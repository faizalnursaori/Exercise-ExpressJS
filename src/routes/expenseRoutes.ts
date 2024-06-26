import express from "express";
import {
  getExpenses,
  getExpensesByDate,
  getExpensesByCategory,
  getExpenseDetail,
  createExpense,
  editExpense,
  deleteExpense,
} from "../controller/expensesController.js";

const router = express.Router();

router.get("/date-range", getExpensesByDate);
router.get("/category/:category", getExpensesByCategory);
router.route("/").get(getExpenses).post(createExpense);
router.route("/:id").get(getExpenseDetail).put(editExpense).delete(deleteExpense);

export default router;
