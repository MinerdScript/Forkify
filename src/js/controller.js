import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config';
import recipeView from './views/recipeView';
import searchView from './views/searchView';
import resultsView from './views/resultsView';
import paginationView from './views/paginationView';
import bookmarksView from './views/bookmarksView';
import addRecipeView from './views/addRecipeView';
import addNewIngredient from './views/addNewIngredient';

//Icons from SVG
import icons from 'url:../img/icons.svg';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

//Makes the page stop reloading everytime you save anything, from parcel
// if (module.hot) {
//   module.hot.accept();
// }

//Fix SVG parcel problem
const fixSvgSprite = function () {
  const arrayAttributes = [
    'icon-search',
    'icon-edit',
    'icon-bookmark',
    'icon-smile',
    'icon-alert-circle',
    'icon-plus-circle',
    'icon-upload-cloud',
  ];

  const svgSprites = document.querySelectorAll('use');

  let i = 0;
  svgSprites.forEach(spr => {
    spr.setAttribute('href', `${icons}#${arrayAttributes[i]}`);
    i++;
  });
};
fixSvgSprite();

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();

    //Update views
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    //1) Loading recipe
    await model.loadRecipe(id);
    const { recipe } = model.state;

    //2) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    //Get search query
    const query = searchView.getQuery();

    //Load search results
    await model.loadSearchResults(query);

    resultsView.render(model.getSearchResultsPage(1));

    //Render pagination buttons
    if (model.state.search.query) paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //Render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //Render new pagination buttons
  paginationView.render(model.state.search);
};

const controlSort = function () {
  model.sortSearch();

  console.log(model.state.search);

  resultsView.render(model.getSearchResultsPage(model.state.search.page));
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  model.updateServings(newServings);

  recipeView.update(model.state.recipe);
};

const controllAddBookmark = function () {
  let deleteAll;

  //Add/remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
    deleteAll = 1;
  } else {
    deleteAll = model.deleteBookmark(model.state.recipe.id);
  }

  //Update recipe view
  recipeView.update(model.state.recipe);

  //Render bookmarks
  bookmarksView.render(model.state.bookmarks);

  //Create deleteAllBookmarks button
  if (deleteAll === 1) {
    bookmarksView.generateDeleteBookmarks();
    //Add the event to the button
    bookmarksView.addHandlerClickDelBookmakrs(controlDelBookmarks);
  }

  //Remove deleteAllBookmarks button
  if (deleteAll === 2) bookmarksView.removeDelBookmarksButton();
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
  if (model.state.bookmarks.length) {
    bookmarksView.generateDeleteBookmarks();
    bookmarksView.addHandlerClickDelBookmakrs(controlDelBookmarks);
  }
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //If some ingredient is on wrong format
    let wrongIngredient = [];
    for (const [key, value] of Object.entries(newRecipe)) {
      if (key.startsWith('ingredient') && value) {
        const string = value.split(',');
        console.log(string);
        if (string.length !== 3 || string[2] === '')
          wrongIngredient.push(key.slice(-1));
      }
    }
    if (wrongIngredient.length !== 0) {
      addRecipeView.ingBadFormat(wrongIngredient);
      return;
    }

    addRecipeView.renderSpinner();

    await model.uploadRecipes(newRecipe);

    //render recipe
    recipeView.render(model.state.recipe);

    //Sucess message
    addRecipeView.renderMessage();

    //Render the bookmark view
    bookmarksView.render(model.state.bookmarks);

    //Change ID in the url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //Close form window
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
  setTimeout(function () {
    addRecipeView.hideWindow();
    addRecipeView.render(1);
    addNewIngredient.resetVariables(controlAddIngredient);
  }, MODAL_CLOSE_SEC * 1000);
};

const controlAddIngredient = function () {
  addNewIngredient.renderAdd();
};

const controlDelBookmarks = function () {
  model.deleteAllBookmarks();

  bookmarksView.render(model.state.bookmarks);

  //Updates in case the current recipe was bookmarked
  recipeView.update(model.state.recipe);
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controllAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination, controlSort);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  addNewIngredient.addHandlerAddIngredient(controlAddIngredient);
};
init();
