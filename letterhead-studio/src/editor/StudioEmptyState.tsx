import type { ReactNode } from 'react';

interface StudioEmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
}

export function StudioEmptyState({ icon, title, description }: StudioEmptyStateProps) {
  return (
    <div className="studio-empty-state" role="status">
      <div className="studio-empty-state-icon" aria-hidden>
        {icon}
      </div>
      <p className="studio-empty-state-title">{title}</p>
      {description ? <p className="studio-empty-state-desc">{description}</p> : null}
    </div>
  );
}
