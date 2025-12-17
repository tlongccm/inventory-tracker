// View group configuration types for configurable list views

export type ViewGroupKey = 'summary' | 'machineSpec' | 'machinePerformance' | 'assignment';

export interface ViewGroupDefinition {
  key: ViewGroupKey;
  label: string;
  fields: string[];
}

export interface ViewPreferences {
  summary: boolean;
  machineSpec: boolean;
  machinePerformance: boolean;
  assignment: boolean;
}

export const DEFAULT_VIEW_PREFERENCES: ViewPreferences = {
  summary: false,
  machineSpec: false,
  machinePerformance: false,
  assignment: false,
};

// View group labels for toggle buttons
export const VIEW_GROUP_LABELS: Record<ViewGroupKey, string> = {
  summary: 'Summary',
  machineSpec: 'Machine Specs',
  machinePerformance: 'Performance',
  assignment: 'Assignment',
};

// Search state for universal search functionality
export interface SearchState {
  term: string;
  isRegex: boolean;
  error: string | null;
  isValid: boolean;
}

export const DEFAULT_SEARCH_STATE: SearchState = {
  term: '',
  isRegex: false,
  error: null,
  isValid: true,
};
