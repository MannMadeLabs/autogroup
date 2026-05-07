<?php
/**
 * REST surface for Apex - public lead intake + JWT auth for the dashboard.
 *
 * @package Apex
 */

declare( strict_types=1 );

namespace Apex\Core;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Rest {

	private const NAMESPACE = 'apex/v1';

	public function register_routes(): void {
		register_rest_route(
			self::NAMESPACE,
			'/lead',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'handle_lead' ),
				'permission_callback' => '__return_true',
				'args'                => $this->lead_schema(),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/auth/login',
			array(
				'methods'             => 'POST',
				'callback'            => array( $this, 'handle_login' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/auth/me',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'handle_me' ),
				'permission_callback' => array( $this, 'require_jwt' ),
			)
		);
	}

	public function handle_lead( \WP_REST_Request $request ): \WP_REST_Response {
		$payload = (array) $request->get_json_params();

		$forwarded = $this->forward_to_logic_engine( $payload );

		if ( is_wp_error( $forwarded ) ) {
			return new \WP_REST_Response(
				array(
					'ok'      => false,
					'message' => $forwarded->get_error_message(),
				),
				502
			);
		}

		return new \WP_REST_Response(
			array(
				'ok'   => true,
				'lead' => $forwarded,
			),
			201
		);
	}

	public function handle_login( \WP_REST_Request $request ): \WP_REST_Response {
		$username = sanitize_user( (string) $request->get_param( 'username' ), true );
		$password = (string) $request->get_param( 'password' );

		$user = wp_authenticate( $username, $password );
		if ( is_wp_error( $user ) ) {
			return new \WP_REST_Response(
				array(
					'ok'      => false,
					'message' => 'invalid credentials',
				),
				401
			);
		}

		$ttl   = (int) ( apex_env( 'APEX_JWT_TTL_MINUTES', '60' ) );
		$token = JWT::issue(
			array(
				'sub'   => $user->ID,
				'login' => $user->user_login,
				'roles' => $user->roles,
			),
			$ttl
		);

		return new \WP_REST_Response(
			array(
				'ok'    => true,
				'token' => $token,
				'user'  => array(
					'id'    => $user->ID,
					'login' => $user->user_login,
					'roles' => $user->roles,
				),
			),
			200
		);
	}

	public function handle_me( \WP_REST_Request $request ): \WP_REST_Response {
		$claims = $request->get_attributes()['apex_jwt'] ?? array();
		return new \WP_REST_Response(
			array(
				'ok'    => true,
				'user'  => $claims,
			),
			200
		);
	}

	public function require_jwt( \WP_REST_Request $request ): bool {
		$auth = $request->get_header( 'authorization' );
		if ( ! $auth || stripos( $auth, 'Bearer ' ) !== 0 ) {
			return false;
		}
		$token  = trim( substr( $auth, 7 ) );
		$claims = JWT::verify( $token );
		if ( null === $claims ) {
			return false;
		}
		$attrs              = $request->get_attributes();
		$attrs['apex_jwt']  = $claims;
		$request->set_attributes( $attrs );
		return true;
	}

	private function lead_schema(): array {
		return array(
			'source'   => array(
				'required' => true,
				'type'     => 'string',
				'enum'     => array( 'fb_ad', 'google_search', 'organic' ),
			),
			'customer' => array(
				'required' => true,
				'type'     => 'object',
			),
			'vehicle'  => array(
				'required' => true,
				'type'     => 'object',
			),
		);
	}

	private function forward_to_logic_engine( array $payload ) {
		$base = apex_env( 'APEX_API_URL', 'http://logic-engine:8000' );
		$response = wp_remote_post(
			rtrim( $base, '/' ) . '/webhook/new-lead',
			array(
				'headers' => array( 'Content-Type' => 'application/json' ),
				'body'    => wp_json_encode( $payload ),
				'timeout' => 8,
			)
		);
		if ( is_wp_error( $response ) ) {
			return $response;
		}
		$code = (int) wp_remote_retrieve_response_code( $response );
		$body = json_decode( (string) wp_remote_retrieve_body( $response ), true );
		if ( $code >= 400 ) {
			return new \WP_Error( 'apex_logic_engine', 'logic engine rejected lead', $body );
		}
		return $body;
	}
}
