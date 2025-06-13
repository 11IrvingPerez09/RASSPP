
/**
 * Sistema de menú responsive unificado para RASSPP
 * Maneja el comportamiento del menú hamburguesa con filtros integrados
 */

document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('.header');
  const nav = document.querySelector('.nav');
  const menuToggle = document.querySelector('.menu-toggle');
  const filtersMenuButton = document.querySelector('#filters-menu-button');
  const filtersContainer = document.querySelector('.filters-sidebar');
  const overlay = document.querySelector('.overlay');
  const adminNameElement = document.getElementById('admin-name');
  
  let isMenuOpen = false;
  let isFiltersOpen = false;

  // Verificar que los elementos existen
  if (!header || !nav || !menuToggle) {
    console.warn('Elementos del menú no encontrados');
    return;
  }

  // Cargar nombre del administrador desde localStorage o Firebase
  function loadAdminName() {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (userData && userData.nombre && adminNameElement) {
        adminNameElement.textContent = userData.nombre;
      } else if (adminNameElement) {
        adminNameElement.textContent = 'Administrador';
      }
    } catch (error) {
      console.log('No se pudo cargar el nombre del usuario');
      if (adminNameElement) {
        adminNameElement.textContent = 'Administrador';
      }
    }
  }

  // Función para alternar el menú principal
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    nav.classList.toggle('active', isMenuOpen);
    menuToggle.classList.toggle('active', isMenuOpen);
    
    // Actualizar ícono del menú
    const icon = menuToggle.querySelector('i');
    if (icon) {
      icon.className = isMenuOpen ? 'fas fa-times' : 'fas fa-bars';
    }
    
    // Prevenir scroll del body cuando el menú está abierto
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    
    // Agregar clase al header para estilos adicionales
    header.classList.toggle('menu-open', isMenuOpen);
    
    // Si se cierra el menú principal, también cerrar filtros
    if (!isMenuOpen && isFiltersOpen) {
      toggleFilters();
    }
  }

  // Función para alternar los filtros
  function toggleFilters() {
    if (!filtersContainer) return;
    
    isFiltersOpen = !isFiltersOpen;
    filtersContainer.classList.toggle('active', isFiltersOpen);
    
    // Mostrar/ocultar overlay
    if (overlay) {
      overlay.style.display = isFiltersOpen ? 'block' : 'none';
    }
    
    // Actualizar botón de filtros
    if (filtersMenuButton) {
      filtersMenuButton.classList.toggle('active', isFiltersOpen);
      const filterIcon = filtersMenuButton.querySelector('i');
      if (filterIcon) {
        filterIcon.className = isFiltersOpen ? 'fas fa-times' : 'fas fa-filter';
      }
    }
  }

  // Función para cerrar el menú
  function closeMenu() {
    if (isMenuOpen) {
      toggleMenu();
    }
  }

  // Función para cerrar los filtros
  function closeFilters() {
    if (isFiltersOpen) {
      toggleFilters();
    }
  }

  // Event listener para el botón del menú principal
  menuToggle.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  // Event listener para el botón de filtros en el menú
  if (filtersMenuButton) {
    filtersMenuButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Si los filtros ya están abiertos, cerrarlos directamente
      if (isFiltersOpen) {
        toggleFilters();
        return;
      }
      
      // Cerrar el menú hamburguesa antes de abrir los filtros
      if (isMenuOpen) {
        closeMenu();
        // Pequeño delay para asegurar una transición suave
        setTimeout(() => {
          toggleFilters();
        }, 300);
      } else {
        toggleFilters();
      }
    });
  }

  // Cerrar filtros al hacer click en el overlay
  if (overlay) {
    overlay.addEventListener('click', function() {
      if (isFiltersOpen) {
        closeFilters();
      }
    });
  }

  // Cerrar menú al hacer click en enlaces (excepto filtros)
  nav.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' || (e.target.tagName === 'BUTTON' && !e.target.classList.contains('filters-menu-button'))) {
      setTimeout(closeMenu, 100);
    }
  });

  // Cerrar menú al hacer click fuera de él
  document.addEventListener('click', function(e) {
    if (isMenuOpen && !nav.contains(e.target) && !menuToggle.contains(e.target)) {
      closeMenu();
    }
  });

  // Cerrar filtros al aplicar o limpiar filtros
  const applyFiltersBtn = document.querySelector('.apply-filters');
  const clearFiltersBtn = document.querySelector('.clear-filters');

  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', function() {
      setTimeout(closeFilters, 300);
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', function() {
      setTimeout(closeFilters, 300);
    });
  }

  // Manejar tecla Escape para cerrar menús
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (isFiltersOpen) {
        closeFilters();
      } else if (isMenuOpen) {
        closeMenu();
      }
    }
  });

  // Cerrar menú al hacer scroll
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', function() {
    const currentScrollY = window.scrollY;
    
    if (Math.abs(currentScrollY - lastScrollY) > 50) {
      if (isFiltersOpen) {
        closeFilters();
      }
      if (isMenuOpen) {
        closeMenu();
      }
    }
    
    lastScrollY = currentScrollY;
  });

  // Función para manejar orientación en dispositivos móviles
  window.addEventListener('orientationchange', function() {
    setTimeout(function() {
      if (isMenuOpen) {
        closeMenu();
      }
      if (isFiltersOpen) {
        closeFilters();
      }
    }, 100);
  });

  // Mejorar accesibilidad
  menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
  menuToggle.setAttribute('aria-expanded', 'false');

  // Cargar nombre del administrador al inicializar
  loadAdminName();

  // Exponer funciones globalmente para uso en otras partes del código
  window.ResponsiveMenu = {
    toggle: toggleMenu,
    close: closeMenu,
    toggleFilters: toggleFilters,
    closeFilters: closeFilters,
    isOpen: function() { return isMenuOpen; },
    isFiltersOpen: function() { return isFiltersOpen; },
    loadAdminName: loadAdminName
  };
});

/**
 * Mejoras adicionales para formularios en móvil
 */
document.addEventListener('DOMContentLoaded', function() {
  // Mejorar inputs en dispositivos iOS
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea');
    
    inputs.forEach(function(input) {
      input.addEventListener('focus', function() {
        // Prevenir zoom en iOS
        input.style.fontSize = '16px';
      });
      
      input.addEventListener('blur', function() {
        // Restaurar tamaño original
        input.style.fontSize = '';
      });
    });
  }

  // Mejorar tablas en móvil
  const tables = document.querySelectorAll('.info-table');
  tables.forEach(function(table) {
    // Agregar indicador de scroll horizontal
    const wrapper = document.createElement('div');
    wrapper.className = 'table-wrapper';
    wrapper.style.position = 'relative';
    
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
    
    // Agregar indicadores de scroll
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    scrollIndicator.innerHTML = '← Desliza para ver más →';
    scrollIndicator.style.cssText = `
      text-align: center;
      font-size: 12px;
      color: #666;
      padding: 5px;
      display: none;
    `;
    
    wrapper.appendChild(scrollIndicator);
    
    // Mostrar indicador solo en móvil si la tabla es más ancha que el contenedor
    function checkTableOverflow() {
      if (window.innerWidth <= 768) {
        if (table.scrollWidth > table.clientWidth) {
          scrollIndicator.style.display = 'block';
        } else {
          scrollIndicator.style.display = 'none';
        }
      } else {
        scrollIndicator.style.display = 'none';
      }
    }
    
    window.addEventListener('resize', checkTableOverflow);
    checkTableOverflow();
  });
});
