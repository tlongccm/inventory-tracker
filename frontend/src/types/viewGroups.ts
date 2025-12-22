// View group configuration types for configurable list views

export type ViewGroupKey = 'summary' | 'spec' | 'performance' | 'history' | 'full';

export interface ViewGroupDefinition {
  key: ViewGroupKey;
  label: string;
  fields: string[];
}

export interface ViewPreferences {
  summary: boolean;
  spec: boolean;
  performance: boolean;
  history: boolean;
  full: boolean;
}

export const DEFAULT_VIEW_PREFERENCES: ViewPreferences = {
  summary: false,
  spec: false,
  performance: false,
  history: false,
  full: false,
};

// View group labels for toggle buttons
export const VIEW_GROUP_LABELS: Record<ViewGroupKey, string> = {
  summary: 'Summary',
  spec: 'Spec',
  performance: 'Performance',
  history: 'History',
  full: 'Full',
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
