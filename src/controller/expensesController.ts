import { Request, Response } from "express";
import getExpenseData from "../utils/expensesFilePath.js";
import expensesWriteFile from "../utils/expensesWriteFile.js";

export async function getExpenses(req: Request, res: Response) {
  try {
    const allExpenses = await getExpenseData();

    res.status(200).json({ message: "Success gett all expenses!", allExpenses });
  } catch (error) {
    res.status(500).json({ message: "Internal server error!" });
  }
}

export async function getExpensesByDate(req: Request, res: Response) {
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
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getExpensesByCategory(req: Request, res: Response) {
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
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getExpenseDetail(req: Request, res: Response) {
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
}

export async function createExpense(req: Request, res: Response) {
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
    await expensesWriteFile(allExpenses);
    res.status(201).json({ message: "Expense added successfully", newExpenses });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function editExpense(req: Request, res: Response) {
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
    await expensesWriteFile(allExpenses);
    res.status(200).json({ message: "Expense updated successfully", updatedExpense });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteExpense(req: Request, res: Response) {
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

    await expensesWriteFile(newExpenses);
    res.status(200).json({ message: "Delete expense success", deletedExpense });
  } catch (error) {
    console.error(error);
  }
}
