'use client';

import React, { createContext, useContext, useState } from 'react';
import type { SafeUser } from '@/types/auth.types';
import { hasPermission, Permission } from '@/lib/auth/permissions';

interface UserContextType {
  user: SafeUser | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<SafeUser | null>>;
  hasPermission: (permission: Permission) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: SafeUser | null;
}) {
  const [user, setUser] = useState<SafeUser | null>(initialUser);
  // We can use loading if we ever implement client-side refresh/fetching, defaulting to false.
  const [loading] = useState(false);

  const checkPermission = (permission: Permission) => {
    return hasPermission(user?.role, permission);
  };

  return (
    <UserContext.Provider value={{ user, loading, setUser, hasPermission: checkPermission }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function usePermission(permission: Permission) {
  const { hasPermission: checkPermission } = useUser();
  return checkPermission(permission);
}
