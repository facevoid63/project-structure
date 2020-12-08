import SortableTable from "../../../components/sortable-table";
import fetchJson from "../../../utils/fetch-json";
import sidebarNav from '../../../utils/sidebar-nav.js';
import header from "./products-list-header";

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
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
    return `<div class="products-list">
              <div class="content__top-panel">
                <h1 class="page-title">Товары</h1>
                <a href="/products/add" class="button-primary">Добавить товар</a>
              </div>
              <div class="content-box content-box_small">
                <form class="form-inline">
                  <div class="form-group">
                    <label class="form-label">Сортировать по:</label>
                    <input type="text" data-elem="filterName" class="form-control" placeholder="Название товара">
                  </div>
                  <div class="form-group" data-elem="sliderContainer">
                    <label class="form-label">Цена:</label>
                    <div class="range-slider">
                      <span data-elem="from">$0</span>
                      <div data-elem="inner" class="range-slider__inner">
                        <span data-elem="progress" class="range-slider__progress" style="left: 0%; right: 0%;"></span>
                        <span data-elem="thumbLeft" class="range-slider__thumb-left" style="left: 0%;"></span>
                        <span data-elem="thumbRight" class="range-slider__thumb-right" style="right: 0%;"></span>
                      </div>
                      <span data-elem="to">$4000</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label class="form-label">Статус:</label>
                    <select class="form-control" data-elem="filterStatus">
                      <option value="" selected="">Любой</option>
                      <option value="1">Активный</option>
                      <option value="0">Неактивный</option>
                    </select>
                  </div>
                </form>
              </div>
              <!-- sortable table -->
              <div data-element="productsContainer" class="products-list__container"></div>
            </div>`;
  }

  initComponents() {
    this.components.sortableTable = new SortableTable(header, {
      url: `/api/rest/products?_embed=subcategory.category&_sort=title&_order=asc&_start=0&_end=30`,
    });
  }

  async renderComponents() {
    await this.components.sortableTable.render();

    this.subElements.productsContainer.append(this.components.sortableTable.element);
  }

  async updateComponents() {
    const tableUrl = new URL('/api/rest/products', process.env.BACKEND_URL);
    tableUrl.searchParams.set('_embed', 'subcategory.category');
    tableUrl.searchParams.set('_sort', 'title');
    tableUrl.searchParams.set('_order', 'asc');
    tableUrl.searchParams.set('_start', '0');
    tableUrl.searchParams.set('_end', '30');

    this.components.sortableTable.bodyData = await fetchJson(tableUrl);
    this.components.sortableTable.sort();
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
