import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js";
import { errorHandler } from "./middlewares/error.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({ name: "FleetMadox API", status: "ok" });
});

app.use(errorHandler);

export default app;

