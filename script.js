console.log("Script loaded");

// script.js - consolidated and defensive
window.addEventListener('DOMContentLoaded', () => {

  // safe logger helper
  const safeLog = (label, err) => {
    if (err) console.error(`[script.js] ${label}`, err);
    else console.log(`[script.js] ${label}`);
  };

  // --- Expand logic (exposed globally) ---
try {
  function expand(el) {
      console.log('expand() clicked');
    try {
      const parent = el.closest('.part');
      if (!parent) return;

      const row = parent.closest('.parts-row');
      if (!row) return;

      const allParts = row.querySelectorAll('.part');
      const isExpanded = parent.classList.contains('expanded');

      if (isExpanded) {
        // If it was already expanded, collapse it
        parent.classList.remove('expanded');
      } else {
        // Collapse all others first
        allParts.forEach(item => item.classList.remove('expanded'));

        // Expand and center this one
        parent.classList.add('expanded');
        const placeholder = parent.querySelector('.part-placeholder, img, video');
        if (placeholder) {
          const rowRect = row.getBoundingClientRect();
          const elRect = placeholder.getBoundingClientRect();
          const offset = (elRect.left + elRect.width / 2) - (rowRect.left + rowRect.width / 2);
          row.scrollBy({ left: offset, behavior: 'smooth' });
        }
      }
    } catch (err) {
      console.error('[script.js] expand() error', err);
    }
  }
  window.expand = expand;
  safeLog('expand() initialized');
} catch (err) {
  safeLog('expand init failed', err);
}

// Safer expand() using transform scale and waiting for transitionend to scroll
try {
  function expand(el) {
    console.log('expand() clicked (safe version)');
    try {
      const parent = el.closest('.part');
      if (!parent) return;

      const row = parent.closest('.parts-row');
      if (!row) return;

      const allParts = Array.from(row.querySelectorAll('.part'));
      const isExpanded = parent.classList.contains('expanded');

      if (isExpanded) {
        // collapse: remove expanded and any dim classes
        parent.classList.remove('expanded');
        allParts.forEach(p => p.classList.remove('dimmed'));
        return;
      }

      // collapse others first
      allParts.forEach(p => p.classList.remove('expanded'));
      // optionally dim siblings for focus
      allParts.forEach(p => p.classList.add('dimmed'));
      parent.classList.remove('dimmed');

      // expand the clicked one
      parent.classList.add('expanded');

      // Choose the element we scale (image/video/placeholder)
      const media = parent.querySelector('img, video, .part-placeholder');
      if (!media) return;

      // Wait for transform transition to finish on the media, then center it
      const onTransitionEnd = (ev) => {
        // only react to the transform transition on the media
        if (ev.propertyName !== 'transform') return;
        media.removeEventListener('transitionend', onTransitionEnd);

        // compute new position and scroll smoothly to center
        const rowRect = row.getBoundingClientRect();
        const elRect = media.getBoundingClientRect();
        const offset = (elRect.left + elRect.width / 2) - (rowRect.left + rowRect.width / 2);
        row.scrollBy({ left: offset, behavior: 'smooth' });
      };

      // If the element is already mid-transition, attach listener anyway
      media.addEventListener('transitionend', onTransitionEnd);

      // Fallback: if transitionend doesn't fire (old browsers), set a safety timeout
      setTimeout(() => {
        media.removeEventListener('transitionend', onTransitionEnd);
        const rowRect = row.getBoundingClientRect();
        const elRect = media.getBoundingClientRect();
        const offset = (elRect.left + elRect.width / 2) - (rowRect.left + rowRect.width / 2);
        row.scrollBy({ left: offset, behavior: 'smooth' });
      }, 500);
    } catch (err) {
      console.error('[script.js] expand (safe) error', err);
    }
  }

  window.expand = expand;
  safeLog('expand() (safe) initialized');
} catch (err) {
  safeLog('expand(init) failed', err);
}


  // --- Scroll Arrows ---
  let arrowWrappers = [];
  try {
    function updateArrowsForWrapper(wrapper) {
      try {
        const row = wrapper.querySelector('.parts-row');
        const arrowLeft = wrapper.querySelector('.scroll-arrow.left');
        const arrowRight = wrapper.querySelector('.scroll-arrow.right');

        if (!row) return;
        if (arrowLeft) arrowLeft.style.display = row.scrollLeft > 5 ? 'block' : 'none';
        if (arrowRight) arrowRight.style.display = (row.scrollWidth - row.clientWidth - row.scrollLeft) > 5 ? 'block' : 'none';
      } catch (err) {
        console.error('[script.js] updateArrowsForWrapper error', err);
      }
    }

    function initScrollArrows() {
      try {
        arrowWrappers = Array.from(document.querySelectorAll('.gif-row-wrapper'));
        arrowWrappers.forEach(wrapper => {
          const row = wrapper.querySelector('.parts-row');
          const arrowLeft = wrapper.querySelector('.scroll-arrow.left');
          const arrowRight = wrapper.querySelector('.scroll-arrow.right');

          if (!row) return;

          // initial update
          updateArrowsForWrapper(wrapper);

          // handlers
          row.addEventListener('scroll', () => updateArrowsForWrapper(wrapper));
          window.addEventListener('resize', () => updateArrowsForWrapper(wrapper));

          if (arrowLeft) {
            arrowLeft.addEventListener('click', () => {
              row.scrollBy({ left: -row.clientWidth / 2, behavior: 'smooth' });
              // small timeout to update after scroll
              setTimeout(() => updateArrowsForWrapper(wrapper), 250);
            });
          }
          if (arrowRight) {
            arrowRight.addEventListener('click', () => {
              row.scrollBy({ left: row.clientWidth / 2, behavior: 'smooth' });
              setTimeout(() => updateArrowsForWrapper(wrapper), 250);
            });
          }
        });
        safeLog('scroll arrows initialized');
      } catch (err) {
        console.error('[script.js] initScrollArrows error', err);
      }
    }

    initScrollArrows();
  } catch (err) {
    safeLog('scroll arrows init failed', err);
  }

  // small helper to update all wrappers (used after filtering)
  function refreshAllArrows() {
    try {
      arrowWrappers.forEach(wrapper => updateArrowsForWrapper(wrapper));
    } catch (err) {
      console.error('[script.js] refreshAllArrows error', err);
    }
  }

  // --- Search Filtering (hide section if empty) ---
try {
  const searchInput = document.getElementById('search');
  const sections = Array.from(document.querySelectorAll('section'));

  function runSearch() {
    try {
      if (!searchInput) return;
      const query = searchInput.value.toLowerCase().trim();
      const terms = query.split(/\s+/).filter(Boolean);

      sections.forEach(section => {
        const wrapper = section.querySelector('.gif-row-wrapper');
        if (!wrapper) return;

        const parts = Array.from(wrapper.querySelectorAll('.part'));
        let visibleCount = 0;

        parts.forEach(part => {
          const tags = (part.dataset.tags || "").toLowerCase().replace(/,/g, " ");
          const matches = terms.length === 0 || terms.every(t => tags.includes(t));
          part.style.display = matches ? 'flex' : 'none';
          if (matches) visibleCount++;
        });

        // hide entire section if no visible parts
        section.style.display = visibleCount > 0 ? '' : 'none';
      });

      // update arrows for visible rows
      setTimeout(refreshAllArrows, 50);
    } catch (err) {
      console.error('[script.js] runSearch error', err);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', runSearch);
    runSearch();
  } else {
    safeLog('no #search input found - search not initialized');
  }
} catch (err) {
  safeLog('search init failed', err);
}


  // --- Random Inspiration Image ---
  try {
    const imgElement = document.getElementById("randomImage");
    if (imgElement) {
      const images = [
        "ElfRogue.png",
        "HolyWarrior.png",
        "Lich.png",
      ];
      const randomImage = images[Math.floor(Math.random() * images.length)];
      imgElement.src = `images/Inspiration/${randomImage}`;
      safeLog('random image set');
    } else {
      safeLog('randomImage element not found');
    }
  } catch (err) {
    safeLog('random image init failed', err);
  }

// ===== TITLE BAR HIDE WHEN SEARCH BAR REACHES TOP =====
(function() {
  try {
    const titleBar = document.querySelector('.title-bar');
    const searchBar = document.querySelector('.search-bar');

    if (!titleBar || !searchBar) {
      console.warn("Title bar or search bar not found");
      return;
    }

    // Use requestAnimationFrame for smoother scrolling
    let ticking = false;

    function checkStickySwap() {
      const rect = searchBar.getBoundingClientRect();

      if (rect.top <= 0) {
        titleBar.classList.add('hidden');
      } else {
        titleBar.classList.remove('hidden');
      }
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(checkStickySwap);
        ticking = true;
      }
    }

    // initial check in case page loads scrolled
    checkStickySwap();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', checkStickySwap);
    
    console.log("Sticky title-bar script initialized");
  } catch (err) {
    console.error("Sticky title-bar error:", err);
  }
})();


}); // end DOMContentLoaded
