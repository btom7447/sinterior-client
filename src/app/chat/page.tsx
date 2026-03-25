import AppLayout from "@/components/layout/AppLayout";
import { MessageCircle, Clock } from "lucide-react";

export default function ChatPage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center">
          <MessageCircle strokeWidth={1} className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-foreground">Chat — Coming Soon</h1>
          <p className="text-muted-foreground max-w-md">
            Real-time messaging between clients, artisans, and suppliers is on its way.
            Connect directly to discuss projects and place orders.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full">
          <Clock strokeWidth={1} className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Feature in development</span>
        </div>
      </div>
    </AppLayout>
  );
}
