<?php
/**
 * Plugin Name:       Apex Connector
 * Description:       Headless Project Apex integration — CPTs and hooks for the FastAPI logic engine (extend with ACF Pro).
 * Version:           0.1.0
 * Author:            MannMadeLabs
 * License:           GPL-2.0-or-later
 * Text Domain:       apex-connector
 *
 * @package Apex_Connector
 */

defined( 'ABSPATH' ) || exit;

/**
 * Register CPT stubs — expand field maps to match packages/schemas/lead.schema.json.
 */
function apex_connector_register_cpts() {
	$labels_lead = array(
		'name'          => __( 'Leads', 'apex-connector' ),
		'singular_name' => __( 'Lead', 'apex-connector' ),
	);

	register_post_type(
		'apex_lead',
		array(
			'labels'       => $labels_lead,
			'public'       => false,
			'show_ui'      => true,
			'show_in_rest' => true,
			'rest_base'    => 'apex-leads',
			'supports'     => array( 'title', 'custom-fields' ),
			'menu_icon'    => 'dashicons-groups',
		)
	);

	register_post_type(
		'apex_vehicle',
		array(
			'labels'       => array(
				'name'          => __( 'Vehicles', 'apex-connector' ),
				'singular_name' => __( 'Vehicle', 'apex-connector' ),
			),
			'public'       => false,
			'show_ui'      => true,
			'show_in_rest' => true,
			'rest_base'    => 'apex-vehicles',
			'supports'     => array( 'title', 'custom-fields' ),
			'menu_icon'    => 'dashicons-car',
		)
	);

	register_post_type(
		'apex_work_order',
		array(
			'labels'       => array(
				'name'          => __( 'Work Orders', 'apex-connector' ),
				'singular_name' => __( 'Work Order', 'apex-connector' ),
			),
			'public'       => false,
			'show_ui'      => true,
			'show_in_rest' => true,
			'rest_base'    => 'apex-work-orders',
			'supports'     => array( 'title', 'custom-fields' ),
			'menu_icon'    => 'dashicons-hammer',
		)
	);
}
add_action( 'init', 'apex_connector_register_cpts' );

/**
 * Future: on transition_post_status for apex_lead → publish, POST JSON to:
 * trailingslashit( APEX_LOGIC_URL ) . 'webhook/new-lead'
 * with headers X-Apex-Secret when APEX_WEBHOOK_SECRET is defined in wp-config.php.
 */
