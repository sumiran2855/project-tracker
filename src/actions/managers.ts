'use server';

import { getValidSession } from '@/helpers/auth.helpers';
import { managersApi } from '@/api-services/managers.api';

export async function getManagersAction(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await managersApi.getManagers(session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data!.managers };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function updateManagerAssignmentsAction(
  managerId: string,
  employeeIds: string[],
  teamLeadIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getValidSession();

    const { error } = await managersApi.updateAssignments(managerId, employeeIds, teamLeadIds, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function getManagerTeamAction(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await managersApi.getManagerTeam(session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data!.team };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}

export async function sendEmployeeReminderAction(
  employeeId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await getValidSession();

    const { data, error } = await managersApi.sendEmployeeReminder(employeeId, session.token);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: data!.message };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unauthorized' };
  }
}
