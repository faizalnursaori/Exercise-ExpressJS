import express, { Application } from "express";
import expenseRoutes from "./routes/expenseRoutes.js";
import { errorHandling } from "./middleware/errorHandling.js";

const app: Application = express();
const PORT = 8000;

app.use(express.json());

app.use("/api/v1/expenses-tracker", expenseRoutes);

app.use(errorHandling);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
