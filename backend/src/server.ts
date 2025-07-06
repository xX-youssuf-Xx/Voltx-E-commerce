import express from "express";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth";
import productsRoutes from "./routes/products";
import categoriesRoutes from "./routes/categories";
import brandsRoutes from "./routes/brands";
import discountsRouter from './routes/discounts';
import { Client } from "pg";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Database client for health check
const dbClient = new Client({ connectionString: process.env.DATABASE_URL });

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    // Test database connection
    await dbClient.connect();
    const dbResult = await dbClient.query('SELECT NOW() as current_time');
    await dbClient.end();
    
    res.status(200).json({
      status: "healthy",
      message: "VoltX backend is running successfully",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: "connected",
        current_time: dbResult.rows[0].current_time
      }
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      message: "VoltX backend is running but database connection failed",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: "disconnected",
        error: error instanceof Error ? error.message : "Unknown database error"
      }
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/brands", brandsRoutes);
app.use("/api/discounts", discountsRouter);

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`🚀 VoltX backend server started on port ${PORT}`);
});
 
