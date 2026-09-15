# WeVisDoc

[English](README.md) | [简体中文](README.zh-CN.md)

<p align="center">
  <a href="https://github.com/Tencent/WeVisDoc"><img src="assets/badges/github.svg" alt="GitHub"></a>
  <a href="https://tencent.github.io/WeVisDoc"><img src="assets/badges/project-page.svg" alt="Project Page"></a>
  <a href="https://huggingface.co/Tencent/WeVisDoc-4B"><img src="assets/badges/wevisdoc-4b.svg" alt="WeVisDoc-4B"></a>
  <a href="https://huggingface.co/Tencent/WeVisDoc-2B"><img src="assets/badges/wevisdoc-2b.svg" alt="WeVisDoc-2B"></a>
  <a href="#" title="Coming soon"><img src="assets/badges/technical-report.svg" alt="Technical Report"></a>
</p>

WeVisDoc 是面向文档图片的端到端解析模型，由 [Qwen3-VL-2B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct) 与 [Qwen3-VL-4B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct) 微调得到，将页面转为结构化 Markdown，并输出 LaTeX 公式与 HTML 表格。

WeVisDoc-4B 在 OmniDocBench v1.6 上取得 95.38 的 Overall，在 PureDocBench 三条赛道上的 Overall 均值为 75.54，在全部四个评测设置中均位列所比较的端到端解析器第一。

<p align="center">
  <img src="assets/figure1.png" alt="WeVisDoc-4B 在全部四个评测设置中领先所比较的端到端解析器。" width="100%">
</p>
<p align="center"><em>WeVisDoc-4B 在全部四个评测设置中领先所比较的端到端解析器。柱状图给出 OmniDocBench v1.6 以及 PureDocBench 的 Clean、Digital、Real 三个测试集上的得分。</em></p>

## 快速开始

需要 Python 3.10+。安装 vLLM 和客户端依赖：

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-vllm.txt
```

在第一个终端启动服务：

```bash
bash scripts/serve_vllm.sh Tencent/WeVisDoc-2B
```

如需运行 4B 版本，将模型 ID 替换为 `Tencent/WeVisDoc-4B`。

在第二个终端解析仓库内的全部示例图片：

```bash
source .venv/bin/activate
bash scripts/run_demo.sh
```

推理结果写入 `outputs/predictions/`。

## vLLM 服务部署

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements-vllm.txt
bash scripts/serve_vllm.sh Tencent/WeVisDoc-2B
```

如需部署 4B 版本，将模型 ID 替换为 `Tencent/WeVisDoc-4B`。脚本要求 vLLM >=0.11.1。额外参数会传给 vLLM。需要跨机器访问时设置 `HOST=0.0.0.0`。例如使用两张 GPU 并增大上下文：

```bash
CUDA_VISIBLE_DEVICES=0,1 TENSOR_PARALLEL_SIZE=2 MAX_MODEL_LEN=65536 \
  bash scripts/serve_vllm.sh Tencent/WeVisDoc-4B --dtype bfloat16
curl --fail http://127.0.0.1:8000/health
```

| 环境变量 | 默认值 | 含义 |
| --- | --- | --- |
| `WEVISDOC_MODEL_PATH` / `MODEL_PATH` | 未设置 | 模型 ID 或权重目录；位置参数优先，其次是 `WEVISDOC_MODEL_PATH` |
| `SERVED_MODEL_NAME` | `wevisdoc` | API 模型别名，客户端也读取此变量 |
| `HOST` / `PORT` | `127.0.0.1` / `8000` | 监听地址与端口 |
| `TENSOR_PARALLEL_SIZE` | `1` | 张量并行 GPU 数量 |
| `MAX_MODEL_LEN` | `32768` | 文本、图片和输出 token 的总上下文预算 |
| `GPU_MEMORY_UTILIZATION` | `0.9` | GPU 显存使用比例 |
| `MAX_NUM_SEQS` | `8` | 最大并发序列数 |
| `OMP_NUM_THREADS` | `1` | CPU 预处理线程数量 |
| `VLLM_API_KEY` | 未设置 | 可选服务认证，由 vLLM 读取 |

请与 Transformers 使用独立虚拟环境，避免 PyTorch 依赖冲突。

## 调用服务

客户端机器仅需安装 `python -m pip install -r requirements.txt`。下面的示例使用 PNG、JPEG 或 WebP 文档图片：

```bash
python -m wevisdoc.client --image page.png --output results/page.md
python -m wevisdoc.client --image-dir images --result-dir results --workers 4
```

`--image-dir` 处理该目录下的图片（不递归），每张图片输出一个 Markdown 文件，例如 `results/page.png.md`。已有非空结果默认跳过，使用 `--overwrite` 重新生成。

解析 `demos/inputs/` 中全部示例图片：

```bash
OPENAI_BASE_URL=http://127.0.0.1:8000/v1 \
  bash scripts/run_demo.sh --workers 4
```

每张图片的 Markdown 结果写入 `outputs/predictions/`。

客户端读取 `OPENAI_BASE_URL`（默认 `http://127.0.0.1:8000/v1`）、`OPENAI_API_KEY`（默认 `EMPTY`）和 `SERVED_MODEL_NAME`。启用服务认证时，将 `OPENAI_API_KEY` 设为与 `VLLM_API_KEY` 一致。

可以用 `--base-url`、`--model`、`--timeout`（默认 600 秒）、`--temperature`（默认 0）和 `--max-tokens`（默认 8192）调整请求。输出被截断时增大 token 或上下文预算；显存不足时降低图片尺寸、上下文长度或并发数量。

## Transformers 本地推理

与 vLLM 使用独立环境：

```bash
python -m pip install -r requirements-local.txt
python -m wevisdoc.local --model Tencent/WeVisDoc-2B \
  --image page.png --output results/page.md
```

如需使用 4B 版本，将模型 ID 替换为 `Tencent/WeVisDoc-4B`。设置 `WEVISDOC_MODEL_PATH` 后可省略 `--model`。本地推理支持 `--device-map`（默认 `auto`）和 `--max-tokens`（默认 8192）。PDF 需先转成页面图片。
