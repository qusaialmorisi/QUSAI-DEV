import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleHealthRequest, sendMethodNotAllowed } from '../server/platformCore.ts';

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  if (req.method !== 'GET') {
    sendMethodNotAllowed(res, 'GET');
    return;
  }
  handleHealthRequest(res);
}
