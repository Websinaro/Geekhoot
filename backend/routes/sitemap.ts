import { Router } from "express";
import { SitemapStream, streamToPromise } from "sitemap";
import { ProductCategory } from "@prisma/client";
import prisma from "../prisma/db";

const router = Router();

router.get("/sitemap.xml", async (_, res) => {
  try {
    const smStream = new SitemapStream({
      hostname: "https://shopongeekhoot.onrender.com",
    });

    // Static Pages
    smStream.write({
      url: "/",
      changefreq: "daily",
      priority: 1.0,
    });

    smStream.write({
      url: "/shop",
      changefreq: "daily",
      priority: 0.9,
    });

    smStream.write({
      url: "/categories",
      changefreq: "weekly",
      priority: 0.8,
    });

    smStream.write({
      url: "/about",
      changefreq: "monthly",
      priority: 0.5,
    });

    smStream.write({
      url: "/contact",
      changefreq: "monthly",
      priority: 0.5,
    });

    // Categories
    Object.values(ProductCategory).forEach((category) => {
      smStream.write({
        url: `/category/${category.toLowerCase()}`,
        changefreq: "weekly",
        priority: 0.8,
      });
    });

    // Dynamic Product URLs
    const products = await prisma.product.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
    });

    products.forEach((product) => {
      smStream.write({
        url: `/product/${product.id}`,
        lastmod: product.updatedAt,
        changefreq: "weekly",
        priority: 0.7,
      });
    });

    smStream.end();

    const sitemapOutput = await streamToPromise(smStream);

    res.header("Content-Type", "application/xml");
    res.send(sitemapOutput.toString());
  } catch (error) {
    console.error("Sitemap Error:", error);

    res.status(500).send("Error generating sitemap");
  }
});

export default router;
