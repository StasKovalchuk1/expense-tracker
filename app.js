export class Category {
    name;
    transactions;
    color;

    /**
     * Constructor for creating Category
     * @constructor
     * @param {string} name - category name
     * @param {Array} transactions - category transactions
     * @param {string} color - category color
     */
    constructor(name, transactions, color) {
        this.name = name;
        this.transactions = transactions;
        this.color = color;
    }

    /**
     * Adds a transaction to the category's transaction list.
     *
     * @param {transaction} transaction - The transaction object to add.
     */
    addTransaction(transaction) {
        this.transactions.push(transaction);
    }

    /**
     * Return total amount of expenses for period
     * @param {string} filter - period
     * @returns {number} - total expenses
     */
    getTotalForPeriod(filter) {
        let filteredTransactions = [];
        if (filter === 'week') filteredTransactions = this.getTransactionsForLastWeek();
        else if (filter === 'month') filteredTransactions = this.getTransactionsForLastMonth();
        else if (filter === 'quarter') filteredTransactions = this.getTransactionsForLastQuarter();
        else if (filter === 'year') filteredTransactions = this.getTransactionsForLastYear();
        return filteredTransactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
    }

    /**
     * Return array of transactions for certain period.
     * @param {string} filter - period.
     * @returns {Array} - Array of transactions.
     */
    getTransactionsForPeriod(filter){
        let filteredTransactions= [];
        if (filter === 'week') filteredTransactions = this.getTransactionsForLastWeek();
        else if (filter === 'month') filteredTransactions = this.getTransactionsForLastMonth();
        else if (filter === 'quarter') filteredTransactions = this.getTransactionsForLastQuarter();
        else if (filter === 'year') filteredTransactions = this.getTransactionsForLastYear();
        return filteredTransactions;
    }

    /**
     * Returns category's name
     * @returns {string} category's name
     */
    getName() {
        return this.name;
    }

    /**
     * Returns transactions for last week
     * @returns {Array} transactions for last week
     */
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

    /**
     * Returns transactions for last month
     * @returns {Array} transactions for last month
     */
    getTransactionsForLastMonth() {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        return this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
        })
    }

    /**
     * Returns transactions for last quarter
     * @returns {Array} transactions for last quarter
     */
    getTransactionsForLastQuarter() {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        let quarter;
        if (currentMonth % 3 === 0) quarter = currentMonth / 3;
        else quarter = Math.floor(currentMonth / 3) + 1;

        const rightMonths = [quarter * 3, quarter * 3 - 1, quarter * 3 - 2];

        return this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return rightMonths.includes(transactionDate.getMonth() + 1)  && transactionDate.getFullYear() === currentYear;
        })
    }

    /**
     * Returns transactions for last year
     * @returns {Array} transactions for last year
     */
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

    /**
     * Constructor for transactions
     * @constructor
     * @param {date} date - transaction date
     * @param {number} amount - transaction amount
     */
    constructor( date, amount) {
        this.date = date;
        this.amount = amount;
    }
}

class Homepage {

