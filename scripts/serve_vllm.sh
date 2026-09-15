#!/usr/bin/env bash
# Serve document-image inference with the official vLLM Qwen3-VL recipe.
set -euo pipefail

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
    cat <<'HELP'
Usage: bash scripts/serve_vllm.sh [MODEL] [vLLM options...]
MODEL may also be set with WEVISDOC_MODEL_PATH or MODEL_PATH.
Environment: HOST, PORT, SERVED_MODEL_NAME, TENSOR_PARALLEL_SIZE,
             MAX_MODEL_LEN, GPU_MEMORY_UTILIZATION, MAX_NUM_SEQS,
             MAX_IMAGES, OMP_NUM_THREADS, VLLM_API_KEY.
Default model alias: wevisdoc. No checkpoint is assumed.
HELP
    exit 0
fi

model="${WEVISDOC_MODEL_PATH:-${MODEL_PATH:-}}"
if [[ $# -gt 0 && "$1" != -* ]]; then
    model="$1"
    shift
fi
if [[ -z "$model" ]]; then
    echo "Provide a model ID/directory or set WEVISDOC_MODEL_PATH." >&2
    exit 2
fi
if ! command -v vllm >/dev/null 2>&1; then
    echo "Install requirements-vllm.txt in the active environment first." >&2
    exit 127
fi
# Limit preprocessing threads so service instances do not compete for CPU.
export OMP_NUM_THREADS="${OMP_NUM_THREADS:-1}"
# Defaults target the 4B dense document model; forward extra arguments to vLLM.
exec vllm serve "$model" \
    --served-model-name "${SERVED_MODEL_NAME:-wevisdoc}" \
    --host "${HOST:-127.0.0.1}" \
    --port "${PORT:-8000}" \
    --tensor-parallel-size "${TENSOR_PARALLEL_SIZE:-1}" \
    --max-model-len "${MAX_MODEL_LEN:-32768}" \
    --gpu-memory-utilization "${GPU_MEMORY_UTILIZATION:-0.9}" \
    --max-num-seqs "${MAX_NUM_SEQS:-8}" \
    --limit-mm-per-prompt "{\"image\": ${MAX_IMAGES:-1}, \"video\": 0}" \
    --mm-encoder-tp-mode data \
    --async-scheduling \
    "$@"
