"use client";
import { Bell, CheckCheck, Info, ShoppingBag, Star, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const typeIcons: Record<string, React.ElementType> = {
  order: ShoppingBag,
  payment: CreditCard,
  review: Star,
  info: Info,
};

const typeColors: Record<string, string> = {
  order: "bg-primary/10 text-primary",
  payment: "bg-success/10 text-success",
  review: "bg-warning/10 text-warning",
  info: "bg-accent/10 text-accent",
};

const NotificationItem = ({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: string) => void;
}) => {
  const Icon = typeIcons[notification.type] || Info;
  const color = typeColors[notification.type] || typeColors.info;

  return (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-xl transition-colors cursor-pointer group",
        notification.isRead ? "opacity-60" : "bg-secondary/50"
      )}
      onClick={() => !notification.isRead && onRead(notification._id)}
    >
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", color)}>
        <Icon className="w-4 h-4" strokeWidth={1} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{notification.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

const NotificationBell = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-xl text-muted-foreground hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5" strokeWidth={1} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-display font-bold text-foreground text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary h-auto py-1 px-2"
              onClick={markAllAsRead}
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1" strokeWidth={1} />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          <div className="p-2 space-y-1">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground text-sm">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" strokeWidth={1} />
                <p className="text-muted-foreground text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n._id}
                  notification={n}
                  onRead={markAsRead}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
