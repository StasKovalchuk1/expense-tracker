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

        this._transactionsListEl.addEventListener('click', this._handleDeleteTransaction.bind(this));
    }

    _handleDeleteTransaction(event) {
        if (event.target.tagName.toLowerCase() !== 'a' || !event.target.textContent.includes('delete')) {
            return;
        }

        const transactionLi = event.target.closest('li');
        if (!transactionLi) {
            return;
        }

        const date = event.target.className;
        const amount = parseFloat(transactionLi.querySelector('.transaction-amount').textContent.split(' ')[0]);
        const deletedTransaction = this._filteredTransactions.find(transaction => {
            return transaction.date.toLocaleDateString() === date &&
                parseFloat(transaction.amount) === amount;
        });

        console.log(deletedTransaction)

        if (!deletedTransaction) {
            return;
        }

        try {
            const index = this._categoryObj.transactions.findIndex(transaction => transaction.id === deletedTransaction.id);
            this._categoryObj.transactions.splice(index, 1);

            this._filteredTransactions = this._filteredTransactions.filter(transaction => transaction !== deletedTransaction);
            this._createHtmlWithStrings();
            localStorage.setItem('categories', JSON.stringify({
                type: 'Categories',
                data: categories.map(category => ({
                    name: category.name,
                    transactions: category.transactions,
                    color: category.color
                })),
            }));
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
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
                      <span class="transaction-amount">${transaction.amount} Kč</span>
                      <a class="${date}">delete</a>
                    </li>
                `);
            }

            transactionsHtmlArray.push(`</ul>`);

            transactionsHtmlArray.push(`<div class="total-amount">${this._calculateTotalAmount(groupedTransactions[date])} Kč</div>`);
        }

        this._transactionsListEl.innerHTML = transactionsHtmlArray.join('');
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