const header = [
  {
    id: 'images',
    title: 'Фото',
    sortable: false,
    template: data => {
      const url = (data[0]) ? data[0].url : '';

      return `
          <div class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="${url}">
          </div>
        `;
    }
  },
  {
    id: 'title',
    title: 'Название',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'subcategory',
    title: 'Категория',
    sortable: false,
    template: data => `<div class="sortable-table__cell">${data.title}</div>`,
  },
  {
    id: 'quantity',
    title: 'Количество',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'price',
    title: 'Цена',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'status',
    title: 'Статус',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `<div class="sortable-table__cell">
          ${data > 0 ? 'Активен' : 'Неактивен'}
        </div>`;
    }
  },
];

export default header;
