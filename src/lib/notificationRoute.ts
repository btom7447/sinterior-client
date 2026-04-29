import type { Notification } from "@/hooks/useNotifications";

/**
 * Map a notification to the page that best surfaces it. Falls back to the
 * dashboard root when a type / data payload doesn't have a clear destination,
 * so a click never lands the user on a 404.
 *
 * Server-side notification types currently in use:
 *   order, job, appointment, inventory, review, payout, wallet,
 *   verification, chat / message, admin, admin_fee_threshold, info
 */
export function getNotificationRoute(n: Notification): string {
  const data = (n.data || {}) as Record<string, unknown>;
  const type = n.type || "info";

  // Admin-targeted notifications belong in the admin section.
  if (type === "admin" || type === "admin_fee_threshold") {
    if (typeof data.profileId === "string") return `/admin/users/${data.profileId}`;
    if (typeof data.disputeId === "string") return `/admin/disputes`;
    if (typeof data.verificationId === "string") return `/admin/verification`;
    if (data.escrowEntryId || data.payoutId) return `/admin/payments`;
    return `/admin`;
  }

  switch (type) {
    case "order":
      return typeof data.orderId === "string"
        ? `/dashboard/orders?orderId=${data.orderId}`
        : `/dashboard/orders`;
    case "job":
      return typeof data.jobId === "string"
        ? `/dashboard/jobs?jobId=${data.jobId}`
        : `/dashboard/jobs`;
    case "appointment":
      return `/dashboard/appointments`;
    case "payout":
      return `/dashboard/wallet/payouts`;
    case "wallet":
      return `/dashboard/wallet`;
    case "inventory":
      return `/dashboard/inventory`;
    case "review":
      return `/dashboard/reviews`;
    case "verification":
      return `/dashboard/verification`;
    case "chat":
    case "message":
      return typeof data.conversationId === "string"
        ? `/dashboard/chat?conversationId=${data.conversationId}`
        : `/dashboard/chat`;
    default:
      return "/dashboard";
  }
}
