import express from "express";
import cors from "cors";
import { createRoutes } from "./routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

createRoutes(app);

app.listen(PORT, () => {
  console.log(`PM Copilot server running on port ${PORT}`);
});

export default app;
