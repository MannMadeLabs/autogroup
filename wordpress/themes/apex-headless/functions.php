<?php
/**
 * Apex Headless Theme — functions.php
 * Minimal theme that primes WordPress for headless/API-only operation.
 * All rendering is done by Next.js; this theme removes unnecessary WP front-end
 * overhead while keeping the admin and REST API fully functional.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// ── Theme support ─────────────────────────────────────────────────────────────

add_action( 'after_setup_theme', function () {
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'custom-logo' );
    add_theme_support( 'title-tag' );
} );

// ── REST API enhancements ─────────────────────────────────────────────────────

// Expose featured image URL in REST responses
add_action( 'rest_api_init', function () {
    register_rest_field( array( 'post', 'page', 'apex_lead' ), 'featured_image_url', array(
        'get_callback' => function ( $obj ) {
            return get_the_post_thumbnail_url( $obj['id'], 'full' ) ?: null;
        },
        'schema' => array( 'type' => 'string', 'format' => 'uri' ),
    ) );
} );

// ── Disable front-end theme rendering ─────────────────────────────────────────

add_action( 'template_redirect', function () {
    // Return a 204 for all front-end requests; the Next.js app handles rendering.
    if ( ! is_admin() && ! ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
        status_header( 204 );
        exit;
    }
} );

// Remove emoji scripts (not needed in headless)
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );
