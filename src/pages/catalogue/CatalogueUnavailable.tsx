import { ReactNode } from 'react';
import CatalogueLayout from './CatalogueLayout';

interface CatalogueUnavailableSectionProps {
  active: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}

export function CatalogueUnavailableSection({
  active,
  title,
  description,
  children,
}: CatalogueUnavailableSectionProps) {
  return (
    <CatalogueLayout active={active}>
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">
          {description ?? 'Les données du catalogue sont indisponibles pour le moment.'}
        </p>
        {children}
      </div>
    </CatalogueLayout>
  );
}

export default CatalogueUnavailableSection;
