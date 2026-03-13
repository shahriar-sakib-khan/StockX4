import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import { rateLimit } from "express-rate-limit";

import authRoutes from "./features/auth/auth.routes";
import userRoutes from './features/user/user.routes';
import transactionRoutes from './features/transaction/transaction.routes';
import systemRoutes from './features/system/system.routes';

import { morganMiddleware } from "./config/logger";
import { StoreRoutes } from './features/store/store.routes';
import { CustomerRoutes } from './features/customer/customer.routes';
import { ProductRoutes } from './features/product/product.routes';
import { VehicleRoutes } from './features/vehicle/vehicle.routes';
import { InventoryRoutes } from './features/inventory/inventory.routes';
import { StoreProductRoutes } from './features/product/store-product.routes';
import { BrandRoutes } from './features/brand/brand.routes';
import { UploadRoutes } from './features/upload/upload.routes';
import { dashboardRoutes } from './features/dashboard/dashboard.routes';

export const app: express.Application = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4001",
  "http://127.0.0.1:4001",
  "http://localhost:3001", // Added for redundancy
  "http://127.0.0.1:3001", // Added for redundancy
  "http://localhost:4002",
  "http://127.0.0.1:4002",
  "http://127.0.0.1:4000",
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
    if (!origin || allowed.includes(origin) || allowed.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());

// Rate Limiting (General)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000, // Limit each IP to 1000 requests per `window` to accommodate intensive SPA navigation
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use(limiter);
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
app.use('/upload', UploadRoutes);
app.use('/transactions', transactionRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/system', systemRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({ message: "Hello from API" });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log error via winston
  import('./config/logger').then(({ logger }) => {
      logger.error(`${status} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
      if (process.env.NODE_ENV === 'development' && err.stack) {
          logger.error(err.stack);
      }
  });

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
