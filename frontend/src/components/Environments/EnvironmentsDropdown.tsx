import { useState } from 'react';
import type { RailwayEnvironment } from '../../types/types';
import './EnvironmentsDropdown.css';

interface EnvironmentsDropdownProps {
  environments: RailwayEnvironment[];
  selectedEnvironment: RailwayEnvironment | null;
  onEnvironmentChange: (environment: RailwayEnvironment) => void;
}

export function EnvironmentsDropdown({
  environments,
  selectedEnvironment,
  onEnvironmentChange,
}: EnvironmentsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isSingleEnvironment = environments.length === 1;

  const handleSelect = (environment: RailwayEnvironment) => {
    onEnvironmentChange(environment);
    setIsOpen(false);
  };

  if (environments.length === 0) {
    return null;
  }

  return (
    <div className="environments-dropdown">
      <button
        className={`environments-dropdown-toggle ${isSingleEnvironment ? 'disabled' : ''}`}
        onClick={() => !isSingleEnvironment && setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        disabled={isSingleEnvironment}
      >
        <span className="environments-selected">
          {selectedEnvironment?.name || environments[0]?.name || 'Select environment'}
        </span>
        {!isSingleEnvironment && (
          <span className="environments-arrow">{isOpen ? '▲' : '▼'}</span>
        )}
      </button>
      {isOpen && !isSingleEnvironment && (
        <>
          <div className="environments-overlay" onClick={() => setIsOpen(false)} />
          <ul className="environments-list">
            {environments.map((environment) => (
              <li
                key={environment.id}
                className={`environments-item ${
                  selectedEnvironment?.id === environment.id ? 'selected' : ''
                }`}
                onClick={() => handleSelect(environment)}
              >
                {environment.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}