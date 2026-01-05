import { z } from 'zod';
import { insertSettingsSchema, chats, messages, settings } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  status: {
    get: {
      method: 'GET' as const,
      path: '/api/status',
      responses: {
        200: z.object({
          status: z.enum(['connecting', 'connected', 'disconnected']),
          user: z.object({
            id: z.string(),
            name: z.string().optional(),
          }).optional(),
          qr: z.string().optional(),
        }),
      },
    },
  },
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings',
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/settings',
      input: insertSettingsSchema.partial(),
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
  },
  chats: {
    list: {
      method: 'GET' as const,
      path: '/api/chats',
      responses: {
        200: z.array(z.custom<typeof chats.$inferSelect>()),
      },
    },
    getMessages: {
      method: 'GET' as const,
      path: '/api/chats/:jid/messages',
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
      },
    },
  },
  messages: {
    send: {
      method: 'POST' as const,
      path: '/api/messages',
      input: z.object({
        jid: z.string(),
        content: z.string(),
      }),
      responses: {
        200: z.object({ success: z.boolean() }),
        500: errorSchemas.internal,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
