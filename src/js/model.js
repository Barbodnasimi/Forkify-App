import { async } from "regenerator-runtime"
import { API_URL, REC_PER_PAGE, KEY } from "./config.js";
//import { getJSON, sendJSON } from "./Helper.js";
import { AJAX } from "./Helper.js";



export const state = {
    recipe: {},
    search: {
        query:'',
        results: [], 
        page: 1,
        resultsPerPage: REC_PER_PAGE
    },
    bookmark :[],
}
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
    try{
        const data = await AJAX(`${API_URL}${id}?key=${KEY}`)
        state.recipe = createRecipeObject(data)

    if(state.bookmark.some(bookmark => bookmark.id === id )){
        state.recipe.bookmarked = true
    }else{
        state.recipe.bookmarked = false
    }
    
} catch(err){
    // Temp error handeling
    console.error(`${err} :]]]]]]]]]]]]]`)
    throw err;
 }
}
export const loadSearchResults = async function (query) {
    try {
        state.search.query = query;

        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`)

       state.search.results = data.data.recipes.map(rec => {
            return {
                id: rec.id,
                title: rec.title, 
                publisher: rec.publisher,
                image: rec.image_url,
                ...(rec.key && { key: rec.key }),
            }
        })
        state.search.page = 1
    }catch(err){
        console.error(`${err} :]]]]]]]]]]]]]`)
        throw err;
    }
}

export const getSearchResultsPage = function(page = state.search.page){
    state.search.page = page

    const start = (page-1) * state.search.resultsPerPage  //0;
    const end =  page * state.search.resultsPerPage //9;

    return state.search.results.slice(start , end)
}

export const updateServings = function (newServings) {
    state.recipe.ingredients.forEach(ing => {
        ing.quantity = ing.quantity * newServings / state.recipe.servings
        // newQt = oldQt * newServings / oldServings // 2 * 8 / 4 = 4
    });


    state.recipe.servings = newServings
}

const persistBookmarks = function () {
    localStorage.setItem('bookmark' , JSON.stringify(state.bookmark))
}

export const addBookmark = function (recipe) {
    // Add bookmark
    state.bookmark.push(recipe);

    // Mark current recipe as bookmarked
    if (recipe.id === state.recipe.id) {
        state.recipe.bookmarked = true
    }
persistBookmarks();
}

export const removeBookmark = function (id) {
    // Remove bookmark
    const index = state.bookmark.findIndex(el => el.id === id)
    state.bookmark.splice(index , 1)

    // Mark current recipe as NOT bookmarked
    if (id === state.recipe.id) {
        state.recipe.bookmarked = false
    }
persistBookmarks();    
}

const init = function(){
const storage = localStorage.getItem('bookmark')
if(storage) state.bookmark = JSON.parse(storage)
}
init()

const clearBookmarks = function () {
    localStorage.clear('bookmark')
}
//clearBookmarks()

export const upLoadRecipe = async function(newRecipe) {
    try{
    const ingredients = Object.entries(newRecipe).filter(entry => entry[0].startsWith('ingredient') && entry[1] !== ''
    ).map(ing => {
        //const ingArr =  ing[1].replaceAll(' ', '').split(',')
        const ingArr =  ing[1].split(',').map(el => el.trim())
        if(ingArr.length !== 3){
            throw new Error(' Wrong ingredient format! Please use the correct format')
        }

        const [quantity, unit, description] = ingArr;
    
        return { quantity: quantity ? +quantity : null, unit, description };
    }) 
    const recipe = {
        title: newRecipe.title,
        source_url: newRecipe.sourceUrl,
        image_url: newRecipe.image,
        publisher: newRecipe.publisher,
        cooking_time: +newRecipe.cookingTime,
        servings: +newRecipe.servings,
        ingredients,
      };
   const data = await AJAX(`${API_URL}?key=${KEY}` , recipe)
      state.recipe = createRecipeObject(data)
      addBookmark(state.recipe)
        }catch(err){
            throw err
        }
}
