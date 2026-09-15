# WeVisDoc

[English](README.md) | [简体中文](README.zh-CN.md)

<p align="center">
  <a href="https://github.com/Tencent/WeVisDoc"><img src="assets/badges/github.svg" alt="GitHub"></a>
  <a href="https://tencent.github.io/WeVisDoc"><img src="assets/badges/project-page.svg" alt="Project Page"></a>
  <a href="https://huggingface.co/Tencent/WeVisDoc-4B"><img src="assets/badges/wevisdoc-4b.svg" alt="WeVisDoc-4B"></a>
  <a href="https://huggingface.co/Tencent/WeVisDoc-2B"><img src="assets/badges/wevisdoc-2b.svg" alt="WeVisDoc-2B"></a>
  <a href="#" title="Coming soon"><img src="assets/badges/technical-report.svg" alt="Technical Report"></a>
</p>

WeVisDoc is an end-to-end document parser for page images. Fine-tuned from [Qwen3-VL-2B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct) and [Qwen3-VL-4B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct), it turns a page into structured Markdown, with LaTeX formulas and HTML tables.

WeVisDoc-4B achieves an Overall score of 95.38 on OmniDocBench v1.6 and a mean Overall score of 75.54 across the three PureDocBench tracks, ranking first among the compared end-to-end parsers in all four settings.

<p align="center">
  <img src="assets/figure1.png" alt="WeVisDoc-4B leads the compared end-to-end parsers across all four reported settings." width="100%">
</p>
<p align="center"><em>WeVisDoc-4B leads the compared end-to-end parsers across all four reported settings. Bars show scores on OmniDocBench v1.6 and PureDocBench Clean, Digital, and Real.</em></p>

## Quick start

Python 3.10+ is required. Install the vLLM and client dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-vllm.txt
```

Start the service in the first terminal:

```bash
bash scripts/serve_vllm.sh Tencent/WeVisDoc-2B
```

Use `Tencent/WeVisDoc-4B` instead to run the 4B version.

Then process all bundled images from a second terminal:

```bash
source .venv/bin/activate
bash scripts/run_demo.sh
```

Predictions are written to `outputs/predictions/`.

## Serve with vLLM

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-vllm.txt
bash scripts/serve_vllm.sh Tencent/WeVisDoc-2B
```

Replace the model ID with `Tencent/WeVisDoc-4B` to serve the 4B version. The launcher requires vLLM >=0.11.1. Extra arguments are passed to vLLM. To expose the service on the network, set `HOST=0.0.0.0`. For two GPUs and a larger context:

```bash
CUDA_VISIBLE_DEVICES=0,1 TENSOR_PARALLEL_SIZE=2 MAX_MODEL_LEN=65536 \
  bash scripts/serve_vllm.sh Tencent/WeVisDoc-4B --dtype bfloat16
curl --fail http://127.0.0.1:8000/health
```

| Environment variable | Default | Meaning |
| --- | --- | --- |
| `WEVISDOC_MODEL_PATH` / `MODEL_PATH` | Unset | Model ID or checkpoint; positional argument takes precedence, then `WEVISDOC_MODEL_PATH` |
| `SERVED_MODEL_NAME` | `wevisdoc` | API model alias; also read by the client |
| `HOST` / `PORT` | `127.0.0.1` / `8000` | Listening address |
| `TENSOR_PARALLEL_SIZE` | `1` | Number of tensor-parallel GPUs |
| `MAX_MODEL_LEN` | `32768` | Total context budget: text, image and output tokens |
| `GPU_MEMORY_UTILIZATION` | `0.9` | GPU memory fraction |
| `MAX_NUM_SEQS` | `8` | Maximum concurrent sequences |
| `OMP_NUM_THREADS` | `1` | CPU preprocessing threads |
| `VLLM_API_KEY` | Unset | Optional server authentication, handled by vLLM |

Use a separate virtual environment from Transformers to avoid conflicting PyTorch packages.

## Call the service

A client machine only needs `python -m pip install -r requirements.txt`. The examples expect PNG, JPEG, or WebP page images:

```bash
python -m wevisdoc.client --image page.png --output results/page.md
python -m wevisdoc.client --image-dir images --result-dir results --workers 4
```

`--image-dir` processes images in that directory (not recursively) and writes one Markdown file per image, such as `results/page.png.md`. Existing nonempty results are skipped unless `--overwrite` is set.

To process every bundled image in `demos/inputs/`:

```bash
OPENAI_BASE_URL=http://127.0.0.1:8000/v1 \
  bash scripts/run_demo.sh --workers 4
```

The demo writes one Markdown file per image to `outputs/predictions/`.

The client reads `OPENAI_BASE_URL` (default `http://127.0.0.1:8000/v1`), `OPENAI_API_KEY` (default `EMPTY`), and `SERVED_MODEL_NAME`. Match `OPENAI_API_KEY` to `VLLM_API_KEY` when authentication is enabled.

Override defaults with `--base-url`, `--model`, `--timeout` (600 seconds), `--temperature` (0), or `--max-tokens` (8192). Increase the token or context budget if output is truncated; reduce image size, context, or concurrency if GPU memory is insufficient.

## Local Transformers inference

Use a separate environment from vLLM:

```bash
python -m pip install -r requirements-local.txt
python -m wevisdoc.local --model Tencent/WeVisDoc-2B \
  --image page.png --output results/page.md
```

Use `Tencent/WeVisDoc-4B` for the 4B version. `--model` can be omitted when `WEVISDOC_MODEL_PATH` is set. Local inference supports `--device-map` (default `auto`) and `--max-tokens` (8192). Render PDFs to page images first.
