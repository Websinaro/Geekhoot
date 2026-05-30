import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";
import { config } from "./config/app.config";
import { errorHandler } from "./middleware/error.middleware";
import { csrfProtection, xssProtection } from "./middleware/security.middleware";

// Routes
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import adminRoutes from "./routes/admin.routes";
import notificationRoutes from "./routes/notification.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import sitemapRoutes from "./routes/sitemap.routes";

import prisma from "./prisma/db";

// Auto-migration: fix category names saved with old admin form values.
// Safe to re-run on every startup — updateMany with 0 matches is a no-op.
async function runCategoryMigration() {
  const renames = [
    { from: "Cups",           to: "Mugs" },
    { from: "Custom Printed", to: "Mugs" },
  ];
  for (const { from, to } of renames) {
    const result = await prisma.product.updateMany({
      where: { category: { equals: from, mode: "insensitive" } },
      data:  { category: to },
    });
    if (result.count > 0) {
      console.log(`[migration] Renamed "${from}" → "${to}" for ${result.count} product(s)`);
    }
  }
}

const isProd = config.nodeEnv === "production";

async function startServer() {
  const app = express();

  // Security & Utility Middleware
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(csrfProtection);
  app.use(xssProtection);
  app.use(morgan(isProd ? "combined" : "dev"));

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
  });
  if (isProd) app.use("/api/", limiter);

  // Static files for uploads
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  app.use("/uploads", express.static(uploadsDir));

  // Health Check
  app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/wishlist", wishlistRoutes);

  // SEO: sitemap + robots (must be before SPA catch-all)
  app.use("/", sitemapRoutes);

  // Vite middleware or Production static files
  if (!isProd) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    // 1. Hashed assets (JS, CSS, images emitted by Vite with content-hash filenames)
    //    Safe to cache for 1 year — the hash changes whenever the content changes.
    app.use(
      "/assets",
      express.static(path.join(distPath, "assets"), {
        maxAge: "1y",
        immutable: true,
        etag: false,       // hash in filename makes etag redundant
        lastModified: false,
      })
    );

    // 2. PWA manifest, icons, service worker
    //    Short cache — these can change with app updates but are small files.
    app.use(
      express.static(distPath, {
        maxAge: "1d",
        setHeaders(res, filePath) {
          // index.html must never be cached — it's the SPA entry point and
          // must always reflect the latest hashed asset filenames.
          if (filePath.endsWith("index.html")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
            return;
          }
          // Service worker must not be cached or updates won't reach users.
          if (filePath.endsWith("sw.js") || filePath.endsWith("workbox-")) {
            res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
            return;
          }
        },
      })
    );

    // 3. SPA fallback — always serve index.html with no-cache headers
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Error Handler (Must be last)
  // Run DB migrations before accepting traffic
  await runCategoryMigration();

  app.use(errorHandler);

  app.listen(Number(config.port), "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${config.port} (${config.nodeEnv})`);
  });
}

startServer().catch((err) => {
  console.error("Startup Failure:", err);
  process.exit(1);
});
