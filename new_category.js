const addCategoryForm = document.getElementById("add-category-form");
const urlSearchParams = new URLSearchParams(window.location.search);
const period = urlSearchParams.get('period');

document.getElementById('back-button').addEventListener('click',
    () => {
        if (period) window.location.href = `homepage.html?period=${period}`;
        else window.location.href = `homepage.html`;
    });

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
    ] : null;
}

addCategoryForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const categoryName = document.getElementById("category-name").value;
    const categoryColor = document.getElementById("category-color").value;
    const colorRGB = hexToRgb(categoryColor);
    const transparentColor = `rgba(${colorRGB[0]}, ${colorRGB[1]}, ${colorRGB[2]}, 0.2)`;

    const categories = JSON.parse(localStorage.getItem("categories"));

    const newCategory = {
        name: categoryName,
        transactions: [],
        color: transparentColor
    };

    categories.data.push(newCategory);
    localStorage.setItem("categories", JSON.stringify(categories));
    if (period) window.location.href = `homepage.html?period=${period}`;
    else window.location.href = `homepage.html`;
})
