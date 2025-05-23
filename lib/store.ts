'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ButtonItem } from '@/lib/types';

export interface Bot {
  id: string;
  token: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface UserList {
  id: string;
  name: string;
  count: number;
  users: string[];
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  media: string[];
  buttons?: ButtonItem[][];
  createdAt: string;
  hideLinkPreview: boolean;
  parseMode: 'HTML' | 'MarkdownV2';
}

export interface Campaign {
  id: string;
  name: string;
  botId: string;
  userListId: string;
  messageId: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed';
  scheduledFor?: string;
  progress: number;
  createdAt: string;
}

interface Store {
  bots: Bot[];
  userLists: UserList[];
  messageTemplates: MessageTemplate[];
  campaigns: Campaign[];
  testTelegramId: string;
  setTestTelegramId: (id: string) => void;
  addBot: (bot: Omit<Bot, 'id' | 'createdAt'>) => void;
  removeBot: (id: string) => void;
  addUserList: (userList: Omit<UserList, 'id' | 'createdAt'>) => void;
  updateUserList: (id: string, updates: Partial<UserList>) => void;
  removeUserList: (id: string) => void;
  addMessageTemplate: (template: Omit<MessageTemplate, 'id' | 'createdAt'>) => void;
  updateMessageTemplate: (id: string, updates: Partial<MessageTemplate>) => void;
  removeMessageTemplate: (id: string) => void;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt'>) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  removeCampaign: (id: string) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      bots: [],
      userLists: [],
      messageTemplates: [],
      campaigns: [],
      testTelegramId: '',
      setTestTelegramId: (id) => set({ testTelegramId: id }),
      addBot: (bot) =>
        set((state) => ({
          bots: [
            ...state.bots,
            {
              ...bot,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      removeBot: (id) =>
        set((state) => ({
          bots: state.bots.filter((bot) => bot.id !== id),
        })),
      addUserList: (userList) =>
        set((state) => ({
          userLists: [
            ...state.userLists,
            {
              ...userList,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateUserList: (id, updates) =>
        set((state) => ({
          userLists: state.userLists.map((list) =>
            list.id === id ? { ...list, ...updates } : list
          ),
        })),
      removeUserList: (id) =>
        set((state) => ({
          userLists: state.userLists.filter((list) => list.id !== id),
        })),
      addMessageTemplate: (template) =>
        set((state) => ({
          messageTemplates: [
            ...state.messageTemplates,
            {
              ...template,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateMessageTemplate: (id, updates) =>
        set((state) => ({
          messageTemplates: state.messageTemplates.map((template) =>
            template.id === id ? { ...template, ...updates } : template
          ),
        })),
      removeMessageTemplate: (id) =>
        set((state) => ({
          messageTemplates: state.messageTemplates.filter((template) => template.id !== id),
        })),
      addCampaign: (campaign) =>
        set((state) => ({
          campaigns: [
            ...state.campaigns,
            {
              ...campaign,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateCampaign: (id, updates) =>
        set((state) => ({
          campaigns: state.campaigns.map((campaign) =>
            campaign.id === id ? { ...campaign, ...updates } : campaign
          ),
        })),
      removeCampaign: (id) =>
        set((state) => ({
          campaigns: state.campaigns.filter((campaign) => campaign.id !== id),
        })),
    }),
    {
      name: 'tg-bot-mailing-storage',
    }
  )
);