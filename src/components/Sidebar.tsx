import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FolderOpen, 
  Star, 
  Clock, 
  Share2, 
  Trash2,
  HardDrive,
  ChevronRight
} from 'lucide-react';
import { useFiles } from '@/hooks/useFiles';
import { StorageUsage } from './StorageUsage';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar = ({ currentView, onViewChange }: SidebarProps) => {
  const { getStarredFiles, getRecentFiles, getTrashedFiles } = useFiles();
  const [starredCount, setStarredCount] = useState(0);
  const [recentCount, setRecentCount] = useState(0);
  const [trashedCount, setTrashedCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      const [starred, recent, trashed] = await Promise.all([
        getStarredFiles(),
        getRecentFiles(),
        getTrashedFiles()
      ]);
      
      setStarredCount(starred.length);
      setRecentCount(recent.length);
      setTrashedCount(trashed.length);
    };

    fetchCounts();
    
    // Refresh counts every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [getStarredFiles, getRecentFiles, getTrashedFiles]);

  const menuItems = [
    {
      id: 'my-drive',
      label: 'My Drive',
      icon: FolderOpen,
      count: null,
    },
    {
      id: 'recent',
      label: 'Recent',
      icon: Clock,
      count: recentCount,
    },
    {
      id: 'starred',
      label: 'Starred',
      icon: Star,
      count: starredCount,
    },
    {
      id: 'shared',
      label: 'Shared with me',
      icon: Share2,
      count: null,
    },
    {
      id: 'trash',
      label: 'Trash',
      icon: Trash2,
      count: trashedCount,
    },
  ];

  return (
    <div className="w-64 min-h-screen bg-card border-r p-4 space-y-4">
      {/* Storage Usage */}
      <StorageUsage />
      
      <Separator />
      
      {/* Navigation Menu */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="mr-3 h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count !== null && item.count > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {item.count}
                </Badge>
              )}
              {isActive && <ChevronRight className="ml-2 h-3 w-3" />}
            </Button>
          );
        })}
      </nav>
    </div>
  );
};