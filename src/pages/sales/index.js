import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import sidebarNav from "../../utils/sidebar-nav.js";
import header from "./sales-header";
import fetchJson from "../../utils/fetch-json";

export default class Page {
  async render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();

    this.range = {
      from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      to: new Date(),
    };

    this.loadComponents();
    this.appendComponents();
    this.initEventListeners();
    sidebarNav('sales');

    return this.element;
  }

  loadComponents() {
    const rangePicker = new RangePicker({
      from: this.range.from,
      to: this.range.to,
    });

    const sortableTable = new SortableTable(header, {
      url: `api/rest/orders?createdAt_gte=${this.range.from.toISOString()}&createdAt_lte=${this.range.to.toISOString()}&_sort=createdAt&_order=desc&_start=0&_end=30`
    });

    this.components = {
      rangePicker, sortableTable
    };
  }

  appendComponents() {
    Object.entries(this.components).map(([name, component]) => {
      this.subElements[name].append(component.element);
    });
  }

  async updateComponents(from = this.range.from, to = this.range.to) {
    const data = await fetchJson(`${process.env.BACKEND_URL}api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}&_sort=createdAt&_order=desc&_start=0&_end=30`);
    this.components.sortableTable.addRows(data);
  }

  get template() {
    return `<div class="sales full-height flex-column">
              <div class="content__top-panel">
                <h1 class="page-title">Продажи</h1>
                <div data-element="rangePicker" class="rangepicker"></div>
              </div>
              <div data-element="sortableTable" class="full-height flex-column"></div>
            </div>`;
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
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
