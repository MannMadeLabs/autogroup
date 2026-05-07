<?php
/**
 * Plugin Name: Apex Core
 * Description: Project Apex custom post types and headless-ready API helpers.
 * Version: 0.1.0
 * Author: Project Apex
 */

if (!defined('ABSPATH')) {
    exit;
}

final class ApexCorePlugin {
    public function __construct() {
        add_action('init', [$this, 'register_post_types']);
        add_action('rest_api_init', [$this, 'register_rest_routes']);
    }

    public function register_post_types(): void {
        register_post_type('lead', [
            'labels' => [
                'name' => 'Leads',
                'singular_name' => 'Lead',
            ],
            'public' => false,
            'show_ui' => true,
            'show_in_rest' => true,
            'supports' => ['title', 'custom-fields'],
            'menu_icon' => 'dashicons-id',
        ]);

        register_post_type('vehicle', [
            'labels' => [
                'name' => 'Vehicles',
                'singular_name' => 'Vehicle',
            ],
            'public' => false,
            'show_ui' => true,
            'show_in_rest' => true,
            'supports' => ['title', 'custom-fields'],
            'menu_icon' => 'dashicons-car',
        ]);

        register_post_type('work_order', [
            'labels' => [
                'name' => 'Work Orders',
                'singular_name' => 'Work Order',
            ],
            'public' => false,
            'show_ui' => true,
            'show_in_rest' => true,
            'supports' => ['title', 'custom-fields'],
            'menu_icon' => 'dashicons-clipboard',
        ]);
    }

    public function register_rest_routes(): void {
        register_rest_route('apex/v1', '/health', [
            'methods' => 'GET',
            'permission_callback' => '__return_true',
            'callback' => function () {
                return [
                    'status' => 'ok',
                    'service' => 'apex-core',
                ];
            },
        ]);
    }
}

new ApexCorePlugin();
