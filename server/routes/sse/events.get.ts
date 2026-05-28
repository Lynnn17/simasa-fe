import { defineEventHandler } from "h3";

const SSE_BACKEND =
  process.env.NUXT_PUBLIC_SSE_URL || "http://localhost:8098";

export default defineEventHandler(async (event) => {
  const query = new URL(
    event.node.req.url!,
    "http://localhost"
  ).searchParams.toString();

  const targetUrl = `${SSE_BACKEND}/events${query ? "?" + query : ""}`;

  // Set SSE headers
  event.node.res.setHeader("Content-Type", "text/event-stream");
  event.node.res.setHeader("Cache-Control", "no-cache");
  event.node.res.setHeader("Connection", "keep-alive");
  event.node.res.setHeader("X-Accel-Buffering", "no");
  event.node.res.flushHeaders();

  // Fetch from backend SSE endpoint
  const response = await fetch(targetUrl, {
    headers: {
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
    },
    // @ts-ignore - duplex needed for streaming
    duplex: "half",
  });

  if (!response.body) {
    event.node.res.end();
    return;
  }

  const reader = response.body.getReader();

  // Forward SSE stream to client
  const pump = async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done || event.node.req.destroyed) break;
        event.node.res.write(value);
      }
    } catch {
      // Client disconnected or stream ended
    } finally {
      reader.cancel();
      event.node.res.end();
    }
  };

  // Clean up if client disconnects
  event.node.req.on("close", () => {
    reader.cancel();
  });

  await pump();
});
