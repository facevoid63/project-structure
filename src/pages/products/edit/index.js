import ProductForm from "../../../components/product-form";
import sidebarNav from '../../../utils/sidebar-nav.js';

export default class Page {
  element;
  subElements = {};
  components = {};
  productId;

  async render() {
    const path = decodeURI(window.location.pathname).replace(/^\/|\/$/, '');
    const arPath = path.split('/');

    if (arPath.length > 0 && arPath[arPath.length - 1] !== 'add') {
      this.productId = arPath[arPath.length - 1];
    }

    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.initComponents();
    await this.renderComponents();
    sidebarNav('products');

    return this.element;
  }

  get template() {
    return `<div class="products-edit">
      <div class="content__top-panel">
        <h1 class="page-title">
          <a href="/products" class="link">Товары</a> / ${this.getSubtitle()}
        </h1>
      </div>
      <div data-element="productForm" class="content-box"></div>
    </div>`;
  }

  getSubtitle() {
    return (this.productId) ? 'Редактировать' : 'Добавить';
  }

  initComponents() {
    this.components.productForm = new ProductForm(this.productId);
  }

  async renderComponents() {
    const element = await this.components.productForm.render();

    this.subElements.productForm.append(element);
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
