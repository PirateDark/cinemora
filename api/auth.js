import express from "express";
import authRouter from "../server/auth.js";

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

export default function handler(req, res) {
  app(req, res);
}
