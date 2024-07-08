import { input, editor, number } from "@inquirer/prompts";
import select, { Separator } from "@inquirer/select";
import { v4 as uuidv4 } from "uuid";
import chalk from "chalk";
import CliTable3 from "cli-table3";
import fs from "fs";
import path from "path";

let expenses = [];
(function () {
  try {
    const data = fs.readFileSync("expenseData.json", "utf-8");
    expenses = JSON.parse(data);
  } catch (error) {
    console.error(error);
  }
})();

function saveExpense(expenses) {
  const expenseJsonData = JSON.stringify(expenses);
  fs.writeFile("expenseData.json", expenseJsonData, (err) => {
    if (err) {
      console.log(err);
    }
  });
}

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
  lists?.forEach((list, index) => {
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

async function removeExpense(expenseId, expenseArrary) {
  expenseArrary = expenseArrary?.filter((_, index) => index !== expenseId - 1);
  return expenseArrary;
}
async function getExpenseIdRemove(tempArray) {
  console.log(
    chalk.red("Enter the ID number of the Expense You Want to remove")
  );
  let expenseId = await input({ message: "EXPENSE ID NUMBER: " });

  expenseId = Number(expenseId);
  while (tempArray <= 0 || tempArray > expenses.length) {
    console.log(chalk.redBright("Invalid expense ID number"));
    expenseId = await input({ message: ":" });
  }
  return expenseId;
}

async function getExpenseIdToUpdate() {
  console.log(chalk.cyan("Enter the Expense you want to update / edit"));
  let expenseId = await input({ message: "EXPENSE ID NUMBER: " });
  expenseId = Number(expenseId);

  while (expenseId <= 0 || expenseId > expenses.length) {
    console.log(chalk.redBright("Invalid expense ID number"));
    expenseId = await input({ message: ":" });
  }
  return expenseId;
}
async function updateExpense(expenseId) {
  if (expenses.length > 0) {
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
  } else {
    console.clear();
    setTimeout(
      () =>
        console.log(
          chalk.bgRed("\n The Expense List is empty please add items first")
        ),
      1000
    );
    await main();
  }
}

function isValidAmount(input) {
  return /^\d+(\.\d+)?$/.test(input);
}

async function searchExpense() {
  console.clear();
  let searchCriteria = await select({
    message: "By what you to want to search ",
    choices: [
      {
        name: "name",
        value: "name",
        description: "The name of the expense ",
      },
      {
        name: "amount",
        value: "amount",
        description: "Based the amount/payment/cost/expense",
      },
    ],
  });
  let searchTerm = "";
  switch (searchCriteria) {
    case "name":
      searchTerm = await input({
        message: "Enter the name of the item you want to search: ",
      });
      break;
    case "amount":
      searchTerm = await input({
        message: "Enter the amount of the item you want to search: ",
      });
    default:
      break;
  }
  let tempArray = [];
  if (typeof searchTerm === "string" || searchTerm instanceof String) {
    const regexPattern = new RegExp(searchTerm, "i");

    tempArray = expenses.filter((expense) => regexPattern.test(expense.name));
  } else if (typeof searchTerm === Number) {
    searchTerm = Number(searchTerm);
  }
  displayItems(tempArray);
  const optionsForNewArray = await select({
    message: "By what you to want to search ",
    choices: [
      {
        name: "Remove",
        value: "remove",
        description: "This will remove the item above ",
      },
      {
        name: "Update",
        value: "update",
        description: "This will allow update the above expense",
      },
      {
        name: "Go back",
        value: "main",
        description: "Go back to the main page",
      },
      {
        name: "quit",
        value: "quit",
        description: "You will exit this application",
      },
    ],
  });
  switch (optionsForNewArray.trim().toLowerCase()) {
    case "remove":
    case "delete":
      const expenseToBeRemovedID = await getExpenseIdRemove(tempArray);
      const newArr = await removeExpense(expenseToBeRemovedID, expenses);
      expenses = newArr;
      saveExpense(expenses);
      break;
    case "update":
    case "edit":
      const expenseToUpdateID = await getExpenseIdToUpdate();
      await updateExpense(expenseToUpdateID);
      break;
    case "quit":
      console.clear();
      console.log("You have quitted this app");
      break;
    case "main":
      await main();
      break;
    default:
      break;
  }
}
async function main() {
  saveExpense(expenses);
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
      {
        name: "quit",
        value: "quit",
        description: "to exit from this application",
      },
    ],
  });

  switch (command.trim().toLowerCase()) {
    case "add":
      await addExpense();
      break;
    case "remove":
    case "delete":
      const expenseToBeRemovedID = await getExpenseIdRemove(expenses);
      const newRemovedArray = await removeExpense(
        expenseToBeRemovedID,
        expenses
      );
      expenses = newRemovedArray;
      await main();
      break;
    case "update":
    case "edit":
      const expenseToUpdateID = await getExpenseIdToUpdate();
      await updateExpense(expenseToUpdateID);
      break;
    case "search":
      if (expenses.length === 0) {
        setTimeout(() => console.log(chalk("Empty list can't search")));
      }
      await searchExpense();
      break;
    case "quit":
      console.clear();
      console.log("You have quitted this app");
      return;
    default:
      break;
  }
  //await main();
}

main();
