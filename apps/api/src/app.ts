import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./features/auth/auth.routes";
import userRoutes from './features/user/user.routes';
import cookieParser from "cookie-parser";
import { morganMiddleware } from "./config/logger";
import { StoreRoutes } from './features/store/store.routes';
import { StaffPublicRoutes } from './features/staff/staff.routes';
import { ShopRoutes } from './features/shop/shop.routes';
import { CustomerRoutes } from './features/customer/customer.routes';
import { ProductRoutes } from './features/product/product.routes';
import { VehicleRoutes } from './features/vehicle/vehicle.routes';
import { CylinderRoutes } from './features/cylinder/cylinder.routes';
import { BrandRoutes } from './features/brand/brand.routes';
import { UploadRoutes } from './features/upload/upload.routes';

dotenv.config();

export const app: express.Application = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));
app.use(morganMiddleware);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use('/shops', ShopRoutes);
app.use('/customers', CustomerRoutes);
app.use('/products', ProductRoutes);
app.use('/vehicles', VehicleRoutes);
app.use('/cylinders', CylinderRoutes);
app.use('/brands', BrandRoutes);
app.use('/stores', StoreRoutes); // Stores + Nested Staff Management
app.use('/staff', StaffPublicRoutes); // Staff Public (Login)
app.use('/upload', UploadRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Hello from API" });
});
