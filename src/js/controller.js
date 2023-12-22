//import { async } from 'regenerator-runtime';
import * as model from './model.js'
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeViews.js';
import searchView from './views/searchView.js'
import resultsView from './views/resultsView.js'
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';

import 'core-js/stable'
import 'regenerator-runtime/runtime'
import addRecipeView from './views/addRecipeView.js';

// if(model.hot){
//   model.hot.accept();
// }

const recipeContainer = document.querySelector('.recipe');


const controlRecipes = async function () {
    try{
      const id = window.location.hash.slice(1)

      if(!id) return;
      recipeView.renderSpinner()
      // 0)  Update results view to mark selected search result
      resultsView.update(model.getSearchResultsPage());
      
      // 1) Updating bookmarks view
      bookmarksView.update(model.state.bookmark)

      // 2) Loading recipe
     await model.loadRecipe(id)

    // 3) Rendering recipe
      recipeView.render(model.state.recipe)

    
   
    }catch(err){
      console.log(err);
        recipeView.renderError()
    }
}



const controlSearchResults = async function () {
  try{
    resultsView.renderSpinner();

    // 1) Get search query
    const query = searchView.getQuery()
    if(!query) return;

    // 2) Load search results
  await  model.loadSearchResults(query)

    // 3) Render results
    //resultsView.render(model.state.search.results)
  resultsView.render(model.getSearchResultsPage());

  //4) Render initial pagination buttons
  paginationView.render(model.state.search)
  }catch(err){
    console.log(err);
  }
}


const controlPagination = function (goTopage) {
   // 1) Render New results
    //resultsView.render(model.state.search.results)
    resultsView.render(model.getSearchResultsPage(goTopage));

    // 2) Render New pagination buttons
    paginationView.render(model.state.search)
}

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings)


  // Update the recipe view
  //recipeView.render(model.state.recipe)
  recipeView.update(model.state.recipe)
  
}

const controlAddBookmark = function(){
  // 1) Add/remove bookmark
  if (!model.state.recipe.bookmarked)
  {model.addBookmark(model.state.recipe)
  }
else{
  model.removeBookmark(model.state.recipe.id)
}
   // 2) Update recipe view 
  recipeView.update(model.state.recipe)

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmark)
}

const controlBookmark = function () {
  bookmarksView.render(model.state.bookmark)
}

 const controlAddRecipe = async function (newRecipe) {
  try{
    // Show loading spinner
    addRecipeView.renderSpinner()

    // Upload the new recipe data
   await model.upLoadRecipe(newRecipe)
  
   // Render recipe
   recipeView.render(model.state.recipe);

    // Success message 
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmark)

    // Change ID in URL
    window.history.pushState(null , '' , `${model.state.recipe.id}`)
    
   // Close form window
   setTimeout(function() {
    addRecipeView.toggleWindow()
   }, MODAL_CLOSE_SEC * 1000)
  }catch(err){
    console.error(err , ':}}}}}}}}}}}}}}}}}}}}}');
    addRecipeView.renderError(err.message)
  }

  
}

const init = function () {
  bookmarksView.addHandlerRender(controlBookmark)
  recipeView.addHandlerRender(controlRecipes)
  recipeView.addHandlerUpdateServings(controlServings)
  recipeView.addHandlerAddBookmark(controlAddBookmark)
  searchView.addHandlerSearch(controlSearchResults)
  paginationView.addHandlerClick(controlPagination)
  addRecipeView.addHandlerUpload(controlAddRecipe)
}
init();
    