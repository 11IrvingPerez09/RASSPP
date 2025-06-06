/**
 * Sistema de menú responsive unificado para RASSPP
 * Maneja el comportamiento del menú hamburguesa en todas las páginas
 */

document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('.header');
  const nav = document.querySelector('.nav');
  const menuToggle = document.querySelector('.menu-toggle');
  let isMenuOpen = false;

  // Verificar que los elementos existen
  if (!header || !nav || !menuToggle) {
    console.warn('Elementos del menú no encontrados');
    return;
  }

  // Función para alternar el menú
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    nav.classList.toggle('active', isMenuOpen);
    
    // Actualizar ícono del menú
    const icon = menuToggle.querySelector('i');
    if (icon) {
      icon.className = isMenuOpen ? 'fas fa-times' : 'fas fa-bars';
      icon.style.transform = isMenuOpen ? 'rotate(90deg)' : 'rotate(0)';
    }
    
    // Prevenir scroll del body cuando el menú está abierto
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    
    // Agregar clase al header para estilos adicionales
    header.classList.toggle('menu-open', isMenuOpen);
  }

  // Función para cerrar el menú
  function closeMenu() {
    if (isMenuOpen) {
      toggleMenu();
    }
  }

  // Event listener para el botón del menú
  menuToggle.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleMenu();
  });

  // Cerrar menú al hacer click en enlaces o botones del nav
  nav.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
      if (window.innerWidth <= 768) {
        setTimeout(closeMenu, 100); // Pequeño delay para permitir la navegación
      }
    }
  });

  // Cerrar menú al hacer click fuera de él
  document.addEventListener('click', function(e) {
    if (isMenuOpen && !nav.contains(e.target) && !menuToggle.contains(e.target)) {
      closeMenu();
    }
  });

  // Cerrar menú al redimensionar la ventana
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && isMenuOpen) {
      closeMenu();
    }
  });

  // Cerrar menú al hacer scroll (solo en móvil)
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', function() {
    if (window.innerWidth <= 768) {
      const currentScrollY = window.scrollY;
      
      // Si se hace scroll hacia abajo y el menú está abierto, cerrarlo
      if (currentScrollY > lastScrollY && isMenuOpen) {
        closeMenu();
      }
      
      lastScrollY = currentScrollY;
    }
  });

  // Manejar tecla Escape para cerrar el menú
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isMenuOpen) {
      closeMenu();
    }
  });

  // Mejorar accesibilidad
  menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
  menuToggle.setAttribute('aria-expanded', 'false');
  
  // Actualizar aria-expanded cuando cambie el estado del menú
  const originalToggleMenu = toggleMenu;
  toggleMenu = function() {
    originalToggleMenu();
    menuToggle.setAttribute('aria-expanded', isMenuOpen.toString());
    menuToggle.setAttribute('aria-label', isMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
  };

  // Función para optimizar el rendimiento en dispositivos táctiles
  if ('ontouchstart' in window) {
    // Agregar clase para dispositivos táctiles
    document.body.classList.add('touch-device');
    
    // Mejorar el comportamiento táctil
    menuToggle.addEventListener('touchstart', function(e) {
      e.preventDefault();
    });
  }

  // Función para manejar orientación en dispositivos móviles
  window.addEventListener('orientationchange', function() {
    setTimeout(function() {
      if (isMenuOpen) {
        closeMenu();
      }
    }, 100);
  });

  // Exponer funciones globalmente para uso en otras partes del código
  window.ResponsiveMenu = {
    toggle: toggleMenu,
    close: closeMenu,
    isOpen: function() { return isMenuOpen; }
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
