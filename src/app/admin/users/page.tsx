"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { Search, ChevronLeft, ChevronRight, MoreHorizontal, Ban, CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface UserRow {
  _id: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLogin: string | null;
  profile?: {
    fullName: string;
    avatarUrl: string | null;
    city: string;
    state: string;
  };
}

interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, totalPages: 1, totalResults: 0 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      const res = await apiGet<{ data: { users: UserRow[] }; pagination: Pagination }>(`/admin/users?${params}`);
      setUsers(res.data.users);
      setPagination(res.pagination);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleBan = async (userId: string, currentlyBanned: boolean) => {
    try {
      await apiPatch(`/admin/users/${userId}`, { isBanned: !currentlyBanned });
      toast.success(currentlyBanned ? "User unbanned" : "User banned");
      fetchUsers(pagination.page);
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage all platform users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-border bg-background text-sm"
        >
          <option value="">All Roles</option>
          <option value="client">Client</option>
          <option value="artisan">Artisan</option>
          <option value="supplier">Supplier</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Location</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Joined</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Verified</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">No users found</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={u.profile?.avatarUrl || ""} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {u.profile?.fullName?.charAt(0) || u.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{u.profile?.fullName || "—"}</p>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-lg text-xs font-medium capitalize bg-secondary text-foreground">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">
                      {[u.profile?.city, u.profile?.state].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="p-4 hidden lg:table-cell text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="p-4">
                      {u.isEmailVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <span className="text-xs text-muted-foreground">No</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(`/admin/users/${u._id}`, "_self")}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(`/admin/chat?user=${u._id}`, "_self")}>
                            Message User
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleToggleBan(u._id, false)}
                            className="text-destructive"
                          >
                            <Ban className="w-4 h-4 mr-2" /> Ban User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {pagination.totalResults} users total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchUsers(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchUsers(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
