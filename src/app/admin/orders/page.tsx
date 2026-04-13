"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet } from "@/lib/apiClient";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface OrderRow {
  _id: string;
  buyer: { fullName: string };
  seller: { fullName: string };
  totalAmount: number;
  status: string;
  createdAt: string;
  items: { name: string }[];
}

interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  confirmed: "bg-blue-500/10 text-blue-600",
  shipped: "bg-purple-500/10 text-purple-600",
  delivered: "bg-green-500/10 text-green-600",
  cancelled: "bg-red-500/10 text-red-600",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, totalPages: 1, totalResults: 0 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await apiGet<{ data: { orders: OrderRow[] }; pagination: Pagination }>(`/admin/orders?${params}`);
      setOrders(res.data.orders);
      setPagination(res.pagination);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Order Management</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage all platform orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchOrders()}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-border bg-background text-sm"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Order ID</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Buyer</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Seller</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">No orders found</td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="p-4 font-mono text-xs text-muted-foreground">
                      {o._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="p-4 font-medium text-foreground">{o.buyer?.fullName || "—"}</td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{o.seller?.fullName || "—"}</td>
                    <td className="p-4 font-medium">{"\u20A6"}{o.totalAmount?.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium capitalize ${statusColors[o.status] || "bg-secondary text-foreground"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 hidden lg:table-cell text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">{pagination.totalResults} orders total</p>
            <div className="flex items-center gap-2">
              <button onClick={() => fetchOrders(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
              <button onClick={() => fetchOrders(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
