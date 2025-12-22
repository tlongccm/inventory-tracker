"""Field validators for Equipment data."""

import re
from typing import Optional, Tuple


# IPv4 regex pattern - validates each octet is 0-255
IPV4_PATTERN = re.compile(
    r'^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$'
)

# MAC address pattern - matches 12 hex characters with optional separators
MAC_PATTERN = re.compile(r'^([0-9A-Fa-f]{2}[:\-]?){5}[0-9A-Fa-f]{2}$|^[0-9A-Fa-f]{12}$')

# Equipment ID pattern - {TYPE}-NNNN format
EQUIPMENT_ID_PATTERN = re.compile(r'^(PC|MON|SCN|PRN)-\d{4}$', re.IGNORECASE)

# CPU speed pattern - matches number optionally followed by GHz/MHz
CPU_SPEED_PATTERN = re.compile(r'^([\d.]+)\s*(GHz|MHz)?$', re.IGNORECASE)


def validate_ipv4(value: str) -> Tuple[bool, Optional[str]]:
    """Validate IPv4 address format.

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not value or not value.strip():
        return (True, None)  # Empty is valid (nullable field)

    value = value.strip()

    if IPV4_PATTERN.match(value):
        return (True, None)

    # Provide helpful error message
    parts = value.split('.')
    if len(parts) != 4:
        return (False, f"Invalid IPv4 address format. Expected 4 octets separated by dots, got {len(parts)}.")

    for i, part in enumerate(parts):
        try:
            num = int(part)
            if num < 0 or num > 255:
                return (False, f"Invalid IPv4 address format. Octet {i+1} ({num}) is out of range (0-255).")
        except ValueError:
            return (False, f"Invalid IPv4 address format. Octet {i+1} ('{part}') is not a valid number.")

    return (False, "Invalid IPv4 address format. Expected format: xxx.xxx.xxx.xxx where each octet is 0-255.")


def validate_mac_address(value: str) -> Tuple[bool, Optional[str]]:
    """Validate MAC address format.

    Accepts formats:
    - 1C:87:2C:59:E3:C9 (colons)
    - 1C-87-2C-59-E3-C9 (dashes)
    - 1C872C59E3C9 (no separators)
    - WLAN: 28:0C:50:AD:5B:10 (with prefix - MAC extracted)
    - LAN: XX:XX:XX:XX:XX:XX\nWLAN: YY:YY:YY:YY:YY:YY (multi-line)

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not value or not value.strip():
        return (True, None)  # Empty is valid (nullable field)

    value = value.strip()

    # MAC address pattern: 12 hex chars with optional separators
    mac_pattern = re.compile(r'([0-9A-Fa-f]{2}[:\-]){5}[0-9A-Fa-f]{2}|[0-9A-Fa-f]{12}')

    # Find all MAC addresses in the value
    matches = [m.group() for m in mac_pattern.finditer(value)]

    if matches:
        # Validate each found MAC
        for mac in matches:
            clean = mac.upper().replace(':', '').replace('-', '')
            if len(clean) != 12:
                return (False, f"Invalid MAC address format. Expected 12 hexadecimal characters.")
            if not all(c in '0123456789ABCDEF' for c in clean):
                return (False, f"Invalid MAC address format. Contains invalid characters.")
        return (True, None)

    # No pattern match - try direct validation
    clean = value.upper().replace(':', '').replace('-', '')

    if len(clean) != 12:
        return (False, f"Invalid MAC address format. Expected 12 hexadecimal characters, got {len(clean)}.")

    if not all(c in '0123456789ABCDEF' for c in clean):
        invalid_chars = [c for c in clean if c not in '0123456789ABCDEF']
        return (False, f"Invalid MAC address format. Contains invalid characters: {', '.join(set(invalid_chars))}.")

    return (True, None)


def validate_equipment_id(value: str) -> Tuple[bool, Optional[str]]:
    """Validate Equipment ID format ({TYPE}-NNNN).

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not value or not value.strip():
        return (True, None)  # Empty is valid (will be auto-generated)

    value = value.strip().upper()

    if EQUIPMENT_ID_PATTERN.match(value):
        return (True, None)

    # Provide helpful error message
    if '-' not in value:
        return (False, "Invalid Equipment ID format. Expected format: PC-0001, MON-0001, SCN-0001, or PRN-0001.")

    parts = value.split('-')
    if len(parts) != 2:
        return (False, "Invalid Equipment ID format. Expected exactly one hyphen separating type and number.")

    type_part, num_part = parts
    valid_types = ['PC', 'MON', 'SCN', 'PRN']

    if type_part not in valid_types:
        return (False, f"Invalid Equipment ID prefix. Expected one of: {', '.join(valid_types)}. Got: {type_part}.")

    if not num_part.isdigit() or len(num_part) != 4:
        return (False, f"Invalid Equipment ID number. Expected 4 digits (e.g., 0001). Got: {num_part}.")

    return (True, None)


def validate_cpu_speed(value: str) -> Tuple[bool, Optional[str]]:
    """Validate CPU speed format.

    Accepts formats like: 2.5, 2.5GHz, 2.5 GHz, 3.20MHz

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not value or not value.strip():
        return (True, None)  # Empty is valid (nullable field)

    value = value.strip()

    if CPU_SPEED_PATTERN.match(value):
        return (True, None)

    return (False, "Invalid CPU speed format. Expected format: X.XX GHz or X.XX MHz (e.g., 2.5 GHz, 3.20 GHz).")


def validate_title_case_value(value: str, field_name: str) -> Tuple[bool, Optional[str]]:
    """Validate that a string value can be converted to title case.

    This is a permissive validator - it accepts any non-empty string
    since all values will be normalized to title case on save.

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not value or not value.strip():
        return (True, None)  # Empty is valid (nullable field)

    # All non-empty strings are valid - they'll be normalized on save
    return (True, None)
