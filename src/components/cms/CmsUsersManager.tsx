import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Edit,
  Key,
  CheckCircle2,
  X,
  Mail,
  Lock,
  User as UserIcon,
  Shield,
  AlertCircle,
  Send,
  Copy,
  Check,
} from 'lucide-react';
import { cmsUsersApi } from '../../lib/cms-client';
import type { User, UserRole, UserPermissions } from '../../types/cms';

const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  SUPER_ADMIN: {
    canManagePages: true,
    canManageArticles: true,
    canManageMedia: true,
    canManageInquiries: true,
    canManageNavigation: true,
    canManageSettings: true,
    canManageUsers: true,
  },
  ADMIN: {
    canManagePages: true,
    canManageArticles: true,
    canManageMedia: true,
    canManageInquiries: true,
    canManageNavigation: true,
    canManageSettings: true,
    canManageUsers: false,
  },
  EDITOR: {
    canManagePages: true,
    canManageArticles: true,
    canManageMedia: true,
    canManageInquiries: true,
    canManageNavigation: false,
    canManageSettings: false,
    canManageUsers: false,
  },
  VIEWER: {
    canManagePages: false,
    canManageArticles: false,
    canManageMedia: false,
    canManageInquiries: true,
    canManageNavigation: false,
    canManageSettings: false,
    canManageUsers: false,
  },
  CUSTOM: {
    canManagePages: true,
    canManageArticles: false,
    canManageMedia: true,
    canManageInquiries: false,
    canManageNavigation: false,
    canManageSettings: false,
    canManageUsers: false,
  },
};

