import View from './View.js';
import icons from 'url:../../img/icons.svg';

class AddNewIngredient extends View {
  constructor() {
    super();
    this._parentElement = document.querySelector('.ingredients');
    this._ingredients = 6;
    this._btnAddIngredients = document.querySelector(
      '.btn--increase-ingredients'
    );
  }

  addHandlerAddIngredient(handler) {
    this._btnAddIngredients.addEventListener('click', function (e) {
      e.preventDefault();
      handler();
    });
  }

  renderAdd(ingredients) {
    this._ingredients++;
    const markup = this.render(this._ingredients, false);
    this._parentElement.insertAdjacentHTML('beforeend', markup);
  }

  resetVariables(handler) {
    this._parentElement = document.querySelector('.ingredients');
    this._ingredients = 6;
    this._btnAddIngredients = document.querySelector(
      '.btn--increase-ingredients'
    );
    this.addHandlerAddIngredient(handler);
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
