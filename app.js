export class Category {
    name;
    transactions;

    constructor(name, transactions) {
        this.name = name;
        this.transactions = transactions;
    }

    addTransaction(transaction) {
        this.transactions.push(transaction);
    }

    getTransactions(period) {
        return this.transactions.filter(transaction => period.includeDate(transaction.data));
    }

    getTotal() {
        return this.transactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
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
        const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - currentDay + 1);
        const endOfWeek = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate() + 6);

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
    // #category;
    date;
    amount;

    constructor( date, amount) {
        // this.#category = category;
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

        this._initialCategories = [
            new Category("Transport", []),
            new Category("House", []),
            new Category("Food", []),
            new Category("Hobby", []),
            new Category("Party", [])
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
                })),
            });
            localStorage.setItem('categories', serializedCategories);
            return this._initialCategories;
        }
        return JSON.parse(storedCategories).data.map(categoryData => new Category(categoryData.name, categoryData.transactions));
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
            console.log(' trying to add listeners ')
            categoryNameEl.removeEventListener('click', this._handleCategoryClick.bind(this));
            categoryNameEl.addEventListener('click', this._handleCategoryClick.bind(this));
        }
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

}

const homepage = new Homepage();
export let categories = homepage.myCategories;