    /**
     * Constructor for Homepage
     * @constructor
     *
     */
    constructor() {
        this._initialCategories = [
            new Category("Transport", [], "rgba(255, 99, 132, 0.2)"),
            new Category("House", [], "rgba(54, 162, 235, 0.2)"),
            new Category("Food", [], "rgba(255, 206, 86, 0.2)"),
            new Category("Hobby", [], "rgba(75, 192, 192, 0.2)"),
            new Category("Party", [], "rgba(153, 102, 255, 0.2)")
        ];

        this._periodSelect = document.getElementById('period');

        this._urlSearchParams = new URLSearchParams(window.location.search);
        this._period = this._urlSearchParams.get('period');

        this._totalAmountSpan = document.getElementById('total-amount');

        this._categories = this.getCategoriesFromLocalStorage();
        console.log(this._categories);

        this._categoriesListEl = document.querySelector('.categories-list');

        if (this._categories && this._totalAmountSpan && this._periodSelect && this._categoriesListEl) {
            if (this._period) this._periodSelect.value = this._period;
            this.setTotalAmount(this._categories, this._totalAmountSpan, this._periodSelect.value);
            this.createHTMLCategoriesWithStrings();
        }

        this.setHandlerOnButtons();

        this._categoryNameEls = document.querySelectorAll('.category-name');
        this.setHandlersToCategoryClick();

        if (this._periodSelect) this._periodSelect.addEventListener('change', this.handlePeriodChange.bind(this));

        this._canvas = document.getElementById("my-chart");
        if (this._canvas) {
            this._ctx = this._canvas.getContext("2d");
            this._chart = null;
            this.drawGraph(this._ctx);
        }

        if (this._categoriesListEl) this._categoriesListEl.addEventListener('click', this.handleDeleteCategory.bind(this));

        this.setHandlerForVideo();
    }

    /**
     * Returns categories
     * @returns {Array<Category>} categories
     */
    get myCategories() {
        return this._categories;
    }

    /**
     * Sets event listeners on 'add transaction' and 'new category' buttons
     */
    setHandlerOnButtons() {
        this._addTransactionButton = document.querySelector('#add-transaction-button-homepage');
        if (this._addTransactionButton) {
            this._addTransactionButton.addEventListener('click', (e) => {
                window.location.href = `addTransaction.html?period=${this._periodSelect.value}`;
            })
        }

        this._newCategoryButton = document.querySelector('#new-category-button-homepage');
        if (this._newCategoryButton) {
            this._newCategoryButton.addEventListener('click', (e) => {
                window.location.href = `newCategory.html?period=${this._periodSelect.value}`;
            })
        }
    }

