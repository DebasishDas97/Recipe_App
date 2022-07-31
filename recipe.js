const c = console.log.bind(document)
const randomMeals = document.getElementById('meals')
const favContainer = document.getElementById('fav-meals')

const searchTerm = document.getElementById('search-term')
const searchBtn = document.getElementById('search')

const mealPopup = document.querySelector('.popup-container')
const mealInfoEl = document.getElementById('meal-info')
const popupCloseBtn = document.getElementById('close-popup')

getRandomMeal()
fetchFavMeals()

async function getRandomMeal() {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')
    const respData = await resp.json()
    const randomMeal = respData.meals[0]
    addMeal(randomMeal, true)
}

async function getMealById(id) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id)
    const respData = await resp.json()
    const meal = respData.meals[0]
    return meal
}

async function getMealsBySearch(term) {
    const resp = await fetch(
        "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
    );

    const respData = await resp.json();
    const meals = respData.meals;
    return meals;
}


function addMeal(mealData, random = false) {

    const meal = document.createElement("div");
    meal.classList.add("meal");

    meal.innerHTML = `
        <div class="meal-header">
            ${random
            ? `
            <span class="random"> Random Recipe </span>`
            : ""
        }
            <img
                src="${mealData.strMealThumb}"
                alt="${mealData.strMeal}"
            />
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
           
            <button class="fav-btn">
            <i class="fas fa-heart"></i>
            </button>
        </div>`

    randomMeals.appendChild(meal);
    const favBtn = document.querySelector('.fav-btn')

    favBtn.addEventListener('click', () => {
        favBtn.classList.contains('active') ?
            (removeMealLS(mealData.idMeal),
                favBtn.classList.remove('active'))
            :
            (addMealLS(mealData.idMeal),
                favBtn.classList.add('active'))
        fetchFavMeals()
    })
    meal.addEventListener('click', () => {
        showMealInfo(mealData)
    })
}

function addMealLS(mealId) {
    const mealIds = getMealsLS();
    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealLS(mealId) {
    const mealIds = getMealsLS();
    localStorage.setItem(
        "mealIds",
        JSON.stringify(mealIds.filter((id) => id !== mealId))
    );
}

function getMealsLS() {
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));
    return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
    //clean the container
    favContainer.innerHTML = ''

    const mealIds = getMealsLS()
    mealIds.forEach(async element => {
        meal = await getMealById(element)
        addMealFav(meal)
    });

}

//add them to the screen
function addMealFav(mealData) {

    const favMeal = document.createElement("li");

    favMeal.innerHTML = `
        <img src="${mealData.strMealThumb}"
        alt="${mealData.strMeal}"><span>${mealData.strMeal}</span>
        <button class='clear'><i class="fa-solid fa-xmark"></i></button>
    `
    const closeBtn = favMeal.querySelector('.clear')
    closeBtn.addEventListener('click', () => {
        removeMealLS(mealData.idMeal)
        fetchFavMeals()
    })
    favContainer.appendChild(favMeal);
    favMeal.addEventListener('click', () =>
        showMealInfo(mealData)
    )
}

function showMealInfo(mealData) {
    // clean it up
    mealInfoEl.innerHTML = "";

    //update the meal info
    const mealEl = document.createElement('div')

    const ingredients = []
    //get ingredients and measures
    for (let i = 1; i <= 20; i++) {
        if (mealData['strIngredient' + i]) {
            ingredients.push(`${mealData['strIngredient' + i]} -
               ${mealData['strMeasure' + i]}`)
        } else {
            break;
        }
    }

    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="">
        <p>${mealData.strInstructions}</p>
        <h3>Ingredients and Measures</h3>
        <ul>
            ${ingredients.map(ing =>
               ` <li>${ing}</li> `
            ).join('')}
        </ul>

    `
    mealInfoEl.appendChild(mealEl)

    //show the popup
    mealPopup.classList.remove('hidden')

}


searchBtn.addEventListener('click', async () => {
    const mealHeading = document.getElementById('heading-meal')
    mealHeading.innerHTML = 'Searched Meals'
    //clean the container
    randomMeals.innerHTML = ''

    const search = searchTerm.value
    const meals = await getMealsBySearch(search)

    if (meals) {
        meals.forEach(meal => {
            addMeal(meal)
        })
    }
})


popupCloseBtn.addEventListener('click', () => {
    mealPopup.classList.add('hidden')

})