<?php
/**
 * Plugin Name: Apex Core
 * Plugin URI:  https://github.com/your-org/project-apex
 * Description: Project Apex headless CMS plugin. Registers CPTs (Leads, Vehicles, Work_Orders),
 *              enables CORS for the REST API, and adds ACF-backed endpoints.
 * Version:     1.0.0
 * Author:      Apex Team
 * License:     Proprietary
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'APEX_VERSION', '1.0.0' );
define( 'APEX_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );

// ── Autoload ──────────────────────────────────────────────────────────────────

require_once APEX_PLUGIN_DIR . 'includes/class-cpts.php';
require_once APEX_PLUGIN_DIR . 'includes/class-rest-api.php';
require_once APEX_PLUGIN_DIR . 'includes/class-cors.php';
require_once APEX_PLUGIN_DIR . 'includes/class-jwt-auth.php';

// ── Boot ──────────────────────────────────────────────────────────────────────

add_action( 'init', array( 'Apex_CPTs', 'register' ) );
add_action( 'rest_api_init', array( 'Apex_REST_API', 'register_routes' ) );
add_action( 'init', array( 'Apex_CORS', 'add_headers' ) );
add_filter( 'rest_pre_dispatch', array( 'Apex_CORS', 'handle_preflight' ), 10, 3 );

// Flush rewrite rules on activation
register_activation_hook( __FILE__, function () {
    Apex_CPTs::register();
    flush_rewrite_rules();
} );
