"""Password obfuscation utilities for subscription credentials.

Uses base64 + XOR obfuscation. This is NOT cryptographically secure but prevents
casual plaintext exposure in database dumps. Appropriate for internal-network-only
tool without authentication.
"""

import base64
from typing import Optional

XOR_KEY = 0x42


def obfuscate_password(password: Optional[str]) -> Optional[str]:
    """Obfuscate a password using XOR and base64 encoding.

    Args:
        password: The plaintext password to obfuscate.

    Returns:
        The obfuscated password string, or None if input is None/empty.
    """
    if not password:
        return None
    # Encode to UTF-8 first to handle Unicode characters
    password_bytes = password.encode('utf-8')
    obfuscated = bytes([b ^ XOR_KEY for b in password_bytes])
    return base64.b64encode(obfuscated).decode('utf-8')


def deobfuscate_password(obfuscated: Optional[str]) -> Optional[str]:
    """Deobfuscate a password that was encoded with obfuscate_password.

    Args:
        obfuscated: The obfuscated password string.

    Returns:
        The plaintext password, or None if input is None/empty.
    """
    if not obfuscated:
        return None
    data = base64.b64decode(obfuscated)
    # XOR back and decode from UTF-8
    deobfuscated = bytes([b ^ XOR_KEY for b in data])
    return deobfuscated.decode('utf-8')


def mask_password(password: Optional[str], visible_chars: int = 0) -> str:
    """Create a masked version of a password for display.

    Args:
        password: The password to mask.
        visible_chars: Number of characters to show (0 for all asterisks).

    Returns:
        A masked string like "********" or empty string if no password.
    """
    if not password:
        return ""
    if visible_chars <= 0 or visible_chars >= len(password):
        return "*" * len(password)
    return password[:visible_chars] + "*" * (len(password) - visible_chars)
