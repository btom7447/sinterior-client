"use client";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Briefcase,
  ShoppingBag,
  FileText,
  Settings,
  Bell,
  BarChart3,
  Home,
  Wrench,
  Package,
  User,
  LogOut,
  MessageCircle,
  Truck,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { toast } from "sonner";

const menuItems = {
  artisan: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "My Jobs", url: "/dashboard/jobs", icon: Briefcase },
    { title: "Appointments", url: "/dashboard/appointments", icon: FileText },
    { title: "Earnings", url: "/dashboard/earnings", icon: BarChart3 },
    { title: "Reviews", url: "/dashboard/reviews", icon: Users },
    { title: "Chat", url: "/dashboard/chat", icon: MessageCircle },
    { title: "Profile", url: "/dashboard/profile", icon: User },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ],
  supplier: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Products", url: "/dashboard/my-products", icon: Package },
    { title: "Orders", url: "/dashboard/orders", icon: ShoppingBag },
    { title: "Earnings", url: "/dashboard/earnings", icon: BarChart3 },
    { title: "Inventory", url: "/dashboard/inventory", icon: FileText },
    { title: "Logistics", url: "/dashboard/logistics", icon: Truck },
    { title: "Business", url: "/dashboard/business", icon: Building2 },
    { title: "Chat", url: "/dashboard/chat", icon: MessageCircle },
    { title: "Profile", url: "/dashboard/profile", icon: User },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ],
  client: [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "My Orders", url: "/dashboard/orders", icon: ShoppingBag },
    { title: "My Projects", url: "/dashboard/projects", icon: Building2 },
    { title: "Saved Artisans", url: "/dashboard/saved", icon: Users },
    { title: "Properties", url: "/dashboard/properties", icon: Home },
    { title: "Chat", url: "/dashboard/chat", icon: MessageCircle },
    { title: "Profile", url: "/dashboard/profile", icon: User },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ],
};

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { totalUnread } = useChat();
  const currentPath = pathname;

  const role = (profile?.role || "client") as keyof typeof menuItems;
  const items = menuItems[role];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Sintherior" width={40} height={40} className="rounded-lg shrink-0" />
          {!collapsed && (
            <span className="font-display text-lg font-bold text-sidebar-foreground">
              Sintherior
            </span>
          )}
        </Link>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            {!collapsed && "Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = currentPath === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={collapsed ? item.title : undefined}
                    >
                      <Link
                        href={item.url}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
                            : "text-sidebar-foreground hover:bg-sidebar-accent"
                        }`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" strokeWidth={1} />
                        {!collapsed && <span className="flex-1">{item.title}</span>}
                        {!collapsed && item.title === "Chat" && totalUnread > 0 && (
                          <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                            {totalUnread > 9 ? "9+" : totalUnread}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            {!collapsed && "Quick Links"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/artisan" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent">
                    <Wrench className="w-5 h-5 flex-shrink-0" strokeWidth={1} />
                    {!collapsed && <span>Find Artisans</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/products" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent">
                    <Package className="w-5 h-5 flex-shrink-0" strokeWidth={1} />
                    {!collapsed && <span>Shop Materials</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/real-estate" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent">
                    <Building2 className="w-5 h-5 flex-shrink-0" strokeWidth={1} />
                    {!collapsed && <span>Real Estate</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-sm">
              {profile?.full_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile?.full_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{profile?.role || "client"}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-4 h-4" strokeWidth={1} />
            </button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
