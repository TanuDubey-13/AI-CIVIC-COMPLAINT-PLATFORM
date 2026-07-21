require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
 
const PORT = process.env.PORT || 5000;
 
// Connect to MongoDB, then start the server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });
 
  // Handle unhandled promise rejections gracefully
  process.on("unhandledRejection", (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
});
 