    /**
     * Returns categories from Local Storage
     * @returns {Array<Category>} categories list
     */
    getCategoriesFromLocalStorage() {
        const storedCategories = localStorage.getItem('categories');

        if (!storedCategories) {
            const serializedCategories = JSON.stringify({
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

    /**
     * Creates HTML with categories list
     */
    createHTMLCategoriesWithStrings() {
        this._categoriesListEl.innerHTML = '';

        const selectedPeriod = this._periodSelect.value;

        let categoriesHtmlArray = this._categories.map( (category) =>{
            const html = `
                    <li>
                        <span class="category-name">${ category.getName() }</span>
                        <span class="category-amount">${ category.getTotalForPeriod(selectedPeriod) }</span>
                        <img src="img/delete.png" alt="${category.getName()}" class="delete">
                    </li>
                `;

            return html;
        })
        const categoriesHtml = categoriesHtmlArray.join('');
        this._categoriesListEl.innerHTML = categoriesHtml;

    }

    /**
     * Sets total amount for selected period
     */
    setTotalAmount() {
        console.log(this._periodSelect.value)
        let total = this._categories.reduce((sum, category) => {
            return sum + category.getTotalForPeriod(this._periodSelect.value);
        }, 0);

        this._totalAmountSpan.textContent = total;
    }

    /**
     * Handle period change
     */
    handlePeriodChange() {
        this.createHTMLCategoriesWithStrings();
        this.setTotalAmount();

        this._categoryNameEls = document.querySelectorAll('.category-name');
        for (const categoryNameEl of this._categoryNameEls) {
            categoryNameEl.removeEventListener('click', this.handleCategoryClick.bind(this));
            categoryNameEl.addEventListener('click', this.handleCategoryClick.bind(this));
        }
        if (this._chart) this._chart.destroy();
        this.drawGraph(this._ctx);
    }

    /**
     * Handle click on category
     * @param {event} e - clicking on category event
     */
    handleCategoryClick(e) {
        e.preventDefault();
        const categorySelected = e.target.textContent;
        const periodSelected = this._periodSelect.value; // Assuming this is a reference to your period select element

        window.location.href = `transactions.html?category=${categorySelected}&period=${periodSelected}`;
    }

    /**
     * Sets click handlers on categories
     */
    setHandlersToCategoryClick() {
        this._categoryNameEls = document.querySelectorAll('.category-name');
        for (const categoryNameEl of this._categoryNameEls) {
            categoryNameEl.addEventListener('click', this.handleCategoryClick.bind(this));
        }
    }

    /**
     * Draws graph by category expenses
     * @param ctx - variable to store the 2D rendering context of a canvas element.
     */
    drawGraph(ctx) {
        const hasData = this._categories.some(category => category.getTotalForPeriod(this._periodSelect.value) > 0);
        if (hasData) {
            this._canvas.style.display = "block";
            this._chart = new Chart(ctx, {
                type: "pie",
                data: {
                    labels: this._categories.map(category => category.name),
                    datasets: [
                        {
                            data: this._categories.map(category => category.getTotalForPeriod(this._periodSelect.value)),
                            backgroundColor: this._categories.map(category => category.color),
                            borderColor: this._categories.map(category => this.modifyString(category.color, "1)")),
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
        } else {
            this._canvas.style.display = "none";
        }
    }

    /**
     * Change last parameter in rgba color model
     * @param {string} str - string to modify
     * @param {string} newChars - chars to add
     * @returns {string} - modified string
     */
    modifyString(str, newChars) {
        const slicedStr = str.slice(0, -4);
        return slicedStr.concat(newChars);
    }

    /**
     * Handles delete category event
     * @param {event} event - category click event
     */
    handleDeleteCategory(event) {
        if (event.target.tagName.toLowerCase() !== 'img') {
            return;
        }

        const categoryDeleteName = event.target.alt;
        if (!categoryDeleteName) {
            return;
        }

        const confirm = window.confirm("Are you sure you want to delete this category?");
        if (!confirm) return;

        this.deleteCategory(categoryDeleteName);
    }

    /**
     * Deletes category from local storage and sets new html
     * @param {string} categoryDeleteName - deleting category's name
     */
    deleteCategory(categoryDeleteName) {
        try {
            this._categories = this._categories.filter(category => category.name !== categoryDeleteName)
            playDeleteSound();
            this.createHTMLCategoriesWithStrings();
            this.setTotalAmount();
            if (this._chart) this._chart.destroy();
            this.drawGraph(this._ctx);
            localStorage.setItem('categories', JSON.stringify({
                data: this._categories.map(category => ({
                    name: category.name,
                    transactions: category.transactions,
                    color: category.color
                })),
            }));
            this.setHandlersToCategoryClick();
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    }

    /**
     * Sets handlers for 'see video button' and 'close video button'
     */
    setHandlerForVideo() {
        const seeVideoButton = document.getElementById('see-video-button');
        const videoPopup = document.getElementById('video-popup');
        const closePopupButton = document.querySelector('.close-popup-button');

        if (!videoPopup) return;

        seeVideoButton.addEventListener('click', () => {
            videoPopup.style.display = 'flex';
            seeVideoButton.style.display = 'none';
            closePopupButton.style.display = 'block';
            window.scrollTo({
                top: videoPopup.offsetTop,
                behavior: 'smooth'
            });
        });

        closePopupButton.addEventListener('click', () => {
            videoPopup.style.display = 'none';
            seeVideoButton.style.display = 'block';
            closePopupButton.style.display = 'none';
        });
    }

}

/**
 * Plays audio source when element is deleted
 */
export function playDeleteSound() {
    const audioCtx = new AudioContext();
    const gainNode = audioCtx.createGain();
    const soundElement = new Audio("audio/delete_sound.mp3");

    soundElement.source = audioCtx.createMediaElementSource(soundElement);
    soundElement.source.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    soundElement.play();
}

const homepage = new Homepage();

export let categories = homepage.myCategories;






