'use server';

import { getValidSession } from '@/helpers/auth.helpers';
import { dailyUpdatesApi } from '@/api-services/daily-updates.api';
import type { DailyUpdate, CreateDailyUpdateInput } from '@/types/daily-updates.types';

export async function getDailyUpdatesAction(filters?: {
  projectId?: string;
  userId?: string;
  date?: string;
}): Promise<{ success: boolean; data?: DailyUpdate[]; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await dailyUpdatesApi.getDailyUpdates(session.token, filters);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data!.dailyUpdates };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function createDailyUpdateAction(
  updateData: CreateDailyUpdateInput
): Promise<{ success: boolean; data?: DailyUpdate; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await dailyUpdatesApi.createDailyUpdate(updateData, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data!.dailyUpdate };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function deleteDailyUpdateAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getValidSession();

    const { error } = await dailyUpdatesApi.deleteDailyUpdate(id, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}
