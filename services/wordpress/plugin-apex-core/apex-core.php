<?php
/**
 * Plugin Name: Apex Core
 * Description: Project Apex - Custom Post Types, REST surface, and JWT auth for the headless CMS.
 * Version:     0.1.0
 * Author:      Project Apex
 * License:     Proprietary
 * Requires PHP: 8.1
 *
 * Wires up:
 *  - apex_lead / apex_vehicle / apex_work_order CPTs
 *  - REST namespace `apex/v1` (lead intake + auth)
 *  - JWT issuance/verification (HS256, secret shared with FastAPI)
 *
 * @package Apex
 */

declare( strict_types=1 );

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'APEX_CORE_VERSION', '0.1.0' );
define( 'APEX_CORE_DIR', plugin_dir_path( __FILE__ ) );
define( 'APEX_CORE_URL', plugin_dir_url( __FILE__ ) );

/**
 * Read a config value from the environment with a fallback.
 */
function apex_env( string $key, string $fallback = '' ): string {
	$value = getenv( $key );
	return ( false === $value || '' === $value ) ? $fallback : (string) $value;
}

require_once APEX_CORE_DIR . 'includes/class-apex-cpts.php';
require_once APEX_CORE_DIR . 'includes/class-apex-jwt.php';
require_once APEX_CORE_DIR . 'includes/class-apex-rest.php';

add_action(
	'init',
	static function (): void {
		( new \Apex\Core\CPTs() )->register();
	}
);

add_action(
	'rest_api_init',
	static function (): void {
		( new \Apex\Core\Rest() )->register_routes();
	}
);

register_activation_hook(
	__FILE__,
	static function (): void {
		( new \Apex\Core\CPTs() )->register();
		flush_rewrite_rules();
	}
);

register_deactivation_hook(
	__FILE__,
	static function (): void {
		flush_rewrite_rules();
	}
);
