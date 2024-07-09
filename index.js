import { input, editor, number, confirm } from "@inquirer/prompts";
import select, { Separator } from "@inquirer/select";
import { v4 as uuidv4 } from "uuid";
import chalk from "chalk";
import CliTable3 from "cli-table3";
import fs from "fs";
import { toNamespacedPath } from "path";
import { networkInterfaces } from "os";

let expenses = [];
let userIncome = await getUserIncome();

try {
  const data = fs.readFileSync("expenseData.json", "utf-8");
  expenses = JSON.parse(data);
} catch (error) {
  console.error(error);
}

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
      `$${list.amount}`,
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
    id: uuidv4(),
    name: name,
    date: expenseDate,
    category: category,
    amount: Number(amount),
    description: description,
  });

  await main();
}

async function removeExpense(expenseId, expenseArray) {
  if (expenseArray && expenseArray.length > 0) {
    const idToRemove = expenseArray[expenseId - 1]?.id; // Get the ID of the expense to remove
    const filteredArray = expenseArray.filter(
      (expense) => expense.id !== idToRemove
    );
    return filteredArray;
  } else {
    console.log(chalk.red("Expense list is empty."));
    return expenseArray;
  }
}

async function getExpenseIdRemove(tempArray) {
  console.log(
    chalk.red("Enter the ID number of the Expense You Want to remove")
  );
  let expenseId = await input({ message: "EXPENSE ID NUMBER: " });

  expenseId = Number(expenseId);
  while (expenseId <= 0 || expenseId > tempArray.length) {
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
    message: "By what you want to search",
    choices: [
      {
        name: "name",
        value: "name",
        description: "Search by name of the expense",
      },
      {
        name: "amount",
        value: "amount",
        description: "Search by amount of the expense",
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
      searchTerm = Number(searchTerm); // Convert to number for amount search
      break;
    default:
      break;
  }

  let tempArray = [];
  if (searchCriteria === "name") {
    const regexPattern = new RegExp(searchTerm, "i");
    tempArray = expenses.filter((expense) => regexPattern.test(expense.name));
  } else if (searchCriteria === "amount" && !isNaN(searchTerm)) {
    tempArray = expenses.filter((expense) => expense.amount === searchTerm);
  }

  displayItems(tempArray);

  const optionsForNewArray = await select({
    message: "Choose an action",
    choices: [
      {
        name: "Remove",
        value: "remove",
        description: "Remove the selected expense",
      },
      {
        name: "Update",
        value: "update",
        description: "Update the selected expense",
      },
      {
        name: "Go back",
        value: "main",
        description: "Go back to main menu",
      },
    ],
  });

  switch (optionsForNewArray.trim().toLowerCase()) {
    case "remove":
      const expenseToBeRemovedID = await getExpenseIdRemove(tempArray);
      // Find the index in original `expenses` array corresponding to `tempArray[expenseToBeRemovedID - 1]`
      const indexInExpenses = expenses.findIndex(
        (expense) => expense.id === tempArray[expenseToBeRemovedID - 1]?.id
      );
      if (indexInExpenses !== -1) {
        expenses.splice(indexInExpenses, 1); // Remove from `expenses`
        saveExpense(expenses); // Save updated expenses
      } else {
        console.log(chalk.red("Expense not found in main list."));
      }
      break;
    case "update":
      const expenseToUpdateID = await getExpenseIdToUpdate();
      await updateExpense(expenseToUpdateID);
      break;
    case "main":
      await main();
      break;
    default:
      break;
  }
}
async function getUserIncome() {
  let income = await input({ message: "Please Enter your monthly income" });
  while (isNaN(income)) {
    console.log(chalk.redBright("Invalid input:"));
    income = await input({ message: "Please Enter your monthly income" });
  }

  console.log(chalk.yellow(`Is this your Monethly income $${income}`));
  const answer = await confirm({ message: "continue? " });
  if (!answer) {
    return 0;
  }

  return income;
}

function calculateTotalExpenses(income, expenseArr) {
  let totalExpenses = 0;
  expenseArr.forEach((expense) => {
    totalExpenses += expense.amount;
  });

  const netIcome = income - totalExpenses;
  if (netIcome > 0) {
    if (netIcome > income / 2) {
      console.log(
        chalk.greenBright(`You worth ${netIcome}  dollar after expenses`)
      );
      console.log(chalk.greenBright("Neat!! Nicely done! "));
    } else {
      console.log(chalk.green(`You worth $${netIcome} dollar after expenses`));
      console.log(chalk.green(`You could do better`));
    }
  } else {
    console.log(
      chalk.redBright(`You are  dommed bro! You are - $${-netIcome} short`)
    );
    console.log(chalk.redBright(`horrible`));
  }
}
async function main() {
  saveExpense(expenses);
  displayItems(expenses);
  console.log(`Your Income is: ${userIncome}`);
  console.log("");
  calculateTotalExpenses(userIncome, expenses);
  console.log("");
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
        setTimeout(() => {
          console.clear();
          console.log(chalk("Empty list can't search"));
        }, 100);
      }
      await searchExpense();
      break;
    case "quit":
      console.clear();
      console.log("You have quitted this app");
      return 0;
    default:
      console.log("Invalid input bitches");
      break;
  }
  await main();
}

main();
