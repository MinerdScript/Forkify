import View from './View.js';
import previewView from './previewView';
import icons from 'url:../../img/icons.svg';

class BookmarksView extends View {
  _parentElement = document.querySelector('.bookmarks__list');
  _errorMessage = 'No bookmarks yet, find a nice recipe to bookmark.';
  _message = '';

  _generateMarkup() {
    return this._data
      .map(bookmark => previewView.render(bookmark, false))
      .join('');
  }

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  _generateMarkupPreview(result) {
    const id = window.location.hash.slice(1);

    return `
    <li class="preview">
            <a class="preview__link ${
              result.id === id ? 'preview__link--active' : ''
            }" href="#${result.id}">
              <figure class="preview__fig">
                <img src="${result.image}" alt="${result.title}" />
              </figure>
              <div class="preview__data">
                <h4 class="preview__title">${result.title}</h4>
                <p class="preview__publisher">${result.publisher}</p>
              </div>
            </a>
          </li>
      `;
  }
  generateDeleteBookmarks() {
    const markup = `
      <div > 
        <button class="btn-delete-bookmarks preview__link">
          <img src="https://img.icons8.com/material-outlined/24/000000/trash--v1.png"/>
          <h1>Delete all bookmarks</h1>
        </button>
      </div>
    `;
    this._parentElement.insertAdjacentHTML('beforeend', markup);
  }
}

export default new BookmarksView();
