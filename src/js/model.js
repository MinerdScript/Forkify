import { async } from 'regenerator-runtime';
import {
  API_KEY,
  API_URL,
  RES_PER_PAGE,
  API_NUTR_URL,
  API_NUTR_KEY,
} from './config.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    image: recipe.image_url,
    sourceUrl: recipe.source_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

//get the id of each ingredient
const loadIdIng = async function (ingredient) {
  try {
    const dataIng = await AJAX(
      `${API_NUTR_URL}search?query=${ingredient.description}&${API_NUTR_KEY}`
    );
    if (!dataIng) throw new Error();
    const ingOnData = dataIng.results.find(
      ing => ing.name === ingredient.description
    );
    if (!ingOnData) return;
    const id = ingOnData.id;
    return id;
  } catch (err) {
    throw err;
  }
};

//get the calories of each ingredient
const loadCalIng = async function (ing) {
  try {
    if (!ing.id) return;
    const dataCal = await AJAX(
      `${API_NUTR_URL}${ing.id}/information?amount=${ing.quantity}&unit=${ing.unit}&${API_NUTR_KEY}`
    );
    if (!dataCal) throw new Error();
    ing.calories = dataCal.nutrition.nutrients.find(
      nutrient => nutrient.title === 'Calories'
    );
    ing.calories = ing.calories.amount;
    return ing.calories;
  } catch (err) {
    throw err;
  }
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}`);
    state.recipe = createRecipeObject(data);

    (async function () {
      try {
        //Nutrition information using spoonacular API
        const objIng = state.recipe.ingredients.map(ingredient => {
          const ingredientObject = {
            description: ingredient.description.toLowerCase(),
            quantity: +ingredient.quantity,
            unit: ingredient.unit.toLowerCase(),
          };
          return ingredientObject;
        });

        //Gets ingredient's ID
        await Promise.all(objIng.map(loadIdIng)).then(values => {
          for (const [i, ing] of objIng.entries()) {
            ing.id = values[i];
          }
        });

        //Gets ingredient's calories
        await Promise.all(objIng.map(loadCalIng)).then(values => {
          for (const [i, ing] of objIng.entries()) {
            console.log(values);
            ing.calories = values[i];
          }
        });
        for (const [i, ingredient] of state.recipe.ingredients.entries()) {
          state.recipe.ingredients[i].calories = objIng[i].calories;
        }
      } catch (error) {}
    });

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&${API_KEY}`);
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  //Add bookmark
  state.bookmarks.push(recipe);

  //Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  persistBookmarks();
};

export const deleteBookmark = function (id) {
  //if it is 2, it will remove the deleteAllBookmarks button, if it is 1, it will render it
  let deleteAll;
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  //Mark current recipe as NOT bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  persistBookmarks();
  if (state.bookmarks.length === 0) {
    deleteAll = 2;
  } else {
    deleteAll = 1;
  }
  return deleteAll; //it will be saved on "deleteAll" at controller.js, to choose the mode that will remove the deleteAllBookmarks button (if it is === 2)
};

export const deleteAllBookmarks = function () {
  let i = state.bookmarks.length;
  while (i) {
    state.bookmarks.pop();
    i--;
  }
  clearBookmarks();
  if (state.recipe.bookmarked) {
    state.recipe.bookmarked = false;
  }
};

const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

//Clear bookmarks from local storage
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};

export const sortSearch = function () {
  console.log(state);
  state.search.results.sort((A, B) => {
    for (let i = 0; i < A.title.length; i++) {
      if (A.title[i] > B.title[i]) return 1;
      if (B.title[i] > A.title[i]) return -1;
    }
    return -1;
  });
};

export const uploadRecipes = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());

        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient format, please use the correct form.'
          );
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
