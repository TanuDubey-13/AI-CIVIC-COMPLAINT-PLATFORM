require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

let server;

const gracefulShutdown = (signal) => {
  if (server) {
    server.close(() => {
      console.log(`Server shut down due to ${signal}`);
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

const startServer = async () => {
  try {
    process.env.MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

    console.log("Mongo URI:", process.env.MONGODB_URI);

    await connectDB();

    server = app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
