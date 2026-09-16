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

## 评测结果

以下表格仅保留端到端文档解析模型。WeVisDoc 的结果为三次推理的均值。

### OmniDocBench v1.6

| 模型 | 参数量 | Overall ↑ | TextEdit ↓ | FormulaCDM ↑ | TableTEDS ↑ | TableTEDS_S ↑ | ROEdit ↓ |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Nanonets-OCR2* | 3B | 83.20 | 0.108 | 80.35 | 80.10 | 85.26 | 0.211 |
| OCRFlux-3B* | 3B | 83.31 | 0.126 | 88.75 | 73.78 | 77.98 | 0.217 |
| POINTS-Reader | 3B | 83.37 | 0.096 | 85.72 | 73.98 | 77.40 | 0.198 |
| Nanonets-OCR-s | 3B | 83.61 | 0.108 | 81.46 | 80.18 | 84.51 | 0.213 |
| olmOCR-2-7B* | 7B | 85.51 | 0.106 | 88.84 | 78.32 | 82.81 | 0.223 |
| olmOCR | 7B | 85.74 | 0.139 | 88.10 | 83.00 | 87.17 | 0.216 |
| DeepSeek-OCR* | 3B | 86.31 | 0.077 | 84.71 | 81.87 | 86.07 | 0.171 |
| OCRVerse | 4B | 88.60 | 0.063 | 89.61 | 82.44 | 86.27 | 0.163 |
| UniRec-0.1B* | 0.1B | 88.91 | 0.088 | 92.14 | 83.40 | 86.79 | 0.146 |
| DeepSeek-OCR 2 | 3B | 90.25 | 0.050 | 91.84 | 83.89 | 87.75 | 0.144 |
| dots.ocr | 3B | 90.77 | 0.048 | 89.95 | 87.18 | 90.58 | 0.138 |
| FD-RL* | 4B | 91.21 | 0.055 | 92.92 | 86.22 | 90.92 | 0.145 |
| HunyuanOCR | 1B | 92.03 | 0.048 | 88.60 | 92.37 | 93.99 | 0.138 |
| dots.mocr* | 3B | 92.57 | 0.042 | 92.09 | 89.78 | 92.92 | 0.133 |
| FireRed-OCR | 2B | 93.26 | 0.037 | 95.44 | 88.04 | 91.06 | 0.131 |
| Logics-Parsing-v2 | 4B | 93.33 | 0.041 | 95.65 | 88.42 | 91.98 | 0.137 |
| Qianfan-OCR | 4B | 93.90 | 0.040 | 95.08 | 90.53 | 93.31 | 0.130 |
| Unlimited-OCR | 3B-A0.5B | 93.92 | 0.042 | 95.79 | 90.16 | 93.32 | 0.129 |
| HunyuanOCR-1.5 | 1B | 94.74 | 0.039 | 94.50 | 93.67 | 94.71 | 0.129 |
| **WeVisDoc-2B** | **2B** | **95.06** | **0.038** | **95.94** | **93.03** | **95.26** | **0.130** |
| **WeVisDoc-4B** | **4B** | **95.38** | **0.036** | **96.81** | **92.95** | **95.34** | **0.125** |

### PureDocBench

| 模型 | 参数量 | Avg₃ ↑ | Clean Overall ↑ | Digital Degraded Overall ↑ | Real Degraded Overall ↑ |
| --- | ---: | ---: | ---: | ---: | ---: |
| OCRFlux-3B | 3B | 42.06 | 47.14 | 41.82 | 37.21 |
| DeepSeek-OCR | 3B | 46.98 | 53.50 | 46.95 | 40.48 |
| UniRec-0.1B | 0.1B | 48.59 | 58.91 | 52.42 | 34.44 |
| POINTS-Reader* | 3B | 49.24 | 53.78 | 51.24 | 42.69 |
| DeepSeek-OCR-2 | 3B | 49.51 | 55.53 | 49.41 | 43.60 |
| Qianfan-OCR | 4B | 51.04 | 57.22 | 50.85 | 45.06 |
| olmOCR-7B | 7B | 55.90 | 62.56 | 57.84 | 47.30 |
| Nanonets-OCR2 | 3B | 58.36 | 64.83 | 61.23 | 49.03 |
| HunyuanOCR | 1B | 60.56 | 65.61 | 61.49 | 54.58 |
| Unlimited-OCR* | 3B-A0.5B | 62.76 | 71.28 | 63.62 | 53.39 |
| olmOCR-2-7B | 7B | 63.78 | 69.36 | 65.87 | 56.10 |
| dots.ocr | 3B | 64.55 | 72.01 | 65.95 | 55.68 |
| Nanonets-OCR-s* | 3B | 65.37 | 71.26 | 66.56 | 58.28 |
| FireRed-OCR | 2B | 65.57 | 70.81 | 68.49 | 57.42 |
| HunyuanOCR-1.5* | 1B | 68.79 | 73.98 | 70.81 | 61.59 |
| OCRVerse | 4B | 69.40 | 73.18 | 71.36 | 63.66 |
| dots.mocr | 3B | 70.39 | 76.27 | 73.16 | 61.73 |
| Logics-Parsing-v2 | 4B | 72.61 | 76.35 | 73.85 | 67.64 |
| FD-RL | 4B | 73.92 | 78.38 | 76.33 | 67.04 |
| **WeVisDoc-2B** | **2B** | **73.86** | **79.36** | **76.62** | **65.60** |
| **WeVisDoc-4B** | **4B** | **75.54** | **79.81** | **77.74** | **69.08** |

`Avg₃` 为 PureDocBench 三条赛道 Overall 的均值。`*` 表示由我们使用统一评测流程获得的基线结果；其余基线结果取自对应论文。

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
