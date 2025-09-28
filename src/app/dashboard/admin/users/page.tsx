'use client';

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuthStore } from '@/store/auth';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  UserCheck, 
  UserX,
  Mail,
  Building,
  Calendar,
  Shield
} from 'lucide-react';

interface AdminUser {
  _id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  company?: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user, getDashboardRoute } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', role: 'shipper', company: '' });
  const [editForm, setEditForm] = useState({ email: '', firstName: '', lastName: '', role: '', company: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      window.location.href = getDashboardRoute();
    }
  }, [user, getDashboardRoute]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const url = `/api/admin/users?${q ? 'q=' + encodeURIComponent(q) + '&' : ''}${roleFilter ? 'role=' + roleFilter : ''}`;
      const res = await fetchWithAuth(url);
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); // initial
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createUser = async () => {
    setCreating(true);
    setError(null);
    try {
      const res = await fetchWithAuth('/api/admin/users', { method: 'POST', body: JSON.stringify(form) });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed');
      } else {
        setForm({ email: '', password: '', firstName: '', lastName: '', role: 'shipper', company: '' });
        setShowCreateDialog(false);
        loadUsers();
      }
    } finally {
      setCreating(false);
    }
  };

  const editUser = async () => {
    if (!editingUser) return;
    setEditing(true);
    setError(null);
    try {
      const updateData: Record<string, unknown> = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        role: editForm.role,
        company: editForm.company,
      };
      
      // Only include password if it's provided
      if (editForm.password.trim()) {
        updateData.password = editForm.password;
      }

      const res = await fetchWithAuth(`/api/admin/users/${editingUser._id}`, { 
        method: 'PUT', 
        body: JSON.stringify(updateData) 
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to update user');
      } else {
        setShowEditDialog(false);
        setEditingUser(null);
        loadUsers();
      }
    } finally {
      setEditing(false);
    }
  };

  const openEditDialog = (user: AdminUser) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      company: user.company || '',
      password: ''
    });
    setShowEditDialog(true);
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetchWithAuth(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify({ isActive: !isActive }) });
    loadUsers();
  };

  const deleteUser = async (id: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone.`)) return;
    try {
      const res = await fetchWithAuth(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadUsers();
      } else {
        alert(data.message || 'Failed to delete user');
      }
    } catch {
      alert('Failed to delete user');
    }
  };

  if (!user || user.role !== 'admin') return <div className="p-8">Authorizing...</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Users className="h-8 w-8 mr-3" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage system users, roles, and permissions
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    placeholder="user@example.com" 
                    value={form.email} 
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password"
                    placeholder="Password" 
                    type="password" 
                    value={form.password} 
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName"
                      placeholder="First Name" 
                      value={form.firstName} 
                      onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName"
                      placeholder="Last Name" 
                      value={form.lastName} 
                      onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <select 
                      id="role"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                      value={form.role} 
                      onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    >
                      <option value="shipper">Shipper</option>
                      <option value="carrier">Carrier</option>
                      <option value="driver">Driver</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input 
                      id="company"
                      placeholder="Company Name" 
                      value={form.company} 
                      onChange={e => setForm(f => ({ ...f, company: e.target.value }))} 
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button disabled={creating} onClick={createUser}>
                  {creating ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users by name or email..." 
                value={q} 
                onChange={e => setQ(e.target.value)} 
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select 
                value={roleFilter} 
                onChange={e => setRoleFilter(e.target.value)} 
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="shipper">Shipper</option>
                <option value="carrier">Carrier</option>
                <option value="driver">Driver</option>
              </select>
            </div>
            <Button variant="outline" onClick={loadUsers} disabled={loading}>
              {loading ? 'Loading...' : 'Apply Filters'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Users ({users.length})</span>
            {!loading && (
              <Badge variant="outline" className="text-xs">
                Last updated: {new Date().toLocaleTimeString()}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 pr-4 font-medium">User</th>
                  <th className="text-left py-3 pr-4 font-medium">Role</th>
                  <th className="text-left py-3 pr-4 font-medium">Company</th>
                  <th className="text-left py-3 pr-4 font-medium">Status</th>
                  <th className="text-left py-3 pr-4 font-medium">Joined</th>
                  <th className="text-right py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-3">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No users found</p>
                      <p className="text-xs">Try adjusting your search filters</p>
                    </td>
                  </tr>
                )}
                {users.map(u => (
                  <tr key={u._id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-4 pr-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{u.firstName} {u.lastName}</div>
                          <div className="text-sm text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                        {u.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center text-sm">
                        {u.company ? (
                          <>
                            <Building className="h-3 w-3 mr-1 text-muted-foreground" />
                            {u.company}
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center">
                        {u.isActive ? (
                          <>
                            <UserCheck className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-green-600 font-medium">Active</span>
                          </>
                        ) : (
                          <>
                            <UserX className="h-4 w-4 text-muted-foreground mr-2" />
                            <span className="text-muted-foreground">Inactive</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openEditDialog(u)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant={u.isActive ? "outline" : "default"}
                          onClick={() => toggleActive(u._id, u.isActive)}
                        >
                          {u.isActive ? (
                            <>
                              <UserX className="h-3 w-3 mr-1" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3 w-3 mr-1" />
                              Activate
                            </>
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => deleteUser(u._id, u.email)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input 
                    id="edit-email"
                    value={editForm.email} 
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="edit-password">New Password (Optional)</Label>
                  <Input 
                    id="edit-password"
                    placeholder="Leave blank to keep current password" 
                    type="password" 
                    value={editForm.password} 
                    onChange={e => setEditForm(f => ({ ...f, password: e.target.value }))} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-firstName">First Name</Label>
                    <Input 
                      id="edit-firstName"
                      value={editForm.firstName} 
                      onChange={e => setEditForm(f => ({ ...f, firstName: e.target.value }))} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-lastName">Last Name</Label>
                    <Input 
                      id="edit-lastName"
                      value={editForm.lastName} 
                      onChange={e => setEditForm(f => ({ ...f, lastName: e.target.value }))} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-role">Role</Label>
                    <select 
                      id="edit-role"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                      value={editForm.role} 
                      onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))}
                    >
                      <option value="shipper">Shipper</option>
                      <option value="carrier">Carrier</option>
                      <option value="driver">Driver</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="edit-company">Company</Label>
                    <Input 
                      id="edit-company"
                      placeholder="Company Name" 
                      value={editForm.company} 
                      onChange={e => setEditForm(f => ({ ...f, company: e.target.value }))} 
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button disabled={editing} onClick={editUser}>
                  {editing ? 'Updating...' : 'Update User'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
