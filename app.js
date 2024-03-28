// import Chart from './node_modules/chart.js';
// import Chart from 'chart.js';
export class Category {
    name;
    transactions;
    color;

    constructor(name, transactions, color) {
        this.name = name;
        this.transactions = transactions;
        this.color = color;
    }

    addTransaction(transaction) {
        this.transactions.push(transaction);
    }

    getTotalForPeriod(filter) {
        let filteredTransactions = [];
        if (filter === 'week') filteredTransactions = this.getTransactionsForLastWeek();
        else if (filter === 'month') filteredTransactions = this.getTransactionsForLastMonth();
        else if (filter === 'quarter') filteredTransactions = this.getTransactionsForLastQuarter();
        else if (filter === 'year') filteredTransactions = this.getTransactionsForLastYear();
        return filteredTransactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
    }

    /**
     * Возвращает массив транзакций.
     * @param {string} filter - Период.
     * @returns {Array<Transaction>} - Массив объектов класса Transaction.
     */
    getTransactionsForPeriod(filter){
        let filteredTransactions= [];
        if (filter === 'week') filteredTransactions = this.getTransactionsForLastWeek();
        else if (filter === 'month') filteredTransactions = this.getTransactionsForLastMonth();
        else if (filter === 'quarter') filteredTransactions = this.getTransactionsForLastQuarter();
        else if (filter === 'year') filteredTransactions = this.getTransactionsForLastYear();
        return filteredTransactions;
    }

    getName() {
        return this.name;
    }

    getTransactionsForLastWeek() {
        const today = new Date();
        const currentDay = today.getDay();
        let startOfWeek = null;
        if (currentDay === 0) {
            startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
        } else {
            startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - currentDay + 1);
        }
        const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 7);

        return this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate >= startOfWeek && transactionDate <= endOfWeek;
        });
    }

    getTransactionsForLastMonth() {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        return this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
        })
    }

    getTransactionsForLastQuarter() {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        let quarter;
        if (currentMonth % 3 === 0) quarter = currentMonth / 3;
        else quarter = Math.floor(currentMonth / 3) + 1;

        const rightMonths = [quarter * 3, quarter * 3 - 1, quarter * 3 - 2];

        return this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return rightMonths.includes(transactionDate.getMonth())  && transactionDate.getFullYear() === currentYear;
        })
    }

    getTransactionsForLastYear() {
        const today = new Date();
        const currentYear = today.getFullYear();

        return this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getFullYear() === currentYear;
        })
    }

}

export class Transaction {
    date;
    amount;

    constructor( date, amount) {
        this.date = date;
        this.amount = amount;
    }
}

class Homepage {
    constructor() {
        this._addTransactionButton = document.querySelector('#add-transaction-button-homepage');
        if (this._addTransactionButton) {
            this._addTransactionButton.addEventListener('click', (e) => {
                window.location.href = "addTransaction.html";
            })
        }

        this._newCategoryButton = document.querySelector('#new-category-button-homepage');
        if (this._newCategoryButton) {
            this._newCategoryButton.addEventListener('click', (e) => {
                window.location.href = "newcategory.html";
            })
        }

        this._initialCategories = [
            new Category("Transport", [], "rgba(255, 99, 132, 0.2)"),
            new Category("House", [], "rgba(54, 162, 235, 0.2)"),
            new Category("Food", [], "rgba(255, 206, 86, 0.2)"),
            new Category("Hobby", [], "rgba(75, 192, 192, 0.2)"),
            new Category("Party", [], "rgba(153, 102, 255, 0.2)")
        ];

        this._periodSelect = document.getElementById('period');
        this._totalAmountSpan = document.getElementById('total-amount');

        this._categories = this._getCategoriesFromLocalStorage();
        console.log(this._categories);

        this._categoriesListEl = document.querySelector('.categories-list');

        if (this._categories && this._totalAmountSpan && this._periodSelect.value && this._categoriesListEl) {
            this._setTotalAmount(this._categories, this._totalAmountSpan, this._periodSelect.value);
            this._createHTMLCategoriesWithStrings(this._categories, this._categoriesListEl);
        }

        this._categoryNameEls = document.querySelectorAll('.category-name');

        if (this._periodSelect) this._periodSelect.addEventListener('change', this._handlePeriodChange.bind(this));
        this._setHandlersToCategoryClick();

        this._canvas = document.getElementById("my-chart");
        if (this._canvas) {
            this._ctx = this._canvas.getContext("2d");
            this._chart = null;
            this._drawGraph(this._ctx);
        }
    }

