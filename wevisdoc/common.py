"""Shared input validation, message construction, and result writing."""

import argparse
import base64
import os
from pathlib import Path
import tempfile

from .prompts import DEFAULT_PROMPT, DEFAULT_SYSTEM_PROMPT

IMAGE_TYPES = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}
MODEL_NAME = "wevisdoc"


def positive_int(value):
    """Parse a command-line argument that must be positive."""
    number = int(value)
    if number <= 0:
        raise argparse.ArgumentTypeError("must be a positive integer")
    return number


def add_prompt_arguments(parser):
    """Add prompt options shared by both inference backends."""
    parser.add_argument("--prompt", default=DEFAULT_PROMPT, help="User instruction")
    parser.add_argument("--system-prompt", default=DEFAULT_SYSTEM_PROMPT, help="System instruction; use an empty string to omit")
    parser.add_argument("--max-tokens", type=positive_int, default=8192, help="Maximum output tokens")


def validate_image(path):
    """Accept only existing, nonempty images in supported formats."""
    path = Path(path).expanduser().resolve()
    if not path.is_file():
        raise ValueError(f"Image does not exist: {path}")
    if path.suffix.lower() not in IMAGE_TYPES:
        raise ValueError(f"Unsupported image format: {path}")
    if not path.stat().st_size:
        raise ValueError(f"Empty image: {path}")
    return path


def build_messages(path, prompt, system_prompt, *, backend="openai"):
    """Build backend-specific messages for one page image."""
    if backend not in {"openai", "local"}:
        raise ValueError(f"Unknown backend: {backend}")
    path = validate_image(path)
    if backend == "local":
        image = {"type": "image", "path": str(path)}
    else:
        encoded = base64.b64encode(path.read_bytes()).decode("ascii")
        url = f"data:{IMAGE_TYPES[path.suffix.lower()]};base64,{encoded}"
        image = {"type": "image_url", "image_url": {"url": url}}
    content = [image, {"type": "text", "text": prompt}]
    messages = []
    if system_prompt:
        system_content = (
            [{"type": "text", "text": system_prompt}]
            if backend == "local"
            else system_prompt
        )
        messages.append({"role": "system", "content": system_content})
    return messages + [{"role": "user", "content": content}]


def write_result(path, text):
    """Write atomically so interruptions cannot leave partial result files."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=path.parent, delete=False) as stream:
            temporary = Path(stream.name)
            stream.write(text)
        os.replace(temporary, path)
    finally:
        if temporary is not None:
            temporary.unlink(missing_ok=True)
