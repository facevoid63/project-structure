export default function (page) {
  const links = document.querySelectorAll('[data-page]');

  for (const link of links) {
    link.closest('li').classList.remove('active');

    if (link.dataset.page === page) {
      link.closest('li').classList.add('active');
    }
  }
}
