import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, FolderPlus, Link, Upload } from 'lucide-react';
import { useFiles } from '@/hooks/useFiles';
import { FileList } from '@/components/FileList';
import { CreateFolderDialog } from '@/components/CreateFolderDialog';
import { UploadUrlDialog } from '@/components/UploadUrlDialog';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { SearchBar } from '@/components/SearchBar';
import { ViewToggle } from '@/components/ViewToggle';
import { SortMenu } from '@/components/SortMenu';
import { Sidebar } from '@/components/Sidebar';
import { AdvancedShareDialog } from '@/components/AdvancedShareDialog';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';

const Dashboard = () => {
  const { user } = useAuth();
  const {
    files,
    loading,
    uploading,
    uploadFile,
    createFolder,
    uploadFromUrl,
    moveToTrash,
    deleteFile,
    downloadFile,
    toggleStar,
    generateShareLink,
    createAdvancedShare,
    navigateToFolder,
    search,
    sort,
    viewType,
    setViewType,
    sortField,
    sortOrder,
    getStarredFiles,
    getRecentFiles,
    getTrashedFiles
  } = useFiles();

  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUploadUrl, setShowUploadUrl] = useState(false);
  const [showAdvancedShare, setShowAdvancedShare] = useState(false);
  const [selectedFileForShare, setSelectedFileForShare] = useState<{id: string, name: string} | null>(null);
  const [currentView, setCurrentView] = useState('my-drive');
  const [viewFiles, setViewFiles] = useState(files);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    for (let i = 0; i < selectedFiles.length; i++) {
      await uploadFile(selectedFiles[i]);
    }
    
    e.target.value = '';
  };

  const handleViewChange = async (view: string) => {
    setCurrentView(view);
    
    switch (view) {
      case 'starred':
        setViewFiles(await getStarredFiles());
        break;
      case 'recent':
        setViewFiles(await getRecentFiles());
        break;
      case 'trash':
        setViewFiles(await getTrashedFiles());
        break;
      default:
        setViewFiles(files);
    }
  };

  const handleAdvancedShare = (fileId: string, fileName: string) => {
    setSelectedFileForShare({ id: fileId, name: fileName });
    setShowAdvancedShare(true);
  };

  const handleCreateAdvancedShare = async (options: {
    shareType: 'public' | 'private';
    permissionLevel: 'viewer' | 'editor';
    email?: string;
    expiresIn?: string;
  }) => {
    if (!selectedFileForShare) return;
    
    await createAdvancedShare(selectedFileForShare.id, options);
    setShowAdvancedShare(false);
    setSelectedFileForShare(null);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="container max-w-full mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Drive Clone</h1>
              <WorkspaceSelector />
              <SearchBar onSearch={search} />
            </div>
            
            <div className="flex items-center gap-4">
              <ViewToggle viewType={viewType} onViewTypeChange={setViewType} />
              <SortMenu sortField={sortField} sortOrder={sortOrder} onSort={sort} />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button disabled={uploading}>
                    <Plus className="h-4 w-4 mr-2" />
                    New
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setShowCreateFolder(true)}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    New Folder
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => document.getElementById('file-upload')?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowUploadUrl(true)}>
                    <Link className="mr-2 h-4 w-4" />
                    Upload from URL
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <span className="text-muted-foreground">{user?.email}</span>
              <ProfileDropdown />
            </div>
          </div>
        </header>

        {/* File Upload Input */}
        <input
          type="file"
          id="file-upload"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Main Files Area */}
        <main className="container max-w-full mx-auto px-6 py-8">
          <FileList
            files={currentView === 'my-drive' ? files : viewFiles}
            loading={loading}
            viewType={viewType}
            onDownload={downloadFile}
            onDelete={deleteFile}
            onToggleStar={toggleStar}
            onShare={generateShareLink}
            onAdvancedShare={handleAdvancedShare}
            onMoveToTrash={moveToTrash}
            onNavigateToFolder={navigateToFolder}
            showActions={currentView !== 'trash'}
          />
        </main>
      </div>

      {/* Dialogs */}
      <CreateFolderDialog
        open={showCreateFolder}
        onOpenChange={setShowCreateFolder}
        onCreateFolder={createFolder}
        loading={uploading}
      />

      <UploadUrlDialog
        open={showUploadUrl}
        onOpenChange={setShowUploadUrl}
        onUploadUrl={uploadFromUrl}
        loading={uploading}
      />

      <AdvancedShareDialog
        open={showAdvancedShare}
        onOpenChange={setShowAdvancedShare}
        onShare={handleCreateAdvancedShare}
        fileName={selectedFileForShare?.name || ''}
        loading={uploading}
      />
    </div>
  );
};

export default Dashboard;