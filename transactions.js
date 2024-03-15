import { Category, Transaction } from './app.js';
import { categories } from './app.js';

const header = document.querySelector('.category-name-h1');
const expensesEl = document.querySelector('.category-expenses-h2');
const urlSearchParams = new URLSearchParams(window.location.search);
const categoryName = urlSearchParams.get('category');

const period = urlSearchParams.get('period');

const categoryObj = categories.find(category => category.name === categoryName)

console.log(categoryObj)
const filteredTransactions = categoryObj.getTransactionsForPeriod(period)
    .map(transactionData => new Transaction(new Date(transactionData.date), transactionData.amount));
const transactionsListEl = document.querySelector('.transactions-list');

/*
 set Category Name and Expenses
 */
if (header) {
    header.textContent = categoryName;
    expensesEl.textContent = "Expenses: " + categoryObj.getTotalForPeriod(period);
}


function calculateTotalAmount(transactions) {
    return transactions.reduce((total, transaction) => {
        return total + parseFloat(transaction.amount);
    }, 0);
}

function createHtmlWithStrings(transactions, targetEl) {
    targetEl.innerHTML = '';

    const groupedTransactions = transactions.reduce((groups, transaction) => {
        const date = transaction.date.toLocaleDateString();
        groups[date] = groups[date] || [];
        groups[date].push(transaction);
        return groups;
    }, {});

    let transactionsHtmlArray = [];

    for (const date in groupedTransactions) {
        transactionsHtmlArray.push(`<li class="date">${date}</li>`);

        transactionsHtmlArray.push(`<ul class="transactions">`);

        for (const transaction of groupedTransactions[date]) {
            transactionsHtmlArray.push(`
        <li>
<!--          <span class="transaction-name">${transaction.name}</span>-->
          <span class="transaction-amount">${transaction.amount} Kč</span>
        </li>
      `);
        }

        transactionsHtmlArray.push(`</ul>`);

        transactionsHtmlArray.push(`<div class="total-amount">${calculateTotalAmount(groupedTransactions[date])} Kč</div>`);
    }

    let transactionsHtml = transactionsHtmlArray.join('');
    targetEl.innerHTML = transactionsHtml;
}

if (transactionsListEl) createHtmlWithStrings(filteredTransactions, transactionsListEl)