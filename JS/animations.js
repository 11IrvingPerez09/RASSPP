document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.header');
  const nav = document.querySelector('.nav');
  const menuToggle = document.querySelector('.menu-toggle');
  const circles = document.querySelectorAll('.rotating-circle');
  const loginBox = document.querySelector('.login-box') || document.querySelector('.welcome-box');

  // Translation object
  const translations = {
  es: {
    welcome: "Bienvenido",
    social_service: "Servicio Social y Prácticas Profesionales",
    admin: "Administrador",
    program_head: "Jefe de programa",
    login: "Iniciar Sesión",
    language: "Idioma",
    help: "Ayuda",
    back: "Regresar",
    admin_login: "Iniciar Sesión como Administrador",
    program_head_login: "Iniciar Sesión como Jefe de Carrera",
    program_head_register: "Registro de Jefe de Carrera",
    matricula: "Matrícula",
    password: "Contraseña",
    full_name: "Nombre Completo",
    register: "Registrarse",
    select_careers: "Seleccionar Carreras",
    create_user: "Crear Usuario",
    professional_practices: "Prácticas Profesionales",
    public_private: "Institución pública o privada",
    hours_400: "Son un total de 400 Horas",
    semester_5th: "Haber concluido hasta 5 semestre los créditos de impacto social",
    public_civil: "Se realizan en instituciones públicas o Asociaciones Civiles",
    hours_480: "Se realizan en un tiempo de 480 horas o 6 meses",
    semester_7th: "Créditos y Prácticas Profesionales haberlas concluido hasta séptimo semestre"
  },
  en: {
    // ... (versión en inglés con las mismas claves)
  }
};

  // Toggle language function
  window.toggleLanguage = function() {
    currentLanguage = currentLanguage === 'es' ? 'en' : 'es';
    document.querySelectorAll('[data-translate]').forEach(element => {
      const key = element.getAttribute('data-translate');
      element.textContent = translations[currentLanguage][key];
    });
    document.querySelectorAll('[data-translate-placeholder]').forEach(input => {
      const key = input.getAttribute('data-translate-placeholder');
      input.placeholder = translations[currentLanguage][key];
    });
  };

  // Scroll to footer function
  window.scrollToFooter = function() {
    const footer = document.getElementById('footer');
    footer.scrollIntoView({ behavior: 'smooth' });
  };

  // Efecto de scroll en el header
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Manejo del menú móvil mejorado
  let isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    nav.classList.toggle('active');
    
    // Actualizar ícono
    const icon = menuToggle.querySelector('i');
    icon.className = isMenuOpen ? 'fas fa-times' : 'fas fa-bars';
    
    // Prevenir scroll cuando el menú está abierto
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    
    // Animación suave del ícono
    icon.style.transform = isMenuOpen ? 'rotate(90deg)' : 'rotate(0)';
  }

  // Event listeners para el menú móvil
  menuToggle.addEventListener('click', toggleMenu);

  // Cerrar menú al hacer click en un enlace
  nav.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
      if (window.innerWidth <= 768) {
        toggleMenu();
      }
    }
  });

  // Cerrar menú al redimensionar la ventana
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && isMenuOpen) {
      toggleMenu();
    }
  });

  // Cerrar menú al hacer scroll
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > lastScroll && isMenuOpen) {
      toggleMenu();
    }
    
    lastScroll = currentScroll;
  });

  
  // Efecto de difuminado con el cursor
  document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    circles.forEach(circle => {
      const rect = circle.getBoundingClientRect();
      const circleX = rect.left + rect.width / 2;
      const circleY = rect.top + rect.height / 2;

      const distance = Math.sqrt(Math.pow(mouseX - circleX, 2) + Math.pow(mouseY - circleY, 2));
      const maxDistance = 300;
      const maxBlur = 8;

      if (distance < maxDistance) {
        const blurAmount = (1 - distance / maxDistance) * maxBlur;
        circle.style.filter = `blur(${blurAmount}px)`;
      } else {
        circle.style.filter = 'blur(0px)';
      }
    });
  });
});