'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { sendMessage } from '@/lib/telegram';
import { sendMessageFromTemplate } from '@/lib/messaging';

export default function MailingListDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { bots, userLists, messageTemplates, campaigns, addCampaign, updateCampaign, testTelegramId, setTestTelegramId } = useStore();
  
  const [formData, setFormData] = useState({
    name: '',
    botId: '',
    userListId: '',
    messageId: '',
  });

  const [isSending, setIsSending] = useState(false);

  const isNewCampaign = params.id === 'new';
  const existingCampaign = campaigns.find((c) => c.id === params.id);

  useEffect(() => {
    if (!isNewCampaign && existingCampaign) {
      setFormData({
        name: existingCampaign.name,
        botId: existingCampaign.botId,
        userListId: existingCampaign.userListId,
        messageId: existingCampaign.messageId,
      });
    }
  }, [isNewCampaign, existingCampaign]);

  const handleSave = () => {
    if (!formData.name || !formData.botId || !formData.userListId || !formData.messageId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const campaignData = {
      name: formData.name,
      botId: formData.botId,
      userListId: formData.userListId,
      messageId: formData.messageId,
      status: 'draft' as const,
      progress: 0,
    };


    if (isNewCampaign) {
      addCampaign(campaignData);
      toast.success('Mailing list created successfully');
    } else {
      updateCampaign(params.id as string, campaignData);
      toast.success('Mailing list updated successfully');
    }

    router.push('/dashboard/mailing-lists');
  };

  const handleTestMessage = async () => {
    if (!testTelegramId || !formData.botId || !formData.messageId) {
      toast.error('Please fill in bot, message template and test Telegram ID');
      return;
    }

    setIsSending(true);
    try {
      const selectedBot = bots.find((b) => b.id === formData.botId);
      const selectedTemplate = messageTemplates.find((t) => t.id === formData.messageId);
      
      if (!selectedBot || !selectedTemplate) {
        throw new Error('Bot or message template not found');
      }

      const response = await sendMessageFromTemplate(selectedBot, testTelegramId, selectedTemplate);

      if (response.ok) {
        toast.success('Test message sent successfully');
      } else {
        toast.error('Failed to send test message');
      }
      
    } catch (error) {
      toast.error('Failed to send test message');
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {isNewCampaign ? 'Create New Mailing List' : 'Edit Mailing List'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Mailing List Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter mailing list name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bot">Telegram Bot</Label>
            <Select
              value={formData.botId}
              onValueChange={(value) => setFormData({ ...formData, botId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a bot" />
              </SelectTrigger>
              <SelectContent>
                {bots.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No bots available.{' '}
                    <Link href="/dashboard/bots" className="text-primary hover:underline">
                      Create a bot first
                    </Link>
                  </div>
                ) : (
                  bots.map((bot) => (
                    <SelectItem key={bot.id} value={bot.id}>
                      {bot.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userList">User List</Label>
            <Select
              value={formData.userListId}
              onValueChange={(value) => setFormData({ ...formData, userListId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a user list" />
              </SelectTrigger>
              <SelectContent>
                {userLists.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No user lists available.{' '}
                    <Link href="/dashboard/users" className="text-primary hover:underline">
                      Create a user list first
                    </Link>
                  </div>
                ) : (
                  userLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      {list.name} ({list.count} users)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="messageTemplate">Message Template</Label>
            <Select
              value={formData.messageId}
              onValueChange={(value) => setFormData({ ...formData, messageId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a message template" />
              </SelectTrigger>
              <SelectContent>
                {messageTemplates.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No message templates available.{' '}
                    <Link href="/dashboard/messages" className="text-primary hover:underline">
                      Create a message template first
                    </Link>
                  </div>
                ) : (
                  messageTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4">
            <Button onClick={handleSave} className="w-full">
              {isNewCampaign ? 'Create Mailing List' : 'Update Mailing List'}
            </Button>
          </div>

          <div className="border-t pt-4 mt-6">
            <h3 className="text-lg font-medium mb-4">Test Message</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  value={testTelegramId}
                  onChange={(e) => setTestTelegramId(e.target.value)}
                  placeholder="Enter Telegram ID"
                />
              </div>
              <Button 
                onClick={handleTestMessage} 
                disabled={isSending}
                variant="secondary"
              >
                {isSending ? 'Sending...' : 'Send Test Message'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 