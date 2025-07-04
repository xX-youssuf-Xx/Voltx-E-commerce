import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import productsRoutes from "./routes/products";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 VoltX backend server started on port ${PORT}`);
});
 
