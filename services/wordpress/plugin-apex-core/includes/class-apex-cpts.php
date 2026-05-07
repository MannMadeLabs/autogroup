<?php
/**
 * Custom Post Types for Project Apex.
 *
 * @package Apex
 */

declare( strict_types=1 );

namespace Apex\Core;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CPTs {

	private const CPT_LEAD       = 'apex_lead';
	private const CPT_VEHICLE    = 'apex_vehicle';
	private const CPT_WORK_ORDER = 'apex_work_order';

	public function register(): void {
		$this->register_cpt(
			self::CPT_LEAD,
			__( 'Lead', 'apex' ),
			__( 'Leads', 'apex' ),
			'dashicons-groups'
		);

		$this->register_cpt(
			self::CPT_VEHICLE,
			__( 'Vehicle', 'apex' ),
			__( 'Vehicles', 'apex' ),
			'dashicons-car'
		);

		$this->register_cpt(
			self::CPT_WORK_ORDER,
			__( 'Work Order', 'apex' ),
			__( 'Work Orders', 'apex' ),
			'dashicons-clipboard'
		);
	}

	private function register_cpt( string $slug, string $singular, string $plural, string $icon ): void {
		register_post_type(
			$slug,
			array(
				'labels'              => array(
					'name'          => $plural,
					'singular_name' => $singular,
					'menu_name'     => $plural,
					'add_new_item'  => sprintf( __( 'Add New %s', 'apex' ), $singular ),
				),
				'public'              => false,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'show_in_rest'        => true,
				'rest_base'           => $slug,
				'menu_icon'           => $icon,
				'supports'            => array( 'title', 'custom-fields', 'editor' ),
				'has_archive'         => false,
				'exclude_from_search' => true,
				'capability_type'     => 'post',
			)
		);
	}
}
