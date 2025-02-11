'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ButtonItem } from '@/lib/types';

export interface CampaignRun {
  id: string;
  campaignId: string;
  deliveries: {
    tgid: string;
    status: 'pending' | 'sent' | 'failed';
    reason?: string;
    updatedAt: string;
  }[];
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed';
  createdAt: string;
  finishedAt?: string;
  successCount: number;
  failureCount: number;
}


interface Store {
  campaignRuns: CampaignRun[];
  addCampaignRun: (run: CampaignRun) => void;
  updateCampaignRun: (id: string, updates: Partial<CampaignRun>) => void;
  removeCampaignRun: (id: string) => void;
  removeCampaignRunsByCampaignId: (campaignId: string) => void;
}

export const useCampaignRunStore = create<Store>()(
  persist(
    (set) => ({
      campaignRuns: [],
      addCampaignRun: (run) =>
        set((state) => ({
          campaignRuns: [...state.campaignRuns, run],
        })),
      updateCampaignRun: (id, updates) =>
        set((state) => ({
          campaignRuns: state.campaignRuns.map((run) =>
            run.id === id ? { ...run, ...updates } : run
          ),
        })),
      removeCampaignRun: (id) =>
        set((state) => ({
          campaignRuns: state.campaignRuns.filter((run) => run.id !== id),
        })),
      removeCampaignRunsByCampaignId: (campaignId) =>
        set((state) => ({
          campaignRuns: state.campaignRuns.filter((run) => run.campaignId !== campaignId),
        })),
    }),
    {
      name: 'tg-bot-mailing-campaign-run-storage',
    }
  )
);