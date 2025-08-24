import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useWorkspaces } from '@/hooks/useWorkspaces';
import { Loader2, Mail, Trash2, Users, UserX } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface InviteMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  workspaceName: string;
}

export const InviteMembersDialog = ({ 
  open, 
  onOpenChange, 
  workspaceId, 
  workspaceName 
}: InviteMembersDialogProps) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [isInviting, setIsInviting] = useState(false);
  const { user } = useAuth();
  const { 
    inviteToWorkspace, 
    memberships, 
    invitations, 
    fetchMemberships, 
    fetchInvitations,
    removeMember,
    deleteInvitation 
  } = useWorkspaces();

  useEffect(() => {
    if (open && workspaceId) {
      fetchMemberships(workspaceId);
      fetchInvitations(workspaceId);
    }
  }, [open, workspaceId, fetchMemberships, fetchInvitations]);

  const handleInvite = async () => {
    if (!email.trim()) return;

    setIsInviting(true);
    try {
      const success = await inviteToWorkspace(workspaceId, email.trim(), role);
      if (success) {
        setEmail('');
        setRole('member');
      }
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberUserId: string) => {
    if (memberUserId === user?.id) return; // Can't remove self
    await removeMember(workspaceId, memberUserId);
  };

  const handleDeleteInvitation = async (invitationId: string) => {
    await deleteInvitation(invitationId, workspaceId);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Manage {workspaceName}</span>
          </DialogTitle>
          <DialogDescription>
            Invite team members to collaborate in this workspace.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Invite Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Invite New Member</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="invite-email">Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="Enter email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleInvite();
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                <Select value={role} onValueChange={(value: 'admin' | 'member') => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              onClick={handleInvite}
              disabled={!email.trim() || isInviting}
              className="w-full md:w-auto"
            >
              {isInviting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Mail className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </div>

          <Separator />

          {/* Current Members */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Current Members ({memberships.length})</h4>
            <div className="space-y-2">
              {memberships.map((membership) => (
                <div
                  key={membership.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {membership.user_id.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{membership.user_id}</div>
                      <div className="text-xs text-muted-foreground">
                        Joined {new Date(membership.joined_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getRoleBadgeVariant(membership.role)}>
                      {membership.role}
                    </Badge>
                    {membership.user_id !== user?.id && membership.role !== 'owner' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveMember(membership.id, membership.user_id)}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Pending Invitations ({invitations.length})</h4>
                <div className="space-y-2">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                    >
                      <div>
                        <div className="font-medium text-sm">{invitation.email}</div>
                        <div className="text-xs text-muted-foreground">
                          Invited {new Date(invitation.created_at).toLocaleDateString()} • 
                          Expires {new Date(invitation.expires_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{invitation.role}</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteInvitation(invitation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};