"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGet, apiPatch, apiPost } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  MessageCircle,
  Star,
  AlertTriangle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { JobActionModal } from "@/components/dashboard/JobActionModal";
import { toast } from "sonner";

interface OrderItem {
  productId: string;
  supplierId?: string;
  name: string;
  quantity: number;
  priceAtOrder: number;
  selectedSpecs?: Record<string, string>;
}

interface Order {
  _id: string;
  buyerId: {
    _id: string;
    fullName: string;
    avatarUrl: string | null;
    city: string;
  };
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress?: string;
  city?: string;
  note?: string;
  paymentMethod?: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  cancellationReason?: string;
  cancelledBy?: "buyer" | "supplier";
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const STATUS_CONFIG = {
  pending: { label: "Pending", icon: Clock, color: "bg-warning/10 text-warning" },
  confirmed: { label: "Confirmed", icon: Package, color: "bg-primary/10 text-primary" },
  shipped: { label: "Shipped", icon: Truck, color: "bg-accent/10 text-accent" },
  delivered: { label: "Delivered", icon: CheckCircle2, color: "bg-success/10 text-success" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-destructive/10 text-destructive" },
};


export default function DashboardOrders() {
  const { profile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ?as=buyer|seller — explicit override. Otherwise default by role.
  const explicitAs = searchParams?.get("as");
  const view: "buyer" | "seller" =
    explicitAs === "buyer" || explicitAs === "seller"
      ? explicitAs
      : profile?.role === "supplier"
      ? "seller"
      : "buyer";
  const isSupplier = view === "seller";

  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Dispute state
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  // Action modal — replaces generic transition buttons
  const [actionModal, setActionModal] = useState<
    | null
    | "confirm"
    | "ship"
    | "deliver"
    | "cancel"
  >(null);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10", as: view });
      if (filter !== "all") params.set("status", filter);
      const data = await apiGet<{ data: Order[]; pagination: Pagination }>(`/orders?${params}`);
      setOrders(data.data || []);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [filter, view]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: string,
    reason?: string
  ) => {
    setStatusUpdating(true);
    try {
      const body: Record<string, unknown> = { status: newStatus };
      if (newStatus === "cancelled" && reason) body.reason = reason;
      await apiPatch(`/orders/${orderId}/status`, body);
      toast.success(
        newStatus === "confirmed"
          ? "Order confirmed"
          : newStatus === "shipped"
          ? "Marked as shipped"
          : newStatus === "delivered"
          ? "Marked as delivered"
          : newStatus === "cancelled"
          ? "Order cancelled"
          : `Order ${newStatus}`
      );
      fetchOrders(pagination.page);
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: newStatus as Order["status"] } : null
        );
      }
      setActionModal(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleMessageParty = async (participantId: string) => {
    if (!selectedOrder) return;
    try {
      const itemsSummary = selectedOrder.items
        .map((i) => `${i.name} x${i.quantity}`)
        .join(", ");
      const content = [
        `Order #${selectedOrder._id.slice(-8).toUpperCase()}`,
        `Items: ${itemsSummary}`,
        `Total: ${formatCurrency(selectedOrder.totalAmount)}`,
        `Status: ${STATUS_CONFIG[selectedOrder.status].label}`,
        `---`,
        `Hi! I'd like to discuss this order.`,
      ].join("\n");

      await apiPost("/chat/messages", {
        receiverId: participantId,
        content,
      });
      router.push("/dashboard/chat");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start chat");
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedOrder) return;
    // For orders, review the supplier (first item's supplier)
    const supplierId = selectedOrder.items[0]?.supplierId;
    if (!supplierId) {
      toast.error("Cannot determine supplier for review");
      return;
    }
    setReviewSubmitting(true);
    try {
      await apiPost("/reviews", {
        artisanId: supplierId,
        rating: reviewRating,
        comment: reviewComment || undefined,
        orderId: selectedOrder._id,
      });
      toast.success("Review submitted!");
      setShowReviewModal(false);
      setReviewRating(5);
      setReviewComment("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };


  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

  const formatCurrency = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-40" /><Skeleton className="h-4 w-56 mt-2" /></div>
        <div className="flex gap-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-20 rounded-lg" />)}</div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card-elevated p-4 flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/3" /></div>
              <div className="text-right space-y-2"><Skeleton className="h-4 w-16 ml-auto" /><Skeleton className="h-4 w-14 rounded-full ml-auto" /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {isSupplier ? "Orders Received" : "My Purchases"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isSupplier
            ? "Orders from buyers — manage fulfilment from here."
            : "Products you&apos;ve bought from suppliers — track delivery and leave reviews."}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === s
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {s === "all" ? "All" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG].label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
          </div>
          <p className="text-sm font-medium text-foreground">{filter !== "all" ? `No ${filter} orders` : "No orders yet"}</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            {filter !== "all" ? "Try selecting a different filter" : "When you place an order, it will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const statusCfg = STATUS_CONFIG[order.status];
            const StatusIcon = statusCfg.icon;
            return (
              <div
                key={order._id}
                className="card-elevated p-4 flex items-center gap-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => setSelectedOrder(order)}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${statusCfg.color}`}>
                  <StatusIcon className="w-5 h-5" strokeWidth={1} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {order.items.map((i) => i.name).join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""} &middot; {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">{formatCurrency(order.totalAmount)}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusCfg.color}`}>
                    {statusCfg.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => fetchOrders(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span>
          <button onClick={() => fetchOrders(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && !showReviewModal && !showDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display font-bold text-foreground">Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-4 space-y-4">
              {/* Order ID & Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">#{selectedOrder._id.slice(-8).toUpperCase()}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[selectedOrder.status].color}`}>
                  {STATUS_CONFIG[selectedOrder.status].label}
                </span>
              </div>

              {/* Buyer info (supplier view) */}
              {isSupplier && selectedOrder.buyerId && (
                <div className="flex items-center gap-3 bg-secondary/50 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {selectedOrder.buyerId.fullName?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{selectedOrder.buyerId.fullName}</p>
                    {selectedOrder.buyerId.city && <p className="text-xs text-muted-foreground">{selectedOrder.buyerId.city}</p>}
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-secondary/50 rounded-xl px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        {item.selectedSpecs && Object.keys(item.selectedSpecs).length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {Object.entries(item.selectedSpecs).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(item.priceAtOrder * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-sm font-medium text-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">{formatCurrency(selectedOrder.totalAmount)}</span>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-foreground">{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="text-foreground capitalize">{selectedOrder.paymentMethod || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span className={`capitalize font-medium ${selectedOrder.paymentStatus === "paid" ? "text-success" : selectedOrder.paymentStatus === "failed" ? "text-destructive" : "text-warning"}`}>
                    {selectedOrder.paymentStatus || "pending"}
                  </span>
                </div>
                {selectedOrder.updatedAt !== selectedOrder.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated</span>
                    <span className="text-foreground">{formatDate(selectedOrder.updatedAt)}</span>
                  </div>
                )}
                {selectedOrder.deliveryAddress && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-foreground text-right max-w-[60%]">
                      {selectedOrder.deliveryAddress}{selectedOrder.city ? `, ${selectedOrder.city}` : ""}
                    </span>
                  </div>
                )}
                {selectedOrder.note && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Note</span>
                    <span className="text-foreground text-right max-w-[60%]">{selectedOrder.note}</span>
                  </div>
                )}
                {selectedOrder.status === "cancelled" && selectedOrder.cancellationReason && (
                  <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <p className="text-xs uppercase tracking-wider text-destructive font-medium mb-1">
                      Cancelled by{" "}
                      {selectedOrder.cancelledBy === "buyer"
                        ? "buyer"
                        : selectedOrder.cancelledBy === "supplier"
                        ? "supplier"
                        : "—"}
                    </p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {selectedOrder.cancellationReason}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="border-t border-border pt-3 space-y-3">
                {/* Message button */}
                <button
                  onClick={() => {
                    const participantId = isSupplier
                      ? selectedOrder.buyerId._id
                      : selectedOrder.items[0]?.supplierId;
                    if (participantId) handleMessageParty(participantId);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" strokeWidth={1} />
                  {isSupplier ? "Message Buyer" : "Message Seller"}
                </button>

                {/* Review button (buyer only, delivered orders) */}
                {!isSupplier && selectedOrder.status === "delivered" && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
                  >
                    <Star className="w-4 h-4" strokeWidth={1} />
                    Leave a Review
                  </button>
                )}

                {/* Supplier — Confirm a pending order */}
                {isSupplier && selectedOrder.status === "pending" && (
                  <button
                    onClick={() => setActionModal("confirm")}
                    disabled={statusUpdating}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" strokeWidth={1} />
                    Confirm order
                  </button>
                )}

                {/* Supplier — Ship a confirmed order */}
                {isSupplier && selectedOrder.status === "confirmed" && (
                  <button
                    onClick={() => setActionModal("ship")}
                    disabled={statusUpdating}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 transition-colors"
                  >
                    <Truck className="w-4 h-4" strokeWidth={1} />
                    Mark as shipped
                  </button>
                )}

                {/* Supplier — Mark a shipped order delivered */}
                {isSupplier && selectedOrder.status === "shipped" && (
                  <button
                    onClick={() => setActionModal("deliver")}
                    disabled={statusUpdating}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-success text-success-foreground hover:bg-success/90 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" strokeWidth={1} />
                    Mark as delivered
                  </button>
                )}

                {/* Cancel — buyers can cancel pending/confirmed; suppliers can cancel pending/confirmed too */}
                {(selectedOrder.status === "pending" || selectedOrder.status === "confirmed") && (
                  <button
                    onClick={() => setActionModal("cancel")}
                    disabled={statusUpdating}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" strokeWidth={1} />
                    Cancel order
                  </button>
                )}

                {/* Dispute button */}
                {selectedOrder.status !== "pending" && selectedOrder.status !== "cancelled" && (
                  <button
                    onClick={() => {
                      setDisputeReason("");
                      setShowDispute(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4" strokeWidth={1} />
                    Raise a Dispute
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDispute && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDispute(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" strokeWidth={1} />
                Raise a Dispute
              </h3>
              <button onClick={() => setShowDispute(false)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Our team will review this dispute and reach out to both parties within 48 hours.
              </p>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Describe the issue</label>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  maxLength={2000}
                  rows={5}
                  placeholder="What happened? Include dates, amounts, and any relevant context."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground mt-1">{disputeReason.length}/2000</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDispute(false)}
                  className="flex-1 px-3 py-2 rounded-xl text-sm font-medium bg-secondary hover:bg-secondary/80"
                >
                  Cancel
                </button>
                <button
                  disabled={disputeSubmitting || !disputeReason.trim()}
                  onClick={async () => {
                    if (!disputeReason.trim()) return;
                    setDisputeSubmitting(true);
                    try {
                      await apiPost("/disputes", {
                        type: "order",
                        orderId: selectedOrder._id,
                        reason: disputeReason.trim(),
                      });
                      toast.success("Dispute submitted. Our team will review it.");
                      setShowDispute(false);
                      setDisputeReason("");
                    } catch (err) {
                      const msg = err instanceof Error ? err.message : "Failed to submit dispute";
                      toast.error(msg);
                    } finally {
                      setDisputeSubmitting(false);
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                >
                  {disputeSubmitting ? "Submitting..." : "Submit Dispute"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowReviewModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display font-bold text-foreground">Leave a Review</h3>
              <button onClick={() => setShowReviewModal(false)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setReviewRating(s)} className="p-0.5">
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          s <= reviewRating ? "fill-warning text-warning" : "text-muted-foreground/30"
                        }`}
                        strokeWidth={1}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Comment (optional)</p>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was your experience?"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
              <button
                onClick={handleSubmitReview}
                disabled={reviewSubmitting}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Order action confirmation modals ─── */}
      {/* Confirm order (supplier) */}
      <JobActionModal
        open={actionModal === "confirm" && !!selectedOrder}
        onClose={() => setActionModal(null)}
        onConfirm={() =>
          selectedOrder && handleStatusUpdate(selectedOrder._id, "confirmed")
        }
        title="Confirm this order"
        description={
          <>
            Confirm you have <strong className="text-foreground">all items in stock</strong> and
            can fulfill this order. The buyer will be notified and the order moves to confirmed.
          </>
        }
        icon={CheckCircle2}
        tone="primary"
        confirmLabel="Yes, confirm order"
        agreementLabel={
          <>I have all items available and will ship within the agreed time.</>
        }
        loading={statusUpdating}
      />

      {/* Ship order (supplier) */}
      <JobActionModal
        open={actionModal === "ship" && !!selectedOrder}
        onClose={() => setActionModal(null)}
        onConfirm={() =>
          selectedOrder && handleStatusUpdate(selectedOrder._id, "shipped")
        }
        title="Mark as shipped"
        description={
          <>
            Confirm the order has been <strong className="text-foreground">handed off to the courier</strong>
            {" "}or is in transit to the buyer. They&apos;ll be notified to expect delivery.
          </>
        }
        icon={Truck}
        tone="primary"
        confirmLabel="Yes, it's shipped"
        loading={statusUpdating}
      />

      {/* Deliver order (supplier) */}
      <JobActionModal
        open={actionModal === "deliver" && !!selectedOrder}
        onClose={() => setActionModal(null)}
        onConfirm={() =>
          selectedOrder && handleStatusUpdate(selectedOrder._id, "delivered")
        }
        title="Mark as delivered"
        description={
          <>
            Confirm the buyer has <strong className="text-foreground">received and accepted</strong>
            {" "}the order. Only mark this once you have proof of delivery.
          </>
        }
        icon={CheckCircle2}
        tone="success"
        confirmLabel="Yes, delivered"
        loading={statusUpdating}
      />

      {/* Cancel order (either party) */}
      <JobActionModal
        open={actionModal === "cancel" && !!selectedOrder}
        onClose={() => setActionModal(null)}
        onConfirm={({ reason }) =>
          selectedOrder && handleStatusUpdate(selectedOrder._id, "cancelled", reason)
        }
        title="Cancel this order"
        description="The other party will be notified and they'll see your reason."
        icon={XCircle}
        tone="destructive"
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        reasonLabel="Why are you cancelling?"
        reasonPlaceholder={
          isSupplier
            ? "e.g. Item out of stock / can't fulfill in agreed timeframe / buyer unresponsive…"
            : "e.g. Found a better price / no longer needed / wrong item ordered…"
        }
        reasonRequired
        hint={
          <span>
            <strong className="text-foreground">If there&apos;s a problem with the order</strong>,
            consider raising a dispute instead so admin can mediate.
          </span>
        }
        loading={statusUpdating}
      />
    </div>
  );
}
