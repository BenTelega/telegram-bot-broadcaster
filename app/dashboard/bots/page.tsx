'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Loader2, Trash2, TestTube2 } from 'lucide-react';
import { toast } from 'sonner';
import { AddBotModal } from './add-bot.modal';
import { getMe } from '@/lib/telegram';
import { ConfirmationModal } from '@/components/confirmation-modal';

export default function BotsPage() {
  const { bots, removeBot } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleTestBot = async (botId: string) => {
    setIsLoading(botId);
    try {
      const bot = bots.find((bot) => bot.id === botId);
      const data = await getMe(bot!.token);
      if (!data.ok) {
        throw new Error(data.description || 'Failed to connect to bot');
      }
      toast.success('Bot test successful');
    } catch (error) {
      toast.error('Failed to test bot');
    } finally {
      setIsLoading(null);
    }
  };

  const handleDeleteBot = async (botId: string) => {
    try {
      removeBot(botId);
      toast.success('Bot deleted successfully');
    } catch (error) {
      toast.error('Failed to delete bot');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bots</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Bot
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {bots.map((bot) => (
          <Card key={bot.id}>
            <CardHeader>
              <CardTitle>{bot.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      bot.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-sm text-muted-foreground capitalize">
                    {bot.status}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTestBot(bot.id)}
                    disabled={isLoading === bot.id}
                  >
                    {isLoading === bot.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube2 className="h-4 w-4 mr-2" />
                    )}
                    Test
                  </Button>
                  <ConfirmationModal
                    onConfirm={() => handleDeleteBot(bot.id)}
                    title="Delete Bot"
                    description="Are you sure you want to delete this bot? This action cannot be undone."
                    confirmText="Delete"
                    cancelText="Cancel"
                  >
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </ConfirmationModal>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {bots.length === 0 && (
        <Card className="mt-4">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">No bots added yet</p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              Add your first bot
            </Button>
          </CardContent>
        </Card>
      )}

      <AddBotModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}