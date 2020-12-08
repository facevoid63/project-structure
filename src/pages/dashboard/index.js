import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

import fetchJson from '../../utils/fetch-json.js';
import sidebarNav from '../../utils/sidebar-nav.js';

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
    sidebarNav('dashboard');

    this.updateComponents();
    return this.element;
  }

  loadComponents() {
    const rangePicker = new RangePicker({
      from: this.range.from,
      to: this.range.to,
    });
    const ordersChart = new ColumnChart({
      label: 'Заказы',
      link: '/sales',
      url: '/api/dashboard/orders',
    });
    const salesChart = new ColumnChart({
      label: 'Продажи',
      url: '/api/dashboard/sales',
      formatHeading: (data) => {return '$' + new Intl.NumberFormat('ru').format(data)}
    });
    const customersChart = new ColumnChart({
      label: 'Клиенты',
      url: '/api/dashboard/customers',
    });

    const sortableTable = new SortableTable(header, {
      url: `api/dashboard/bestsellers?_start=1&_end=20&from=${this.range.from.toISOString()}&to=${this.range.to.toISOString()}`,
      isSortLocally: true,
      linkPattern: (data) => `/products/${data.id}`,
    });

    this.components = {
      rangePicker, ordersChart, salesChart, customersChart, sortableTable
    };
  }

  appendComponents() {
    Object.entries(this.components).map(([name, component]) => {
      this.subElements[name].append(component.element);
    });
  }

  async updateComponents(from = this.range.from, to = this.range.to) {
    this.components.ordersChart.update(from, to);
    this.components.salesChart.update(from, to);
    this.components.customersChart.update(from, to);

    const data = await fetchJson(`${process.env.BACKEND_URL}api/dashboard/bestsellers?_start=1&_end=20&from=${from.toISOString()}&to=${to.toISOString()}`);
    this.components.sortableTable.addRows(data);
  }

  get template() {
    return `<div class="dashboard full-height flex-column">
              <div class="content__top-panel">
                <h2 class="page-title">Панель управления</h2>
                <!-- rangepicker -->
                <div data-element="rangePicker"></div>
              </div>
              <div class="dashboard__charts">
                <!-- orders chart -->
                <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                <!-- sales chart -->
                <div data-element="salesChart" class="dashboard__chart_sales"></div>
                <!-- customers chart -->
                <div data-element="customersChart" class="dashboard__chart_customers"></div>
              </div>
              <h3 class="block-title">Лидеры продаж</h3>
              <!-- sortable table -->
              <div data-element="sortableTable"></div>
            </div>`;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      const { from, to } = event.detail;

      this.updateComponents(from, to);
    });
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
