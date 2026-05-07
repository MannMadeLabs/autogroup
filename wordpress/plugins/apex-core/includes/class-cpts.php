<?php
/**
 * Custom Post Types: Lead, Vehicle, Work_Order
 */
class Apex_CPTs {

    public static function register(): void {
        self::register_lead();
        self::register_vehicle();
        self::register_work_order();
    }

    // ── Lead ──────────────────────────────────────────────────────────────────

    private static function register_lead(): void {
        register_post_type( 'apex_lead', array(
            'labels'       => array(
                'name'               => __( 'Leads', 'apex' ),
                'singular_name'      => __( 'Lead', 'apex' ),
                'add_new_item'       => __( 'Add New Lead', 'apex' ),
                'edit_item'          => __( 'Edit Lead', 'apex' ),
                'search_items'       => __( 'Search Leads', 'apex' ),
            ),
            'public'             => false,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'show_in_rest'       => true,
            'rest_base'          => 'leads',
            'capability_type'    => 'post',
            'supports'           => array( 'title', 'editor', 'custom-fields', 'revisions' ),
            'menu_icon'          => 'dashicons-businessman',
            'has_archive'        => false,
        ) );

        // ACF field group registered via JSON (acf-json/ directory)
        // Fields: customer_name, customer_phone, customer_email,
        //         vehicle_make, vehicle_model, vehicle_year, service_needed,
        //         lead_source (select), lead_status (select), notes
    }

    // ── Vehicle ───────────────────────────────────────────────────────────────

    private static function register_vehicle(): void {
        register_post_type( 'apex_vehicle', array(
            'labels'       => array(
                'name'          => __( 'Vehicles', 'apex' ),
                'singular_name' => __( 'Vehicle', 'apex' ),
            ),
            'public'          => false,
            'show_ui'         => true,
            'show_in_menu'    => true,
            'show_in_rest'    => true,
            'rest_base'       => 'vehicles',
            'supports'        => array( 'title', 'custom-fields' ),
            'menu_icon'       => 'dashicons-car',
        ) );

        // ACF fields: vin, make, model, year, mileage, color, owner_lead_id
    }

    // ── Work Order ────────────────────────────────────────────────────────────

    private static function register_work_order(): void {
        register_post_type( 'apex_work_order', array(
            'labels'       => array(
                'name'          => __( 'Work Orders', 'apex' ),
                'singular_name' => __( 'Work Order', 'apex' ),
            ),
            'public'          => false,
            'show_ui'         => true,
            'show_in_menu'    => true,
            'show_in_rest'    => true,
            'rest_base'       => 'work-orders',
            'supports'        => array( 'title', 'editor', 'custom-fields' ),
            'menu_icon'       => 'dashicons-clipboard',
        ) );

        // ACF fields: lead_id, technician, labor_hours, parts_cost,
        //             labor_cost, total_amount, invoice_number, paid (boolean)
    }
}
