import { useState, useRef, useEffect } from 'react';
import { Send, MoreVertical, Phone, Video, Loader2, Smile, Paperclip, Image as ImageIcon, FileText, Check, CheckCheck, Trash2, Star, Search, X, Users } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMessages, useSendMessage, useDeleteMessage, useStarMessage } from '@/hooks/use-wa';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { type Chat, type Message } from '@shared/schema';

interface ChatWindowProps {
  chat: Chat | null;
}

export function ChatWindow({ chat }: ChatWindowProps) {
  const { data: messages, isLoading } = useMessages(chat?.jid || null);
  const { mutate: sendMessage, isPending } = useSendMessage();
  const { mutate: deleteMessage } = useDeleteMessage();
  const { mutate: starMessage } = useStarMessage();
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<"image" | "document" | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current && !isSearching) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chat?.jid, isSearching]);

  const filteredMessages = messages?.filter(msg => 
    !searchQuery || msg.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !chat) return;

    sendMessage({ jid: chat.jid, content: input, contentType: "text" });
    setInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !chat || !uploadType) return;

    // In a real app, we would upload to a server and get a URL.
    // For now, we'll use a data URL as a placeholder/simulation
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      sendMessage({
        jid: chat.jid,
        content: `Sent a ${uploadType}`,
        contentType: uploadType,
        fileUrl: dataUrl,
        fileName: file.name
      });
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
    setUploadType(null);
  };

  if (!chat) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-whatsapp-pattern border-l border-border/50 text-center p-8">
        <div className="w-64 h-64 bg-secondary/50 rounded-full flex items-center justify-center mb-8 animate-pulse">
           <img 
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
            alt="WhatsApp" 
            className="w-32 h-32 opacity-20 grayscale"
           />
        </div>
        <h2 className="text-3xl font-display font-bold text-foreground mb-2">WhatsApp Web</h2>
        <p className="text-muted-foreground max-w-md">
          Send and receive messages without keeping your phone online.
          Select a chat to start messaging.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-whatsapp-pattern relative">
      {/* Header */}
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-border/50 flex items-center px-4 justify-between z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${chat.name || chat.jid}`} />
            <AvatarFallback>{chat.name?.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-foreground">{chat.name || chat.jid}</h2>
            <p className="text-xs text-muted-foreground">
               {chat.isTyping ? (
                 <span className="text-primary animate-pulse font-medium">typing...</span>
               ) : chat.isOnline ? (
                 <span className="text-primary font-medium flex items-center gap-1">
                   <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                   Online
                 </span>
               ) : chat.lastSeen ? (
                 `Last seen ${format(new Date(chat.lastSeen), 'HH:mm')}`
               ) : chat.lastMessageTimestamp ? (
                 `Last active ${format(new Date(chat.lastMessageTimestamp), 'PP p')}`
               ) : (
                 'Offline'
               )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("hover:bg-secondary rounded-full", isSearching && "text-primary")}
            onClick={() => {
              setIsSearching(!isSearching);
              if (isSearching) setSearchQuery('');
            }}
          >
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-secondary rounded-full">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-secondary rounded-full">
            <Phone className="w-5 h-5" />
          </Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button variant="ghost" size="icon" className="hover:bg-secondary rounded-full">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Search Bar */}
      <AnimatePresence>
        {isSearching && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white/95 backdrop-blur-md border-b border-border/50 px-4 py-2 z-10"
          >
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                autoFocus
                placeholder="Search messages..." 
                className="pl-10 pr-10 rounded-full bg-secondary/30 border-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scroll-smooth"
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          filteredMessages?.map((msg, idx) => (
            <MessageBubble 
              key={msg.id || idx} 
              message={msg} 
              isPrevFromSame={idx > 0 && filteredMessages[idx-1].fromMe === msg.fromMe}
              chatJid={chat.jid}
              onDelete={(id) => deleteMessage({ jid: chat.jid, messageId: id })}
              onStar={(id, star) => starMessage({ jid: chat.jid, messageId: id, star })}
            />
          ))
        )}
        {!isLoading && filteredMessages?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="w-12 h-12 opacity-20 mb-4" />
            <p>No messages found</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white/95 backdrop-blur border-t border-border/50">
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileUpload}
          accept={uploadType === "image" ? "image/*" : "*/*"}
        />
        <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:bg-secondary shrink-0 rounded-full">
              <Smile className="w-6 h-6" />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:bg-secondary shrink-0 rounded-full">
                  <Paperclip className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start" side="top">
                <div className="flex flex-col gap-1">
                  <Button 
                    variant="ghost" 
                    className="justify-start gap-2" 
                    onClick={() => {
                      setUploadType("image");
                      fileInputRef.current?.click();
                    }}
                  >
                    <ImageIcon className="w-4 h-4 text-purple-500" />
                    <span>Photos & Videos</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start gap-2"
                    onClick={() => {
                      setUploadType("document");
                      fileInputRef.current?.click();
                    }}
                  >
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>Document</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start gap-2"
                    onClick={() => {
                      const msg = prompt("Enter broadcast message:");
                      if (msg) {
                        // This is a simple implementation, ideally it should iterate through all chats
                        alert("Broadcast feature coming soon! Sending to current chat for now.");
                        sendMessage({ jid: chat.jid, content: msg, contentType: "text" });
                      }
                    }}
                  >
                    <Users className="w-4 h-4 text-green-500" />
                    <span>Broadcast</span>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message" 
            className="flex-1 rounded-2xl border-border bg-secondary/30 focus:bg-white transition-colors py-6 shadow-sm"
          />
          
          <Button 
            type="submit" 
            disabled={!input.trim() || isPending}
            className={cn(
              "rounded-full h-12 w-12 shrink-0 shadow-md transition-all duration-300",
              input.trim() ? "bg-primary hover:bg-primary/90 hover:scale-105" : "bg-muted text-muted-foreground"
            )}
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </Button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({ message, isPrevFromSame, chatJid, onDelete, onStar }: { message: Message, isPrevFromSame: boolean, chatJid: string, onDelete: (id: string) => void, onStar: (id: string, star: boolean) => void }) {
  const isMe = message.fromMe;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        "flex w-full",
        isMe ? "justify-end" : "justify-start"
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className={cn(
            "max-w-[70%] px-4 py-2 shadow-sm relative group cursor-pointer",
            isMe 
              ? "bg-[hsl(var(--chat-bubble-me))] rounded-2xl rounded-tr-none text-foreground" 
              : "bg-[hsl(var(--chat-bubble-other))] rounded-2xl rounded-tl-none text-foreground",
            isPrevFromSame && "mt-1",
            !isPrevFromSame && "mt-2"
          )}>
            {message.isStarred && (
              <Star className="w-3 h-3 text-yellow-500 absolute -left-4 top-2" />
            )}
            {!isMe && !isPrevFromSame && message.senderName && (
              <p className="text-xs font-bold text-orange-500 mb-1">{message.senderName}</p>
            )}
            
            {message.contentType === "image" && message.fileUrl && (
              <div className="mb-2 overflow-hidden rounded-lg border border-black/5">
                <img src={message.fileUrl} alt="Sent image" className="max-w-full h-auto" />
              </div>
            )}

            {message.contentType === "document" && (
              <div className="flex items-center gap-3 p-2 mb-2 bg-black/5 rounded-lg border border-black/5">
                <div className="p-2 bg-blue-500 rounded text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{message.fileName || "Document"}</p>
                  <p className="text-[10px] opacity-70 uppercase">{message.fileName?.split('.').pop()} file</p>
                </div>
              </div>
            )}

            {message.content && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
            
            <div className="flex justify-end items-center gap-1 mt-1 opacity-70">
              <span className="text-[10px] leading-none">
                {message.timestamp ? format(new Date(message.timestamp), 'HH:mm') : ''}
              </span>
              {isMe && (
                <span className="ml-1">
                  {message.status === 'read' ? (
                    <CheckCheck className="w-3 h-3 text-blue-400" />
                  ) : message.status === 'delivered' ? (
                    <CheckCheck className="w-3 h-3 text-muted-foreground" />
                  ) : (
                    <Check className="w-3 h-3 text-muted-foreground" />
                  )}
                </span>
              )}
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={isMe ? "end" : "start"}>
          <DropdownMenuItem 
            className="gap-2 cursor-pointer"
            onClick={() => onStar(message.id, !message.isStarred)}
          >
            <Star className={cn("w-4 h-4", message.isStarred && "fill-yellow-500 text-yellow-500")} />
            {message.isStarred ? "Unstar Message" : "Star Message"}
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive gap-2 cursor-pointer"
            onClick={() => onDelete(message.id)}
          >
            <Trash2 className="w-4 h-4" />
            Delete Message
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
