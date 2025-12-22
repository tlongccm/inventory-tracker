# Research: Equipment Fields Update

**Branch**: `005-equipment-fields-update` | **Date**: 2025-12-21

## Research Tasks

### 1. IPv4 Validation Pattern

**Decision**: Use regex pattern `^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$`

**Rationale**: Standard IPv4 regex that validates each octet is 0-255. Python's `ipaddress` module could also be used but regex is simpler for validation-only use case and avoids additional imports.

**Alternatives Considered**:
- `ipaddress.IPv4Address()`: More robust but overkill for simple format validation
- Simple split-and-check: More code, less maintainable

### 2. MAC Address Normalization

**Decision**: Accept any format (colons, dashes, no separator), normalize to uppercase with colons

**Rationale**: Users may copy MAC addresses from various sources with different formats. Normalizing ensures consistent storage and display.

**Implementation**:
```python
def normalize_mac(value: str) -> str:
    # Remove all separators, uppercase, then insert colons
    clean = value.upper().replace(':', '').replace('-', '')
    if len(clean) != 12 or not all(c in '0123456789ABCDEF' for c in clean):
        raise ValueError("Invalid MAC address format")
    return ':'.join(clean[i:i+2] for i in range(0, 12, 2))
```

**Alternatives Considered**:
- Reject non-standard formats: Less user-friendly
- Store as-is: Inconsistent data, harder to search

### 3. CPU Speed Normalization

**Decision**: Ensure space between number and unit, default to GHz if unit missing

**Rationale**: CSV data has inconsistent formatting ("2.5GHz" vs "2.5 GHz"). Normalizing improves readability and consistency.

**Implementation**:
```python
import re
def normalize_cpu_speed(value: str) -> str:
    # Match number optionally followed by unit
    match = re.match(r'^([\d.]+)\s*(GHz|MHz)?$', value.strip(), re.IGNORECASE)
    if not match:
        return value  # Return as-is if doesn't match expected pattern
    number, unit = match.groups()
    unit = unit.upper() if unit else 'GHz'  # Default to GHz
    return f"{number} {unit}"
```

**Alternatives Considered**:
- Reject non-standard formats: Less user-friendly for bulk import
- Store numeric only: Loses unit information

### 4. Title Case Conversion for Enumerations

**Decision**: Use Python's `str.title()` with special handling for known abbreviations

**Rationale**: Title case ensures consistent display. Abbreviations like "CEO", "SFF", "PC" should remain uppercase.

**Implementation**:
```python
PRESERVE_UPPERCASE = {'CEO', 'SFF', 'PC', 'IT', 'HR', 'CFO', 'CTO', 'VP'}

def to_title_case(value: str) -> str:
    words = value.split()
    result = []
    for word in words:
        upper = word.upper()
        if upper in PRESERVE_UPPERCASE:
            result.append(upper)
        else:
            result.append(word.title())
    return ' '.join(result)
```

**Alternatives Considered**:
- Simple `str.title()`: Breaks abbreviations ("CEO" → "Ceo")
- Manual mapping: Not scalable for new abbreviations

### 5. Equipment ID Auto-Generation

**Decision**: Use existing `generate_equipment_id()` pattern with uppercase enforcement

**Rationale**: The codebase already has `EquipmentService.generate_equipment_id()` that handles per-type sequencing. Extend to handle CSV-provided IDs with uppercase normalization.

**Implementation Approach**:
1. If Equipment ID provided in CSV: validate format, uppercase, check uniqueness
2. If Equipment ID missing: auto-generate using existing service
3. Format validation: `{TYPE}-NNNN` where TYPE is PC/MON/SCN/PRN

**Alternatives Considered**:
- Always auto-generate: Loses existing IDs from source data
- Allow any format: Inconsistent data

### 6. Two-Phase Import Workflow

**Decision**: Single preview endpoint that returns all validation results, separate confirm endpoint

**Rationale**: Minimizes API calls. Frontend receives complete validation state in one request, user reviews/edits, then confirms.

**API Design**:
```
POST /api/v1/computers/import/preview
  Request: CSV file upload
  Response: {
    validated_rows: [...],      # Ready to import
    problematic_rows: [...],    # Has validation errors
    duplicate_rows: [...]       # Equipment ID already exists
  }

POST /api/v1/computers/import/confirm
  Request: { rows: [...] }      # Selected rows to import
  Response: ImportResult        # Same as current import result
```

**Alternatives Considered**:
- Real-time per-row validation: Too many API calls
- Client-side validation: Backend should be source of truth

### 7. Extensible Enumerations Storage

**Decision**: Store as validated strings, remove SQLAlchemy Enum constraints

**Rationale**: Per clarification session, no lookup tables. Change `SQLEnum` columns to `String` columns with application-level validation.

**Migration Approach**:
1. Alter columns from `SQLEnum` to `String` (Alembic migration)
2. Update Pydantic schemas to accept string with validation
3. Maintain backward compatibility with existing enum values

**Alternatives Considered**:
- Lookup tables: More complex, requires schema changes for new values
- Keep strict enums: Blocks new values without code changes

### 8. Markdown Rendering for Notes Field

**Decision**: Use `react-markdown` with `DOMPurify` for XSS sanitization

**Rationale**: `react-markdown` is the standard React solution for rendering markdown. DOMPurify provides robust XSS protection by sanitizing the HTML output before rendering.

**Implementation**:
```tsx
// MarkdownRenderer.tsx
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';

interface Props {
  content: string;
}

export default function MarkdownRenderer({ content }: Props) {
  // Sanitize content before rendering
  const sanitized = DOMPurify.sanitize(content);

  return (
    <div className="markdown-content">
      <ReactMarkdown>{sanitized}</ReactMarkdown>
    </div>
  );
}
```

**Supported Syntax**:
- Headers (`#`, `##`, `###`)
- Bold (`**text**`)
- Italic (`*text*`)
- Links (`[text](url)`)
- Unordered lists (`- item`)
- Ordered lists (`1. item`)
- Code (`\`code\``)
- Blockquotes (`> quote`)

**Alternatives Considered**:
- `marked` library: Good but requires manual React integration
- `markdown-it`: More features but heavier
- Raw `dangerouslySetInnerHTML`: Insecure without sanitization
- Server-side rendering: Adds backend complexity unnecessarily

## Dependencies

| Dependency | Purpose | Already in Project |
|------------|---------|-------------------|
| FastAPI | API framework | ✅ Yes |
| Pydantic | Validation schemas | ✅ Yes |
| SQLAlchemy | ORM | ✅ Yes |
| React | Frontend | ✅ Yes |
| react-markdown | Markdown rendering | ❌ NEW |
| dompurify | XSS sanitization | ❌ NEW |
| @types/dompurify | TypeScript types | ❌ NEW |

**New dependencies to install**:
```bash
cd frontend
npm install react-markdown dompurify @types/dompurify
```

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Alembic migration for enum→string | Medium - could affect existing data | Test migration on copy of production data first |
| Title case breaks abbreviations | Low - display issue | Use preservation list for known abbreviations |
| Equipment ID collision during bulk import | Medium - data integrity | Validate all IDs before any inserts |
