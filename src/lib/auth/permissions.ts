export type Role = 'Admin' | 'Manager' | 'Team Lead' | 'Client' | 'Employee';

export type Permission =
  | 'project:create'
  | 'project:view'
  | 'project:delete'
  | 'task:create'
  | 'task:assign'
  | 'task:update-status'
  | 'task:delete'
  | 'roadmap:manage'
  | 'roadmap:view'
  | 'report:view'
  | 'dashboard:view-team-workload'
  | 'dashboard:view-quick-actions'
  | 'settings:view'
  | 'issue:view'
  | 'issue:delete'
  | 'hours:edit'
  | 'manager-assignments:manage'
  | 'team:view';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Admin: [
    'project:create',
    'project:view',
    'project:delete',
    'task:create',
    'task:assign',
    'task:update-status',
    'task:delete',
    'roadmap:manage',
    'roadmap:view',
    'report:view',
    'dashboard:view-team-workload',
    'dashboard:view-quick-actions',
    'settings:view',
    'issue:view',
    'issue:delete',
    'manager-assignments:manage',
  ],
  Manager: [
    'project:create',
    'project:view',
    'project:delete',
    'task:create',
    'task:assign',
    'task:update-status',
    'task:delete',
    'roadmap:manage',
    'roadmap:view',
    'report:view',
    'dashboard:view-team-workload',
    'dashboard:view-quick-actions',
    'settings:view',
    'issue:view',
    'issue:delete',
    'team:view',
  ],
  'Team Lead': [
    'project:create',
    'project:view',
    'task:create',
    'task:assign',
    'task:update-status',
    'task:delete',
    'roadmap:manage',
    'roadmap:view',
    'report:view',
    'dashboard:view-team-workload',
    'dashboard:view-quick-actions',
    'settings:view',
    'issue:view',
    'issue:delete',
    'hours:edit',
  ],
  Client: [
    'project:create',
    'project:view',
    'task:create',
    'task:delete',
    'roadmap:manage',
    'roadmap:view',
    'report:view',
    'dashboard:view-team-workload',
    'dashboard:view-quick-actions',
    'settings:view',
    'issue:view',
    'issue:delete',
  ],
  Employee: [
    'project:view',
    'task:update-status',
    'roadmap:view',
    'settings:view',
    'issue:view',
    'hours:edit',
  ],
};

export function hasPermission(role: Role | string | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  
  // Normalize role casing to handle any database casing mismatches
  const normalizedRole = Object.keys(ROLE_PERMISSIONS).find(
    (r) => r.toLowerCase() === role.toLowerCase()
  ) as Role | undefined;

  if (!normalizedRole) return false;

  const perms = ROLE_PERMISSIONS[normalizedRole];
  return perms ? perms.includes(permission) : false;
}
