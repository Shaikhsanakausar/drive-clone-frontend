import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface WorkspaceMembership {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  email: string;
  invited_by: string;
  role: 'admin' | 'member';
  expires_at: string;
  created_at: string;
}

export const useWorkspaces = () => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [memberships, setMemberships] = useState<WorkspaceMembership[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's workspaces
  const fetchWorkspaces = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkspaces(data || []);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast({
        title: "Error",
        description: "Failed to fetch workspaces",
        variant: "destructive",
      });
    }
  };

  // Create a new workspace
  const createWorkspace = async (name: string, description?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert([{
          name,
          description,
          owner_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchWorkspaces();
      toast({
        title: "Success",
        description: "Workspace created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        title: "Error",
        description: "Failed to create workspace",
        variant: "destructive",
      });
      return null;
    }
  };

  // Invite user to workspace
  const inviteToWorkspace = async (workspaceId: string, email: string, role: 'admin' | 'member' = 'member') => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('workspace_invitations')
        .insert([{
          workspace_id: workspaceId,
          email,
          invited_by: user.id,
          role
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Invitation sent to ${email}`,
      });

      await fetchInvitations(workspaceId);
      return true;
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
      return false;
    }
  };

  // Accept workspace invitation
  const acceptInvitation = async (email: string, workspaceId: string) => {
    try {
      const { data, error } = await supabase.rpc('accept_workspace_invitation', {
        invitation_email: email,
        workspace_uuid: workspaceId
      });

      if (error) throw error;

      if (data) {
        await fetchWorkspaces();
        toast({
          title: "Success",
          description: "Invitation accepted successfully",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Invalid or expired invitation",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive",
      });
      return false;
    }
  };

  // Fetch workspace memberships
  const fetchMemberships = async (workspaceId: string) => {
    try {
      const { data, error } = await supabase
        .from('workspace_memberships')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (error) throw error;
      setMemberships((data || []) as WorkspaceMembership[]);
    } catch (error) {
      console.error('Error fetching memberships:', error);
    }
  };

  // Fetch workspace invitations
  const fetchInvitations = async (workspaceId: string) => {
    try {
      const { data, error } = await supabase
        .from('workspace_invitations')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations((data || []) as WorkspaceInvitation[]);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  // Remove member from workspace
  const removeMember = async (workspaceId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('workspace_memberships')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId);

      if (error) throw error;

      await fetchMemberships(workspaceId);
      toast({
        title: "Success",
        description: "Member removed successfully",
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  // Delete invitation
  const deleteInvitation = async (invitationId: string, workspaceId: string) => {
    try {
      const { error } = await supabase
        .from('workspace_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      await fetchInvitations(workspaceId);
      toast({
        title: "Success",
        description: "Invitation deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast({
        title: "Error",
        description: "Failed to delete invitation",
        variant: "destructive",
      });
    }
  };

  // Switch workspace
  const switchWorkspace = (workspace: Workspace | null) => {
    setCurrentWorkspace(workspace);
    // Store in localStorage for persistence
    if (workspace) {
      localStorage.setItem('currentWorkspaceId', workspace.id);
    } else {
      localStorage.removeItem('currentWorkspaceId');
    }
  };

  // Initialize workspaces and current workspace
  useEffect(() => {
    if (user) {
      fetchWorkspaces().then(() => {
        // Try to restore current workspace from localStorage
        const storedWorkspaceId = localStorage.getItem('currentWorkspaceId');
        if (storedWorkspaceId) {
          const stored = workspaces.find(w => w.id === storedWorkspaceId);
          if (stored) {
            setCurrentWorkspace(stored);
          }
        }
        setLoading(false);
      });
    }
  }, [user]);

  // Update current workspace when workspaces change
  useEffect(() => {
    if (workspaces.length > 0 && !currentWorkspace) {
      const storedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      if (storedWorkspaceId) {
        const stored = workspaces.find(w => w.id === storedWorkspaceId);
        if (stored) {
          setCurrentWorkspace(stored);
        }
      }
    }
  }, [workspaces, currentWorkspace]);

  return {
    workspaces,
    currentWorkspace,
    memberships,
    invitations,
    loading,
    createWorkspace,
    inviteToWorkspace,
    acceptInvitation,
    fetchMemberships,
    fetchInvitations,
    removeMember,
    deleteInvitation,
    switchWorkspace,
    refreshWorkspaces: fetchWorkspaces,
  };
};