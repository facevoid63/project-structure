export default class NotificationMessage {
  static existedElement = null;

  constructor(mes = '',
              {
                duration = 1000,
                type = 'success',
              } = {})
  {
    this.duration = duration;
    this.type = type;
    this.message = mes;

    this.render();
  }

  get template() {
    return `<div class="notification notification_${this.type} show" style="--value:${this.duration / 1000}s">
              <div class="notification__content">${this.message}</div>
            </div>`;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;

    this.element = element.firstElementChild;
  }

  show(target = document.body) {
    if (NotificationMessage.existedElement)
      NotificationMessage.existedElement.remove();

    target.append(this.element);
    NotificationMessage.existedElement = this.element;

    setTimeout(() => this.remove(), this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