    get myCategories() {
        return this._categories;
    }

    _getCategoriesFromLocalStorage() {
        const storedCategories = localStorage.getItem('categories');

        if (!storedCategories) {
            const serializedCategories = JSON.stringify({
                type: 'Categories',
                data: this._initialCategories.map(category => ({
                    name: category.name,
                    transactions: category.transactions,
                    color: category.color
                })),
            });
            localStorage.setItem('categories', serializedCategories);
            return this._initialCategories;
        }
        return JSON.parse(storedCategories).data.map(categoryData => new Category(categoryData.name, categoryData.transactions, categoryData.color));
    }

    _createHTMLCategoriesWithStrings(categories, targetEl) {
        targetEl.innerHTML = '';

        const selectedPeriod = this._periodSelect.value;
        console.log(selectedPeriod)

        let categoriesHtmlArray = categories.map( (category) =>{
            const html = `
                    <li>
                        <span class="category-name">${ category.getName() }</span>
                        <span class="category-amount">${ category.getTotalForPeriod(selectedPeriod) }</span>
                    </li>
                `;

            return html;
        })
        let categoriesHtml = categoriesHtmlArray.join('');
        targetEl.innerHTML = categoriesHtml;

    }

    _setTotalAmount(categories, targetEl, period) {
        let total = categories.reduce((sum, category) => {
            return sum + category.getTotalForPeriod(period);
        }, 0);

        targetEl.textContent = total;
    }

    _handlePeriodChange() {
        this._createHTMLCategoriesWithStrings(this._categories, this._categoriesListEl);
        this._setTotalAmount(this._categories, this._totalAmountSpan, this._periodSelect.value);
        // Обновите обработчики событий для элементов категории
        console.log('updated page');
        console.log(this._categoryNameEls);
        this._categoryNameEls = document.querySelectorAll('.category-name');
        for (const categoryNameEl of this._categoryNameEls) {
            categoryNameEl.removeEventListener('click', this._handleCategoryClick.bind(this));
            categoryNameEl.addEventListener('click', this._handleCategoryClick.bind(this));
        }
        this._chart.destroy();
        this._drawGraph(this._ctx);
    }

    _handleCategoryClick(e) {
        e.preventDefault();
        const categorySelected = e.target.textContent;
        console.log(categorySelected);
        window.location.href = `category.html?category=${categorySelected}&period=${this._periodSelect.value}`;
    }

    _setHandlersToCategoryClick() {
        for (const categoryNameEl of this._categoryNameEls) {
            categoryNameEl.addEventListener('click', this._handleCategoryClick.bind(this));
        }
    }

    _drawGraph(ctx) {
        console.log("draw graph was called")
         this._chart = new Chart(ctx, {
            type: "pie",
            data: {
                labels: this._categories.map(category => category.name),
                datasets: [
                    {
                        data: this._categories.map(category => category.getTotalForPeriod(this._periodSelect.value)),
                        backgroundColor: this._categories.map(category => category.color),
                        borderColor: this._categories.map(category => this._modifyString(category.color, "1)")),
                    },
                ],
            },
            options: {
                legend: {
                    display: true,
                },
                tooltips: {
                    enabled: true,
                    mode: "single",
                    callbacks: {
                        label: function(tooltipItem) {
                            return tooltipItem.yLabel + " kc.";
                        },
                    },
                }
            },
        });
    }

    _modifyString(str, newChars) {
        const slicedStr = str.slice(0, -4);
        return slicedStr.concat(newChars);
    }

}

const homepage = new Homepage();
export let categories = homepage.myCategories;






