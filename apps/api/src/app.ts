import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./features/auth/auth.routes";
import userRoutes from './features/user/user.routes';
import transactionRoutes from './features/transaction/transaction.routes';
import systemRoutes from './features/system/system.routes';

import { morganMiddleware } from "./config/logger";
import { StoreRoutes } from './features/store/store.routes';
import { StaffPublicRoutes } from './features/staff/staff.routes';
import { CustomerRoutes } from './features/customer/customer.routes';
import { ProductRoutes } from './features/product/product.routes';
import { VehicleRoutes } from './features/vehicle/vehicle.routes';
import { InventoryRoutes } from './features/inventory/inventory.routes';
import { StoreProductRoutes } from './features/product/store-product.routes';
import { BrandRoutes } from './features/brand/brand.routes';
import { UploadRoutes } from './features/upload/upload.routes';
import { dashboardRoutes } from './features/dashboard/dashboard.routes';

export const app: express.Application = express();

// Global Request Logger
app.use((req, res, next) => {
  console.log(`[INCOMING] ${req.method} ${req.url} | Origin: ${req.headers.origin}`);
  next();
});

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://stock-x4-web.vercel.app",
  "https://www.stockxbd.com",
  "https://stockxbd.com"
];

if (process.env.CORS_ORIGIN) {
  // Support comma-separated origins
  const origins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
  allowedOrigins.push(...origins);
}

app.use(cors({
  origin: (origin, callback) => {
    const allowed = allowedOrigins;
    console.log(`[CORS] Incoming origin: ${origin}`); // Debug log
    if (!origin || allowed.includes(origin) || allowed.includes('*')) {
      callback(null, true);
    } else {
      console.log(`[CORS] Blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(morganMiddleware);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use('/customers', CustomerRoutes);
app.use('/products', ProductRoutes);
app.use('/vehicles', VehicleRoutes);
app.use('/inventory', InventoryRoutes);
app.use('/store-products', StoreProductRoutes);
app.use('/brands', BrandRoutes);
app.use('/stores', StoreRoutes); // Stores + Nested Staff Management
app.use('/staff', StaffPublicRoutes); // Staff Public (Login)
app.use('/upload', UploadRoutes);
app.use('/transactions', transactionRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/system', systemRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Hello from API" });
});
