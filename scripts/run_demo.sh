#!/usr/bin/env bash
# Process every sample image in demos/inputs/ through an OpenAI-compatible service.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

exec python demos/infer_inputs.py "$@"
