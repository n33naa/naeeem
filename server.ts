
import express from "express";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Security Middleware
  // Helmet helps secure Express apps by setting various HTTP headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "https:", "http:", "https://picsum.photos"],
        "connect-src": ["'self'", "https://generativelanguage.googleapis.com", "https://*.run.app", "wss://*.run.app"],
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
      },
    },
  }));

  // CORS middleware to handle cross-origin requests
  app.use(cors());

  // Parse JSON bodies
  app.use(express.json());

  // 2. API Routes (Optional - for future backend logic)
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // 3. Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`
    🛡️  Elite Security System Active
    🚀 Server running on http://0.0.0.0:${PORT}
    `);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
