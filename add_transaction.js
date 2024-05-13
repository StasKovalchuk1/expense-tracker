import { Category, Transaction } from './app.js';
import { categories } from './app.js';

class AddTransaction {

    /**
     * Constructor for AddTransaction page
     * @constructor
     */
    constructor() {
        this._addTransactionForm = document.querySelector('#add-transaction-form');
        this._transactionAmountError = document.getElementById("transaction-amount-error");
        this._categoryNameError = document.getElementById("category-name-error");
        this._dateError = document.getElementById("date-error");
        // this._addTransactionForm.addEventListener('submit',(e) => {
        //     e.preventDefault();
        //
        //     const amountValue = document.getElementById('amount').value;
        //     const categoryValue = document.getElementById('category').value;
        //     const dateValue = document.getElementById('date').value;
        //
        //     this.addTransaction(dateValue, amountValue, categoryValue);
        // });
        this.setHandlerOnFormSubmitting();

        this._urlSearchParams = new URLSearchParams(window.location.search);
        this._categoryName = this._urlSearchParams.get('category');
        this._period = this._urlSearchParams.get('period');

        this._categorySelectEl = document.getElementById('category');

        // for (const category of categories) {
        //     const optionElement = document.createElement('option');
        //     optionElement.value = category.name;
        //     optionElement.textContent = category.name;
        //     this._categorySelectEl.appendChild(optionElement);
        // }
        this.addOptionElementToForm();
        // if (this._categoryName) {
        //     const option = this._categorySelectEl.querySelector(`option[value="${this._categoryName}"]`);
        //     if (option) option.selected = true;
        // }
        this.setOptionValue();

        // document.getElementById('back-button').addEventListener('click',
        //     () => {
        //         if (this._period) window.location.href = `index.html?period=${this._period}`;
        //         else window.location.href = `index.html`;
        // });
        this.setHandlerOnBackButton();

    }

    /**
     * Sets handler on form submitting
     */
    setHandlerOnFormSubmitting() {
        this._addTransactionForm.addEventListener('submit',(e) => {
            e.preventDefault();

            const amountValue = document.getElementById('amount').value;
            const categoryValue = document.getElementById('category').value;
            const dateValue = document.getElementById('date').value;

            this.addTransaction(dateValue, amountValue, categoryValue);
        });
    }

    /**
     * Adds option element with categories to form
     */
    addOptionElementToForm() {
        for (const category of categories) {
            const optionElement = document.createElement('option');
            optionElement.value = category.name;
            optionElement.textContent = category.name;
            this._categorySelectEl.appendChild(optionElement);
        }
    }

    /**
     * Sets option value from url or by default
     */
    setOptionValue(){
        if (this._categoryName) {
            const option = this._categorySelectEl.querySelector(`option[value="${this._categoryName}"]`);
            if (option) option.selected = true;
        }
    }

    setHandlerOnBackButton() {
        document.getElementById('back-button').addEventListener('click',
            () => {
                if (this._period) window.location.href = `index.html?period=${this._period}`;
                else window.location.href = `index.html`;
            });
    }

    /**
     * Adds transaction to category
     * @param {date} dateValue
     * @param {number} amountValue
     * @param {string} categoryValue
     */
    addTransaction(dateValue, amountValue, categoryValue) {
        const storedCategories = localStorage.getItem('categories');
        const categoriesData = JSON.parse(storedCategories);
        const categories = categoriesData.data.map(categoryData => new Category(categoryData.name, categoryData.transactions, categoryData.color));

        const selectedCategory = categories.find(category => category.getName() === categoryValue);

        if (!this.validate(categories, amountValue, dateValue, selectedCategory)) return;

        const trans = new Transaction(dateValue, amountValue);
        selectedCategory.addTransaction(trans)
        this.updateLocalStorageCategories(categories);

        if (this._period) window.location.href = `index.html?period=${this._period}`;
        else window.location.href = `index.html`;

    }

    /**
     * Update categories in local storage
     * @param {Array<Category>} categories - list of categories
     */
    updateLocalStorageCategories(categories) {
        localStorage.setItem('categories', JSON.stringify({
            data: categories.map(category => ({
                name: category.name,
                transactions: category.transactions,
                color: category.color
            })),
        }));
    }

    /**
     * Validates add transaction inputs
     * @param {Array<Category>} categories - list of categories
     * @param {number} amount - transaction amount
     * @param {date} date - transaction date
     * @param {Category} selectedCategory - selected category
     * @returns {boolean}
     */
    validate(categories, amount, date, selectedCategory) {
        if (amount < 1) {
            this._transactionAmountError.textContent = "Wrong amount";
            return false;
        }
        if (date === null) {
            this._dateError.textContent = "Wrong date";
            return false;
        }
        if (!selectedCategory) {
            this._categoryNameError.textContent = "Wrong category";
            return false;
        }

        return true;
    }

}

const addTransaction = new AddTransaction();