const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

app.use(cors());

app.options("*", cors());

// Path to the routes directory
const routesPath = path.join(__dirname, "./routes");

// app.use("/api", usersRoutes);
// Read all files in the routes directory
fs.readdirSync(routesPath).forEach((file) => {
  const route = require(path.join(routesPath, file));
  // Assuming each route file exports a router and is used under its own endpoint
  app.use("/api", route);
});

// Handle 404 - Route not found
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "API is running",
  });
});

app.listen(1000, () => {
  console.log("http://localhost:1000");
});
