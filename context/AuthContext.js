import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearSession,
  fetchCurrentUser,
  getCachedUser,
  login as apiLogin,
  register as apiRegister,
  updateCustomerLocation,
  updateCustomerProfile,
} from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const cached = await getCachedUser();
      if (cached && active) setUser(cached);
      const fresh = await fetchCurrentUser();
      if (active) {
        setUser(fresh);
        setBootstrapping(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const nextUser = await apiLogin({ email, password });
    setUser(nextUser);
    return nextUser;
  }, []);

  const signUp = useCallback(async (payload) => {
    const nextUser = await apiRegister(payload);
    setUser(nextUser);
    return nextUser;
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const fresh = await fetchCurrentUser();
    setUser(fresh);
    return fresh;
  }, []);

  const updateProfile = useCallback(async (profilePayload, locationPayload) => {
    let next = user;
    if (profilePayload && Object.keys(profilePayload).length) {
      next = await updateCustomerProfile(profilePayload);
    }
    if (locationPayload && Object.keys(locationPayload).length) {
      next = await updateCustomerLocation(locationPayload);
    }
    setUser(next);
    return next;
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      bootstrapping,
      signIn,
      signUp,
      signOut,
      refreshUser,
      updateProfile,
    }),
    [user, bootstrapping, signIn, signUp, signOut, refreshUser, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
