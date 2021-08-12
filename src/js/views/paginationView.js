import View from './View.js';
import icons from 'url:../../img/icons.svg'; // Parcel 2

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler, sortController) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      const sort = e.target.closest('.btn--sort');
      if (sort) {
        sortController();
        return;
      }
      if (!btn) return;

      const goToPage = +btn.dataset.goto;
      handler(goToPage, btn);
    });
  }

  _generateMarkup() {
    const currPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );

    // Page 1, and there are other pages
    if (currPage === 1 && numPages > 1) {
      return `
      <div></div>
      <div class="n-pages">
        Page ${currPage} of ${numPages}
      </div>
      <button data-goto="${
        currPage + 1
      }" class="btn--inline pagination__btn--next">
        <span>Page ${currPage + 1}</span>
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-right"></use>
        </svg>
      </button>
      <div></div>
      <button class="btn--inline btn--sort">
        Sort
      </button>
      `;
    }

    // Last page
    if (currPage === numPages && numPages > 1) {
      return `
        <button data-goto="${
          currPage - 1
        }" class="btn--inline pagination__btn--prev">
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
          </svg>
          <span>Page ${currPage - 1}</span>
        </button>
        <div class="n-pages">
          Page ${currPage} of ${numPages}
        </div>
        <div></div>
        <div></div>
        <button class="btn--inline btn--sort">
          Sort
        </button>
      `;
    }

    // Other page
    if (currPage < numPages) {
      return `
        <button data-goto="${
          currPage - 1
        }" class="btn--inline pagination__btn--prev">
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-left"></use>
          </svg>
          <span>Page ${currPage - 1}</span>
        </button>
        <div class="n-pages">
          Page ${currPage} of ${numPages}
        </div>
        <button data-goto="${
          currPage + 1
        }" class="btn--inline pagination__btn--next">
          <span>Page ${currPage + 1}</span>
          <svg class="search__icon">
            <use href="${icons}#icon-arrow-right"></use>
          </svg>
        </button>
        <div></div>
        <button class="btn--inline btn--sort">
          Sort
        </button>
      `;
    }

    // Page 1, and there are NO other pages
    return `
    <div></div>
    <div class="n-pages">
      Page ${currPage} of ${numPages}
    </div>
    <div></div>
    <div></div>
    <button class="btn--inline btn--sort">
      Sort
    </button>`;
  }
}

export default new PaginationView();
