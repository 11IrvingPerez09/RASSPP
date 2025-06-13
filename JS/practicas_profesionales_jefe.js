// Initialize Firebase
try {
  var firebaseConfig = {
    apiKey: "AIzaSyDgpiwLo8E9Y7ctZu-PqEh8uaL6hEZXdLU",
    authDomain: "rassp-703df.firebaseapp.com",
    projectId: "rassp-703df",
    storageBucket: "rassp-703df.appspot.com",
    messagingSenderId: "951228921480",
    appId: "1:951228921480:web:a3a85933eb132b1748c951"
  };
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

// Firebase auth state check
firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = 'login_admin.html';
  } else {
    document.body.classList.add('logged-in');
    loadAlumnos();
  }
});

function loadAlumnos() {
  const cardContainer = document.getElementById('alumnos-cards');
  if (!cardContainer) return;

  const alumnosRef = database.ref('alumnos');
  const gestorRef = database.ref('gestor_alumnos');

  alumnosRef.on('value', (snapshot) => {
    const alumnosData = snapshot.val();
    gestorRef.once('value').then((gestorSnapshot) => {
      const gestorData = gestorSnapshot.val() || {};
      renderCards(alumnosData, gestorData);
    });
  });
}

// Modificar la función renderCards en practicas_profesionales.html
function updateStudentCounter() {
  const studentCounter = document.getElementById('student-counter');
  const counterText = document.getElementById('counter-text');
  const counterNumber = document.getElementById('counter-number');
  const visibleCards = Array.from(document.querySelectorAll('.student-card')).filter(card => card.style.display !== 'none');
  const totalCards = document.querySelectorAll('.student-card').length;

  studentCounter.style.display = 'block';
  
  if (visibleCards.length === totalCards) {
    counterText.textContent = 'Total de estudiantes registrados:';
  } else {
    counterText.textContent = `Mostrando ${visibleCards.length} de ${totalCards} estudiantes`;
  }
  
  counterNumber.textContent = visibleCards.length;
}

function renderCards(alumnosData, gestorData) {
  const cardContainer = document.getElementById('alumnos-cards');
  cardContainer.innerHTML = '';

  if (alumnosData) {
    const fragment = document.createDocumentFragment(); // Crear un fragmento de documento

    Object.keys(alumnosData).forEach((matricula) => {
      const alumno = alumnosData[matricula];
      const practicas = gestorData[matricula] || {
        cartaPracticas: false,
        cartaAceptacion: false,
        bitacora: false,
        reporte: false,
        cartaTermino: false,
        completion: false,
        fechaInicio: null,
        fechaLimite: null
      };

      const checkCount = [
        practicas.cartaPracticas,
        practicas.cartaAceptacion,
        practicas.bitacora,
        practicas.reporte,
        practicas.cartaTermino,
        practicas.completion
      ].filter(Boolean).length;

      let statusClass = '';
      if (checkCount === 0) {
        statusClass = 'status-zero';
      } else if (checkCount > 0 && checkCount < 6) {
        statusClass = 'status-partial';
      } else {
        statusClass = 'status-complete';
      }

      // Calcular si está próximo a vencer
      let urgenteMessage = '';
      if (practicas.fechaLimite) {
        const fechaLimite = new Date(practicas.fechaLimite);
        const hoy = new Date();
        const unMesAntes = new Date(fechaLimite);
        unMesAntes.setMonth(unMesAntes.getMonth() - 1);

        if (hoy >= unMesAntes && hoy <= fechaLimite) {
          urgenteMessage = '<span class="urgente">URGENTE</span>';
        } else if (hoy > fechaLimite && checkCount < 6) {
          urgenteMessage = '<span class="urgente">VENCIDO</span>';
        }
      }

      const card = document.createElement('div');
      card.className = `student-card ${statusClass}`;
      card.dataset.matricula = matricula;
      card.innerHTML = `
        <div class="student-info">
          <span class="matricula">${alumno.matricula || '-'}</span>
          <span class="nombre">${alumno.nombres || ''} ${alumno.apellidoPaterno || ''} ${alumno.apellidoMaterno || ''}</span>
          <span class="carrera">${alumno.carrera || '-'}</span>
          <span class="semestre">Semestre: ${alumno.semestre || '-'}</span>
          <span class="email"><a href="mailto:${alumno.email}" onclick="event.stopPropagation(); window.location.href='mailto:${alumno.email}?subject=Prácticas Profesionales&body=Estimado alumno,';">${alumno.email || '-'}</a></span>
          <div class="institucion-info">
            Institución: ${alumno.institucion ? `${alumno.institucion.nombre} (${alumno.institucion.tipo === 'public' ? 'Pública' : 'Privada'})` : '-'}
          </div>
          ${practicas.fechaInicio ? `
            <div class="fechas-container">
              <span class="fecha">Inicio: ${formatDate(practicas.fechaInicio)}</span>
              ${practicas.fechaLimite ? `<span class="fecha">Límite: ${formatDate(practicas.fechaLimite)} ${urgenteMessage}</span>` : ''}
            </div>
          ` : ''}
        </div>
        <div class="student-status">
          <span class="status">${checkCount}/6 documentos</span>
          <button class="btn-view" onclick="openModal('${matricula}')">Ver</button>
          <button class="btn-assign-institution" onclick="assignInstitution('${matricula}')">Asignar Institución</button>
          <button class="btn-delete">Dar de baja</button>
        </div>
      `;
      fragment.appendChild(card); // Agregar la tarjeta al fragmento
    });
    cardContainer.appendChild(fragment); // Agregar el fragmento al contenedor
    
    // Update student counter
    updateStudentCounter();

    // Attach event listeners to the delete buttons
    const deleteButtons = cardContainer.querySelectorAll('.btn-delete');
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => {
        const matricula = button.closest('.student-card').dataset.matricula;
        console.log('Matrícula del alumno a dar de baja:', matricula); // Agregar console.log
        window.confirmDelete(matricula);
      });
    });
  } else {
    cardContainer.innerHTML = '<p class="no-students">No hay alumnos registrados</p>';
  }
}

