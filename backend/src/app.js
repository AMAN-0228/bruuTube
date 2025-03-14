import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { upload } from "./middlewares/multer.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// import routes
import userRouter from "./routes/users.router.js";
import videoRouter from './routes/video.router.js';
import authRouters from './routes/authRoutes.js';
// routes declaration

app.use("/api/v1/auth", authRouters);

app.use(
  "/api/v1/user",
  // upload.fields([
  //   {
  //     name: "avatar",
  //     maxCount: 1,
  //   },
  //   {
  //     name: "coverImage",
  //     maxCount: 1,
  //   },
  // ]),
  userRouter
);
app.use('/api/v1/video',videoRouter)

export { app };
