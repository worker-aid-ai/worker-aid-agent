const searchInput = document.querySelector('[data-doc-search]');
const cards = Array.from(document.querySelectorAll('[data-doc-card]'));

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    for (const card of cards) {
      const text = card.textContent.toLowerCase();
      card.hidden = query.length > 0 && !text.includes(query);
    }
  });
}
