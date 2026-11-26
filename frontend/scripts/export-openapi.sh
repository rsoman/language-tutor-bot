#!/usr/bin/env bash
# Writes the backend's OpenAPI schema to frontend/openapi.json, then generates
# src/api/schema.d.ts from it. Run from frontend/:  bash scripts/export-openapi.sh
set -euo pipefail
cd "$(dirname "$0")/../../backend"
uv run python -c "import json; from tutor.main import create_app; print(json.dumps(create_app().openapi(), indent=2))" > ../frontend/openapi.json
cd ../frontend
pnpm gen:api
