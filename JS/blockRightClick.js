document.addEventListener('DOMContentLoaded', function() {
  // Crear el elemento de mensaje
  const messageEl = document.createElement('div');
  messageEl.style.cssText = `
    position: fixed;
    display: none;
    background: rgba(0, 31, 91, 0.9);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    font-size: 14px;
    z-index: 10000;
    pointer-events: none;
    transition: opacity 0.3s ease;
    font-family: 'Montserrat', sans-serif;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  `;
  messageEl.textContent = 'Click derecho deshabilitado';
  document.body.appendChild(messageEl);

  // Prevenir click derecho y mostrar mensaje
  document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    
    // Posicionar y mostrar el mensaje
    messageEl.style.left = e.pageX + 'px';
    messageEl.style.top = e.pageY + 'px';
    messageEl.style.display = 'block';
    messageEl.style.opacity = '1';

    // Ocultar el mensaje después de 1.5 segundos
    setTimeout(() => {
      messageEl.style.opacity = '0';
      setTimeout(() => {
        messageEl.style.display = 'none';
      }, 300);
    }, 1500);
  });

  // Prevenir otras formas de copiar contenido
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && 
        (e.key === 'c' || 
         e.key === 'C' || 
         e.key === 'u' || 
         e.key === 'U' || 
         e.key === 'i' || 
         e.key === 'I')) {
      e.preventDefault();
    }
  });
});
