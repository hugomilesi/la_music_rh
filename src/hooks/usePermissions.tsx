
import { useMemo } from 'react';
import { UserPermissions } from '@/types/permissions';

// Mock permissions - replace with actual user context
const mockPermissions: UserPermissions = {
  canManageEmployees: true,
  canManagePayroll: true,
  canViewReports: true,
  canManageSettings: true,
  canManageUsers: true,
  canManageEvaluations: true
};

export const usePermissions = () => {
  const permissions = useMemo(() => mockPermissions, []);

  const checkPermission = (permission: keyof UserPermissions, showToast = true) => {
    return permissions[permission] || false;
  };

  const requirePermission = (permission: keyof UserPermissions, action = 'realizar esta ação') => {
    return checkPermission(permission);
  };

  return {
    permissions,
    checkPermission,
    requirePermission,
    canManageEmployees: permissions.canManageEmployees,
    canManagePayroll: permissions.canManagePayroll,
    canViewReports: permissions.canViewReports,
    canManageSettings: permissions.canManageSettings,
    canManageUsers: permissions.canManageUsers,
    canManageEvaluations: permissions.canManageEvaluations,
    isAdmin: permissions.canManageUsers,
    isSuperUser: permissions.canManageUsers && permissions.canManageSettings
  };
};
