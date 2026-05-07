<?php
/**
 * Custom REST API endpoints for Apex.
 * Supplements the default WP REST API with business-logic-specific routes.
 */
class Apex_REST_API {

    const NAMESPACE = 'apex/v1';

    public static function register_routes(): void {
        // Site config (public — for client-side hydration)
        register_rest_route( self::NAMESPACE, '/config', array(
            'methods'             => 'GET',
            'callback'            => array( static::class, 'get_config' ),
            'permission_callback' => '__return_true',
        ) );

        // Sync lead from Python backend → WP (authenticated)
        register_rest_route( self::NAMESPACE, '/sync-lead', array(
            'methods'             => 'POST',
            'callback'            => array( static::class, 'sync_lead' ),
            'permission_callback' => array( static::class, 'check_auth' ),
            'args'                => array(
                'lead_id'  => array( 'required' => true, 'type' => 'string' ),
                'status'   => array( 'required' => true, 'type' => 'string' ),
                'customer' => array( 'required' => true, 'type' => 'object' ),
                'vehicle'  => array( 'required' => false, 'type' => 'object' ),
            ),
        ) );

        // Services list (for landing page dropdown population)
        register_rest_route( self::NAMESPACE, '/services', array(
            'methods'             => 'GET',
            'callback'            => array( static::class, 'get_services' ),
            'permission_callback' => '__return_true',
        ) );
    }

    // ── Handlers ──────────────────────────────────────────────────────────────

    public static function get_config( WP_REST_Request $request ): WP_REST_Response {
        return new WP_REST_Response( array(
            'shop_name'   => get_option( 'apex_shop_name', get_bloginfo( 'name' ) ),
            'shop_phone'  => get_option( 'apex_shop_phone', '' ),
            'review_link' => get_option( 'apex_review_link', '' ),
            'version'     => APEX_VERSION,
        ), 200 );
    }

    public static function sync_lead( WP_REST_Request $request ): WP_REST_Response {
        $data     = $request->get_json_params();
        $lead_id  = sanitize_text_field( $data['lead_id'] );
        $customer = $data['customer'];
        $vehicle  = $data['vehicle'] ?? array();
        $status   = sanitize_text_field( $data['status'] );

        // Check if WP post already exists for this lead
        $existing = get_posts( array(
            'post_type'   => 'apex_lead',
            'meta_key'    => 'apex_lead_id',
            'meta_value'  => $lead_id,
            'numberposts' => 1,
            'fields'      => 'ids',
        ) );

        $post_data = array(
            'post_title'  => sanitize_text_field( $customer['name'] ?? 'Unknown' ),
            'post_status' => 'publish',
            'post_type'   => 'apex_lead',
        );

        if ( ! empty( $existing ) ) {
            $post_data['ID'] = $existing[0];
            $post_id = wp_update_post( $post_data, true );
        } else {
            $post_id = wp_insert_post( $post_data, true );
        }

        if ( is_wp_error( $post_id ) ) {
            return new WP_REST_Response( array( 'error' => $post_id->get_error_message() ), 500 );
        }

        // Store meta fields
        update_post_meta( $post_id, 'apex_lead_id', $lead_id );
        update_post_meta( $post_id, 'apex_status', $status );
        update_post_meta( $post_id, 'apex_customer_name', sanitize_text_field( $customer['name'] ?? '' ) );
        update_post_meta( $post_id, 'apex_customer_phone', sanitize_text_field( $customer['phone'] ?? '' ) );
        update_post_meta( $post_id, 'apex_customer_email', sanitize_email( $customer['email'] ?? '' ) );
        if ( ! empty( $vehicle ) ) {
            update_post_meta( $post_id, 'apex_vehicle_make', sanitize_text_field( $vehicle['make'] ?? '' ) );
            update_post_meta( $post_id, 'apex_vehicle_model', sanitize_text_field( $vehicle['model'] ?? '' ) );
            update_post_meta( $post_id, 'apex_vehicle_year', sanitize_text_field( $vehicle['year'] ?? '' ) );
            update_post_meta( $post_id, 'apex_service_needed', sanitize_text_field( $vehicle['service_needed'] ?? '' ) );
        }

        return new WP_REST_Response( array( 'post_id' => $post_id, 'lead_id' => $lead_id ), 201 );
    }

    public static function get_services( WP_REST_Request $request ): WP_REST_Response {
        $services = get_option( 'apex_service_list', array(
            'Oil Change',
            'Brake Service',
            'Tire Rotation / Replacement',
            'AC / Heat Repair',
            'Engine Diagnostic',
            'Transmission Service',
            'Wheel Alignment',
            'Battery Replacement',
        ) );
        return new WP_REST_Response( array( 'services' => $services ), 200 );
    }

    // ── Auth check ────────────────────────────────────────────────────────────

    public static function check_auth( WP_REST_Request $request ): bool {
        // Accept WP cookie auth or a pre-shared API key header
        if ( current_user_can( 'edit_posts' ) ) {
            return true;
        }
        $header = $request->get_header( 'X-Apex-Key' );
        $key    = defined( 'APEX_API_KEY' ) ? APEX_API_KEY : get_option( 'apex_api_key', '' );
        return ! empty( $key ) && hash_equals( $key, (string) $header );
    }
}
