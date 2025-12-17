/**
 * ViewGroupToggle component - toggle buttons for view group visibility.
 */

import type { ViewPreferences, ViewGroupKey } from '../types/viewGroups';
import { VIEW_GROUP_LABELS } from '../types/viewGroups';
import { VIEW_GROUP_KEYS } from '../config/columns';

interface ViewGroupToggleProps {
  preferences: ViewPreferences;
  onToggle: (group: ViewGroupKey) => void;
}

export default function ViewGroupToggle({
  preferences,
  onToggle,
}: ViewGroupToggleProps) {
  return (
    <div className="view-group-toggle">
      {VIEW_GROUP_KEYS.map((group) => (
        <button
          key={group}
          className={`toggle-chip ${preferences[group] ? 'active' : ''}`}
          onClick={() => onToggle(group)}
          type="button"
        >
          {VIEW_GROUP_LABELS[group]}
        </button>
      ))}
    </div>
  );
}
