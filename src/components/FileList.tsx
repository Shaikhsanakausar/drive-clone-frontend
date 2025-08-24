import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Trash2, 
  File, 
  FileImage, 
  FileText, 
  FileVideo, 
  FileAudio,
  Folder,
  Star,
  Share2,
  MoreVertical
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatBytes } from '@/lib/utils';

interface FileData {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  storage_path: string;
  created_at: string;
  updated_at?: string;
  is_folder: boolean;
  parent_folder_id: string | null;
  is_starred: boolean;
  is_trashed: boolean;
  last_accessed_at: string;
  shared_publicly: boolean;
  public_share_token: string | null;
  user_id: string;
}

interface FileListProps {
  files: FileData[];
  loading: boolean;
  onDownload: (storagePath: string, fileName: string, fileId: string) => void;
  onDelete: (fileId: string, storagePath: string) => void;
  onToggleStar?: (fileId: string, isStarred: boolean) => void;
  onShare?: (fileId: string) => void;
  onAdvancedShare?: (fileId: string, fileName: string) => void;
  onMoveToTrash?: (fileIds: string[]) => void;
  onNavigateToFolder?: (folderId: string) => void;
  viewType?: 'list' | 'grid';
  showActions?: boolean;
}

const getFileIcon = (mimeType: string, isFolder?: boolean) => {
  if (isFolder) {
    return <Folder className="h-5 w-5 text-blue-500" />;
  }
  
  if (mimeType?.startsWith('image/')) {
    return <FileImage className="h-5 w-5 text-green-500" />;
  } else if (mimeType?.startsWith('video/')) {
    return <FileVideo className="h-5 w-5 text-purple-500" />;
  } else if (mimeType?.includes('pdf')) {
    return <FileText className="h-5 w-5 text-red-500" />;
  } else if (mimeType?.startsWith('audio/')) {
    return <FileAudio className="h-5 w-5 text-orange-500" />;
  } else {
    return <File className="h-5 w-5 text-gray-500" />;
  }
};

export const FileList: React.FC<FileListProps> = ({ 
  files, 
  loading, 
  onDownload, 
  onDelete, 
  onToggleStar,
  onShare,
  onAdvancedShare,
  onMoveToTrash,
  onNavigateToFolder,
  viewType = 'list',
  showActions = true
}) => {
  if (loading) {
    return (
      <div className="border rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading files...</span>
        </div>
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <File className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No files found</h3>
        <p className="text-muted-foreground">Upload your first file to get started</p>
      </div>
    );
  }

  const handleItemClick = (file: FileData) => {
    if (file.is_folder && onNavigateToFolder) {
      onNavigateToFolder(file.id);
    } else if (!file.is_folder) {
      onDownload(file.storage_path, file.name, file.id);
    }
  };

  if (viewType === 'grid') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {files.map((file) => (
          <div key={file.id} className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer group">
            <div className="flex flex-col items-center space-y-2">
              <div className="text-4xl" onClick={() => handleItemClick(file)}>
                {getFileIcon(file.mime_type, file.is_folder)}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium truncate w-full" title={file.name}>
                  {file.name}
                </p>
                {!file.is_folder && (
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                )}
              </div>
              {showActions && (
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onToggleStar && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStar(file.id, file.is_starred);
                      }}
                    >
                      <Star className={`h-4 w-4 ${file.is_starred ? 'fill-current text-yellow-400' : ''}`} />
                    </Button>
                  )}
                  {(onShare || onAdvancedShare) && !file.is_folder && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {onShare && (
                          <DropdownMenuItem onClick={() => onShare(file.id)}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Quick Share
                          </DropdownMenuItem>
                        )}
                        {onAdvancedShare && (
                          <DropdownMenuItem onClick={() => onAdvancedShare(file.id, file.name)}>
                            <MoreVertical className="mr-2 h-4 w-4" />
                            Advanced Share
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {onMoveToTrash && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveToTrash([file.id]);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Modified</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id} className="hover:bg-muted/50">
              <TableCell 
                className="cursor-pointer flex items-center space-x-2"
                onClick={() => handleItemClick(file)}
              >
                {getFileIcon(file.mime_type, file.is_folder)}
                <div>
                  <div className="font-medium">{file.name}</div>
                  {file.is_starred && <Star className="h-3 w-3 fill-current text-yellow-400 inline ml-1" />}
                </div>
              </TableCell>
              <TableCell>{file.is_folder ? '-' : formatBytes(file.size)}</TableCell>
              <TableCell>{file.is_folder ? 'Folder' : file.mime_type}</TableCell>
              <TableCell>{new Date(file.updated_at || file.created_at).toLocaleDateString()}</TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    {onToggleStar && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleStar(file.id, file.is_starred)}
                      >
                        <Star className={`h-4 w-4 ${file.is_starred ? 'fill-current text-yellow-400' : ''}`} />
                      </Button>
                    )}
                    {(onShare || onAdvancedShare) && !file.is_folder && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {onShare && (
                            <DropdownMenuItem onClick={() => onShare(file.id)}>
                              <Share2 className="mr-2 h-4 w-4" />
                              Quick Share
                            </DropdownMenuItem>
                          )}
                          {onAdvancedShare && (
                            <DropdownMenuItem onClick={() => onAdvancedShare(file.id, file.name)}>
                              <MoreVertical className="mr-2 h-4 w-4" />
                              Advanced Share
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    {!file.is_folder && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownload(file.storage_path, file.name, file.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    {onMoveToTrash && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onMoveToTrash([file.id])}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};