export default function CmsUsersManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Email Notification Modal state
  const [sentEmailNotification, setSentEmailNotification] = useState<any | null>(null);
  const [copiedEmailText, setCopiedEmailText] = useState(false);

  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('EDITOR');
  const [isActive, setIsActive] = useState(true);
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS['EDITOR']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await cmsUsersApi.getAll();
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('EDITOR');
    setIsActive(true);
    setPermissions({ ...DEFAULT_PERMISSIONS['EDITOR'] });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setUsername(user.username);
    setEmail(user.email);
    setPassword('');
    setRole(user.role);
    setIsActive(user.isActive);
    setPermissions({
      ...(DEFAULT_PERMISSIONS[user.role] || DEFAULT_PERMISSIONS['EDITOR']),
      ...(user.permissions || {}),
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (DEFAULT_PERMISSIONS[newRole]) {
      setPermissions({ ...DEFAULT_PERMISSIONS[newRole] });
    }
  };

  const handlePermissionToggle = (key: keyof UserPermissions) => {
    setRole('CUSTOM');
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim() || !email.trim()) {
      setErrorMessage('Username and email are required.');
      return;
    }

    try {
      if (editingUser) {
        const updated = await cmsUsersApi.update(editingUser.id, {
          username,
          email,
          password: password ? password : undefined,
          role,
          isActive,
          permissions,
        });
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        setSuccessMessage(`User "${username}" updated successfully!`);
        setIsModalOpen(false);
        setTimeout(() => setSuccessMessage(null), 3500);
      } else {
        const res = await cmsUsersApi.create({
          username,
          email,
          password: password || 'viralmuse2026!',
          role,
          isActive,
          permissions,
        });
        setUsers((prev) => [...prev, res.user]);
        setIsModalOpen(false);

        // If email notification metadata was returned, trigger the email notification popup
        if (res.emailNotification) {
          setSentEmailNotification(res.emailNotification);
        } else {
          setSuccessMessage(`User "${username}" created and notification email sent!`);
          setTimeout(() => setSuccessMessage(null), 3500);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save user');
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}"?`)) return;
    try {
      await cmsUsersApi.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSuccessMessage(`User "${name}" deleted.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const handleCopyNotificationEmail = () => {
    if (!sentEmailNotification) return;
    const text = `Subject: ${sentEmailNotification.subject}\n\nHello ${sentEmailNotification.username},\n\nYour ViralMuse CMS account has been created with role: ${sentEmailNotification.role}.\n\nLogin URL: ${sentEmailNotification.loginUrl}\nUsername: ${sentEmailNotification.username}\nTemporary Password: ${sentEmailNotification.temporaryPassword}\n\nPlease sign in and update your password upon your first login.\n\nBest regards,\nViralMuse Security Team`;
    navigator.clipboard.writeText(text);
    setCopiedEmailText(true);
    setTimeout(() => setCopiedEmailText(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#df0567]/20 text-[#df0567] border border-[#df0567]/30">
              Access Control &amp; RBAC
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-[#df0567]" />
            <span>Team &amp; User Permissions</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-0.5">
            Create CMS team accounts, assign granular permissions, and automatically notify users with login credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-white text-xs sm:text-sm font-bold transition-all shadow-lg shadow-[#df0567]/25 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create New User</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Users Cards Stream */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-16 text-center text-white/40 text-xs font-mono">Loading team users...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-white/40 text-xs border border-dashed border-white/10 rounded-2xl">
            No team users found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-6 rounded-2xl bg-[#131317] border border-white/10 space-y-4 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white text-sm">
                        {u.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-white flex items-center gap-2">
                          <span>{u.username}</span>
                          {!u.isActive && (
                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                              Inactive
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-white/50 flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-white/40" />
                          <span>{u.email}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        u.role === 'SUPER_ADMIN'
                          ? 'bg-[#df0567]/20 text-[#df0567] border border-[#df0567]/30'
                          : u.role === 'ADMIN'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : u.role === 'EDITOR'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {u.role.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Permissions badges summary */}
                  <div className="pt-2 border-t border-white/5 flex flex-wrap gap-1.5 text-[10px]">
                    <span className="text-white/40 font-semibold mr-1">Permissions:</span>
                    {u.permissions?.canManagePages && (
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/80">Pages</span>
                    )}
                    {u.permissions?.canManageArticles && (
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/80">Blog</span>
                    )}
                    {u.permissions?.canManageMedia && (
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/80">Media</span>
                    )}
                    {u.permissions?.canManageInquiries && (
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/80">Inquiries</span>
                    )}
                    {u.permissions?.canManageNavigation && (
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/80">Nav</span>
                    )}
                    {u.permissions?.canManageSettings && (
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/80">Settings</span>
                    )}
                    {u.permissions?.canManageUsers && (
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-white/80">Team</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs">
                  <span className="text-white/40 text-[11px]">
                    Created: {new Date(u.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(u)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit &amp; Permissions</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u.id, u.username)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#131317] border border-white/15 rounded-2xl shadow-2xl text-white p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-black text-white">
                {editingUser ? `Edit User: ${editingUser.username}` : 'Create New Team User'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 font-semibold mb-1.5">Username *</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. elena_admin"
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-white text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1.5">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="elena@viralmuse.agency"
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-white text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 font-semibold mb-1.5">
                    {editingUser ? 'New Password (Leave blank to keep current)' : 'Temporary Password *'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="viralmuse2026!"
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-white text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 font-semibold mb-1.5">Role Preset</label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-medium"
                  >
                    <option value="SUPER_ADMIN">Super Admin (Full Access)</option>
                    <option value="ADMIN">Admin (Content &amp; Settings)</option>
                    <option value="EDITOR">Editor (Pages &amp; Blog)</option>
                    <option value="VIEWER">Viewer (Inquiries CRM Only)</option>
                    <option value="CUSTOM">Custom Permissions</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="accent-[#df0567] rounded w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-white font-medium cursor-pointer">
                  Account is Active (Allow login)
                </label>
              </div>

              {/* Granular Permission Restrictions */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#df0567]" />
                    <span>Granular Feature Permissions</span>
                  </span>
                  <span className="text-[10px] text-white/40">Check to allow module access</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {[
                    { key: 'canManagePages', label: 'Manage Pages & Sections' },
                    { key: 'canManageArticles', label: 'Manage Blog / Articles' },
                    { key: 'canManageMedia', label: 'Manage Media Library' },
                    { key: 'canManageInquiries', label: 'View & Manage CRM Inquiries' },
                    { key: 'canManageNavigation', label: 'Manage Navigation Menu' },
                    { key: 'canManageSettings', label: 'Manage Site Settings' },
                    { key: 'canManageUsers', label: 'Manage Team Users & RBAC' },
                  ].map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(permissions[perm.key as keyof UserPermissions])}
                        onChange={() => handlePermissionToggle(perm.key as keyof UserPermissions)}
                        className="accent-[#df0567] rounded w-4 h-4 cursor-pointer"
                      />
                      <span className="text-white font-medium text-xs">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#df0567] hover:bg-[#c4045a] text-white text-xs font-bold shadow-lg shadow-[#df0567]/25 cursor-pointer transition-all"
                >
                  {editingUser ? 'Save Changes' : 'Create User & Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Notification Sent Success Modal */}
      {sentEmailNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div
            className="w-full max-w-lg bg-[#131317] border border-emerald-500/30 rounded-2xl shadow-2xl text-white p-6 sm:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${sentEmailNotification.isSandboxRestricted ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'} flex items-center justify-center`}>
                  <Send className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {sentEmailNotification.isSandboxRestricted ? 'User Created (Email Restricted by Resend)' : 'Login Credentials Email Sent!'}
                  </h3>
                  <p className="text-xs text-white/60">
                    {sentEmailNotification.isSandboxRestricted ? (
                      <span className="text-amber-400">Resend trial sandbox restricted delivery to <span className="font-mono">{sentEmailNotification.sentTo}</span></span>
                    ) : (
                      <>Dispatched successfully to <span className="text-emerald-400 font-mono">{sentEmailNotification.sentTo}</span></>
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSentEmailNotification(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {sentEmailNotification.isSandboxRestricted && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Resend free-trial domains can only deliver emails to your verified account email. Please use the <b>Copy Email Draft</b> button below to share these login credentials with the user via chat, Slack, or direct message.
                </span>
              </div>
            )}

            {/* Email Preview Box */}
            <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-3 font-mono text-xs text-white/80">
              <div className="text-white/40 border-b border-white/10 pb-2">
                <div><span className="text-white/40">To:</span> {sentEmailNotification.sentTo}</div>
                <div><span className="text-white/40">Subject:</span> {sentEmailNotification.subject}</div>
              </div>
              <div className="space-y-2 text-xs font-sans text-white/90">
                <p>Hello <b>{sentEmailNotification.username}</b>,</p>
                <p>Your ViralMuse CMS account has been successfully created with role <b>{sentEmailNotification.role}</b>.</p>
                <div className="p-3 rounded-lg bg-black/60 border border-white/10 space-y-1 font-mono text-xs">
                  <div><span className="text-white/45">Login URL:</span> <span className="text-[#df0567]">{sentEmailNotification.loginUrl}</span></div>
                  <div><span className="text-white/45">Username:</span> {sentEmailNotification.username}</div>
                  <div><span className="text-white/45">Temporary Password:</span> {sentEmailNotification.temporaryPassword}</div>
                </div>
                <p className="text-[11px] text-white/60">Please sign in and update your password upon your first login.</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleCopyNotificationEmail}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
              >
                {copiedEmailText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedEmailText ? 'Copied Email Draft!' : 'Copy Email Draft'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSentEmailNotification(null)}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold shadow-lg cursor-pointer transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
