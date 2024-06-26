import express, { Application } from "express";
import expenseRoutes from "./routes/expenseRoutes.js";

const app: Application = express();
const PORT = 8000;

app.use(express.json());

app.use("/api/v1/expenses-tracker", expenseRoutes);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
