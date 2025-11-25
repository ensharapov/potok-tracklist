import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory storage for progress (в production лучше использовать БД)
const progressStore = new Map<string, Record<string, boolean>>();

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Middleware для парсинга JSON
  app.use(express.json());

  // API для сохранения прогресса
  app.post("/api/progress", (req, res) => {
    const { userId, checkedItems } = req.body;
    
    if (!userId || typeof userId !== "string") {
      return res.status(400).json({ error: "userId is required" });
    }

    if (!checkedItems || typeof checkedItems !== "object") {
      return res.status(400).json({ error: "checkedItems is required" });
    }

    progressStore.set(userId, checkedItems);
    res.json({ success: true });
  });

  // API для загрузки прогресса
  app.get("/api/progress/:userId", (req, res) => {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const checkedItems = progressStore.get(userId) || {};
    res.json({ checkedItems });
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
