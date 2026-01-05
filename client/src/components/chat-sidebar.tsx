import { useState } from 'react';
import { useChats } from '@/hooks/use-wa';
import { type Chat } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatSidebarProps {
  selectedJid: string | null;
  onSelectChat: (jid: string) => void;
}

export function ChatSidebar({ selectedJid, onSelectChat }: ChatSidebarProps) {
  const { data: chats, isLoading } = useChats();
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

function ChatListItem({ chat, isSelected, onClick }: { chat: Chat, isSelected: boolean, onClick: () => void }) {
  const formatTime = (dateStr: string | Date | null) => {
    if (!dateStr) return '';
    return format(new Date(dateStr), 'HH:mm');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-4 cursor-pointer transition-colors duration-200 border-b border-border/20",
        isSelected ? "bg-secondary/80 border-l-4 border-l-primary" : "hover:bg-secondary/40 border-l-4 border-l-transparent"
      )}
    >
      <Avatar className="h-12 w-12 border border-border/50 shadow-sm">
        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${chat.name || chat.jid}`} />
        <AvatarFallback>{chat.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="font-semibold text-foreground truncate">{chat.name || chat.jid}</h3>
          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
            {formatTime(chat.lastMessageTimestamp)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground truncate w-full pr-2">
            Click to view messages
          </p>
          {(chat.unreadCount || 0) > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
