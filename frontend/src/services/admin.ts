import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  role: {
    id: number;
    role_name: string;
    role_code: string;
  };
}

export interface Role {
  id: number;
  role_name: string;
  role_code: string;
  description: string | null;
}

export interface RoleHistoryLog {
  id: number;
  user_id: string;
  old_role_id: number;
  new_role_id: number;
  changed_by: string;
  changed_at: string;
  user: {
    name: string;
    email: string;
  };
  old_role: {
    role_name: string;
  };
  new_role: {
    role_name: string;
  };
  changer: {
    name: string;
    email: string;
  };
}

export const adminService = {
  getUsers: async (filters?: { search?: string; role?: string; is_active?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));

    const response = await api.get<User[]>(`/admin/users?${params.toString()}`);
    return response.data;
  },

  getRoles: async () => {
    const response = await api.get<Role[]>('/admin/roles');
    return response.data;
  },

  updateUserRole: async (userId: string, roleId: number) => {
    const response = await api.put<{ message: string; user: User }>(`/admin/users/${userId}/role`, {
      role_id: roleId
    });
    return response.data;
  },

  toggleUserBlock: async (userId: string) => {
    const response = await api.put<{ message: string; user: User }>(`/admin/users/${userId}/toggle-block`);
    return response.data;
  },

  getRoleHistory: async () => {
    const response = await api.get<RoleHistoryLog[]>('/admin/role-history');
    return response.data;
  }
};
