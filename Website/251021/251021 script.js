window.addEventListener('DOMContentLoaded', () => {
  function expand(el) {
    const parent = el.closest('.part');
    if (!parent) return;
    const row = parent.parentElement;
    const all = row.querySelectorAll('.part');

    const isAlreadyExpanded = parent.classList.contains('expanded');

    // collapse all
    all.forEach(item => item.classList.remove('expanded'));

    // if it wasn't already expanded, expand it now
    if (!isAlreadyExpanded) {
      parent.classList.add('expanded');

      // center the expanded element
      const placeholder = parent.querySelector('.part-placeholder');
      const rowRect = row.getBoundingClientRect();
      const elRect = placeholder.getBoundingClientRect();
      const offset = (elRect.left + elRect.width / 2) - (rowRect.left + rowRect.width / 2);
      row.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }

  window.expand = expand;
});


const searchInput = document.getElementById('search');
const parts = document.querySelectorAll('.part');

parts.forEach(part => part.style.display = 'flex');

searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase().trim();

  parts.forEach(part => {
    const tags = (part.dataset.tags || "").toLowerCase().split(",");
    const regex = new RegExp(`\\b${query}`);
    const match = tags.some(tag => regex.test(tag));
    part.style.display = (query === "" || match) ? 'flex' : 'none';
  });
});
