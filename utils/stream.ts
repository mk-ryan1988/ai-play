/**
 * Server-Sent Events (SSE) Utilities
 *
 * Helpers for streaming responses from API routes to clients.
 */

/**
 * SSE Event Types
 */
export type SSEEvent =
  | { type: 'text'; content: string }
  | { type: 'action'; action: unknown }
  | { type: 'error'; error: string }
  | { type: 'done' };

/**
 * Send an SSE event to a stream controller
 */
export function sendSSE(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  event: SSEEvent
): void {
  controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
}

/**
 * Create SSE response headers
 */
export const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
} as const;
