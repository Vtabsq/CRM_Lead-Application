"""
Input Validation and Sanitization Utilities
Provides functions to sanitize user input and prevent injection attacks.
"""

import re
import os
import html
from typing import Optional, List


# --- String Sanitization ---

def sanitize_string(value: str, max_length: int = 10000) -> str:
    """
    Sanitize a string by removing HTML tags, control characters,
    and limiting length. Preserves normal text content.
    """
    if not isinstance(value, str):
        return str(value)[:max_length]

    # Remove null bytes
    value = value.replace("\x00", "")

    # Remove HTML tags
    value = re.sub(r"<[^>]+>", "", value)

    # Remove control characters (except newline, tab, carriage return)
    value = re.sub(r"[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]", "", value)

    # Truncate to max length
    return value[:max_length]


def sanitize_html(value: str) -> str:
    """Escape HTML entities to prevent XSS in contexts where HTML is output."""
    return html.escape(value, quote=True)


# --- Email Header Sanitization ---

def sanitize_email_header(value: str) -> str:
    """
    Sanitize a value for use in email headers.
    Removes CRLF characters to prevent header injection.
    """
    if not isinstance(value, str):
        return ""
    # Remove CR, LF, and null bytes
    return re.sub(r"[\r\n\x00]", "", value).strip()


# --- Filename Sanitization ---

def sanitize_filename(filename: str) -> str:
    """
    Sanitize a filename to prevent directory traversal and special character attacks.
    Returns a safe filename suitable for filesystem storage.
    """
    if not filename:
        return "unnamed_file"

    # Remove directory separators and traversal sequences
    filename = filename.replace("\\", "/")
    filename = os.path.basename(filename)  # Get just the filename part

    # Remove directory traversal patterns
    filename = filename.replace("..", "")

    # Remove null bytes
    filename = filename.replace("\x00", "")

    # Only allow safe characters: alphanumeric, dash, underscore, dot, space
    filename = re.sub(r"[^\w\-. ]", "_", filename)

    # Remove leading/trailing dots and spaces
    filename = filename.strip(". ")

    # Ensure we have a valid filename
    if not filename:
        return "unnamed_file"

    return filename


# --- Numeric Validation ---

def validate_numeric_range(
    value, min_val: Optional[float] = None, max_val: Optional[float] = None,
    param_name: str = "value"
) -> float:
    """
    Validate that a value is numeric and within the specified range.
    Returns the validated float value.
    Raises ValueError if validation fails.
    """
    try:
        num_value = float(value)
    except (ValueError, TypeError):
        raise ValueError(f"{param_name} must be a valid number")

    if min_val is not None and num_value < min_val:
        raise ValueError(f"{param_name} must be at least {min_val}")

    if max_val is not None and num_value > max_val:
        raise ValueError(f"{param_name} must not exceed {max_val}")

    return num_value


# --- Log Message Sanitization ---

def sanitize_log_message(message: str) -> str:
    """
    Sanitize a message for safe log output.
    Encodes newlines and control characters to prevent log injection.
    """
    if not isinstance(message, str):
        message = str(message)

    # Encode newlines
    message = message.replace("\n", "\\n").replace("\r", "\\r")

    # Remove other control characters
    message = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", message)

    return message


# --- File Upload Validation ---

ALLOWED_FILE_EXTENSIONS = {".xlsx", ".xls", ".xlsm", ".csv", ".pdf", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

# Magic bytes for common file types
FILE_SIGNATURES = {
    b"\x50\x4b\x03\x04": {".xlsx", ".xlsm", ".xls"},  # ZIP-based (Office Open XML)
    b"\xd0\xcf\x11\xe0": {".xls"},  # OLE2 (legacy Excel)
    b"%PDF": {".pdf"},
    b"\x89PNG": {".png"},
    b"\xff\xd8\xff": {".jpg", ".jpeg"},
}


def validate_file_upload(
    filename: str,
    file_size: int,
    file_content_start: bytes = b"",
    allowed_extensions: set = None,
    max_size: int = None,
) -> tuple[bool, str]:
    """
    Validate a file upload for type, size, and content.
    Returns (is_valid, error_message).
    """
    if allowed_extensions is None:
        allowed_extensions = ALLOWED_FILE_EXTENSIONS
    if max_size is None:
        max_size = MAX_FILE_SIZE_BYTES

    # Check filename
    safe_name = sanitize_filename(filename)
    _, ext = os.path.splitext(safe_name)
    ext = ext.lower()

    if ext not in allowed_extensions:
        return False, f"File type '{ext}' is not allowed. Allowed types: {', '.join(sorted(allowed_extensions))}"

    # Check file size
    if file_size > max_size:
        max_mb = max_size / (1024 * 1024)
        return False, f"File size exceeds the maximum limit of {max_mb:.0f} MB"

    if file_size == 0:
        return False, "File is empty"

    # Check magic bytes (content-type verification)
    if file_content_start and len(file_content_start) >= 4:
        matched = False
        for signature, valid_exts in FILE_SIGNATURES.items():
            if file_content_start.startswith(signature):
                if ext in valid_exts:
                    matched = True
                    break
        # For CSV files, no magic bytes to check (they're plain text)
        if ext == ".csv":
            matched = True
        # If we have signatures but none matched (and it's not CSV), warn
        if not matched and ext != ".csv":
            return False, "File content does not match the expected file type"

    return True, ""
