import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { Settings, UpdateSettings } from "@shared/schema";

// ============================================
// STATUS
// ============================================
export function useStatus() {
  return useQuery({
    queryKey: [api.status.get.path],
    queryFn: async () => {
      const res = await fetch(api.status.get.path);
      if (!res.ok) throw new Error('Failed to fetch status');
      return api.status.get.responses[200].parse(await res.json());
    },
    // Refetch often if disconnected to catch quick state changes if socket lags
    refetchInterval: (query) => query.state.data?.status === 'connected' ? false : 5000,
  });
}

// ============================================
// SETTINGS
// ============================================
export function useSettings() {
  return useQuery({
    queryKey: [api.settings.get.path],
    queryFn: async () => {
      const res = await fetch(api.settings.get.path);
      if (!res.ok) throw new Error('Failed to fetch settings');
      return api.settings.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: UpdateSettings) => {
      const res = await fetch(api.settings.update.path, {
        method: api.settings.update.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      return api.settings.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.settings.get.path] });
    },
  });
}

// ============================================
// CHATS
// ============================================
export function useChats() {
  return useQuery({
    queryKey: [api.chats.list.path],
    queryFn: async () => {
      const res = await fetch(api.chats.list.path);
      if (!res.ok) throw new Error('Failed to fetch chats');
      return api.chats.list.responses[200].parse(await res.json());
    },
  });
}

// ============================================
// MESSAGES
// ============================================
export function useMessages(jid: string | null) {
  return useQuery({
    queryKey: [api.chats.getMessages.path.replace(':jid', jid || '')],
    queryFn: async () => {
      if (!jid) return [];
      const url = buildUrl(api.chats.getMessages.path, { jid });
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch messages');
      return api.chats.getMessages.responses[200].parse(await res.json());
    },
    enabled: !!jid,
    refetchInterval: 3000, // Polling backup
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ jid, content }: { jid: string; content: string }) => {
      const res = await fetch(api.messages.send.path, {
        method: api.messages.send.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jid, content }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      return api.messages.send.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      const url = buildUrl(api.chats.getMessages.path, { jid: variables.jid });
      queryClient.invalidateQueries({ queryKey: [url] });
      queryClient.invalidateQueries({ queryKey: [api.chats.list.path] });
    },
  });
}
