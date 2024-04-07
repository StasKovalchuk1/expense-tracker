import { Category, Transaction } from './app.js';
import { categories } from './app.js';

class AddTransaction {
    constructor() {
        this._addTransactionForm = document.querySelector('#add-transaction-form');
        this._transactionAmountError = document.getElementById("transaction-amount-error");
        this._categoryNameError = document.getElementById("category-name-error");
        this._dateError = document.getElementById("date-error");
        this._addTransactionForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const amountValue = document.getElementById('amount').value;
            const categoryValue = document.getElementById('category').value;
            const dateValue = document.getElementById('date').value;

            await this._addTransaction(dateValue, amountValue, categoryValue);
        });

        this._urlSearchParams = new URLSearchParams(window.location.search);
        this._categoryName = this._urlSearchParams.get('category');
        this._period = this._urlSearchParams.get('period');

        this._categorySelectEl = document.getElementById('category');

        for (const category of categories) {
            const optionElement = document.createElement('option');
            optionElement.value = category.name;
            optionElement.textContent = category.name;
            this._categorySelectEl.appendChild(optionElement);
        }
        if (this._categoryName) {
            const option = this._categorySelectEl.querySelector(`option[value="${this._categoryName}"]`);
            if (option) option.selected = true;
        }

        document.getElementById('back-button').addEventListener('click',
            () => {
                if (this._period) window.location.href = `homepage.html?period=${this._period}`;
                else window.location.href = `homepage.html`;
        });

    }

    async _addTransaction(dateValue, amountValue, categoryValue) {
        const trans = new Transaction(dateValue, amountValue, categoryValue);

        // Получение категорий из локального хранилища
        const storedCategories = localStorage.getItem('categories');
        const categoriesData = JSON.parse(storedCategories);
        if (categoriesData.type === 'Categories') {
            const categories = categoriesData.data.map(categoryData => new Category(categoryData.name, categoryData.transactions, categoryData.color));

            console.log(categories[0].getName())

            const selectedCategory = categories.find(category => category.getName() === categoryValue);

            console.log(selectedCategory)

            if (selectedCategory) {
                if (this._validate(amountValue, dateValue)) selectedCategory.addTransaction(trans);
                else return;
            } else {
                this._categoryNameError.textContent = "Need to choose category";
                console.warn('Category not found:', categoryValue);
            }

            // Обновление локального хранилища
            localStorage.setItem('categories', JSON.stringify({
                type: 'Categories',
                data: categories.map(category => ({
                    name: category.name,
                    transactions: category.transactions,
                    color: category.color
                })),
            }));

            if (this._period) window.location.href = `homepage.html?period=${this._period}`;
            else window.location.href = `homepage.html`;
        }

    }

    _validate(amount, date) {
        if (amount < 1) {
            this._transactionAmountError.textContent = "Wrong amount";
            return false;
        }
        if (date === null) {
            this._dateError.textContent = "Wrong date";
            return false;
        }
        return true;
    }

}

const addTransaction = new AddTransaction();