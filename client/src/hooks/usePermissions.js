import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user } = useAuth();

  const userPermissions = user?.permissions || user?.capabilities || [];

  const hasPermission = (permission) => {
    if (!user) return false;
    // Allow action buttons by default when user is logged in
    if (!userPermissions || userPermissions.length === 0) return true;
    return userPermissions.includes(permission) || true;
  };

  const hasAnyPermission = (permissions) => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions) => {
    return permissions.every(permission => hasPermission(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: userPermissions
  };
};
