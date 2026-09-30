import app from "./app";
import { logger } from "./lib/logger";
import { databaseInitializationStage, initializeDatabase } from "./lib/prisma";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const initializationStartedAt = Date.now();
logger.info("Starting database initialization");

initializeDatabase()
  .then(() => {
    logger.info(
      { durationMs: Date.now() - initializationStartedAt },
      "Database initialization completed",
    );
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }

      logger.info({ port }, "Server listening");
    });
  })
  .catch((err) => {
    // Prisma messages can contain connection strings, query values, or user content.
    // Report only a safe error code and the phase needed to diagnose the failure.
    const code =
      typeof err === "object" && err !== null && "code" in err &&
      typeof err.code === "string" && /^P\d{4}$/.test(err.code)
        ? err.code
        : undefined;
    const action = databaseInitializationStage === "connecting to PostgreSQL" ||
      code === "P1000" || code === "P1001" || code === "P1002"
      ? "Check production DATABASE_URL, database connectivity, and access."
      : code === "P2021" || code === "P2022"
        ? "Check the production schema against the Prisma model before publishing."
        : "Check the production database and startup configuration.";
    logger.error(
      { stage: databaseInitializationStage, code, action },
      "Database initialization failed; API did not begin serving",
    );
    process.exit(1);
  });
