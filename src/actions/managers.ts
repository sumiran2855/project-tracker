'use server';

import { getSession } from '@/lib/auth/dal';
import { apiClient } from '@/lib/api/apiClient';

export async function getManagersAction(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.get<{ success: boolean; data: { managers: any[] } }>(
      'managers',
      { token: session.token }
    );

    return { success: true, data: res.data.managers };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to fetch managers' };
  }
}

export async function updateManagerAssignmentsAction(
  managerId: string,
  employeeIds: string[],
  teamLeadIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    await apiClient.put(
      `managers/${managerId}/assignments`,
      { employeeIds, teamLeadIds },
      { token: session.token }
    );

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to update assignments' };
  }
}

export async function getManagerTeamAction(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const session = await getSession();
    if (!session?.token) {
      return { success: false, error: 'Unauthorized' };
    }

    const res = await apiClient.get<{ success: boolean; data: { team: any[] } }>(
      'managers/my-team',
      { token: session.token }
    );

    return { success: true, data: res.data.team };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to fetch team' };
  }
}
