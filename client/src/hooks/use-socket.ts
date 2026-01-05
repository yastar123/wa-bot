import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '@shared/routes';
import { useToast } from '@/hooks/use-toast';

interface SocketState {
  status: 'connecting' | 'connected' | 'disconnected';
  qr: string | null;
}

export function useSocket() {
  const [state, setState] = useState<SocketState>({
    status: 'connecting',
    qr: null,
  });
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    // Connect to the same host
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      // Initially, we might still be waiting for WA connection
      // We rely on the 'status' event from backend
    });

    socket.on('disconnect', () => {
      setState(prev => ({ ...prev, status: 'disconnected' }));
    });

    socket.on('status', (data: { status: 'connecting' | 'connected' | 'disconnected', qr?: string }) => {
      setState(prev => ({
        ...prev,
        status: data.status,
        qr: data.qr || null,
      }));
      
      // Invalidate status query to ensure everything is in sync
      queryClient.invalidateQueries({ queryKey: [api.status.get.path] });
    });

    socket.on('qr', (data: { qr: string }) => {
      setState(prev => ({ ...prev, qr: data.qr }));
    });

    socket.on('chat_update', () => {
      queryClient.invalidateQueries({ queryKey: [api.chats.list.path] });
    });

    socket.on('message_upsert', (data: any) => {
       // Invalidate messages for the specific chat
       if (data.chatJid) {
         // This is a bit broad, but ensures consistency. 
         // Optimally we'd update the cache directly.
         queryClient.invalidateQueries({ queryKey: [api.chats.getMessages.path.replace(':jid', data.chatJid)] });
         // Also update chat list because last message changed
         queryClient.invalidateQueries({ queryKey: [api.chats.list.path] });
       }
       
       if (!data.fromMe) {
         toast({
           title: data.senderName || "New Message",
           description: data.content,
         });
       }
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient, toast]);

  return state;
}
