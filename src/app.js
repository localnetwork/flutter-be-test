const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const bodyParser = require("body-parser");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Handle dynamic image requests, including subdirectories
app.get("/images/*", (req, res) => {
  const imagePath = path.join(__dirname, "../public", req.path);

  // Send the image file if it exists
  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error(err);
      res.status(404).json({ error: "Image not found" });
    }
  });
});

// Enable CORS
app.use(cors());
app.options("*", cors());

const routesPath = path.join(__dirname, "./routes");

app.use(bodyParser.json());

// Test the server
app.get("/", (req, res) => {
  res.status(200).json({
    message: "API is running",
  });
});

// Dynamically load routes
fs.readdirSync(routesPath).forEach((file) => {
  const route = require(path.join(routesPath, file));
  app.use("/api", route);
});

// Handle 404 - Route not found
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found." });
});

// Handle server error
app.use((req, res, next) => {
  res.status(500).json({ error: "Server Error" });
});

app.listen(1000, () => {
  console.log("Server running at http://localhost:1000");
});
