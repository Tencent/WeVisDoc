"""Run single-page or directory inference through an OpenAI-compatible service."""

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import os
from pathlib import Path
import sys

from .common import IMAGE_TYPES, MODEL_NAME, add_prompt_arguments, build_messages, positive_int, validate_image, write_result


def infer(client, args, path):
    """Reject incomplete responses so truncated documents are not saved."""
    response = client.chat.completions.create(
        model=args.model,
        messages=build_messages(path, args.prompt, args.system_prompt),
        max_tokens=args.max_tokens,
        temperature=args.temperature,
    )
    if not response.choices:
        raise RuntimeError("Server returned no choices")
    choice = response.choices[0]
    if choice.finish_reason != "stop":
        raise RuntimeError(f"Incomplete generation (finish_reason={choice.finish_reason}); increase token/context limits if truncated")
    if not choice.message.content or not choice.message.content.strip():
        raise RuntimeError("Server returned empty content")
    return choice.message.content


def parse_args(argv=None):
    parser = argparse.ArgumentParser(description="WeVisDoc OpenAI-compatible client")
    inputs = parser.add_mutually_exclusive_group(required=True)
    inputs.add_argument("--image", type=Path, help="One page image")
    inputs.add_argument("--image-dir", type=Path, help="Process each image in a directory (non-recursive)")
    parser.add_argument("--output", type=Path, help="Single-request output file")
    parser.add_argument("--result-dir", type=Path, default=Path("results"))
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--workers", type=positive_int, default=4)
    parser.add_argument("--base-url", default=os.getenv("OPENAI_BASE_URL", "http://127.0.0.1:8000/v1"))
    parser.add_argument("--api-key", default=os.getenv("OPENAI_API_KEY", "EMPTY"))
    parser.add_argument("--model", default=os.getenv("SERVED_MODEL_NAME", MODEL_NAME))
    parser.add_argument("--timeout", type=positive_int, default=600)
    parser.add_argument("--temperature", type=float, default=0.0)
    add_prompt_arguments(parser)
    args = parser.parse_args(argv)
    if args.image_dir is not None and args.output is not None:
        parser.error("--output is only valid with --image")
    if not 0 <= args.temperature <= 2:
        parser.error("--temperature must be between 0 and 2")
    return args


def run(args, client):
    """Skip nonempty results and continue after individual batch failures."""
    if args.image:
        text = infer(client, args, args.image)
        if args.output:
            write_result(args.output, text)
        print(text)
        return 0
    if not args.image_dir.is_dir():
        raise ValueError(f"Image directory does not exist: {args.image_dir}")
    paths = sorted(path for path in args.image_dir.iterdir() if path.is_file() and path.suffix.lower() in IMAGE_TYPES)
    if not paths:
        raise ValueError(f"No supported images in {args.image_dir}")
    completed = skipped = failed = 0
    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = {}
        for path in paths:
            # Preserve extensions so same-named JPG and PNG files do not collide.
            output = args.result_dir / f"{path.name}.md"
            if not args.overwrite and output.is_file() and output.stat().st_size:
                skipped += 1
                continue
            futures[executor.submit(infer, client, args, path)] = (path, output)
        for future in as_completed(futures):
            path, output = futures[future]
            try:
                write_result(output, future.result())
                completed += 1
            except Exception as exc:
                failed += 1
                print(f"Failed: {path}: {exc}", file=sys.stderr)
    print(f"Completed: {completed}; skipped: {skipped}; failed: {failed}", file=sys.stderr)
    return 1 if failed else 0


def main():
    args = parse_args()
    try:
        # Delay the import so help works without the client dependency.
        from openai import OpenAI

        if args.image:
            validate_image(args.image)
        with OpenAI(base_url=args.base_url, api_key=args.api_key, timeout=args.timeout) as client:
            return run(args, client)
    except (ValueError, OSError, RuntimeError, ImportError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
