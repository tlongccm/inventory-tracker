/**
 * API client service for Equipment Inventory Tracker.
 * Base configuration for localhost:8000.
 */

import type {
  Equipment,
  EquipmentListItem,
  EquipmentCreate,
  EquipmentUpdate,
  EquipmentFilters,
  AssignmentHistoryItem,
  ImportResult,
  ApiError,
} from '../types/equipment';

import type {
  Software,
  SoftwareListItem,
  SoftwareCreate,
  SoftwareUpdate,
  SoftwareFilters,
  SoftwareImportResult,
} from '../types/software';

const API_BASE_URL = '/api/v1';

/**
 * Generic fetch wrapper with error handling.
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: `HTTP error ${response.status}`,
    }));
    throw new Error(error.detail);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Build query string from filter parameters.
 */
function buildQueryString(filters: EquipmentFilters): string {
  const params = new URLSearchParams();

  if (filters.status) params.append('status', filters.status);
  if (filters.equipment_type) params.append('equipment_type', filters.equipment_type);
  if (filters.usage_type) params.append('usage_type', filters.usage_type);
  if (filters.location) params.append('location', filters.location);
  if (filters.primary_user) params.append('primary_user', filters.primary_user);
  if (filters.model) params.append('model', filters.model);
  if (filters.min_rating !== undefined) params.append('min_rating', filters.min_rating.toString());
  if (filters.max_rating !== undefined) params.append('max_rating', filters.max_rating.toString());
  if (filters.sort_by) params.append('sort_by', filters.sort_by);
  if (filters.sort_order) params.append('sort_order', filters.sort_order);
  if (filters.include_deleted) params.append('include_deleted', 'true');

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

// Equipment API methods

export async function listEquipment(
  filters: EquipmentFilters = {}
): Promise<EquipmentListItem[]> {
  const query = buildQueryString(filters);
  return fetchApi<EquipmentListItem[]>(`/computers${query}`);
}

export async function getEquipment(identifier: string): Promise<Equipment> {
  return fetchApi<Equipment>(`/computers/${encodeURIComponent(identifier)}`);
}

export async function createEquipment(data: EquipmentCreate): Promise<Equipment> {
  return fetchApi<Equipment>('/computers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEquipment(
  identifier: string,
  data: EquipmentUpdate
): Promise<Equipment> {
  return fetchApi<Equipment>(`/computers/${encodeURIComponent(identifier)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteEquipment(identifier: string): Promise<void> {
  return fetchApi<void>(`/computers/${encodeURIComponent(identifier)}`, {
    method: 'DELETE',
  });
}

export async function restoreEquipment(identifier: string): Promise<Equipment> {
  return fetchApi<Equipment>(`/computers/${encodeURIComponent(identifier)}/restore`, {
    method: 'POST',
  });
}

// Assignment History API

export async function getEquipmentHistory(
  identifier: string
): Promise<AssignmentHistoryItem[]> {
  return fetchApi<AssignmentHistoryItem[]>(
    `/computers/${encodeURIComponent(identifier)}/history`
  );
}

// Admin API

export async function listDeletedEquipment(): Promise<EquipmentListItem[]> {
  return fetchApi<EquipmentListItem[]>('/admin/deleted');
}

// Import/Export API

export async function exportEquipment(includeDeleted = false): Promise<void> {
  const query = includeDeleted ? '?include_deleted=true' : '';
  const url = `${API_BASE_URL}/computers/export${query}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Export failed');
  }

  // Trigger download
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;

  // Extract filename from Content-Disposition header or use default
  const contentDisposition = response.headers.get('Content-Disposition');
  const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
  link.download = filenameMatch ? filenameMatch[1] : 'equipment_export.csv';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

export async function importEquipment(file: File): Promise<ImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/computers/import`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: `HTTP error ${response.status}`,
    }));
    throw new Error(error.detail);
  }

  return response.json();
}

// ============================================================================
// Software API Methods
// ============================================================================

/**
 * Build query string from software filter parameters.
 */
function buildSoftwareQueryString(filters: SoftwareFilters): string {
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.status) params.append('status', filters.status);
  if (filters.type) params.append('type', filters.type);
  if (filters.vendor) params.append('vendor', filters.vendor);
  if (filters.purchaser) params.append('purchaser', filters.purchaser);
  if (filters.deployment) params.append('deployment', filters.deployment);
  if (filters.sort_by) params.append('sort_by', filters.sort_by);
  if (filters.sort_order) params.append('sort_order', filters.sort_order);
  if (filters.include_deleted) params.append('include_deleted', 'true');

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export async function listSoftware(
  filters: SoftwareFilters = {}
): Promise<SoftwareListItem[]> {
  const query = buildSoftwareQueryString(filters);
  return fetchApi<SoftwareListItem[]>(`/software${query}`);
}

export async function getSoftware(identifier: string): Promise<Software> {
  return fetchApi<Software>(`/software/${encodeURIComponent(identifier)}`);
}

export async function createSoftware(data: SoftwareCreate): Promise<Software> {
  return fetchApi<Software>('/software', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSoftware(
  identifier: string,
  data: SoftwareUpdate
): Promise<Software> {
  return fetchApi<Software>(`/software/${encodeURIComponent(identifier)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSoftware(identifier: string): Promise<void> {
  return fetchApi<void>(`/software/${encodeURIComponent(identifier)}`, {
    method: 'DELETE',
  });
}

export async function restoreSoftware(id: number): Promise<Software> {
  return fetchApi<Software>(`/software/${id}/restore`, {
    method: 'POST',
  });
}

// Software Admin API

export async function listDeletedSoftware(): Promise<SoftwareListItem[]> {
  return fetchApi<SoftwareListItem[]>('/admin/deleted-software');
}

// Software Import/Export API

export async function exportSoftware(includeDeleted = false): Promise<void> {
  const query = includeDeleted ? '?include_deleted=true' : '';
  const url = `${API_BASE_URL}/software/export${query}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Export failed');
  }

  // Trigger download
  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;

  // Extract filename from Content-Disposition header or use default
  const contentDisposition = response.headers.get('Content-Disposition');
  const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
  link.download = filenameMatch ? filenameMatch[1] : 'software_export.csv';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

export async function importSoftware(file: File): Promise<SoftwareImportResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/software/import`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: `HTTP error ${response.status}`,
    }));
    throw new Error(error.detail);
  }

  return response.json();
}
