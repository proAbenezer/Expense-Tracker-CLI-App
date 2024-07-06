import { input, editor, number } from "@inquirer/prompts";
import select, { Separator } from "@inquirer/select";
import { v4 as uuidv4 } from "uuid";
import chalk from "chalk";
import CliTable3 from "cli-table3";
//Each expense should have date, category, amount, description,Unique id
let expenses = [
  {
    id: uuidv4(),
    name: "chees cake",
    date: "12/20/2024",
    amount: 3,
    category: "food",
    description: "injeras",
  },
];
console.log(chalk.cyan("Welcome to Expense Tracker App"));
console.log(chalk.cyan("Made by  Abenezer Haile"));
console.log("");

function displayItems(lists) {
  console.clear();

  //console.table(lists, ["date", "category", "amount", "description"]);
  console.log(chalk.cyan("Welcome to Expense Tracker App"));
  console.log(chalk.cyan("Made by  Abenezer Haile"));
  console.log("");

  let expenseTable = new CliTable3({
    head: [
      chalk.cyan("ID"),
      chalk.cyan("NAME"),
      chalk.cyan("DATE"),
      chalk.cyan("CATEGORY"),
      chalk.cyan("AMOUNT"),
      chalk.cyan("DESCRIPTION"),
    ],
  });
  lists.forEach((list, index) => {
    const listArray = [
      `${index + 1}`,
      `${list.name.toUpperCase()}`,
      `${list.date}`,
      `${list.category}`,
      `${list.amount}`,
      `${list.description}`,
    ];
    expenseTable.push([...listArray]);
  });
  console.log(chalk.bgBlack(expenseTable.toString()));
}

async function addExpense() {
  console.log("Enter the following Inormation");
  const date = new Date();
  const expenseDate = `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}`;

  const category = await select({
    message: "Enter The category of the item",
    choices: [
      {
        name: "Food",
        value: "food",
        description: "Food item (eg., eggs, injer, bread...etc",
      },
      {
        name: "Transportation",
        value: "transportation",
        description:
          "Transportation expenses (eg., busy ticket, gasoil, car repair...etc)",
      },
      {
        name: "Entertainment",
        value: "entertainment",
        description:
          "Entertainment expenses (eg., TV, playstation, xbox, vaction,travel, ...etc)",
      },
      {
        name: "Utilities",
        value: "utilities",
        description:
          "Utilities expenses (eg., Water bills, Electric bills, WIFI, ...etc)",
      },
    ],
  });
  const name = await input({
    message: "Enter the name of the item/Payment/Expense or whatsoever: ",
  });
  let amount = await input({ message: "Enter the amount of the item: " });
  while (!isValidAmount(amount)) {
    console.log(chalk.redBright("You have Entered Invalid Amount: "));
    amount = await input({ message: "Enter the amount of the item: " });
  }

  const description = await input({
    message: "Enter the Description for  item: ",
  });

  expenses.push({
    name: name,
    date: expenseDate,
    category: category,
    amount: Number(amount),
    description: description,
  });

  await main();
}

async function removeExpense() {
  console.log(
    chalk.red("Enter the ID number of the Expense You Want to remove")
  );
  const exepnseID = await input({ message: "EXPENSE ID NUMBER: " });
  expenses = expenses.filter((expense) => expense == expense[exepnseID]);
  displayItems(expenses);
  await main();
}

async function updateExpense() {
  console.log(chalk.cyan("Enter the Expense you want to update / edit"));
  let expenseId = await input({ message: "EXPENSE ID NUMBER: " });
  expenseId = Number(expenseId);

  while (expenseId <= 0 || expenseId > expenses.length) {
    console.log(chalk.redBright("Invalid expense ID number"));
    expenseId = await input({ message: ":" });
  }

  console.log(`Change Expense Name: `);
  const newExpenseName = await input({ message: ":" });

  console.log(`Change Expense Amount: `);
  let newExpenseAmount = await input({ message: ":" });
  while (isValidAmount(!newExpenseAmount)) {
    console.log(chalk.redBright("Invaild amount number try again"));
    newExpenseAmount = await input({ message: ":" });
  }
  console.log(`Change Expense Description: `);
  const newExpenseDescription = await input({ message: "" });
  console.log(newExpenseName, newExpenseAmount, newExpenseDescription);
  expenses = expenses.map((expense) => {
    console.log(expense === expenses[expenseId - 1]);
    if (expense === expenses[expenseId - 1]) {
      return {
        ...expense,
        name: newExpenseName,
        amount: newExpenseAmount,
        description: newExpenseDescription,
      };
    } else {
      return expense;
    }
  });
  await main();
}

function isValidAmount(input) {
  return /^\d+(\.\d+)?$/.test(input);
}
async function main() {
  displayItems(expenses);

  console.log(
    chalk.magenta("Select a command") +
      chalk.green("( add, ") +
      chalk.red("remove, ") +
      chalk.cyan("update, ") +
      chalk.green("search )")
  );

  //const command = input({ message: "Enter your name" });
  const command = await select({
    message: "",
    choices: [
      {
        name: "add",
        value: "add",
        description: "add an item to expense list",
      },
      {
        name: "remove",
        value: "remove",
        description: "remove / delete item from expense list",
      },
      {
        name: "update",
        value: "update",
        description: "update / edit item from expense list",
      },
      {
        name: "search",
        value: "search",
        description:
          "search item from expense list based on (index, date, category, amount)",
      },
    ],
  });

  switch (command.trim().toLowerCase()) {
    case "add":
      addExpense();
      break;
    case "remove":
      removeExpense();
    case "update":
    case "edit":
      updateExpense();
      break;
    default:
      break;
  }
}

main();
