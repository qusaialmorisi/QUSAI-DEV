import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleAiChatRequest, sendMethodNotAllowed } from '../../server/platformCore.ts';

export default async function handler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse
): Promise<void> {
  if (req.method !== 'POST') {
    sendMethodNotAllowed(res, 'POST');
    return;
  }
  await handleAiChatRequest(req, res);
}