// Función auxiliar para formatear fechas
function formatDate(timestamp) {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function openModal(matricula) {
  const modal = document.getElementById('student-modal');
  const details = document.getElementById('student-details');
  const message = document.getElementById('modal-message');
  message.textContent = '';

  database.ref(`alumnos/${matricula}`).once('value', (snapshot) => {
    const alumno = snapshot.val();
    if (alumno) {
      details.dataset.matricula = matricula;
      details.innerHTML = `
        <p><strong>Matrícula:</strong> ${alumno.matricula || '-'}</p>
        <p><strong>Nombre:</strong> ${alumno.nombres || '-'} ${alumno.apellidoPaterno || '-'} ${alumno.apellidoMaterno || '-'}</p>
        <p><strong>Carrera:</strong> ${alumno.carrera || '-'}</span></p>
        <p><strong>Semestre:</strong> ${alumno.semestre || '-'}</span></p>
        <p><strong>Grupo:</strong> ${alumno.grupo || '-'}</span></p>
        <p><strong>Generación:</strong> ${alumno.generacion || '-'}</span></p>
        <p><strong>Sexo:</strong> ${alumno.sexo || '-'}</span></p>
        <p><strong>Institución:</strong> ${alumno.institucion ? `${alumno.institucion.nombre} (${alumno.institucion.tipo === 'public' ? 'Pública' : 'Privada'})` : '-'}</p>
      `;
    }
  });

  database.ref(`gestor_alumnos/${matricula}`).once('value', (snapshot) => {
    const practicas = snapshot.val() || {};
    document.getElementById('carta-practicas').checked = practicas.cartaPracticas || false;
    document.getElementById('carta-aceptacion').checked = practicas.cartaAceptacion || false;
    document.getElementById('bitacora').checked = practicas.bitacora || false;
    document.getElementById('reporte').checked = practicas.reporte || false;
    document.getElementById('carta-termino').checked = practicas.cartaTermino || false;
    document.getElementById('completion').checked = practicas.completion || false;

    // Mostrar fechas si existen
    if (practicas.fechaInicio || practicas.fechaLimite) {
      const fechaSection = document.createElement('div');
      fechaSection.className = 'fechas-container';
      fechaSection.style.marginTop = '15px';

      if (practicas.fechaInicio) {
        const inicioPara = document.createElement('p');
        inicioPara.innerHTML = `<strong>Fecha de inicio:</strong> ${formatDate(practicas.fechaInicio)}`;
        fechaSection.appendChild(inicioPara);
      }

      if (practicas.fechaLimite) {
        const limitePara = document.createElement('p');
        limitePara.innerHTML = `<strong>Fecha límite:</strong> ${formatDate(practicas.fechaLimite)}`;
        fechaSection.appendChild(fechaSection);
      }

      details.appendChild(fechaSection);
    }
  });

  modal.style.display = 'block';
}

function closeModal() {
  document.getElementById('student-modal').style.display = 'none';
}

function updatePracticas(matricula) {
  const message = document.getElementById('modal-message');
  let isUpdating = false;

  const practicasData = {
    cartaPracticas: document.getElementById('carta-practicas').checked,
    cartaAceptacion: document.getElementById('carta-aceptacion').checked,
    bitacora: document.getElementById('bitacora').checked,
    reporte: document.getElementById('reporte').checked,
    cartaTermino: document.getElementById('carta-termino').checked,
    completion: document.getElementById('completion').checked
  };

  database.ref(`gestor_alumnos/${matricula}`).once('value').then((snapshot) => {
    const currentData = snapshot.val() || {};
    const checkCount = Object.values(practicasData).filter(Boolean).length;
    isUpdating = checkCount > 0 && checkCount < 6;

    if (!currentData.fechaInicio && checkCount > 0) {
      const hoy = new Date();
      const fechaLimite = new Date();
      fechaLimite.setMonth(hoy.getMonth() + 6);
      practicasData.fechaInicio = hoy.getTime();
      practicasData.fechaLimite = fechaLimite.getTime();
    } else if (currentData.fechaInicio) {
      practicasData.fechaInicio = currentData.fechaInicio;
      practicasData.fechaLimite = currentData.fechaLimite;
    }

    return database.ref(`gestor_alumnos/${matricula}`).set(practicasData);
  })
      .then(() => {
        const card = document.querySelector(`.student-card[data-matricula="${matricula}"]`);
        if (card) {
          /*card.classList.remove('status-pending', 'status-in-progress', 'status-completed', 'status-updating');

          if (isUpdating) {
            card.classList.add('status-updating');
            setTimeout(() => {
              card.classList.replace('status-updating', 'status-in-progress');
            }, 2000);
          } else if (Object.values(practicasData).filter(Boolean).length === 6) {
            card.classList.add('status-completed');
          } else {
            card.classList.add('status-pending');
          }*/
        }

        message.textContent = 'Documentos actualizados correctamente';
        message.className = 'message success';
        setTimeout(closeModal, 2000);
      });
}

function searchStudents() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const cards = document.querySelectorAll('.student-card');

  cards.forEach(card => {
    const matricula = card.dataset.matricula.toLowerCase();
    const nombre = card.querySelector('.nombre').textContent.toLowerCase();

    if (matricula.includes(searchTerm) || nombre.includes(searchTerm)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
  
  // Update counter after search
  updateStudentCounter();
}

function applyFilters() {
  const carrera = document.getElementById('filter-carrera').value;
  const generacion = document.getElementById('filter-generacion').value.toLowerCase();
  const grupo = document.getElementById('filter-grupo').value.toLowerCase();
  const sexo = document.getElementById('filter-sexo').value;
  const institucion = document.getElementById('filter-institucion').value;
  const status = document.getElementById('filter-status').value;

  const cards = document.querySelectorAll('.student-card');
  let processedCards = 0;

  cards.forEach(card => {
    const matricula = card.dataset.matricula;

    // Obtener los datos del alumno desde Firebase
    database.ref(`alumnos/${matricula}`).once('value').then(snapshot => {
      const alumno = snapshot.val();
      let showCard = true;

      if (carrera && alumno.carrera !== carrera) {
        showCard = false;
      }

      if (generacion && (!alumno.generacion || !alumno.generacion.toLowerCase().includes(generacion))) {
        showCard = false;
      }

      if (grupo && (!alumno.grupo || !alumno.grupo.toLowerCase().includes(grupo))) {
        showCard = false;
      }

      if (sexo && alumno.sexo !== sexo) {
        showCard = false;
      }

      card.style.display = showCard ? 'flex' : 'none';
      
      // Update counter only after all cards have been processed
      processedCards++;
      if (processedCards === cards.length) {
        updateStudentCounter();
      }
    });
  });
}

function clearFilters() {
  document.getElementById('filter-carrera').value = '';
  document.getElementById('filter-generacion').value = '';
  document.getElementById('filter-grupo').value = '';
  document.getElementById('filter-sexo').value = '';
  document.getElementById('filter-institucion').value = '';
  document.getElementById('filter-status').value = '';

  const cards = document.querySelectorAll('.student-card');
  cards.forEach(card => {
    card.style.display = 'flex';
  });

  document.getElementById('search-input').value = '';
  
  // Update counter after clearing filters
  updateStudentCounter();
}

window.confirmDelete = function(matricula) {
  // Crear el modal de confirmación
  const deleteModal = document.createElement('div');
  deleteModal.id = 'delete-modal';
  deleteModal.className = 'modal';
  deleteModal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="window.closeDeleteModal()">&times;</span>
      <h2>Confirmar Baja</h2>
      <p>¿Está seguro de que desea dar de baja al alumno con matrícula ${matricula}?</p>
      <label for="admin-password-confirm">Contraseña de administrador:</label>
      <input type="password" id="admin-password-confirm">
      <p id="delete-error" class="error"></p>
      <div class="modal-buttons">
        <button onclick="window.deleteStudent()">Confirmar</button>
        <button onclick="window.closeDeleteModal()">Cancelar</button>
      </div>
    </div>
  `;

  // Agregar el modal al DOM
  document.body.appendChild(deleteModal);

  // Mostrar el modal
  deleteModal.style.display = 'block';

  // Asignar la matrícula al modal para usarla en la función deleteStudent
  deleteModal.dataset.matricula = matricula;
}

window.closeDeleteModal = function() {
  const deleteModal = document.getElementById('delete-modal');
  deleteModal.style.display = 'none';
  // Eliminar el modal del DOM
  deleteModal.remove();
}

function assignInstitution(matricula) {
  window.location.href = `asignar_institucion.html?matricula=${matricula}`;
}

window.deleteStudent = function() {
  const deleteModal = document.getElementById('delete-modal');
  const matricula = deleteModal.dataset.matricula;
  const password = document.getElementById('admin-password-confirm').value;
  const errorMessage = document.getElementById('delete-error');

  if (!password) {
    errorMessage.textContent = 'Por favor ingrese su contraseña';
    return;
  }

  const user = firebase.auth().currentUser;
  const credential = firebase.auth.EmailAuthProvider.credential(
    user.email,
    password
  );

  // Reautenticar al administrador
  user.reauthenticateWithCredential(credential)
    .then(() => {
      // Eliminar alumno de la base de datos
      database.ref(`alumnos/${matricula}`).remove()
        .then(() => {
          // Eliminar datos del gestor de alumnos
          return database.ref(`gestor_alumnos/${matricula}`).remove();
        })
        .then(() => {
          console.log('Alumno dado de baja correctamente');
          window.closeDeleteModal();
          // Limpiar el campo de contraseña
          document.getElementById('admin-password-confirm').value = '';
          // Mostrar mensaje de éxito
          alert('Alumno dado de baja correctamente');

          // Eliminar la tarjeta del alumno del DOM
          const card = document.querySelector(`.student-card[data-matricula="${matricula}"]`);
          if (card) {
            card.remove();
          }
        })
        .catch(error => {
          console.error('Error al dar de baja al alumno:', error);
          errorMessage.textContent = 'Error al dar de baja al alumno. Intente nuevamente.';
        });
    })
    .catch((error) => {
      console.error('Error al dar de baja:', error);
      let errorText = 'Error al dar de baja';
      
      switch(error.code) {
        case 'auth/wrong-password':
          errorText = 'Contraseña incorrecta';
          break;
        case 'auth/too-many-requests':
          errorText = 'Demasiados intentos. Intente más tarde';
          break;
        default:
          errorText = error.message || errorText;
      }
      
      errorMessage.textContent = errorText;
    });
}