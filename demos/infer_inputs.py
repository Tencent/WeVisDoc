#!/usr/bin/env python3
"""Run batch inference for the sample images in demos/inputs/."""

from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
INPUT_DIR = ROOT / "demos" / "inputs"
PREDICTION_DIR = ROOT / "outputs" / "predictions"

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from wevisdoc.client import parse_args, run  # noqa: E402


def main(argv=None):
    """Reuse the public client with fixed sample input and output directories."""
    argv = sys.argv[1:] if argv is None else argv
    args = parse_args([
        *argv,
        "--image-dir",
        str(INPUT_DIR),
        "--result-dir",
        str(PREDICTION_DIR),
    ])
    try:
        from openai import OpenAI

        with OpenAI(base_url=args.base_url, api_key=args.api_key, timeout=args.timeout) as client:
            return run(args, client)
    except (ValueError, OSError, RuntimeError, ImportError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
