.PHONY: help lint-api lint-web lint fmt-api fmt-web test-api

help:
	@echo "Targets: lint-api lint-web lint fmt-api fmt-web test-api"

lint-api:
	cd services/api && ruff check app tests && pytest -q

fmt-api:
	cd services/api && ruff format app tests

test-api:
	cd services/api && pytest -q

lint-web:
	cd apps/web && npm run lint && npm run typecheck

fmt-web:
	cd apps/web && npm run format

lint: lint-api lint-web
