import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

type SortField = 'name' | 'size' | 'mime_type' | 'created_at';
type SortOrder = 'asc' | 'desc';

interface SortMenuProps {
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField, order: SortOrder) => void;
}

export const SortMenu = ({ sortField, sortOrder, onSort }: SortMenuProps) => {
  const sortOptions = [
    { field: 'name' as SortField, label: 'Name' },
    { field: 'size' as SortField, label: 'Size' },
    { field: 'mime_type' as SortField, label: 'Type' },
    { field: 'created_at' as SortField, label: 'Date Created' },
  ];

  const getSortIcon = (field: SortField) => {
    if (sortField === field) {
      return sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
    }
    return null;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle order if same field
      onSort(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to desc for new field
      onSort(field, 'desc');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Sort
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.field}
            onClick={() => handleSort(option.field)}
            className="flex items-center justify-between"
          >
            <span>{option.label}</span>
            {getSortIcon(option.field)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};