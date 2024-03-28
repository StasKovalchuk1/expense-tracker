import { Category, Transaction } from './app.js';
import { categories } from './app.js';

const urlSearchParams = new URLSearchParams(window.location.search);
const categoryName = urlSearchParams.get('category');

const categorySelectEl = document.getElementById('category');

for (const category of categories) {
    const optionElement = document.createElement('option');
    optionElement.value = category.name;
    optionElement.textContent = category.name;
    categorySelectEl.appendChild(optionElement);
}

if (categoryName) {
    const option = categorySelectEl.querySelector(`option[value="${categoryName}"]`);
    if (option) option.selected = true;
}

// Функция для добавления транзакции
async function addTransaction(dateValue, amountValue, categoryValue) {
    const trans = new Transaction(dateValue, amountValue, categoryValue);

    // Получение категорий из локального хранилища
    const storedCategories = localStorage.getItem('categories');
    const categoriesData = JSON.parse(storedCategories);
    if (categoriesData.type === 'Categories') {
        const categories = categoriesData.data.map(categoryData => new Category(categoryData.name, categoryData.transactions, categoryData.color));

        console.log(categories[0].getName())

        const selectedCategory = categories.find(category => category.getName() === categoryValue);

        console.log(selectedCategory)

        // Добавление транзакции к категории
        if (selectedCategory) {
            console.log("try to add")
            selectedCategory.addTransaction(trans);
        } else {
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

        window.location.href = "homepage.html";
    }

}

// Обработчик события отправки формы
const addTransactionForm = document.querySelector('#add-transaction-form');
addTransactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const amountValue = document.getElementById('amount').value;
    const categoryValue = document.getElementById('category').value;
    const dateValue = document.getElementById('date').value;

    await addTransaction(dateValue, amountValue, categoryValue);
});
