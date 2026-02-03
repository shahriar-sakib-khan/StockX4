import { app } from "./app";
import { connectDB } from "./config/db";
import { logger } from "./config/logger";

const port = process.env.PORT || 3001;

// Database and Seeding
connectDB().then(() => {
  app.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`);
  });
});
