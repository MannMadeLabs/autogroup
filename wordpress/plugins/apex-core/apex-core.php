<?php
/**
 * Plugin Name: Apex Core
 * Description: Project Apex core plugin for CPT registration and API helpers.
 * Version: 0.1.0
 * Author: Apex Internal
 */

if (!defined('ABSPATH')) {
    exit;
}

function apex_register_cpts(): void
{
    register_post_type('leads', [
        'label' => 'Leads',
        'public' => false,
        'show_ui' => true,
        'show_in_rest' => true,
        'supports' => ['title', 'custom-fields'],
    ]);

    register_post_type('vehicles', [
        'label' => 'Vehicles',
        'public' => false,
        'show_ui' => true,
        'show_in_rest' => true,
        'supports' => ['title', 'custom-fields'],
    ]);

    register_post_type('work_orders', [
        'label' => 'Work Orders',
        'public' => false,
        'show_ui' => true,
        'show_in_rest' => true,
        'supports' => ['title', 'custom-fields'],
    ]);
}
add_action('init', 'apex_register_cpts');

function apex_register_routes(): void
{
    register_rest_route('apex/v1', '/health', [
        'methods' => 'GET',
        'callback' => function () {
            return new WP_REST_Response(['status' => 'ok', 'service' => 'wordpress-apex-core'], 200);
        },
        'permission_callback' => '__return_true',
    ]);
}
add_action('rest_api_init', 'apex_register_routes');
