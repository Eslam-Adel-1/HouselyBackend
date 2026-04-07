import express from "express";

const app = express();

// Middlewares
app.use(express.json());

// Basic health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Housely API" });
});

export default app;
