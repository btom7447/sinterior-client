"use client";

/**
 * One order, for an admin.
 *
 * There was no way to open an order at all — the list was a table of rows and
 * that was the end of it. Meanwhile disputes carry an orderId, and resolving a
 * dispute in the buyer's favour now moves real money out of escrow. An admin
 * was being asked to decide a refund against an order they could not look at.
 *
 * So this leads with the money: what was charged, what is still held, what has
 * already gone back. Everything else — items, buyer, address — is underneath.
 */
import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, ShieldCheck, User } from "lucide-react";
import { apiGet } from "@/lib/apiClient";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const naira = (kobo: number) =>
  `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface Escrow {
  _id: string;
  amount: number;
  status: string;
  refundedAmount?: number;
  feeAmount?: number;
  netAmount?: number;
  heldAt?: string;
  releasedAt?: string;
}

interface OrderDetail {
  order: {
    _id: string;
    status: string;
    paymentStatus?: string;
    paymentMethod?: string;
    totalAmount?: number;
    total?: number;
    deliveryAddress?: string;
    city?: string;
    state?: string;
    createdAt: string;
    buyer?: { fullName?: string; phone?: string; city?: string };
    items?: {
      _id?: string;
      quantity?: number;
      price?: number;
      productId?: { name?: string; unit?: string } | string;
      supplierId?: { fullName?: string } | string;
    }[];
  };
  escrow: Escrow[];
}

const STATUS_TONE: Record<string, string> = {
  held: "bg-amber-500/10 text-amber-600",
  released: "bg-green-500/10 text-green-600",
  refunded: "bg-red-500/10 text-red-600",
  partially_refunded: "bg-red-500/10 text-red-600",
};

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ data: OrderDetail }>(`/admin/orders/${id}`);
      setData(res.data);
    } catch {
      toast.error("Could not load that order");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-muted-foreground">That order could not be found.</p>;
  }

  const { order, escrow } = data;
  const total = order.totalAmount ?? order.total ?? 0;
  const held = escrow.filter((e) => e.status === "held").reduce((s, e) => s + e.amount, 0);
  const refunded = escrow.reduce((s, e) => s + (e.refundedAmount ?? 0), 0);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> All orders
      </Link>

      <div>
        <h1 className="text-xl font-display font-bold text-foreground">
          Order {order._id.slice(-6).toUpperCase()}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {new Date(order.createdAt).toLocaleString("en-NG")} · {order.status}
          {order.paymentStatus ? ` · ${order.paymentStatus}` : ""}
          {order.paymentMethod ? ` · ${order.paymentMethod}` : ""}
        </p>
      </div>

      {/* Money first — this is what a refund decision turns on. */}
      <div className="card-elevated p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck strokeWidth={1.5} className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground">Money</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Figure label="Charged" value={naira(total)} />
          <Figure label="Still in escrow" value={naira(held)} tone={held > 0 ? "warn" : undefined} />
          <Figure label="Refunded" value={naira(refunded)} tone={refunded > 0 ? "bad" : undefined} />
        </div>

        {escrow.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No escrow entries — this order was cash on delivery, or was never paid.
          </p>
        ) : (
          <div className="space-y-2">
            {escrow.map((e) => (
              <div
                key={e._id}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
              >
                <div className="text-sm">
                  <span className="font-medium text-foreground">{naira(e.amount)}</span>
                  {!!e.netAmount && (
                    <span className="text-muted-foreground">
                      {" "}
                      · net {naira(e.netAmount)} after {naira(e.feeAmount ?? 0)} fee
                    </span>
                  )}
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    STATUS_TONE[e.status] ?? "bg-secondary text-muted-foreground"
                  }`}
                >
                  {e.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card-elevated p-6 space-y-3">
        <div className="flex items-center gap-2">
          <User strokeWidth={1.5} className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground">Buyer &amp; delivery</h2>
        </div>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <Pair label="Name" value={order.buyer?.fullName} />
          <Pair label="Phone" value={order.buyer?.phone} />
          <Pair
            label="Delivering to"
            value={[order.deliveryAddress, order.city, order.state].filter(Boolean).join(", ")}
          />
        </dl>
      </div>

      <div className="card-elevated p-6 space-y-3">
        <div className="flex items-center gap-2">
          <Package strokeWidth={1.5} className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground">
            Items ({order.items?.length ?? 0})
          </h2>
        </div>
        <div className="space-y-2">
          {(order.items ?? []).map((item, i) => {
            const product = typeof item.productId === "object" ? item.productId : undefined;
            const supplier = typeof item.supplierId === "object" ? item.supplierId : undefined;
            return (
              <div
                key={item._id ?? i}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-foreground">{product?.name ?? "Item"}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity ?? 1} × {naira(item.price ?? 0)}
                    {supplier?.fullName ? ` · ${supplier.fullName}` : ""}
                  </p>
                </div>
                <p className="font-medium text-foreground">
                  {naira((item.price ?? 0) * (item.quantity ?? 1))}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Figure({ label, value, tone }: { label: string; value: string; tone?: "warn" | "bad" }) {
  const colour =
    tone === "warn" ? "text-amber-600" : tone === "bad" ? "text-red-600" : "text-foreground";
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${colour}`}>{value}</p>
    </div>
  );
}

function Pair({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  );
}
