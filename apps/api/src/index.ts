import { app } from "./app";
import { connectDB } from "./config/db";
import { seedUsers } from "./config/seed";
import { logger } from "./config/logger";

const port = process.env.PORT || 3001;

// Database and Seeding
connectDB().then(() => {
  seedUsers();

  app.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
  });
});
