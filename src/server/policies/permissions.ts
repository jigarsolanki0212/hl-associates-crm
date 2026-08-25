export const Permissions = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard:view',

  // Inquiries
  INQUIRIES_VIEW: 'inquiries:view',
  INQUIRIES_CREATE: 'inquiries:create',
  INQUIRIES_EDIT: 'inquiries:edit',
  INQUIRIES_ACCEPT: 'inquiries:accept',
  INQUIRIES_LOSE: 'inquiries:lose',
  INQUIRIES_REOPEN: 'inquiries:reopen',
  INQUIRIES_CONVERT: 'inquiries:convert',

  // Proformas
  PROFORMAS_VIEW: 'proformas:view',
  PROFORMAS_CREATE: 'proformas:create',
  PROFORMAS_SEND: 'proformas:send',
  PROFORMAS_DOWNLOAD: 'proformas:download',

  // Clients & Services
  CLIENTS_VIEW: 'clients:view',
  CLIENTS_EDIT: 'clients:edit',
  CLIENTS_EXPORT: 'clients:export',
  SERVICES_VIEW: 'services:view',
  SERVICES_MANAGE: 'services:manage',

  // Renewals & Follow-ups
  RENEWALS_VIEW: 'renewals:view',
  RENEWALS_SEND: 'renewals:send',
  RENEWALS_EXECUTE: 'renewals:execute',
  FOLLOWUPS_MANAGE: 'followups:manage',

  // Activity & Notifications
  ACTIVITY_VIEW: 'activity:view',
  NOTIFICATIONS_VIEW: 'notifications:view',

  // Admin & System
  USERS_MANAGE: 'users:manage',
  SETTINGS_MANAGE: 'settings:manage',
  JOBS_TRIGGER: 'jobs:trigger',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];
