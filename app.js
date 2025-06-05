import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { notFound } from "./src/middlewares/notFound.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";

const app = express();

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development"
        ? [
            "http://localhost:3000",
            "http://localhost:3002",
            "http://localhost:3001",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:5000",
            "http://localhost:8080",
            "http://localhost:8081",
          ]
        : "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Specify allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

//Routes Imports
import authRouter from "./src/routes/auth/auth.routes.js";
import userRouter from "./src/routes/users/user.routes.js";
import destinationRouter from "./src/routes/destinations/destination.routes.js";
import reviewRouter from "./src/routes/review/review.routes.js";
import tagRouter from "./src/routes/tags/tag.routes.js";
import categoryRouter from "./src/routes/category/category.routes.js";
import recommendationRouter from "./src/routes/recommendation/recommendation.routes.js";
import { scheduleRecommendationRefresh } from "./src/jobs/refreshTravelRecommendations.jobs..js";

app.get("/", (req, res) => {
  res.status(200).send("APIs are working...");
});

// Routes Definitions
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/destinations", destinationRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/tags", tagRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/recommendations", recommendationRouter);

scheduleRecommendationRefresh();

app.use(notFound);
app.use(errorHandler);

export { app };
