export default class RangePicker {
  element;
  subElements;
  range;
  selectState = {
    from: true,
    to: true,
  };
  currentShownDates = {};
  rangepickerOpenClass = 'rangepicker_open';
  rangepickerCellClass = {
    from: 'rangepicker__selected-from',
    to: 'rangepicker__selected-to',
    between: 'rangepicker__selected-between',
  };
  timezoneOffset = (new Date()).getTimezoneOffset() * 60000;

  formatInputDate = (date) => {
    return date.toLocaleString('ru', {dateStyle: 'short'});
  }

  eventHandlerToggleRangepicker = () => {
    this.element.classList.toggle(this.rangepickerOpenClass);
    this.updateCalendar(this.currentShownDates.from, this.currentShownDates.to);
  }

  eventHandlerCloseRangepicker = (e) => {
    if (!e.target.closest('.rangepicker') && this.element.classList.contains('rangepicker_open'))
      this.element.classList.remove('rangepicker_open');
  }

  behaviorRangePick = (e) => {
    const target = e.target;

    if (!target.classList.contains('rangepicker__cell'))
      return;

    const dateValue = new Date(target.dataset.value);

    if (this.isRangeSelected()) {
      this.selectState.to = false;

      this.range.from = new Date(new Date(dateValue).getTime() + this.timezoneOffset);
      this.clearSelection();
      target.classList.add(this.rangepickerCellClass.from);

      return;
    }

    if (this.selectState.to === false) {
      this.selectState.to = true;

      this.range.to = new Date(new Date(dateValue).getTime() + this.timezoneOffset);
      target.classList.add(this.rangepickerCellClass.to);
      this.element.classList.toggle(this.rangepickerOpenClass);
      this.updateDateInput();

      this.element.dispatchEvent(new CustomEvent('date-select', {
        bubbles: true,
        detail: {
          from: this.range.from,
          to: this.range.to,
        }
      }));
    }
  }

  previousMonth = () => {
    const dateFrom = this.currentShownDates.from;

    this.currentShownDates.to = this.currentShownDates.from;
    this.currentShownDates.from = new Date(dateFrom.getFullYear(), dateFrom.getMonth() - 1, dateFrom.getDate());


    this.updateCalendar(this.currentShownDates.from, this.currentShownDates.to);
  }

  nextMonth = () => {
    const dateTo = this.currentShownDates.to;

    this.currentShownDates.from = this.currentShownDates.to;
    this.currentShownDates.to = new Date(dateTo.getFullYear(), dateTo.getMonth() + 1, dateTo.getDate());

    this.updateCalendar(this.currentShownDates.from, this.currentShownDates.to);
  }

  constructor({
                from = new Date(),
                to = new Date(),
              } = {}) {
    this.range = {
      from: from,
      to: to,
    };

    this.currentShownDates.from = from;
    this.currentShownDates.to = to;

    this.render();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.initEventListeners();
  }

  get template() {
    return `<div class="rangepicker">
              <div class="rangepicker__input rangepicker_open" data-element="input">
                ${this.getDateInput()}
              </div>
              <div class="rangepicker__selector" data-element="selector"></div>
            </div>`;
  }

  getDateInput() {
    return Object.entries(this.range).map(([key, val]) => {
      return `<span data-element="${key}">${this.formatInputDate(val)}</span>`;
    }).join(' - ');
  }

  updateDateInput() {
    this.subElements.input.innerHTML = this.getDateInput();
  }

  updateCalendar(from, to) {
    if (from.getMonth() === to.getMonth())
      to = new Date(to.getFullYear(), to.getMonth() + 1, to.getDate());

    this.subElements.selector.innerHTML = `${this.getCalendarNav()}
                                           ${this.getCalendarMonth(from)}
                                           ${this.getCalendarMonth(to)}`;

    this.subElements.selector.querySelector('.rangepicker__selector-control-left').addEventListener('click', this.previousMonth);
    this.subElements.selector.querySelector('.rangepicker__selector-control-right').addEventListener('click', this.nextMonth);
  }

  getCalendarNav() {
    return `<div class="rangepicker__selector-arrow"></div>
            <div class="rangepicker__selector-control-left"></div>
            <div class="rangepicker__selector-control-right"></div>`;
  }

  getCalendarMonth(date) {
    let monthName = date.toLocaleDateString('ru', {month: 'long'});
    monthName = monthName[0].toUpperCase() + monthName.substr(1);

    return `<div class="rangepicker__calendar">
              <div class="rangepicker__month-indicator">
                <time datetime="${monthName}">${monthName}</time>
              </div>
              <div class="rangepicker__day-of-week">${this.getCalendarWeek()}</div>
              <div class="rangepicker__date-grid">${this.getCalendarDays(date)}</div>
            </div>`;
  }

  getCalendarWeek() {
    const daysOfWeek = new Array(7)
      .fill(1)
      .map((item, index) =>
        new Date(new Date(2020, 5, index + 1)).toLocaleString('ru', { weekday: 'short'}));

    return daysOfWeek.map(item => `<div>${item[0].toUpperCase() + item.substr(1)}</div>`).join('');
  }

  getCalendarDays(date) {
    const curMonth = date.getMonth();
    const curYear = date.getFullYear();
    const lastDay = new Date(curYear, curMonth + 1, 0).getDate();
    let startDay = new Date(curYear, curMonth, 1).getDay();
    const arReturn = [];

    if (startDay === 0)
      startDay = 7;

    for (let i = 1; i <= lastDay; i++) {
      const iterationDate = new Date(curYear, curMonth, i);
      const selectClass = this.getCalendarDaySelectClass(iterationDate);
      const startFrom = (i === 1) ? `style="--start-from: ${startDay}"` : '';

      arReturn.push(`<button type="button"
                             class="rangepicker__cell${selectClass}"
                             data-value="${new Date(iterationDate.getTime() - this.timezoneOffset).toISOString()}"
                             ${startFrom}>${i}</button>`);
    }

    return arReturn.join('');
  }

  getCalendarDaySelectClass(date) {
    this.resetTime(this.range.from);
    this.resetTime(this.range.to);

    const dateTimestamp = date.getTime();
    const fromTimestamp = this.range.from.getTime();
    const toTimestamp = this.range.to.getTime();

    if (dateTimestamp === fromTimestamp)
      return ` ${this.rangepickerCellClass.from}`;

    if (dateTimestamp > fromTimestamp && dateTimestamp < toTimestamp)
      return ` ${this.rangepickerCellClass.between}`;

    if (dateTimestamp === toTimestamp)
      return ` ${this.rangepickerCellClass.to}`;

    return '';
  }

  resetTime(date) {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners() {
    this.subElements.input.addEventListener('click', this.eventHandlerToggleRangepicker);
    document.addEventListener('click', this.eventHandlerCloseRangepicker, true);
    document.addEventListener('click', this.behaviorRangePick);
  }

  isRangeSelected() {
    return (this.selectState.from === true && this.selectState.to === true);
  }

  clearSelection() {
    this.subElements.selector.querySelectorAll('.rangepicker__cell').forEach(element => {
      element.classList.remove(this.rangepickerCellClass.from);
      element.classList.remove(this.rangepickerCellClass.to);
      element.classList.remove(this.rangepickerCellClass.between);
    });
  }

  remove() {
    this.element.remove();

    document.removeEventListener('click', this.eventHandlerCloseRangepicker, true);
    document.removeEventListener('click', this.behaviorRangePick);
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.selectState = {
      from: true,
      to: true,
    };
    this.range = {
      from: new Date(),
      to: new Date()
    };
    this.currentShownDates = {};

    return this;
  }
}
