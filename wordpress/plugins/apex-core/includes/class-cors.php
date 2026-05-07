<?php
/**
 * CORS support for the WP REST API — required for headless Next.js consumption.
 */
class Apex_CORS {

    private static function allowed_origins(): array {
        $default = array(
            'http://localhost:3000',
            'http://localhost:3001',
        );
        $env_origins = defined( 'APEX_CORS_ORIGINS' ) ? explode( ',', APEX_CORS_ORIGINS ) : array();
        return array_filter( array_merge( $default, $env_origins ) );
    }

    public static function add_headers(): void {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ( in_array( $origin, self::allowed_origins(), true ) ) {
            header( "Access-Control-Allow-Origin: {$origin}" );
            header( 'Access-Control-Allow-Credentials: true' );
            header( 'Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS' );
            header( 'Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce, X-Apex-Key' );
        }
    }

    public static function handle_preflight( $result, $server, $request ): mixed {
        if ( $request->get_method() === 'OPTIONS' ) {
            self::add_headers();
            exit;
        }
        return $result;
    }
}
