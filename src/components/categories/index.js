import SortableList from "../sortable-list";
import fetchJson from '../../utils/fetch-json.js';

export default class Categories {

  onHeaderClick = (event) => {
    if (event.target.closest('.category__header')) {
      event.target.closest('.category').classList.toggle('category_open');
    }
  }

  constructor(url = '') {
    this.url = url;
  }

  onSortList() {
    const categories = this.querySelector('.sortable-list').childNodes;
    const eventDetail = [];

    categories.forEach((item, index)=> {
      const subcategory = {
        id: item.dataset.id,
        weight: index + 1,
      }

      eventDetail.push(subcategory);
    });

    this.dispatchEvent(new CustomEvent('categories-updated', {
      bubbles: true,
      detail: eventDetail,
    }));
  }

  async render() {
    this.element = await this.getCategories();
    this.initEventListeners();

    return this.element;
  }

  async getCategories() {
    const categoriesData = await fetchJson(this.url);

    if (categoriesData) {
      return Object.values(categoriesData).map(category => {
        const categoryBody = document.createElement('div');
        categoryBody.innerHTML = `<div class="category category_open" data-id="${category.id}">
                                    <header class="category__header">${category.title}</header>
                                    <div class="category__body">
                                      <div class="subcategory-list"></div>
                                    </div>
                                  </div>`;

        categoryBody.querySelector('.subcategory-list').append(this.getSubCategories(category.subcategories));

        return categoryBody.firstElementChild;
      });
    }
  }

  getSubCategories(categories) {
    const items = Object.values(categories).map(subcategory => {
      const wrapper = document.createElement('div');

      wrapper.innerHTML = `
        <li class="categories__sortable-list-item" data-grab-handle data-id="${subcategory.id}">
          <strong>${subcategory.title}</strong>
          <span><b>${subcategory.count}</b> товаров</span>
        </li>`;

      return wrapper.firstElementChild;
    });

    const sortableList = new SortableList({items});

    return sortableList.element;
  }

  initEventListeners() {
    document.addEventListener("click", this.onHeaderClick);
    this.element.forEach(item => {
      item.addEventListener('list-sorted', this.onSortList);
    });
  }

  removeEventListeners() {
    document.removeEventListener("click", this.onHeaderClick);
  }

  destroy() {
    this.element = null;
    this.removeEventListeners();
  }
}
