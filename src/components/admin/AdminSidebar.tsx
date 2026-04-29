"use client";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  FileText,
  Settings,
  MessageCircle,
  Shield,
  Briefcase,
  BarChart3,
  BadgeCheck,
  Scale,
  LogOut,
  Newspaper,
  HelpCircle,
  Sparkles,
  Wallet as WalletIcon,
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
import { toast } from "sonner";

const menuItems = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Orders", url: "/admin/orders", icon: ShoppingBag },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Verification", url: "/admin/verification", icon: BadgeCheck },
  { title: "Disputes", url: "/admin/disputes", icon: Scale },
  { title: "Payments", url: "/admin/payments", icon: WalletIcon },
  { title: "Blog", url: "/admin/blog", icon: Newspaper },
  { title: "Careers", url: "/admin/careers", icon: Briefcase },
  { title: "Help", url: "/admin/help", icon: HelpCircle },
  { title: "Feed", url: "/admin/feed", icon: Sparkles },
  { title: "Chat", url: "/admin/chat", icon: MessageCircle },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = usePathname();
  const router = useRouter();
  const { profile, signOut } = useAuth();

  // On mobile the sidebar is a drawer — close it after a link tap so the user
  // doesn't have to dismiss the drawer themselves.
  const closeMobile = () => {
    if (isMobile) setOpenMobile(false);
  };

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
        <Link href="/admin" onClick={closeMobile} className="flex items-center gap-3">
          <div className="relative shrink-0">
            <Image src="/logo.png" alt="Sintherior" width={40} height={40} className="rounded-lg" />
            <Shield className="absolute -bottom-1 -right-1 w-4 h-4 text-primary bg-card rounded-full p-0.5" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-display text-lg font-bold text-sidebar-foreground">Sintherior</span>
              <span className="block text-[10px] uppercase tracking-widest text-primary font-semibold -mt-1">Admin</span>
            </div>
          )}
        </Link>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            {!collapsed && "Management"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive =
                  item.url === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.url);
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
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 flex-shrink-0">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-sm">
              {profile?.full_name?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile?.full_name || "Admin"}
              </p>
              <p className="text-xs text-primary font-medium">Super Admin</p>
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
