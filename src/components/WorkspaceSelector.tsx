import { useState } from 'react';
import { Plus, Users, Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { CreateWorkspaceDialog } from './CreateWorkspaceDialog';
import { InviteMembersDialog } from './InviteMembersDialog';

export const WorkspaceSelector = () => {
  const { workspaces, currentWorkspace, switchWorkspace, loading } = useWorkspaces();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>{currentWorkspace?.name || 'Personal'}</span>
            <Badge variant="secondary" className="ml-2">
              {currentWorkspace ? 'Team' : 'Personal'}
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Personal workspace */}
          <DropdownMenuItem 
            onClick={() => switchWorkspace(null)}
            className="flex items-center space-x-2"
          >
            <div className="flex-1">
              <div className="font-medium">Personal</div>
              <div className="text-xs text-muted-foreground">Your personal files</div>
            </div>
            {!currentWorkspace && <Check className="h-4 w-4" />}
          </DropdownMenuItem>

          {/* Team workspaces */}
          {workspaces.map((workspace) => (
            <DropdownMenuItem 
              key={workspace.id}
              onClick={() => switchWorkspace(workspace)}
              className="flex items-center space-x-2"
            >
              <div className="flex-1">
                <div className="font-medium">{workspace.name}</div>
                {workspace.description && (
                  <div className="text-xs text-muted-foreground">
                    {workspace.description}
                  </div>
                )}
              </div>
              {currentWorkspace?.id === workspace.id && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          
          {/* Actions */}
          <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
          </DropdownMenuItem>
          
          {currentWorkspace && (
            <DropdownMenuItem onClick={() => setShowInviteDialog(true)}>
              <Users className="h-4 w-4 mr-2" />
              Invite Members
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateWorkspaceDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
      
      {currentWorkspace && (
        <InviteMembersDialog
          open={showInviteDialog}
          onOpenChange={setShowInviteDialog}
          workspaceId={currentWorkspace.id}
          workspaceName={currentWorkspace.name}
        />
      )}
    </>
  );
};