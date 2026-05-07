<?php
/**
 * Plugin Name: Apex Headless Core
 * Description: Registers CPTs and REST exposure for the Project Apex stack (Leads, Vehicles, Work Orders).
 * Version: 0.1.0
 * Author: Apex Internal
 * Text Domain: apex-headless
 */

defined('ABSPATH') || exit;

function apex_register_post_types(): void
{
    register_post_type('apex_lead', [
        'labels' => [
            'name' => __('Leads', 'apex-headless'),
            'singular_name' => __('Lead', 'apex-headless'),
        ],
        'public' => true,
        'show_in_rest' => true,
        'menu_icon' => 'dashicons-id',
        'supports' => ['title', 'editor', 'custom-fields'],
        'has_archive' => false,
        'rewrite' => ['slug' => 'lead'],
    ]);

    register_post_type('apex_vehicle', [
        'labels' => [
            'name' => __('Vehicles', 'apex-headless'),
            'singular_name' => __('Vehicle', 'apex-headless'),
        ],
        'public' => true,
        'show_in_rest' => true,
        'menu_icon' => 'dashicons-car',
        'supports' => ['title', 'editor', 'custom-fields'],
        'has_archive' => false,
        'rewrite' => ['slug' => 'vehicle'],
    ]);

    register_post_type('apex_work_order', [
        'labels' => [
            'name' => __('Work Orders', 'apex-headless'),
            'singular_name' => __('Work Order', 'apex-headless'),
        ],
        'public' => true,
        'show_in_rest' => true,
        'menu_icon' => 'dashicons-hammer',
        'supports' => ['title', 'editor', 'custom-fields'],
        'has_archive' => false,
        'rewrite' => ['slug' => 'work-order'],
    ]);
}

add_action('init', 'apex_register_post_types');
