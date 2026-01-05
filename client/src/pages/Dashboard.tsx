import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/use-socket';
import { useStatus } from '@/hooks/use-wa';
import { ChatSidebar } from '@/components/chat-sidebar';
import { ChatWindow } from '@/components/chat-window';
import { SettingsDialog } from '@/components/settings-dialog';
import { useChats } from '@/hooks/use-wa';
import { LogOut, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function Dashboard() {
  const { status } = useSocket();
  const { data: serverStatus } = useStatus();
  const { data: chats } = useChats();
  const [selectedJid, setSelectedJid] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Redirect if disconnected
  useEffect(() => {
    if (status === 'disconnected' && serverStatus?.status === 'disconnected') {
      setLocation('/login');
    }
  }, [status, serverStatus, setLocation]);

  const selectedChat = chats?.find(c => c.jid === selectedJid) || null;

  const handleDisconnect = async () => {
    try {
      // Call disconnect API
      const response = await fetch('/api/disconnect', { method: 'POST' });
      if (response.ok) {
        setLocation('/login');
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Navigation Rail (Desktop) */}
      <nav className="hidden md:flex flex-col items-center py-4 w-16 bg-secondary/30 border-r border-border/50 justify-between z-20">
        <div className="space-y-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer hover:scale-105 transition-transform">
                  <span className="font-display font-bold text-white text-lg">W</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">WhatsApp Bot</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="w-full h-px bg-border/50" />
        </div>

        <div className="flex flex-col gap-4">
          <SettingsDialog />
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={handleDisconnect}
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Disconnect</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="mt-2 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
             <UserCircle className="w-5 h-5 text-primary" />
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-[400px] h-full flex-shrink-0 z-10 shadow-xl shadow-black/5">
          <ChatSidebar 
            selectedJid={selectedJid} 
            onSelectChat={setSelectedJid} 
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 h-full min-w-0 bg-background relative">
          <ChatWindow chat={selectedChat} />
        </div>
      </div>
    </div>
  );
}
