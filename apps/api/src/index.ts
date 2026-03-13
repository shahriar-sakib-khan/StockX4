import 'dotenv/config'; // MUST BE THE FIRST LINE
import { app } from "./app";
import { connectDB } from "./config/db";
import { logger } from "./config/logger";

const port = process.env.PORT || 3001;

// Database and Seeding
connectDB().then(() => {
  app.listen(port as number, "0.0.0.0", () => {
    logger.info(`Server running on http://0.0.0.0:${port}`);
  });
});
