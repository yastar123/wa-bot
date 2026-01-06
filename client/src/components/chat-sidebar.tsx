import { useState } from 'react';
import { useChats, useMarkUnread } from '@/hooks/use-wa';
import { type Chat } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Search, Loader2, MoreVertical, Circle, CheckCircle2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface ChatSidebarProps {
  selectedJid: string | null;
  onSelectChat: (jid: string) => void;
}

export function ChatSidebar({ selectedJid, onSelectChat }: ChatSidebarProps) {
  const { data: chats, isLoading } = useChats();
  const { mutate: markUnread } = useMarkUnread();
  const [search, setSearch] = useState('');

  const filteredChats = chats?.filter(chat => 
    chat.name?.toLowerCase().includes(search.toLowerCase()) || 
    chat.jid.includes(search)
  ) || [];

  return (
    <div className="flex flex-col h-full bg-white border-r border-border/50">
      <div className="p-4 border-b border-border/50 bg-secondary/30 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-xl font-bold font-display text-primary mb-4">Chats</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search or start new chat" 
            className="pl-9 bg-background/50 border-border/50 focus:bg-background transition-all rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          className="w-full mt-4 gap-2 rounded-xl border-dashed hover:border-primary hover:text-primary transition-all"
          onClick={() => {
            const jid = prompt("Enter WhatsApp ID (e.g. 628123456789@s.whatsapp.net):");
            if (jid && jid.includes('@')) {
              onSelectChat(jid);
            } else if (jid) {
              alert("Invalid JID. Please include @s.whatsapp.net or @g.us");
            }
          }}
        >
          <Users className="w-4 h-4" />
          Start New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
          </div>
        ) : (
          <div className="flex flex-col">
            <AnimatePresence initial={false}>
              {filteredChats.map((chat) => (
                <ChatListItem 
                  key={chat.jid} 
                  chat={chat} 
                  isSelected={selectedJid === chat.jid}
                  onClick={() => onSelectChat(chat.jid)}
                  onMarkUnread={(unread) => markUnread({ jid: chat.jid, unread })}
                />
              ))}
            </AnimatePresence>
            
            {filteredChats.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No chats found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatListItem({ chat, isSelected, onClick, onMarkUnread }: { chat: Chat, isSelected: boolean, onClick: () => void, onMarkUnread: (unread: boolean) => void }) {
  const formatTime = (dateStr: string | Date | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return format(date, 'HH:mm');
    }
    return format(date, 'dd/MM');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 cursor-pointer transition-colors duration-200 border-b border-border/20 group relative",
        isSelected ? "bg-secondary/80 border-l-4 border-l-primary" : "hover:bg-secondary/40 border-l-4 border-l-transparent"
      )}
    >
      <Avatar className="h-12 w-12 border border-border/50 shadow-sm">
        <AvatarImage src={`https://api.dicebear.com/7.x/${chat.isGroup ? 'identicon' : 'initials'}/svg?seed=${chat.name || chat.jid}`} />
        <AvatarFallback>{chat.isGroup ? <Users className="w-6 h-6" /> : chat.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className={cn(
            "font-semibold truncate",
            (chat.unreadCount || 0) > 0 || chat.isMarkedUnread ? "text-primary" : "text-foreground"
          )}>{chat.name || chat.jid}</h3>
          <span className={cn(
            "text-xs whitespace-nowrap ml-2",
            (chat.unreadCount || 0) > 0 || chat.isMarkedUnread ? "text-primary font-bold" : "text-muted-foreground"
          )}>
            {formatTime(chat.lastMessageTimestamp)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <p className={cn(
            "text-sm truncate w-full pr-2",
            (chat.unreadCount || 0) > 0 || chat.isMarkedUnread ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {chat.isTyping ? (
              <span className="text-primary animate-pulse">typing...</span>
            ) : chat.lastMessageTimestamp ? 
              `Last activity: ${format(new Date(chat.lastMessageTimestamp), 'MMM dd, HH:mm')}` : 
              'Click to view messages'
            }
          </p>
          {((chat.unreadCount ?? 0) > 0 || chat.isMarkedUnread) && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-sm">
              {chat.unreadCount && chat.unreadCount > 0 ? chat.unreadCount : ''}
            </span>
          )}
        </div>
      </div>

      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background shadow-sm border border-border/50">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              className="gap-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onMarkUnread(!chat.isMarkedUnread);
              }}
            >
              {chat.isMarkedUnread ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Mark as read</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  <span>Mark as unread</span>
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
