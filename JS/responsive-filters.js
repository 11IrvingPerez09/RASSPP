/**
 * Sistema de filtros responsive unificado para RASSPP
 * Maneja el comportamiento del menú de filtros en todas las páginas
 */

document.addEventListener('DOMContentLoaded', function() {
  // Obtener elementos existentes del DOM
  const filtersContainer = document.querySelector('.filters-sidebar');
  const contentContainer = document.querySelector('.content');
  const toggleButton = document.querySelector('.filters-toggle');
  const filtersMenuButton = document.querySelector('#filters-menu-button');
  const closeFiltersMenuButton = document.querySelector('#close-filters-menu-button');
  const overlay = document.querySelector('.overlay');
  
  if (!filtersContainer || !contentContainer || !overlay) return;

  let isFiltersOpen = false;

  function toggleFilters() {
    isFiltersOpen = !isFiltersOpen;
    filtersContainer.classList.toggle('active', isFiltersOpen);
    
    if (toggleButton) {
      toggleButton.classList.toggle('active', isFiltersOpen);
    }
    
    // Controlar el scroll del body solo en móvil
    if (window.innerWidth <= 1024) {
      document.body.style.overflow = isFiltersOpen ? 'hidden' : '';
    }
    
    // Mostrar/ocultar overlay
    overlay.style.display = isFiltersOpen ? 'block' : 'none';

    // Actualizar visibilidad de los botones
    updateButtonVisibility();
  }

  function updateButtonVisibility() {
    if (closeFiltersMenuButton && filtersMenuButton) {
      if (isFiltersOpen) {
        closeFiltersMenuButton.style.display = 'inline-flex';
        filtersMenuButton.style.display = 'none';
      } else {
        closeFiltersMenuButton.style.display = 'none';
        filtersMenuButton.style.display = 'inline-flex';
      }
    }
  }

  function closeFilters() {
    if (isFiltersOpen) {
      isFiltersOpen = false;
      filtersContainer.classList.remove('active');
      
      if (toggleButton) {
        toggleButton.classList.remove('active');
      }
      
      document.body.style.overflow = '';
      overlay.style.display = 'none';
      updateButtonVisibility();
    }
  }

  function openFilters() {
    if (!isFiltersOpen) {
      isFiltersOpen = true;
      filtersContainer.classList.add('active');
      
      if (toggleButton) {
        toggleButton.classList.add('active');
      }
      
      if (window.innerWidth <= 1024) {
        document.body.style.overflow = 'hidden';
      }
      
      overlay.style.display = 'block';
      updateButtonVisibility();
    }
  }

  // Event listener para el botón de filtros flotante (toggle)
  if (toggleButton) {
    toggleButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleFilters();
    });
  }

  // Event listener para el botón de filtros en el burger menu
  if (filtersMenuButton) {
    filtersMenuButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Cerrar el menú hamburguesa si está abierto
      if (window.ResponsiveMenu && window.ResponsiveMenu.isOpen()) {
        window.ResponsiveMenu.close();
      }
      
      // Abrir filtros después de un pequeño delay
      setTimeout(() => {
        openFilters();
      }, 100);
    });
  }

  // Event listener para el botón de cerrar filtros en el burger menu
  if (closeFiltersMenuButton) {
    closeFiltersMenuButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Cerrar el menú hamburguesa si está abierto
      if (window.ResponsiveMenu && window.ResponsiveMenu.isOpen()) {
        window.ResponsiveMenu.close();
      }
      
      // Cerrar filtros
      closeFilters();
    });
  }

  // Cerrar al hacer click en el overlay
  overlay.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    closeFilters();
  });

  // Cerrar con la tecla Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isFiltersOpen) {
      closeFilters();
    }
  });

  // Cerrar al hacer click en los botones de aplicar/limpiar filtros (opcional)
  const applyFiltersBtn = document.querySelector('.apply-filters');
  const clearFiltersBtn = document.querySelector('#clear-filters');

  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', function() {
      // Solo cerrar en móvil para mejor UX
      if (window.innerWidth <= 768 && isFiltersOpen) {
        setTimeout(() => {
          closeFilters();
        }, 500);
      }
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function() {
      // Solo cerrar en móvil para mejor UX
      if (window.innerWidth <= 768 && isFiltersOpen) {
        setTimeout(() => {
          closeFilters();
        }, 500);
      }
    });
  }

  // Manejar cambios de orientación
  window.addEventListener('orientationchange', function() {
    setTimeout(() => {
      if (isFiltersOpen && window.innerWidth <= 1024) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }, 100);
  });

  // Inicializar estado de botones
  updateButtonVisibility();
});
