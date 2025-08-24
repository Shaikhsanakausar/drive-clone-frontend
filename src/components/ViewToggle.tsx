import { Button } from '@/components/ui/button';
import { List, Grid3X3 } from 'lucide-react';

interface ViewToggleProps {
  viewType: 'list' | 'grid';
  onViewTypeChange: (viewType: 'list' | 'grid') => void;
}

export const ViewToggle = ({ viewType, onViewTypeChange }: ViewToggleProps) => {
  return (
    <div className="flex border rounded-lg overflow-hidden">
      <Button
        variant={viewType === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewTypeChange('list')}
        className="rounded-none"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={viewType === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewTypeChange('grid')}
        className="rounded-none"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
    </div>
  );
};