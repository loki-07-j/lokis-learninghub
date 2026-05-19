'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { adminService, User, Role, RoleHistoryLog } from '@/services/admin';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Users,
  History,
  Search,
  Shield,
  Ban,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Settings,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Premium Custom Role Select Dropdown for User Table
interface RoleSelectDropdownProps {
  user: User;
  roles: Role[];
  onRoleChange: (userId: string, roleId: number) => void;
  isSelf: boolean;
}

function RoleSelectDropdown({ user, roles, onRoleChange, isSelf }: RoleSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        disabled={isSelf}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-xl border border-white/[0.05] bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none min-w-[120px]"
      >
        <span>{user.role.role_name}</span>
        <ChevronDown className={cn("h-3 w-3 text-slate-500 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-[140px] rounded-xl border border-white/[0.08] bg-[#0c0a21] shadow-[0_4px_25px_rgba(0,0,0,0.6)] backdrop-blur-2xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                onRoleChange(user.id, r.id);
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-purple-600/20 hover:text-purple-300 transition-colors cursor-pointer block",
                user.role.id === r.id ? "text-purple-400 bg-purple-600/10" : "text-slate-400"
              )}
            >
              {r.role_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Premium Custom Select Dropdown for Table Filter Bars
interface FilterSelectDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}

function FilterSelectDropdown({ value, onChange, options, placeholder }: FilterSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative w-full text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full inline-flex justify-between items-center gap-2 px-3 py-2.5 text-xs rounded-xl bg-slate-900 border border-white/[0.05] text-white hover:border-white/[0.1] hover:bg-slate-800/40 transition-all cursor-pointer select-none"
      >
        <span className={cn(!value && "text-slate-500 font-light")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-slate-500 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-full rounded-xl border border-white/[0.08] bg-[#0c0a21] shadow-[0_4px_25px_rgba(0,0,0,0.6)] backdrop-blur-2xl py-1 z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
          <button
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className={cn(
              "w-full text-left px-4 py-2.5 text-xs font-light hover:bg-white/[0.02] hover:text-white transition-colors cursor-pointer block border-b border-white/[0.03]",
              !value ? "text-purple-400 font-semibold bg-purple-600/10" : "text-slate-400"
            )}
          >
            {placeholder}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-4 py-2.5 text-xs font-light hover:bg-white/[0.02] hover:text-white transition-colors cursor-pointer block",
                value === opt.value ? "text-purple-400 font-semibold bg-purple-600/10" : "text-slate-400"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
      <div className="flex h-[75vh] flex-col items-center justify-center text-center space-y-4 max-w-sm mx-auto animate-fade-in">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight">403 Access Denied</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-light">
            You do not possess the necessary privileges to load the administrative panels. Administrative clearance is strictly enforced.
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
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-purple-400" />
            Security & Administration
          </h1>
          <p className="text-xs text-slate-400 font-light mt-0.5">Manage user directory registers, adjust clearance levels, and verify audit records.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/60 border border-white/[0.05]">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/10'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <Users className="h-3.5 w-3.5" />
            Users list
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/10'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            <History className="h-3.5 w-3.5" />
            Audit trail
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      {activeTab === 'users' ? (
        <Card className="border-white/[0.05] bg-slate-950/40 backdrop-blur-2xl rounded-3xl p-5 md:p-6 space-y-6">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <CardTitle className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-purple-400" />
                Registered Node Directory
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs font-light">
                Locate and authorize access criteria for learning hub accounts.
              </CardDescription>
            </div>
          </div>

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
                className="pl-9 pr-4 py-2 w-full text-xs rounded-xl bg-slate-900 border border-white/[0.05] text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
              />
            </div>

            {/* Role Select Filter */}
            <FilterSelectDropdown
              value={selectedRole}
              onChange={setSelectedRole}
              options={roles.map(r => ({ value: r.role_code, label: r.role_name }))}
              placeholder="Filter by Role (All)"
            />

            {/* Status Select Filter */}
            <FilterSelectDropdown
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'blocked', label: 'Blocked' }
              ]}
              placeholder="Filter by Status (All)"
            />
          </div>

          {/* User Directory Table */}
          {loadingUsers ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/[0.05] rounded-2xl bg-slate-900/10">
              <p className="text-slate-500 text-xs font-light">No registered users matched your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-white/[0.04] rounded-2xl bg-slate-950/20">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-slate-900/30 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-4 py-3.5">User Details</th>
                    <th className="px-4 py-3.5">Assigned clearance role</th>
                    <th className="px-4 py-3.5">Account Status</th>
                    <th className="px-4 py-3.5 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-xs">
                  {filteredUsers.map((user) => {
                    const isSelf = user.id === currentUser?.id;
                    return (
                      <tr key={user.id} className="hover:bg-white/[0.01] transition-colors duration-200">
                        {/* Details */}
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-white">{user.name}</div>
                          <div className="text-[10px] text-slate-500 font-light mt-0.5">{user.email}</div>
                        </td>

                        {/* Role Assign */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <RoleSelectDropdown
                              user={user}
                              roles={roles}
                              onRoleChange={handleRoleChange}
                              isSelf={isSelf}
                            />
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-semibold border ${user.is_active
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
                            className={`h-7 px-2.5 rounded-lg text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-300 border ${user.is_active
                                ? 'text-rose-400 border-rose-500/10 hover:bg-rose-500/10'
                                : 'text-emerald-400 border-emerald-500/10 hover:bg-emerald-500/10'
                              } disabled:opacity-50`}
                          >
                            {user.is_active ? 'Block account' : 'Unblock account'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : (
        <Card className="border-white/[0.05] bg-slate-950/40 backdrop-blur-2xl rounded-3xl p-5 md:p-6 space-y-6">
          <div className="space-y-1">
            <CardTitle className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
              <History className="h-4.5 w-4.5 text-purple-400" />
              Administrative Security Audit Trail
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs font-light">
              Review chronological transactions of role assignments and clearance transfers.
            </CardDescription>
          </div>

          <CardContent className="p-0">
            {loadingHistory ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : historyLogs.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-white/[0.05] rounded-2xl bg-slate-900/10">
                <p className="text-slate-500 text-xs font-light">No role changes recorded in history logs.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {historyLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl border border-white/[0.04] bg-slate-950/10 hover:border-purple-500/10 transition-all duration-300 flex flex-col sm:flex-row justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1 text-slate-300 font-light">
                        <span className="font-bold text-white">{log.changer.name}</span>
                        <span className="text-slate-500">changed privilege clearance for</span>
                        <span className="font-bold text-white">{log.user.name}</span>
                      </div>
                      <div className="text-[9px] text-slate-500 flex items-center gap-1 font-semibold">
                        <Shield className="h-3 w-3 text-purple-400/80" />
                        Clearance shifted: <span className="text-rose-400">{log.old_role.role_name}</span> → <span className="text-emerald-400">{log.new_role.role_name}</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 text-left sm:text-right font-semibold">
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
