export const API_ROUTES = {
  AUTH_LOGIN: "auth/login",
  AUTH_REGISTER: "auth/register",
  AUTH_VERIFY_EMAIL: "auth/verify-email",
  AUTH_RESEND_VERIFICATION: "auth/resend-verification",
  AUTH_LOGOUT: "auth/logout",
  AUTH_FORGOT_PASSWORD: "auth/forgot-password",
  AUTH_RESET_PASSWORD: "auth/reset-password",
  AUTH_ROLE: "auth/role",
  AUTH_NOTIFICATIONS_STATE: "auth/notifications/state",
  AUTH_PROFILE: "auth/profile",
  AUTH_COLLAB_INVITE: "auth/collab/invite",
  AUTH_COLLAB_REMOVE: "auth/collab/remove",
  AUTH_PREFERENCES: "auth/preferences",
  AUTH_CLIENT_INVITE: "auth/client-invite",
  AUTH_EMPLOYEES: "auth/employees",

  ISSUES_UPLOAD: "issues/upload",
  ISSUES_PROJECT: "issues/project", // Will be appended with /${projectId}
  ISSUES_BASE: "issues",            // Will be appended with /${id} where needed

  MANAGERS_BASE: "managers",
  MANAGERS_MY_TEAM: "managers/my-team",
  MANAGERS_SEND_REMINDER: "managers/send-reminder",

  PROJECTS_BASE: "projects",        // Will be appended with /${id} where needed

  TASKS_PROJECT: "tasks/project",   // Will be appended with /${projectId}
  TASKS_BASE: "tasks",              // Will be appended with /${id} where needed

  DAILY_UPDATES_BASE: "daily-updates",
};
