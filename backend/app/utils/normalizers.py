"""Field normalizers for Equipment data."""

import re
from typing import Optional


# Abbreviations to preserve as uppercase in title case conversion
PRESERVE_UPPERCASE = {'CEO', 'SFF', 'PC', 'IT', 'HR', 'CFO', 'CTO', 'VP', 'COO', 'CMO', 'CIO', 'CSO'}


def normalize_mac_address(value: Optional[str]) -> Optional[str]:
    """Normalize MAC address to uppercase with colons.

    Accepts:
    - 1C:87:2C:59:E3:C9 (already normalized)
    - 1C-87-2C-59-E3-C9 (dashes)
    - 1c872c59e3c9 (no separators, lowercase)
    - 1c:87:2c:59:e3:c9 (lowercase with colons)
    - WLAN: 28:0C:50:AD:5B:10 (with prefix)
    - LAN: C8:53:09:D0:43:0A\nWLAN: 40:D1:33:19:0F:9B (multi-line)

    Returns:
    - 1C:87:2C:59:E3:C9 (uppercase with colons)
    - For multi-line, returns newline-separated normalized MACs
    - None if input is None or empty
    - Original value if no valid MAC address found
    """
    if not value or not value.strip():
        return None

    # MAC address pattern: 12 hex chars with optional separators
    mac_pattern = re.compile(r'([0-9A-Fa-f]{2}[:\-]){5}[0-9A-Fa-f]{2}|[0-9A-Fa-f]{12}')

    # Find all MAC addresses in the value
    matches = mac_pattern.findall(value) if not mac_pattern.search(value) else [m.group() for m in mac_pattern.finditer(value)]

    if not matches:
        # Try to extract from the raw value directly
        clean = value.strip().upper().replace(':', '').replace('-', '').replace(' ', '')
        # Remove common prefixes
        for prefix in ['WLAN', 'LAN', 'WIFI', 'ETH', 'ETHERNET']:
            clean = clean.replace(prefix, '')

        if len(clean) == 12 and all(c in '0123456789ABCDEF' for c in clean):
            return ':'.join(clean[i:i+2] for i in range(0, 12, 2))
        return value.strip()  # Return original if invalid

    # Normalize each found MAC address
    normalized = []
    for mac in matches:
        clean = mac.upper().replace(':', '').replace('-', '')
        if len(clean) == 12 and all(c in '0123456789ABCDEF' for c in clean):
            normalized.append(':'.join(clean[i:i+2] for i in range(0, 12, 2)))

    if not normalized:
        return value.strip()

    return '\n'.join(normalized)


def normalize_cpu_speed(value: Optional[str]) -> Optional[str]:
    """Normalize CPU speed to have space between number and unit.

    Accepts:
    - 2.5 (number only - defaults to GHz)
    - 2.5GHz (no space)
    - 2.5 GHz (already normalized)
    - 3.20mhz (lowercase)

    Returns:
    - 2.5 GHz (space, proper case)
    - None if input is None or empty
    - Original value if not a recognized format
    """
    if not value or not value.strip():
        return None

    value = value.strip()

    # Match number optionally followed by unit
    match = re.match(r'^([\d.]+)\s*(GHz|MHz)?$', value, re.IGNORECASE)
    if not match:
        return value  # Return as-is if doesn't match expected pattern

    number, unit = match.groups()
    # Default to GHz if no unit provided
    unit = unit.upper() if unit else 'GHz'

    # Ensure proper capitalization
    if unit == 'GHZ':
        unit = 'GHz'
    elif unit == 'MHZ':
        unit = 'MHz'

    return f"{number} {unit}"


def to_title_case(value: Optional[str]) -> Optional[str]:
    """Convert string to title case, preserving known abbreviations.

    Accepts any string and converts to title case, keeping abbreviations
    like CEO, SFF, PC, IT, HR, etc. in uppercase.

    Examples:
    - "active" -> "Active"
    - "in storage" -> "In Storage"
    - "ceo computer" -> "CEO Computer"
    - "it department" -> "IT Department"
    - "sff desktop" -> "SFF Desktop"

    Returns:
    - Title-cased string with abbreviations preserved
    - None if input is None or empty
    """
    if not value or not value.strip():
        return None

    words = value.strip().split()
    result = []

    for word in words:
        upper = word.upper()
        if upper in PRESERVE_UPPERCASE:
            result.append(upper)
        else:
            result.append(word.title())

    return ' '.join(result)


def normalize_equipment_id(value: Optional[str]) -> Optional[str]:
    """Normalize Equipment ID to uppercase.

    Accepts:
    - PC-0001 (already uppercase)
    - pc-0001 (lowercase)
    - Pc-0001 (mixed case)

    Returns:
    - PC-0001 (uppercase)
    - None if input is None or empty
    """
    if not value or not value.strip():
        return None

    return value.strip().upper()
