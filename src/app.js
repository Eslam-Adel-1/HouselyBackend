import express from "express";
import routes from "./routes/index.js";
import cors from "cors";

const app = express();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: "*",
  }),
);

// Routes
app.use("/api", routes);

// Basic health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to Housely API" });
});

export default app;
