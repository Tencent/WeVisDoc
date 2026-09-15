"""Run inference by loading Qwen3-VL weights directly with Transformers."""

import argparse
import os
from pathlib import Path
import sys

from .common import add_prompt_arguments, build_messages, write_result


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description="WeVisDoc Transformers inference")
    parser.add_argument("--model", default=os.getenv("WEVISDOC_MODEL_PATH"), help="Hugging Face model ID or checkpoint directory")
    parser.add_argument("--image", type=Path, required=True, help="One page image")
    parser.add_argument("--device-map", default="auto")
    parser.add_argument("--output", type=Path)
    add_prompt_arguments(parser)
    args = parser.parse_args(argv)
    if not args.model:
        parser.error("Provide --model or WEVISDOC_MODEL_PATH")
    return args


def main():
    args = parse_args()
    try:
        messages = build_messages(args.image, args.prompt, args.system_prompt, backend="local")
        # Delay imports so client-only users do not need GPU dependencies.
        import torch
        from transformers import AutoProcessor, Qwen3VLForConditionalGeneration

        print(f"Loading model: {args.model}", file=sys.stderr)
        model = Qwen3VLForConditionalGeneration.from_pretrained(args.model, dtype="auto", device_map=args.device_map)
        model.eval()
        processor = AutoProcessor.from_pretrained(args.model)
        inputs = processor.apply_chat_template(
            messages, tokenize=True, add_generation_prompt=True,
            return_dict=True, return_tensors="pt",
        ).to(model.device)
        with torch.inference_mode():
            generated = model.generate(**inputs, max_new_tokens=args.max_tokens, do_sample=False)
        tokens = generated[:, inputs["input_ids"].shape[1]:]
        # Reject output that reaches the limit without an end token.
        eos = model.generation_config.eos_token_id
        eos_ids = eos if isinstance(eos, list) else [eos]
        if tokens.shape[1] >= args.max_tokens and tokens[0, -1].item() not in eos_ids:
            raise RuntimeError("Generation truncated; increase --max-tokens")
        text = processor.batch_decode(tokens, skip_special_tokens=True, clean_up_tokenization_spaces=False)[0]
        if not text.strip():
            raise RuntimeError("Model returned empty content")
        if args.output:
            write_result(args.output, text)
        print(text)
        return 0
    except (ValueError, OSError, RuntimeError, ImportError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
