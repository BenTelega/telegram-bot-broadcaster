'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Check, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getMe } from '@/lib/telegram';

interface AddBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddBotModal({ isOpen, onClose }: AddBotModalProps) {
  const { addBot } = useStore();
  const [botToken, setBotToken] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isConnectionOk, setIsConnectionOk] = useState<boolean | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsConnectionOk(undefined);
  }, [botToken]);


  const resetForm = () => {
    setBotToken('');
    setIsTestingConnection(false);
    setIsConnectionOk(undefined);
    setIsSaving(false);
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const testConnection = async () => {
    if (!botToken) {
      toast.error('Please enter a bot token');
      return;
    }

    setIsTestingConnection(true);
    try {
      const data = await getMe(botToken);

      if (!data.ok) {
        throw new Error(data.description || 'Failed to connect to bot');
      }

      setIsConnectionOk(true);
      toast.success('Bot connection successful!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to connect to bot');
      setIsConnectionOk(false);
    } finally {
      setIsTestingConnection(false);
    }

  };

  const handleSave = async () => {
    if (!botToken) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSaving(true);
    try {

      const data = await getMe(botToken);

      if (!data.ok) {
        throw new Error(data.description || 'Failed to connect to bot');
      }

      // Add bot to secure storage
      addBot({
        token: botToken,
        name: data.result.username,
        status: 'active',
      });

      toast.success('Bot added successfully!');
      handleClose();
    } catch (error) {
      toast.error('Failed to save bot');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Bot</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="token">Bot Token</Label>
            <Input
              id="token"
              type="password"
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get this from @BotFather on Telegram
            </p>
          </div>
        </div>
        <DialogFooter className="flex space-x-2 justify-between sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={testConnection}
            disabled={isTestingConnection || isSaving}
          >
            {isTestingConnection && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isConnectionOk === true && (
              <Check className="mr-2 h-4 w-4 text-green-500" />
            )}
            {isConnectionOk === false && (
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
            )}

            Test
          </Button>
          <div className="space-x-2">
            <Button
              type="submit"
              onClick={handleSave}
              disabled={isTestingConnection || isSaving}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Bot
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 