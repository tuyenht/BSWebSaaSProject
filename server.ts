import http from "http";
import next from "next";

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const NODE_ENV = process.env.NODE_ENV || "production";
const dev = NODE_ENV !== "production";

async function main() {
  // Create Next.js app instance
  const app = next({ dev });
  const handle = app.getRequestHandler();

  // Wait for Next.js to prepare
  await app.prepare();

  // Create HTTP server
  const server = http.createServer(async (req, res) => {
    try {
      await handle(req, res);
    } catch (err) {
      console.error("Error handling request:", err);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    }
  });

  // Start server
  server.listen(PORT, () => {
    console.log(
      `Server running on http://localhost:${PORT} (env: ${NODE_ENV})`
    );
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log("Shutting down server...");
    server.close(() => {
      console.log("Server closed");
      app.close();
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

