import Categories from "../../components/categories";
import NotificationMessage from "../../components/notification";
import sidebarNav from "../../utils/sidebar-nav";
import fetchJson from "../../utils/fetch-json";

export default class Page {
  components = {};

  onCategoryUpdate = async event => {
    const options = {
      method: 'PATCH',
      body: JSON.stringify(event.detail),
      headers: {
        'Content-type': 'application/json',
      }
    }

    const response = await fetchJson(new URL('api/rest/subcategories', process.env.BACKEND_URL), options);

    if (response) {
      const notification = new NotificationMessage('Category order saved', {duration: 2000});
      notification.show();
    }
  }

  async render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();

    await this.loadComponents();
    this.initEventListeners();
    sidebarNav('categories');

    return this.element;
  }

  async loadComponents() {
    const categories = new Categories(new URL('api/rest/categories?_sort=weight&_refs=subcategory', process.env.BACKEND_URL));

    this.components.categories = categories;

    const categoriesElements = await categories.render();
    for (const categoriesElement of categoriesElements)
      this.subElements.categories.append(categoriesElement);
  }

  get template() {
    return `<div class="categories">
              <div class="content__top-panel">
                <h1 class="page-title">Категории товаров</h1>
              </div>
              <div data-element="categories"></div>
            </div>`;
  }

  initEventListeners() {
    document.addEventListener('categories-updated', this.onCategoryUpdate);
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
