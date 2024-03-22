import { Category, Transaction } from './app.js';
import { categories } from './app.js';

class M {
    constructor() {
        this._header = document.querySelector('.category-name-h1');
        this._expensesEl = document.querySelector('.category-expenses-h2');
        this._urlSearchParams = new URLSearchParams(window.location.search);
        this._categoryName = this._urlSearchParams.get('category');

        this._period = this._urlSearchParams.get('period');

        this._categoryObj = categories.find(category => category.name === this._categoryName)
        this._filteredTransactions = this._categoryObj.getTransactionsForPeriod(this._period)
            .map(transactionData => new Transaction(new Date(transactionData.date), transactionData.amount));
        this._transactionsListEl = document.querySelector('.transactions-list');

        this._setHeader();
        this._createHtmlWithStrings();

        document.getElementById('add-transaction-button').addEventListener('click',
            (e) => window.location.href = `addTransaction.html?category=${this._categoryName}`);

    }

    _createHtmlWithStrings() {
        this._transactionsListEl.innerHTML = '';

        const groupedTransactions = this._filteredTransactions.reduce((groups, transaction) => {
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

            transactionsHtmlArray.push(`<div class="total-amount">${this._calculateTotalAmount(groupedTransactions[date])} Kč</div>`);
        }

        let transactionsHtml = transactionsHtmlArray.join('');
        this._transactionsListEl.innerHTML = transactionsHtml;
    }

    _calculateTotalAmount(transactions) {
        return transactions.reduce((total, transaction) => {
            return total + parseFloat(transaction.amount);
        }, 0);
    }

    _setHeader() {
        this._header.textContent = this._categoryName;
        this._expensesEl.textContent = "Expenses: " + this._categoryObj.getTotalForPeriod(this._period);
    }

}

const m = new M();