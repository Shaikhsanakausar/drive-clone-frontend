import { useEffect, useState } from 'react';
import { useProfiles } from '@/hooks/useProfiles';
import { Progress } from '@/components/ui/progress';
import { formatBytes } from '@/lib/utils';
import { HardDrive } from 'lucide-react';

export const StorageUsage = () => {
  const { profile, getStorageUsage } = useProfiles();
  const [usedStorage, setUsedStorage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStorageUsage = async () => {
      const usage = await getStorageUsage();
      setUsedStorage(usage);
      setLoading(false);
    };

    fetchStorageUsage();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStorageUsage, 30000);
    return () => clearInterval(interval);
  }, [getStorageUsage]);

  if (loading || !profile) {
    return <div className="animate-pulse bg-muted h-16 rounded-lg" />;
  }

  const totalStorage = profile.storage_quota_bytes;
  const usedPercentage = (usedStorage / totalStorage) * 100;

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <HardDrive className="h-4 w-4" />
        <span className="text-sm font-medium">Storage Usage</span>
      </div>
      <div className="space-y-2">
        <Progress value={usedPercentage} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatBytes(usedStorage)} used</span>
          <span>{formatBytes(totalStorage)} total</span>
        </div>
      </div>
    </div>
  );
};