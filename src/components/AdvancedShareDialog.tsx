import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Mail, Link as LinkIcon, Users, Globe, Lock, Eye, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AdvancedShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: (options: ShareOptions) => void;
  fileName: string;
  loading?: boolean;
}

interface ShareOptions {
  shareType: 'public' | 'private';
  permissionLevel: 'viewer' | 'editor';
  email?: string;
  expiresIn?: string;
}

export const AdvancedShareDialog: React.FC<AdvancedShareDialogProps> = ({
  open,
  onOpenChange,
  onShare,
  fileName,
  loading = false
}) => {
  const [shareType, setShareType] = useState<'public' | 'private'>('public');
  const [permissionLevel, setPermissionLevel] = useState<'viewer' | 'editor'>('viewer');
  const [email, setEmail] = useState('');
  const [expiresIn, setExpiresIn] = useState('7');
  const [shareMethod, setShareMethod] = useState<'link' | 'email'>('link');

  const handleShare = () => {
    const options: ShareOptions = {
      shareType,
      permissionLevel,
      email: shareMethod === 'email' ? email : undefined,
      expiresIn: expiresIn !== 'never' ? expiresIn : undefined,
    };

    onShare(options);
  };

  const isEmailRequired = shareMethod === 'email' || shareType === 'private';
  const isFormValid = !isEmailRequired || (email && email.includes('@'));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Share "{fileName}"
          </DialogTitle>
        </DialogHeader>

        <Tabs value={shareMethod} onValueChange={(value) => setShareMethod(value as 'link' | 'email')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Link
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-3">
              <Label>Share Type</Label>
              <RadioGroup value={shareType} onValueChange={(value) => setShareType(value as 'public' | 'private')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Public - Anyone with link can access
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Private - Only specified users
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {shareType === 'private' && (
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient-email">Recipient Email</Label>
              <Input
                id="recipient-email"
                type="email"
                placeholder="Enter recipient's email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-3">
          <Label>Permission Level</Label>
          <RadioGroup value={permissionLevel} onValueChange={(value) => setPermissionLevel(value as 'viewer' | 'editor')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="viewer" id="viewer" />
              <Label htmlFor="viewer" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Viewer - Can view and download
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="editor" id="editor" />
              <Label htmlFor="editor" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Editor - Can view, download, and modify
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expires">Link Expires</Label>
          <Select value={expiresIn} onValueChange={setExpiresIn}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 day</SelectItem>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="never">Never</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleShare} 
            disabled={loading || !isFormValid}
            className="flex-1"
          >
            {loading ? 'Creating...' : shareMethod === 'email' ? 'Send Email' : 'Create Link'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};