import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectsAction, getEmployeesAction } from '@/actions/projects';
import { getTasksByProjectAction } from '@/actions/tasks';
import { getIssuesByProjectAction } from '@/actions/issues';

export function useCachedProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await getProjectsAction();
      if (!res.success) {
        throw new Error(res.error || 'Failed to fetch projects');
      }
      return res.data || [];
    },
    staleTime: 30000, // consider data fresh for 30s
  });
}

export function useCachedEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await getEmployeesAction();
      if (!res.success) {
        throw new Error(res.error || 'Failed to fetch employees');
      }
      return res.data || [];
    },
    staleTime: 60000, // consider data fresh for 60s
  });
}

export function useCachedTasks(projectId?: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await getTasksByProjectAction(projectId);
      if (!res.success) {
        throw new Error(res.error || 'Failed to fetch tasks');
      }
      return res.data || [];
    },
    enabled: !!projectId,
    staleTime: 15000, // consider fresh for 15s
  });
}

export function useCachedIssues(projectId?: string) {
  return useQuery({
    queryKey: ['issues', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await getIssuesByProjectAction(projectId);
      if (!res.success) {
        throw new Error(res.error || 'Failed to fetch issues');
      }
      return res.data || [];
    },
    enabled: !!projectId,
    staleTime: 15000, // consider fresh for 15s
  });
}
