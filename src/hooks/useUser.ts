"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'owner' | 'user';
  storeName?: string;
  storeType?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  emailVerified: boolean;
  isActive: boolean;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/auth/me');
      setUser(response.data.user);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = () => {
    fetchUser();
  };

  return { user, isLoading, error, refreshUser };
}