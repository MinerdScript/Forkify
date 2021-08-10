import View from './View.js';
import icons from 'url:../../img/icons.svg';

class AddNewIngredient extends View {
  _parentElement = document.querySelector('.ingredients');
  _btnAddIngredients = document.querySelector('.btn--increase-ingredients');
  _ingredients = 6;

  addHandlerAddIngredient(handler) {
    this._btnAddIngredients.addEventListener('click', function (e) {
      console.log('a');
      e.preventDefault();
      handler();
    });
  }

  renderAdd(ingredients) {
    this._ingredients++;
    const markup = this.render(this._ingredients, false);
    this._parentElement.insertAdjacentHTML('beforeend', markup);
  }

  _generateMarkup() {
    return `
  <label>Ingredient ${this._ingredients}</label>
  <input
    type="text"
    name="ingredient-${this._ingredients}"
    placeholder="Format: 'Quantity,Unit,Description'"
  />`;
  }
}

export default new AddNewIngredient();
