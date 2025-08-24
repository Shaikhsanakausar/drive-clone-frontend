import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useWorkspaces } from './useWorkspaces';

interface FileData {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  storage_path: string;
  created_at: string;
  updated_at: string;
  is_folder: boolean;
  parent_folder_id: string | null;
  is_starred: boolean;
  is_trashed: boolean;
  last_accessed_at: string;
  shared_publicly: boolean;
  public_share_token: string | null;
  user_id: string;
  workspace_id: string | null;
}

type SortField = 'name' | 'size' | 'mime_type' | 'created_at';
type SortOrder = 'asc' | 'desc';
type ViewType = 'list' | 'grid';

export const useFiles = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewType, setViewType] = useState<ViewType>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspaces();

  const fetchFiles = async (folderId?: string | null, query?: string) => {
    if (!user) return;
    
    try {
      let queryBuilder = supabase
        .from('files')
        .select('*')
        .eq('is_trashed', false);

      // Filter by workspace
      if (currentWorkspace) {
        queryBuilder = queryBuilder.eq('workspace_id', currentWorkspace.id);
      } else {
        queryBuilder = queryBuilder.is('workspace_id', null);
      }

      // Filter by folder
      if (folderId) {
        queryBuilder = queryBuilder.eq('parent_folder_id', folderId);
      } else {
        queryBuilder = queryBuilder.is('parent_folder_id', null);
      }

      // Search functionality
      if (query) {
        queryBuilder = queryBuilder.ilike('name', `%${query}%`);
      }

      // Sorting
      queryBuilder = queryBuilder.order(sortField, { ascending: sortOrder === 'asc' });

      const { data, error } = await queryBuilder;

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Failed to fetch files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async (name: string, parentFolderId?: string | null) => {
    if (!user) return;
    
    setUploading(true);
    try {
      const { error } = await supabase
        .from('files')
        .insert({
          name: name,
          size: 0,
          mime_type: 'folder',
          storage_path: '',
          user_id: user.id,
          is_folder: true,
          parent_folder_id: parentFolderId || null,
          workspace_id: currentWorkspace?.id || null,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Folder "${name}" created successfully`,
      });

      await fetchFiles(currentFolderId, searchQuery);
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadFromUrl = async (url: string) => {
    if (!user) return;
    
    setUploading(true);
    try {
      // Fetch the file from URL
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch file from URL');
      
      const blob = await response.blob();
      const fileName = url.split('/').pop() || 'downloaded-file';
      const file = new File([blob], fileName, { type: blob.type });
      
      await uploadFile(file);
    } catch (error) {
      console.error('Error uploading from URL:', error);
      toast({
        title: "Error",
        description: "Failed to upload file from URL",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadFile = async (file: File, parentFolderId?: string | null) => {
    if (!user) return;
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          name: file.name,
          size: file.size,
          mime_type: file.type,
          storage_path: filePath,
          user_id: user.id,
          is_folder: false,
          parent_folder_id: parentFolderId || currentFolderId,
          workspace_id: currentWorkspace?.id || null,
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: `${file.name} uploaded successfully`,
      });

      await fetchFiles(currentFolderId, searchQuery);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const toggleStar = async (fileId: string, isStarred: boolean) => {
    try {
      const { error } = await supabase
        .from('files')
        .update({ is_starred: !isStarred, last_accessed_at: new Date().toISOString() })
        .eq('id', fileId);

      if (error) throw error;

      toast({
        title: "Success",
        description: isStarred ? "Removed from starred" : "Added to starred",
      });

      await fetchFiles(currentFolderId, searchQuery);
    } catch (error) {
      console.error('Error toggling star:', error);
      toast({
        title: "Error",
        description: "Failed to update file",
        variant: "destructive",
      });
    }
  };

  const moveToTrash = async (fileIds: string[]) => {
    try {
      const { error } = await supabase.rpc('move_to_trash', { file_ids: fileIds });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${fileIds.length} item(s) moved to trash`,
      });

      await fetchFiles(currentFolderId, searchQuery);
    } catch (error) {
      console.error('Error moving to trash:', error);
      toast({
        title: "Error",
        description: "Failed to move items to trash",
        variant: "destructive",
      });
    }
  };

  const restoreFromTrash = async (fileIds: string[]) => {
    try {
      const { error } = await supabase.rpc('restore_from_trash', { file_ids: fileIds });

      if (error) throw error;

      toast({
        title: "Success",
        description: `${fileIds.length} item(s) restored`,
      });

      await fetchFiles(currentFolderId, searchQuery);
    } catch (error) {
      console.error('Error restoring from trash:', error);
      toast({
        title: "Error",
        description: "Failed to restore items",
        variant: "destructive",
      });
    }
  };

  const generateShareLink = async (fileId: string) => {
    try {
      // Generate share token
      const { data: tokenData, error: tokenError } = await supabase.rpc('generate_share_token');
      if (tokenError) throw tokenError;

      // Update file with share settings
      const { error: updateError } = await supabase
        .from('files')
        .update({ 
          shared_publicly: true, 
          public_share_token: tokenData,
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', fileId);

      if (updateError) throw updateError;

      const shareUrl = `${window.location.origin}/shared/${tokenData}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Success",
        description: "Share link copied to clipboard",
      });

      await fetchFiles(currentFolderId, searchQuery);
      
      return shareUrl;
    } catch (error) {
      console.error('Error generating share link:', error);
      toast({
        title: "Error",
        description: "Failed to generate share link",
        variant: "destructive",
      });
    }
  };

  const createAdvancedShare = async (fileId: string, options: {
    shareType: 'public' | 'private';
    permissionLevel: 'viewer' | 'editor';
    email?: string;
    expiresIn?: string;
  }) => {
    try {
      let expiresAt = null;
      if (options.expiresIn && options.expiresIn !== 'never') {
        const days = parseInt(options.expiresIn);
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
      }

      const { data: shareToken, error } = await supabase.rpc('create_file_share_and_notify', {
        p_file_id: fileId,
        p_shared_with_email: options.email || null,
        p_share_type: options.shareType,
        p_permission_level: options.permissionLevel,
        p_expires_at: expiresAt?.toISOString() || null
      });

      if (error) throw error;

      const shareUrl = `${window.location.origin}/shared/${shareToken}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Success",
        description: options.email 
          ? `Share link created and will be sent to ${options.email}`
          : "Share link copied to clipboard",
      });

      await fetchFiles(currentFolderId, searchQuery);
      
      return shareUrl;
    } catch (error) {
      console.error('Error creating advanced share:', error);
      toast({
        title: "Error",
        description: "Failed to create share link",
        variant: "destructive",
      });
    }
  };

  const deleteFile = async (fileId: string, storagePath: string) => {
    try {
      // Delete from storage if it's a file
      if (storagePath) {
        const { error: storageError } = await supabase.storage
          .from('files')
          .remove([storagePath]);

        if (storageError) throw storageError;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Item deleted permanently",
      });

      await fetchFiles(currentFolderId, searchQuery);
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    }
  };

  const downloadFile = async (storagePath: string, fileName: string, fileId: string) => {
    try {
      // Update last accessed time
      await supabase
        .from('files')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('id', fileId);

      const { data, error } = await supabase.storage
        .from('files')
        .download(storagePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const getStarredFiles = async () => {
    if (!user) return [];
    
    try {
      let queryBuilder = supabase
        .from('files')
        .select('*')
        .eq('is_starred', true)
        .eq('is_trashed', false);

      // Filter by workspace
      if (currentWorkspace) {
        queryBuilder = queryBuilder.eq('workspace_id', currentWorkspace.id);
      } else {
        queryBuilder = queryBuilder.is('workspace_id', null);
      }

      const { data, error } = await queryBuilder.order('last_accessed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching starred files:', error);
      return [];
    }
  };

  const getRecentFiles = async () => {
    if (!user) return [];
    
    try {
      let queryBuilder = supabase
        .from('files')
        .select('*')
        .eq('is_trashed', false);

      // Filter by workspace
      if (currentWorkspace) {
        queryBuilder = queryBuilder.eq('workspace_id', currentWorkspace.id);
      } else {
        queryBuilder = queryBuilder.is('workspace_id', null);
      }

      const { data, error } = await queryBuilder
        .order('last_accessed_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent files:', error);
      return [];
    }
  };

  const getTrashedFiles = async () => {
    if (!user) return [];
    
    try {
      let queryBuilder = supabase
        .from('files')
        .select('*')
        .eq('is_trashed', true);

      // Filter by workspace
      if (currentWorkspace) {
        queryBuilder = queryBuilder.eq('workspace_id', currentWorkspace.id);
      } else {
        queryBuilder = queryBuilder.is('workspace_id', null);
      }

      const { data, error } = await queryBuilder.order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching trashed files:', error);
      return [];
    }
  };

  const navigateToFolder = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    fetchFiles(folderId, searchQuery);
  };

  const search = (query: string) => {
    setSearchQuery(query);
    fetchFiles(currentFolderId, query);
  };

  const sort = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
    fetchFiles(currentFolderId, searchQuery);
  };

  // Initialize files and refresh when workspace changes
  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchFiles(currentFolderId, searchQuery);
    }
  }, [user, currentFolderId, searchQuery, sortField, sortOrder, currentWorkspace]);

  // Reset to root folder when switching workspaces
  useEffect(() => {
    setCurrentFolderId(null);
  }, [currentWorkspace]);

  return {
    // State
    files,
    loading,
    uploading,
    currentFolderId,
    sortField,
    sortOrder,
    viewType,
    searchQuery,
    
    // Actions
    uploadFile,
    createFolder,
    uploadFromUrl,
    deleteFile,
    downloadFile,
    toggleStar,
    moveToTrash,
    restoreFromTrash,
    generateShareLink,
    createAdvancedShare,
    navigateToFolder,
    search,
    sort,
    setViewType,
    
    // Queries
    getStarredFiles,
    getRecentFiles,
    getTrashedFiles,
    
    // Utilities
    refetch: () => fetchFiles(currentFolderId, searchQuery),
  };
};