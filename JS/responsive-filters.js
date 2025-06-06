/**
 * Sistema de filtros responsive unificado para RASSPP
 * Maneja el comportamiento del menú de filtros en todas las páginas
 */

document.addEventListener('DOMContentLoaded', function() {
  // Obtener elementos existentes del DOM
  const filtersContainer = document.querySelector('.filters-sidebar');
  const contentContainer = document.querySelector('.content');
  const toggleButton = document.querySelector('.filters-toggle');
  const overlay = document.querySelector('.overlay');
  
  if (!filtersContainer || !contentContainer || !toggleButton || !overlay) return;

  let isFiltersOpen = false;

  function toggleFilters() {
    isFiltersOpen = !isFiltersOpen;
    filtersContainer.classList.toggle('active');
    toggleButton.classList.toggle('active');
    
    // Controlar el scroll del body solo en móvil
    if (window.innerWidth <= 1024) {
      document.body.style.overflow = isFiltersOpen ? 'hidden' : '';
    }
    
    // Mostrar/ocultar overlay
    overlay.style.display = isFiltersOpen ? 'block' : 'none';
  }

  // Event listeners
  toggleButton.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleFilters();
  });

  // Cerrar al hacer click en el overlay
  overlay.addEventListener('click', function() {
    if (isFiltersOpen) {
      toggleFilters();
    }
  });

  // Cerrar con la tecla Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isFiltersOpen) {
      toggleFilters();
    }
  });

  // Cerrar al hacer click en los botones de filtro
  const applyFiltersBtn = document.querySelector('.apply-filters');
  const clearFiltersBtn = document.querySelector('#clear-filters');

  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', function() {
      if (isFiltersOpen) {
        toggleFilters();
      }
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function() {
      if (isFiltersOpen) {
        toggleFilters();
      }
    });
  }

  // Cerrar al hacer scroll
  let lastScroll = 0;
  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    if (Math.abs(currentScroll - lastScroll) > 50 && isFiltersOpen) {
      toggleFilters();
    }
    lastScroll = currentScroll;
  });

  // Manejar cambios de orientación
  window.addEventListener('orientationchange', function() {
    if (isFiltersOpen) {
      toggleFilters();
    }
  });
});
