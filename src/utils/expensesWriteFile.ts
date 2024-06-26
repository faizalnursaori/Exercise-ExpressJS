import fs from "fs/promises";

const filePath = "./src/data/expense-tracker.json";

export default async function expensesWriteFile(data: any) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}
