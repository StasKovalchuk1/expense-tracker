const addCategoryForm = document.getElementById("add-category-form");
const categoryNameError = document.getElementById('category-name-error');
const urlSearchParams = new URLSearchParams(window.location.search);
const period = urlSearchParams.get('period');

document.getElementById('back-button').addEventListener('click',
    () => {
        if (period) window.location.href = `homepage.html?period=${period}`;
        else window.location.href = `homepage.html`;
    });


/**
 * Converts hex to rgb
 * @param {string }hex - hex color code
 * @returns {number[]|null} - values for tgb color code
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
    ] : null;
}

/**
 * Validates new category name
 * @param {Array} categories - categories from local storage
 * @param {string} inputName - name from input
 * @returns {boolean}
 */
function validate(categories, inputName) {
    if (inputName.length < 0) return false;
    for (const category of categories.data) {
        if (category.name.toLowerCase() === inputName.toLowerCase()) return false;
    }
    return true;
}


addCategoryForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const categoryName = document.getElementById("category-name").value;
    const categoryColor = document.getElementById("category-color").value;
    const colorRGB = hexToRgb(categoryColor);
    const transparentColor = `rgba(${colorRGB[0]}, ${colorRGB[1]}, ${colorRGB[2]}, 0.2)`;

    const categories = JSON.parse(localStorage.getItem("categories"));

    if (validate(categories, categoryName)) {
        const newCategory = {
            name: categoryName,
            transactions: [],
            color: transparentColor
        };

        categories.data.push(newCategory);
        localStorage.setItem("categories", JSON.stringify(categories));
        if (period) window.location.href = `homepage.html?period=${period}`;
        else window.location.href = `homepage.html`;
    } else {
        categoryNameError.textContent = "Wrong name";

    }
})
