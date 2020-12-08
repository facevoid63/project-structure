import fetchJson from '../../utils/fetch-json.js';
const API_URL = `https://course-js.javascript.ru/`;

export default class ColumnChart {
  chartHeight = 50;

  constructor({
                label = '',
                link = '',
                url = '',
                range = {
                  from: new Date(),
                  to: new Date(),
                },
                formatHeading = data => data,
              } = {}) {
    this.label = label;
    this.link = link;
    this.url = new URL(url, API_URL);
    this.range = range;
    this.formatHeading = formatHeading;

    this.render();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart">
          </div>
        </div>
      </div>
    `;
  }

  getLink() {
    return (this.link !== '') ? `<a href="${this.link}" class="column-chart__link">Подробнее</a>` : '';
  }

  getBody(data) {
    const columnProps = this.getColumnProps(data);

    return columnProps.map(obj => {
      const tooltip = `<span>
        <small>${obj.date.toLocaleString('ru', {dateStyle: 'medium'})}</small>
        <br>
        <strong>${obj.percent}%</strong>
      </span>`;

      return `<div style="--value: ${obj.percent}" data-tooltip="${tooltip}"></div>`
    }).join('');
  }

  getValue(data) {
    const value = Object.values(data).reduce((accum, value) => {
      return accum + value;
    }, 0);

    return this.formatHeading(value);
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  async update(from = this.range.from, to = this.range.to) {
    this.range.from = from;
    this.range.to = to;

    this.loading();

    const data = await this.apiRequest();

    this.subElements.header.innerHTML = this.getValue(data);
    this.subElements.body.innerHTML = this.getBody(data);

    this.loaded();
  }

  async apiRequest() {
    this.url.searchParams.set('from', this.range.from.toISOString());
    this.url.searchParams.set('to', this.range.to.toISOString());

    return await fetchJson(this.url);
  }

  getColumnProps(data) {
    const maxValue = Math.max(...Object.values(data));
    const scale = 50 / maxValue;

    return Object.entries(data).map(([key, value]) => {
      return {
        date: key,
        percent: String(Math.floor(value * scale)),
      };
    });
  }

  loading() {
    this.element.classList.add('column-chart_loading');
  }

  loaded() {
    this.element.classList.remove('column-chart_loading');
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
