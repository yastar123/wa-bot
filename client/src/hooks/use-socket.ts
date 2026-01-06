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
    console.log('Setting up socket connection...');
    // Connect to the same host
    const socket = io();
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      // Saat reconnect, reset state ke connecting untuk menunggu QR baru
      setState(prev => ({ 
        ...prev, 
        status: 'connecting',
        qr: null // Reset QR saat reconnect untuk menampilkan QR baru
      }));
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setState(prev => ({ 
        ...prev, 
        status: 'disconnected',
        qr: null // Reset QR saat disconnect untuk menampilkan QR baru saat reconnect
      }));
    });

    socket.on('status', (data: { status: 'connecting' | 'connected' | 'disconnected', qr?: string }) => {
      console.log('Status update:', data.status, data.qr ? 'QR ada' : 'QR tidak ada');
      setState(prev => ({
        ...prev,
        status: data.status,
        qr: data.qr || prev.qr, // Preserve existing QR if update doesn't provide one
      }));
      
      // Jika status connected, redirect ke dashboard (hanya jika di login page)
      if (data.status === 'connected' && window.location.pathname === '/login') {
        console.log('Redirecting to dashboard...');
        window.location.href = '/';
      }
      
      // Jika status disconnected dan user di dashboard, redirect ke login
      if (data.status === 'disconnected' && window.location.pathname === '/') {
        console.log('Redirecting to login page...');
        window.location.href = '/login';
      }
      
      // Invalidate status query to ensure everything is in sync
      queryClient.invalidateQueries({ queryKey: [api.status.get.path] });
    });

    socket.on('qr', (data: { qr: string }) => {
      console.log('QR Code diterima:', data.qr.substring(0, 50) + '...');
      console.log('QR Code length:', data.qr.length);
      console.log('QR Code full length check:', data.qr.length > 0);
      setState(prev => ({ ...prev, qr: data.qr }));
    });

    socket.on('chat_update', () => {
      console.log('Chat update received');
      queryClient.invalidateQueries({ queryKey: [api.chats.list.path] });
    });

    socket.on('message_upsert', (data: any) => {
       console.log('Message upsert received:', data);
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
      console.log('Cleaning up socket connection...');
      socket.disconnect();
    };
  }, [queryClient, toast]);

  console.log('Current socket state:', state);
  return state;
}
