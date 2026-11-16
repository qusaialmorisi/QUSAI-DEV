import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleAiStatusRequest, sendMethodNotAllowed } from '../../server/platformCore.ts';

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  if (req.method !== 'GET') {
    sendMethodNotAllowed(res, 'GET');
    return;
  }
  handleAiStatusRequest(res);
}
