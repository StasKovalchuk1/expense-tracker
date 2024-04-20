import { Category, Transaction } from './app.js';
import { categories, playDeleteSound } from './app.js';

class CategoryTransactionsPage {

    /**
     * Constructor for category transactions page
     * @constructor
     */
    constructor() {
        this._header = document.querySelector('.category-name-h1');
        this._expensesEl = document.querySelector('.category-expenses-h2');
        this._urlSearchParams = new URLSearchParams(window.location.search);
        this._categoryName = this._urlSearchParams.get('category');

        this._period = this._urlSearchParams.get('period');

        this._categoryObj = categories.find(category => category.name === this._categoryName)
        if (this._period && this._categoryObj) {
            this._filteredTransactions = this._categoryObj.getTransactionsForPeriod(this._period)
                .map(transactionData => new Transaction(new Date(transactionData.date), transactionData.amount));
        }
        this._transactionsListEl = document.querySelector('.transactions-list');

        this.setHeader();
        this.createHtmlWithStrings();

        document.getElementById('add-transaction-button').addEventListener('click',
            (e) => window.location.href = `addTransaction.html?category=${this._categoryName}&period=${this._period}`);

        document.getElementById('back-button').addEventListener('click',
            () => window.location.href = `homepage.html?period=${this._period}`)

        this._transactionsListEl.addEventListener('click', this.handleDeleteTransaction.bind(this));
    }

    /**
     * Handles delete transaction event
     * @param {event} event - click on delete transaction
     */
    handleDeleteTransaction(event) {
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
            playDeleteSound();
            const index = this._categoryObj.transactions.findIndex(transaction =>
                (new Date(transaction.date).getTime() === deletedTransaction.date.getTime()) && (transaction.amount === deletedTransaction.amount)
            );
            this._categoryObj.transactions.splice(index, 1);

            this._filteredTransactions = this._filteredTransactions.filter(transaction => transaction !== deletedTransaction);
            console.log(this._filteredTransactions)

            transactionLi.classList.add('removing');

            setTimeout(() => {
                this.createHtmlWithStrings();
                this.setHeader();
                localStorage.setItem('categories', JSON.stringify({
                    data: categories.map(category => ({
                        name: category.name,
                        transactions: category.transactions,
                        color: category.color
                    })),
                }));
            }, 500);
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    }

    /**
     * Creates HTML with category transactions by asc
     */
    createHtmlWithStrings() {
        this._transactionsListEl.innerHTML = '';

        const transactionsByDate = {};

        this._filteredTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

        this._filteredTransactions.forEach(transaction => {
            if (!transactionsByDate[transaction.date]) {
                transactionsByDate[transaction.date] = [];
            }

            transactionsByDate[transaction.date].push(transaction);
        });

        const groupedTransactions = Object.values(transactionsByDate);

        let transactionsHtmlArray = [];

        for (const group in groupedTransactions) {
            const date = groupedTransactions[group][0].date.toLocaleDateString()
            transactionsHtmlArray.push(`<li class="date">${date}</li>`);

            transactionsHtmlArray.push(`<ul class="transactions">`);

            for (const transaction of groupedTransactions[group]) {
                transactionsHtmlArray.push(`
                    <li>
                      <span class="transaction-amount">${transaction.amount} Kč</span>
                      <a class="${date}">delete</a>
                    </li>
                `);
            }

            transactionsHtmlArray.push(`</ul>`);

            transactionsHtmlArray.push(`<div class="total-amount">${this.calculateTotalAmount(groupedTransactions[group])} Kč</div>`);
        }

        this._transactionsListEl.innerHTML = transactionsHtmlArray.join('');
    }

    /**
     * Calculates total amount for transactions expenses
     * @param {Array} transactions - transactions list
     * @returns {number} - total amount for transactions expenses
     */
    calculateTotalAmount(transactions) {
        return transactions.reduce((total, transaction) => {
            return total + parseFloat(transaction.amount);
        }, 0);
    }

    /**
     * Sets header for CategoryTransactionsPage
     */
    setHeader() {
        this._header.textContent = this._categoryName;
        if (this._categoryObj) this._expensesEl.textContent = "Expenses: " + this._categoryObj.getTotalForPeriod(this._period);
    }


}

const m = new CategoryTransactionsPage();