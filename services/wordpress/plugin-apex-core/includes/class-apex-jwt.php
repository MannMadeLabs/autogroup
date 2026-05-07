<?php
/**
 * Lightweight HS256 JWT helpers shared with the FastAPI Logic Engine.
 *
 * @package Apex
 */

declare( strict_types=1 );

namespace Apex\Core;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

final class JWT {

	private const ALGORITHM = 'HS256';

	public static function issue( array $claims, int $ttl_minutes = 60 ): string {
		$header = array(
			'alg' => self::ALGORITHM,
			'typ' => 'JWT',
		);
		$now = time();
		$payload = array_merge(
			$claims,
			array(
				'iat' => $now,
				'exp' => $now + ( $ttl_minutes * 60 ),
				'iss' => 'apex-wp',
			)
		);

		$segments = array(
			self::b64( wp_json_encode( $header ) ),
			self::b64( wp_json_encode( $payload ) ),
		);
		$signing_input = implode( '.', $segments );
		$signature     = hash_hmac( 'sha256', $signing_input, self::secret(), true );
		$segments[]    = self::b64( $signature );

		return implode( '.', $segments );
	}

	public static function verify( string $token ): ?array {
		$parts = explode( '.', $token );
		if ( count( $parts ) !== 3 ) {
			return null;
		}
		[ $h, $p, $s ] = $parts;
		$expected      = self::b64( hash_hmac( 'sha256', $h . '.' . $p, self::secret(), true ) );
		if ( ! hash_equals( $expected, $s ) ) {
			return null;
		}
		$payload = json_decode( self::b64_decode( $p ), true );
		if ( ! is_array( $payload ) ) {
			return null;
		}
		if ( isset( $payload['exp'] ) && time() >= (int) $payload['exp'] ) {
			return null;
		}
		return $payload;
	}

	private static function secret(): string {
		$secret = apex_env( 'APEX_JWT_SECRET' );
		if ( '' === $secret ) {
			$secret = wp_salt( 'auth' );
		}
		return $secret;
	}

	private static function b64( string $bytes ): string {
		return rtrim( strtr( base64_encode( $bytes ), '+/', '-_' ), '=' );
	}

	private static function b64_decode( string $b64 ): string {
		$pad = strlen( $b64 ) % 4;
		if ( $pad > 0 ) {
			$b64 .= str_repeat( '=', 4 - $pad );
		}
		return base64_decode( strtr( $b64, '-_', '+/' ) );
	}
}
