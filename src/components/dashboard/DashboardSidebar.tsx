"use client";
import {
  LayoutDashboard,
  Building2,
  Users,
  Briefcase,
  ShoppingBag,
  FileText,
  Settings,
  BarChart3,
  Home,
  Wrench,
  Package,
  User,
  LogOut,
  MessageCircle,
  Truck,
  ShieldCheck,
  Wallet,
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

// Grouped sidebar items per role. Each group has a tiny label so the sidebar
// stays scannable as the number of items grows. The Marketplace group exposes
// cross-role buying/hiring on every dashboard.

interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
}
interface MenuGroup {
  label: string | null; // null = no label (top of sidebar)
  items: MenuItem[];
}

const overviewGroup: MenuGroup = {
  label: null,
  items: [{ title: "Dashboard", url: "/dashboard", icon: LayoutDashboard }],
};

const marketplaceGroup: MenuGroup = {
  label: "Marketplace",
  items: [
    { title: "Browse Artisans", url: "/artisan", icon: Wrench },
    { title: "Browse Products", url: "/products", icon: Package },
    { title: "My Purchases", url: "/dashboard/orders?as=buyer", icon: ShoppingBag },
    { title: "My Hires", url: "/dashboard/jobs?as=client", icon: Briefcase },
  ],
};

const communicationGroup: MenuGroup = {
  label: "Communication",
  items: [{ title: "Chat", url: "/dashboard/chat", icon: MessageCircle }],
};

const accountGroup: MenuGroup = {
  label: "Account",
  items: [
    { title: "Profile", url: "/dashboard/profile", icon: User },
    { title: "Settings", url: "/dashboard/settings", icon: Settings },
  ],
};

const menuGroups: Record<string, MenuGroup[]> = {
  artisan: [
    overviewGroup,
    {
      label: "Working",
      items: [
        { title: "Jobs Hired For", url: "/dashboard/jobs?as=artisan", icon: Briefcase },
        { title: "Appointments", url: "/dashboard/appointments", icon: FileText },
        { title: "Earnings", url: "/dashboard/earnings", icon: BarChart3 },
        { title: "Reviews", url: "/dashboard/reviews", icon: Users },
      ],
    },
    {
      label: "My Profile",
      items: [
        { title: "Professional Profile", url: "/dashboard/artisan-profile", icon: Wrench },
        { title: "Verification", url: "/dashboard/verification", icon: ShieldCheck },
        { title: "Wallet", url: "/dashboard/wallet", icon: Wallet },
      ],
    },
    marketplaceGroup,
    communicationGroup,
    accountGroup,
  ],
  supplier: [
    overviewGroup,
    {
      label: "Selling",
      items: [
        { title: "My Products", url: "/dashboard/my-products", icon: Package },
        { title: "Orders Received", url: "/dashboard/orders?as=seller", icon: ShoppingBag },
        { title: "Inventory", url: "/dashboard/inventory", icon: FileText },
        { title: "Earnings", url: "/dashboard/earnings", icon: BarChart3 },
        { title: "Logistics", url: "/dashboard/logistics", icon: Truck },
      ],
    },
    {
      label: "My Business",
      items: [
        { title: "Business", url: "/dashboard/business", icon: Building2 },
        { title: "Verification", url: "/dashboard/verification", icon: ShieldCheck },
        { title: "Wallet", url: "/dashboard/wallet", icon: Wallet },
      ],
    },
    marketplaceGroup,
    communicationGroup,
    accountGroup,
  ],
  client: [
    overviewGroup,
    {
      label: "Activity",
      items: [
        { title: "My Purchases", url: "/dashboard/orders", icon: ShoppingBag },
        { title: "My Hires", url: "/dashboard/jobs", icon: Briefcase },
        { title: "My Projects", url: "/dashboard/projects", icon: Building2 },
        { title: "Saved Artisans", url: "/dashboard/saved", icon: Users },
        { title: "Properties", url: "/dashboard/properties", icon: Home },
      ],
    },
    {
      label: "Marketplace",
      items: [
        { title: "Browse Artisans", url: "/artisan", icon: Wrench },
        { title: "Browse Products", url: "/products", icon: Package },
      ],
    },
    communicationGroup,
    accountGroup,
  ],
};

export function DashboardSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const { totalUnread } = useChat();
  const currentPath = pathname;

  // On mobile the sidebar is a drawer over the page — close it after a link
  // click so the user lands on the new page without an extra tap to dismiss.
  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

  const role = (profile?.role || "client") as keyof typeof menuGroups;
  const groups = menuGroups[role] || menuGroups.client;

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
        <Link href="/" onClick={closeMobile} className="flex items-center gap-3">
          <Image src="/logo.png" alt="Sintherior" width={40} height={40} className="rounded-lg shrink-0" />
          {!collapsed && (
            <span className="font-display text-lg font-bold text-sidebar-foreground">
              Sintherior
            </span>
          )}
        </Link>
      </div>

      <SidebarContent>
        {groups.map((group, gi) => (
          <SidebarGroup key={gi}>
            {group.label && (
              <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/80 px-3">
                {!collapsed && group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  // Match active state ignoring query string so /dashboard/jobs?as=artisan still highlights when path matches.
                  const itemPath = item.url.split("?")[0];
                  const isActive = currentPath === itemPath;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={collapsed ? item.title : undefined}
                      >
                        <Link
                          href={item.url}
                          onClick={closeMobile}
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
        ))}
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
