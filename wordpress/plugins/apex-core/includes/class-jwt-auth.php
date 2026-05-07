<?php
/**
 * Lightweight JWT authentication for the WP REST API.
 * Issues a JWT on successful WP login and validates it on subsequent requests.
 * Requires the WP_JWT_SECRET constant (set in wp-config.php via .env injection).
 */
class Apex_JWT_Auth {

    const ALG = 'HS256';

    // ── Issue token ───────────────────────────────────────────────────────────

    public static function issue_token( WP_User $user ): array {
        $secret  = defined( 'WP_JWT_SECRET' ) ? WP_JWT_SECRET : 'changeme';
        $issued  = time();
        $expires = $issued + ( 24 * 60 * 60 ); // 24 h

        $payload = array(
            'iss'  => get_bloginfo( 'url' ),
            'iat'  => $issued,
            'exp'  => $expires,
            'sub'  => $user->ID,
            'user' => array(
                'id'    => $user->ID,
                'email' => $user->user_email,
                'roles' => $user->roles,
            ),
        );

        return array(
            'token'   => self::encode( $payload, $secret ),
            'expires' => $expires,
            'user_id' => $user->ID,
        );
    }

    // ── Validate token ────────────────────────────────────────────────────────

    public static function validate_token( string $token ): array|WP_Error {
        $secret = defined( 'WP_JWT_SECRET' ) ? WP_JWT_SECRET : 'changeme';
        $parts  = explode( '.', $token );

        if ( count( $parts ) !== 3 ) {
            return new WP_Error( 'jwt_invalid', 'Malformed token', array( 'status' => 401 ) );
        }

        [ $header_b64, $payload_b64, $sig_b64 ] = $parts;
        $expected_sig = self::sign( "{$header_b64}.{$payload_b64}", $secret );

        if ( ! hash_equals( $expected_sig, $sig_b64 ) ) {
            return new WP_Error( 'jwt_invalid', 'Invalid signature', array( 'status' => 401 ) );
        }

        $payload = json_decode( base64_decode( strtr( $payload_b64, '-_', '+/' ) ), true );

        if ( ! $payload || ( $payload['exp'] ?? 0 ) < time() ) {
            return new WP_Error( 'jwt_expired', 'Token expired', array( 'status' => 401 ) );
        }

        return $payload;
    }

    // ── REST endpoint: /apex/v1/token ─────────────────────────────────────────

    public static function register_endpoint(): void {
        register_rest_route( 'apex/v1', '/token', array(
            'methods'             => 'POST',
            'callback'            => array( static::class, 'handle_token_request' ),
            'permission_callback' => '__return_true',
            'args'                => array(
                'username' => array( 'required' => true, 'type' => 'string' ),
                'password' => array( 'required' => true, 'type' => 'string' ),
            ),
        ) );
    }

    public static function handle_token_request( WP_REST_Request $request ): WP_REST_Response|WP_Error {
        $user = wp_authenticate(
            $request->get_param( 'username' ),
            $request->get_param( 'password' )
        );

        if ( is_wp_error( $user ) ) {
            return new WP_Error( 'invalid_credentials', 'Invalid username or password', array( 'status' => 401 ) );
        }

        return new WP_REST_Response( self::issue_token( $user ), 200 );
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static function encode( array $payload, string $secret ): string {
        $header  = self::b64url( json_encode( array( 'typ' => 'JWT', 'alg' => self::ALG ) ) );
        $payload = self::b64url( json_encode( $payload ) );
        $sig     = self::sign( "{$header}.{$payload}", $secret );
        return "{$header}.{$payload}.{$sig}";
    }

    private static function sign( string $data, string $secret ): string {
        return self::b64url( hash_hmac( 'sha256', $data, $secret, true ) );
    }

    private static function b64url( string $data ): string {
        return rtrim( strtr( base64_encode( $data ), '+/', '-_' ), '=' );
    }
}

add_action( 'rest_api_init', array( 'Apex_JWT_Auth', 'register_endpoint' ) );
