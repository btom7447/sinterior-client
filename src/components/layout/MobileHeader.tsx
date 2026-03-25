"use client";
import Link from "next/link";
import { Bell, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MobileHeader = () => {
  const { isAuthenticated, profile } = useAuth();
  const { totalUnread } = useChat();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-lg border-b border-border lg:hidden">
      <div className="flex items-center justify-between h-12 px-4">
        <Link href="/" className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-base">S</span>
          </div>
          <span className="font-display font-bold text-lg text-foreground">Sinterior</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground relative">
              <MessageCircle strokeWidth={1} className="w-5 h-5" />
              {totalUnread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                  {totalUnread > 9 ? "9+" : totalUnread}
                </span>
              )}
            </Button>
          </Link>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground relative">
            <Bell strokeWidth={1} className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </Button>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {profile?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
                <User strokeWidth={1} className="w-5 h-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
