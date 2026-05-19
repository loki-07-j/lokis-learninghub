'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { adminService, User, Role, RoleHistoryLog } from '@/services/admin';
import { toast } from 'sonner';
import {
  Users,
  History,
  Search,
  Filter,
  Shield,
  Ban,
  CheckCircle2,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'history'>('users');

  // Loading & State
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [historyLogs, setHistoryLogs] = useState<RoleHistoryLog[]>([]);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // 1. Guard against non-admin entries
  const isAdmin = currentUser?.role_code === 'SUPER_ADMIN' || currentUser?.role_code === 'ADMIN';

  // 2. Fetch Users and Roles on mount
  useEffect(() => {
    if (!isAdmin) return;
    fetchDirectory();
  }, [isAdmin]);

  // 3. Fetch History when history tab becomes active
  useEffect(() => {
    if (activeTab === 'history' && isAdmin) {
      fetchHistory();
    }
  }, [activeTab, isAdmin]);

  const fetchDirectory = async () => {
    try {
      setLoadingUsers(true);
      const [fetchedUsers, fetchedRoles] = await Promise.all([
        adminService.getUsers(),
        adminService.getRoles()
      ]);
      setUsers(fetchedUsers);
      setRoles(fetchedRoles);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load user directory');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const logs = await adminService.getRoleHistory();
      setHistoryLogs(logs);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load audit history logs');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle User Role Change
  const handleRoleChange = async (userId: string, roleId: number) => {
    try {
      const response = await adminService.updateUserRole(userId, roleId);
      toast.success(response.message || 'User role updated successfully');

      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: response.user.role } : u));

      // Live reload history timeline logs
      fetchHistory();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to update user role');
    }
  };

  // Handle User Account Toggle Block State
  const handleToggleBlock = async (userId: string) => {
    try {
      const response = await adminService.toggleUserBlock(userId);
      toast.success(response.message);

      // Update local state
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: response.user.is_active } : u));

      // Live reload history timeline logs
      fetchHistory();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to modify account state');
    }
  };

  // Render Access Denied for unauthorized access
  if (!isAdmin) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">403 Forbidden</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            You do not have permission to view this workspace. Administrative access is restricted to authorized accounts only.
          </p>
        </div>
      </div>
    );
  }

  // Filter local users before rendering
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === '' || u.role.role_code === selectedRole;
    const matchesStatus =
      selectedStatus === '' ||
      (selectedStatus === 'active' && u.is_active) ||
      (selectedStatus === 'blocked' && !u.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Admin Control Panel</h1>
          <p className="text-sm text-slate-400">Manage directory users, reassign system security tiers, and monitor audit trails.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-white/5">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <Users className="h-3.5 w-3.5" />
            Users List
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <History className="h-3.5 w-3.5" />
            Audit Logs
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      {activeTab === 'users' ? (
        <Card className="border-white/5 bg-slate-950/40 backdrop-blur-2xl shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              Users Directory
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Search and manage access settings for registered hub users.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filter Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full text-xs rounded-xl bg-slate-900 border border-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>

              {/* Role Select Filter */}
              <div className="relative">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full pl-3 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-white/5 text-white focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
                >
                  <option value="">Filter by Role (All)</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.role_code}>{r.role_name}</option>
                  ))}
                </select>
              </div>

              {/* Status Select Filter */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full pl-3 pr-4 py-2 text-xs rounded-xl bg-slate-900 border border-white/5 text-white focus:outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
                >
                  <option value="">Filter by Status (All)</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            {/* User Directory Table */}
            {loadingUsers ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl bg-slate-900/10">
                <p className="text-slate-500 text-sm">No registered users match your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-white/5 rounded-2xl bg-slate-950/20">
                <table className="min-w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-slate-900/30 text-xs font-semibold text-slate-400">
                      <th className="px-4 py-3.5">User Details</th>
                      <th className="px-4 py-3.5">Assigned Role</th>
                      <th className="px-4 py-3.5">Account Status</th>
                      <th className="px-4 py-3.5 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {filteredUsers.map((user) => {
                      const isSelf = user.id === currentUser?.id;
                      return (
                        <tr key={user.id} className="hover:bg-white/2 transition-colors">
                          {/* Details */}
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-white">{user.name}</div>
                            <div className="text-[10px] text-slate-500">{user.email}</div>
                          </td>

                          {/* Role Assign */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <select
                                disabled={isSelf}
                                value={user.role.id}
                                onChange={(e) => handleRoleChange(user.id, Number(e.target.value))}
                                className="px-2 py-1 text-[11px] rounded-lg bg-slate-900 border border-white/15 text-slate-300 focus:outline-none focus:border-purple-500/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {roles.map(r => (
                                  <option key={r.id} value={r.id}>{r.role_name}</option>
                                ))}
                              </select>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${user.is_active
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}>
                              {user.is_active ? (
                                <>
                                  <CheckCircle2 className="h-3 w-3" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <Ban className="h-3 w-3" />
                                  Blocked
                                </>
                              )}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right">
                            <Button
                              onClick={() => handleToggleBlock(user.id)}
                              disabled={isSelf}
                              variant="ghost"
                              size="sm"
                              className={`h-7 px-2.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors border ${user.is_active
                                  ? 'text-rose-400 border-rose-500/10 hover:bg-rose-500/10'
                                  : 'text-emerald-400 border-emerald-500/10 hover:bg-emerald-500/10'
                                } disabled:opacity-50`}
                            >
                              {user.is_active ? 'Block Account' : 'Unblock Account'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-white/5 bg-slate-950/40 backdrop-blur-2xl shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <History className="h-5 w-5 text-purple-400" />
              Administrative Audit Logs
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Review history log records for all user role modifications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : historyLogs.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl bg-slate-900/10">
                <p className="text-slate-500 text-sm">No role changes recorded in history.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl border border-white/5 bg-slate-950/20 hover:border-purple-500/20 transition-colors flex flex-col sm:flex-row justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-slate-300">
                        <span className="font-semibold text-white">{log.changer.name}</span>
                        <span className="text-slate-500">changed role for</span>
                        <span className="font-semibold text-white">{log.user.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Shield className="h-3 w-3 text-purple-400/80" />
                        Transitioned from <span className="text-rose-400 font-semibold">{log.old_role.role_name}</span> to <span className="text-emerald-400 font-semibold">{log.new_role.role_name}</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 text-left sm:text-right font-medium">
                      {new Date(log.changed_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
