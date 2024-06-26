import fs from "fs/promises";

const filePath = "./src/data/expense-tracker.json";

export default async function getExpenseData() {
  try {
    const expenseData = await fs.readFile(filePath, "utf-8");
    return JSON.parse(expenseData);
  } catch (error) {
    console.error(error);
  }
}
