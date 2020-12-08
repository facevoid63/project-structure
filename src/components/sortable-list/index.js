export default class SortableList {
  element;
  dragElement;
  placeholderElement;
  dragShift;
  listOrderChanged;

  onDragStart = event => {
    event.preventDefault();

    if (event.which !== 1)
      return;

    const dragElement = event.target.closest('.sortable-list__item');

    if (!event.target.closest('[data-grab-handle]') || !dragElement)
      return;

    this.listOrderChanged = false;
    this.dragElement = dragElement;

    const dimensions = this.dragElement.getBoundingClientRect();

    this.dragShift = {
      x: event.clientX - dimensions.left,
      y: event.clientY - dimensions.top,
    };

    this.placeholderElement = this.getPlaceholder(dimensions);

    this.dragElement.classList.add('sortable-list__item_dragging');
    this.dragElement.style.width = `${dimensions.width}px`;
    this.dragElement.style.height = `${dimensions.height}px`;
    this.dragElement.replaceWith(this.placeholderElement);
    this.element.append(this.dragElement);
    this.dragTo(event.clientX, event.clientY);

    document.addEventListener('pointermove', this.onDrag);
    document.addEventListener('pointerup', this.onDragStop);
  }

  onDrag = event => {
    this.dragTo(event.clientX, event.clientY);

    const prevElement = this.placeholderElement.previousElementSibling;
    const nextElement = this.placeholderElement.nextElementSibling;

    if (prevElement) {
      const prevElementMiddle = prevElement.getBoundingClientRect().top + prevElement.getBoundingClientRect().height / 2;

      if (event.clientY < prevElementMiddle) {
        prevElement.before(this.placeholderElement);
        this.listOrderChanged = true;
        return;
      }
    }

    if (nextElement) {
      const nextElementMiddle = nextElement.getBoundingClientRect().top + nextElement.getBoundingClientRect().height / 2;

      if (event.clientY > nextElementMiddle) {
        nextElement.after(this.placeholderElement);
        this.listOrderChanged = true;
        return;
      }
    }
  }

  onDragStop = () => {
    this.dragElement.style.cssText = '';
    this.dragElement.classList.remove('sortable-list__item_dragging');
    this.placeholderElement.replaceWith(this.dragElement);

    if (this.listOrderChanged)
      this.element.dispatchEvent(new CustomEvent('list-sorted', {bubbles: true}));

    this.removeEventListeners();
  }

  deleteHandle = event => {
    if (!event.target.closest('[data-delete-handle]'))
      return;

    const element = event.target.closest('.sortable-list__item');

    if (element)
      element.remove();
  }

  constructor({items = []} = {}) {
    this.items = items;

    this.render();
    this.initEventListeners();
  }

  dragTo(coordX, coordY) {
    this.dragElement.style.left = coordX - this.dragShift.x + 'px';
    this.dragElement.style.top = coordY - this.dragShift.y + 'px';
  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.deleteHandle, true);
    this.element.addEventListener('pointerdown', this.onDragStart);
  }

  removeEventListeners() {
    document.removeEventListener('pointermove', this.onDrag);
    document.removeEventListener('pointerup', this.onDragStop);
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
  }

  get template() {
    return `<ul class="sortable-list">${this.getList()}</ul>`
  }

  getList() {
    return this.items.map(item => {
      item.classList.add('sortable-list__item');

      return item.outerHTML;
    }).join('')
  }

  getPlaceholder(dimensions) {
    const element = document.createElement('div');
    element.classList.add('sortable-list__placeholder');
    element.style.width = dimensions.width + 'px';
    element.style.height = dimensions.height + 'px';

    return element;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
  }
}
