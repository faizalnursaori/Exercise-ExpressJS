import express, { Request, Response } from "express";
import fs from "fs/promises";

const app = express();
const PORT = 8000;
const filePath = "./src/data/expense-tracker.json";

app.use(express.json());

async function getExpenseData() {
  try {
    const expenseData = await fs.readFile(filePath, "utf-8");
    return JSON.parse(expenseData);
  } catch (error) {
    console.error(error);
  }
}

app.get("/api/v1/expense-tracker", async (req: Request, res: Response) => {
  try {
    const allExpenses = await getExpenseData();
    res.status(200).json({ message: "Sucess getting all of the data", allExpenses });
  } catch (error) {}
});

app.get("/api/v1/expense-tracker/date-range", async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: "Start date and end date are required" });
    }

    const allExpenses = await getExpenseData();

    const filteredExpenses = allExpenses.filter((expense: any) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate >= new Date(startDate as string) && expenseDate <= new Date(endDate as string)
      );
    });

    const totalExpense = filteredExpenses.reduce(
      (sum: number, expense: any) => sum + expense.nominal,
      0
    );

    res.status(200).json({
      message: "Success getting total expense by date range",
      totalExpense,
      startDate,
      endDate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/v1/expense-tracker/category/:category", async (req: Request, res: Response) => {
  const {
    params: { category },
  } = req;

  try {
    if (!["food", "transport", "salary"].includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const allExpenses = await getExpenseData();

    const filteredExpenses = allExpenses.filter(
      (expense: any) => expense.category.toLowerCase() === category.toLowerCase()
    );

    if (filteredExpenses.length === 0) {
      return res.status(404).json({ message: "No expenses found for this category" });
    }

    const totalExpense = filteredExpenses.reduce(
      (acc: number, expense: any) => acc + expense.nominal,
      0
    );

    res.status(200).json({
      message: "Success",
      category,
      totalExpense,
      expenses: filteredExpenses,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/v1/expense-tracker/:id", async (req: Request, res: Response) => {
  try {
    const allExpenses = await getExpenseData();
    const expense = allExpenses.find((exp: { id: number }) => exp.id === Number(req.params.id));

    if (!expense) {
      return res.status(400).json({ message: "Expense not found" });
    } else {
      return res.status(200).json({ message: "Success getting Expense", expense });
    }
  } catch (error) {
    console.error(error);
  }
});

app.post("/api/v1/expense-tracker/", async (req: Request, res: Response) => {
  try {
    const allExpenses = await getExpenseData();
    const { title, nominal, type, category, date } = req.body;

    if (!title || !nominal || !type || !category || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newId =
      allExpenses.length > 0 ? Math.max(...allExpenses.map((exp: { id: number }) => exp.id)) : 1;

    const newExpenses = {
      id: newId + 1,
      title,
      nominal,
      type,
      category,
      date,
    };

    allExpenses.push(newExpenses);
    await fs.writeFile(filePath, JSON.stringify(allExpenses, null, 2));
    res.status(201).json({ message: "Expense added successfully", newExpenses });
  } catch (error) {
    console.error(error);
  }
});

app.put("/api/v1/expense-tracker/:id", async (req: Request, res: Response) => {
  try {
    const allExpenses = await getExpenseData();
    const expenseIndex = allExpenses.findIndex(
      (exp: { id: number }) => exp.id === Number(req.params.id)
    );

    if (expenseIndex === -1) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const getExpense = allExpenses[expenseIndex];
    const updatedExpense = { ...getExpense, ...req.body };

    allExpenses[expenseIndex] = updatedExpense;
    await fs.writeFile(filePath, JSON.stringify(allExpenses, null, 2));
    res.status(200).json({ message: "Expense updated successfully", updatedExpense });
  } catch (error) {
    console.error(error);
  }
});

app.delete("/api/v1/expense-tracker/:id", async (req: Request, res: Response) => {
  try {
    const allExpenses = await getExpenseData();
    const expenseIndex = allExpenses.findIndex(
      (exp: { id: number }) => exp.id === Number(req.params.id)
    );

    if (expenseIndex === -1) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const deletedExpense = allExpenses[expenseIndex];
    const newExpenses = allExpenses.filter(
      (exp: { id: number }) => exp.id !== Number(req.params.id)
    );

    await fs.writeFile(filePath, JSON.stringify(newExpenses, null, 2));
    res.status(200).json({ message: "Delete expense success", deletedExpense });
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
