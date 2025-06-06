document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    checkAuth();
    
    // Cargar alumnos al iniciar
    loadAlumnos();
    
    // Configurar eventos
    document.getElementById('search-button').addEventListener('click', searchStudents);
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchStudents();
        }
    });
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
});

// Función para cargar alumnos desde Firebase (servicio social)
function loadAlumnos() {
    const alumnosRef = firebase.database().ref('alumnos_servicio_social');
    const gestorRef = firebase.database().ref('gestor_servicio_social');
    const alumnosContainer = document.getElementById('alumnos-cards');

    alumnosRef.on('value', alumnosSnapshot => {
        gestorRef.once('value').then(gestorSnapshot => {
            const alumnos = alumnosSnapshot.val();
            const documentos = gestorSnapshot.val();

            alumnosContainer.innerHTML = '';

            if (!alumnos) {
                alumnosContainer.innerHTML = '<div class="no-data"><i class="fas fa-user-graduate"></i><p>No hay alumnos registrados</p></div>';
                return;
            }

            Object.entries(alumnos).forEach(([matricula, alumnoData]) => {
                const documentosAlumno = documentos && documentos[matricula] ? documentos[matricula] : null;
                createStudentCard(alumnoData, documentosAlumno);
            });
        });
    });
}

// Función para crear una tarjeta de alumno
function createStudentCard(alumnoData, documentos) {
    const alumnosContainer = document.getElementById('alumnos-cards');
    
    // Determinar estado basado en documentos
    let status = 'zero';
    let statusText = 'No iniciado';
    
    if (documentos) {
        const totalDocumentos = 6; // Total de documentos requeridos
        const documentosCompletados = Object.values(documentos).filter(doc => doc === true).length;
        
        if (documentosCompletados === totalDocumentos) {
            status = 'complete';
            statusText = 'Completo';
        } else if (documentosCompletados > 0) {
            status = 'partial';
            statusText = `${documentosCompletados}/${totalDocumentos} documentos`;
        }
    }
    
    // Crear elementos HTML
    const card = document.createElement('div');
    card.className = `student-card status-${status}`;
    card.dataset.matricula = alumnoData.matricula;
    
    // Información del alumno
    const studentInfo = document.createElement('div');
    studentInfo.className = 'student-info';
    
    const matricula = document.createElement('span');
    matricula.className = 'matricula';
    matricula.textContent = alumnoData.matricula;
    
    const nombre = document.createElement('h3');
    nombre.className = 'nombre';
    nombre.textContent = `${alumnoData.nombres} ${alumnoData.apellidoPaterno} ${alumnoData.apellidoMaterno}`;
    
    const carrera = document.createElement('span');
    carrera.className = 'carrera';
    carrera.textContent = alumnoData.carrera;
    
    const semestre = document.createElement('span');
    semestre.className = 'semestre';
    semestre.textContent = `Semestre ${alumnoData.semestre}`;
    
    const email = document.createElement('span');
    email.className = 'email';
    const emailLink = document.createElement('a');
    emailLink.href = `mailto:${alumnoData.email}`;
    emailLink.textContent = alumnoData.email;
    email.appendChild(emailLink);
    
    const institucion = document.createElement('span');
    institucion.className = 'institucion-info';
    institucion.textContent = `Institución: ${alumnoData.institucion || 'No asignada'}`;
    
    // Estado del alumno
    const studentStatus = document.createElement('div');
    studentStatus.className = 'student-status';
    
    const statusBadge = document.createElement('span');
    statusBadge.className = 'status';
    statusBadge.textContent = statusText;
    
    const viewButton = document.createElement('button');
    viewButton.className = 'btn-view';
    viewButton.textContent = 'Ver';
    viewButton.addEventListener('click', () => {
        openModal(alumnoData.matricula);
    });

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn-delete';
    deleteButton.textContent = 'Dar de baja';
    deleteButton.addEventListener('click', () => {
        confirmDelete(alumnoData.matricula);
    });
    
    // Construir la estructura
    studentInfo.appendChild(matricula);
    studentInfo.appendChild(nombre);
    studentInfo.appendChild(carrera);
    studentInfo.appendChild(semestre);
    studentInfo.appendChild(email);
    studentInfo.appendChild(institucion);
    
    studentStatus.appendChild(statusBadge);
    studentStatus.appendChild(viewButton);
    studentStatus.appendChild(deleteButton);
    
    card.appendChild(studentInfo);
    card.appendChild(studentStatus);
    
    alumnosContainer.appendChild(card);
}

// Modal y funciones para servicio social

function openModal(matricula) {
    const modal = document.getElementById('student-modal');
    const details = document.getElementById('student-details');
    const message = document.getElementById('modal-message');
    message.textContent = '';

    // Cargar datos del alumno
    database.ref(`alumnos_servicio_social/${matricula}`).once('value', (snapshot) => {
        const alumno = snapshot.val();
        if (alumno) {
            details.dataset.matricula = matricula;
            details.innerHTML = `
                <p><strong>Matrícula:</strong> ${alumno.matricula || '-'}</p>
                <p><strong>Nombre:</strong> ${alumno.nombres || '-'} ${alumno.apellidoPaterno || '-'} ${alumno.apellidoMaterno || '-'}</p>
                <p><strong>Carrera:</strong> ${alumno.carrera || '-'}</p>
                <p><strong>Semestre:</strong> ${alumno.semestre || '-'}</p>
                <p><strong>Grupo:</strong> ${alumno.grupo || '-'}</p>
                <p><strong>Generación:</strong> ${alumno.generacion || '-'}</p>
                <p><strong>Sexo:</strong> ${alumno.sexo || '-'}</p>
                <p><strong>Institución:</strong> ${alumno.institucion || '-'} (${alumno.tipoInstitucion === 'publico' ? 'Pública' : 'Privada'})</p>
            `;
        }
    });

    // Cargar documentos
    database.ref(`gestor_servicio_social/${matricula}`).once('value', (snapshot) => {
        const documentos = snapshot.val() || {};
        document.getElementById('carta-practicas').checked = documentos.cartaPracticas || false;
        document.getElementById('carta-aceptacion').checked = documentos.cartaAceptacion || false;
        document.getElementById('bitacora').checked = documentos.bitacora || false;
        document.getElementById('reporte').checked = documentos.reporte || false;
        document.getElementById('carta-termino').checked = documentos.cartaTermino || false;
        document.getElementById('completion').checked = documentos.completion || false;
    });

    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('student-modal');
    modal.style.display = 'none';
}

function updateDocumentos(matricula) {
    const message = document.getElementById('modal-message');

    const documentosData = {
        cartaPracticas: document.getElementById('carta-practicas').checked,
        cartaAceptacion: document.getElementById('carta-aceptacion').checked,
        bitacora: document.getElementById('bitacora').checked,
        reporte: document.getElementById('reporte').checked,
        cartaTermino: document.getElementById('carta-termino').checked,
        completion: document.getElementById('completion').checked
    };

    database.ref(`gestor_servicio_social/${matricula}`).set(documentosData)
        .then(() => {
            message.textContent = 'Documentos actualizados correctamente';
            message.className = 'message success';
            setTimeout(closeModal, 2000);
            loadAlumnos();
        })
        .catch((error) => {
            message.textContent = `Error al actualizar: ${error.message}`;
            message.className = 'message error';
        });
}



function confirmDelete(matricula) {
    currentDeleteMatricula = matricula;
    const deleteModal = document.getElementById('delete-modal');
    const deleteError = document.getElementById('delete-error');
    deleteError.textContent = '';
    document.getElementById('admin-password-confirm').value = '';
    deleteModal.style.display = 'flex';
}

function closeDeleteModal() {
    const deleteModal = document.getElementById('delete-modal');
    deleteModal.style.display = 'none';
    currentDeleteMatricula = null;
}

function deleteStudent() {
    const password = document.getElementById('admin-password-confirm').value;
    const errorElement = document.getElementById('delete-error');

    if (!password) {
        errorElement.textContent = 'Por favor ingrese su contraseña';
        return;
    }

    const user = firebase.auth().currentUser;
    const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        password
    );

    user.reauthenticateWithCredential(credential)
        .then(() => {
            const deletePromises = [
                database.ref(`alumnos_servicio_social/${currentDeleteMatricula}`).remove(),
                database.ref(`gestor_servicio_social/${currentDeleteMatricula}`).remove()
            ];

            return Promise.all(deletePromises);
        })
        .then(() => {
            closeDeleteModal();
            const messageElement = document.getElementById('modal-message');
            if (messageElement) {
                messageElement.textContent = 'Alumno dado de baja correctamente';
                messageElement.className = 'message success';
            }
            loadAlumnos();
        })
        .catch((error) => {
            let errorMessage = 'Error al dar de baja';
            switch (error.code) {
                case 'auth/wrong-password':
                    errorMessage = 'Contraseña incorrecta';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Demasiados intentos. Intente más tarde';
                    break;
                default:
                    errorMessage = error.message || errorMessage;
            }
            errorElement.textContent = errorMessage;
        });
}

// Función para buscar alumnos
function searchStudents() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const cards = document.querySelectorAll('.student-card');
    
    cards.forEach(card => {
        const nombre = card.querySelector('.nombre').textContent.toLowerCase();
        const matricula = card.querySelector('.matricula').textContent.toLowerCase();
        
        if (nombre.includes(searchTerm) || matricula.includes(searchTerm)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Función para aplicar filtros
function applyFilters() {
    const carreraFilter = document.getElementById('filter-carrera').value;
    const generacionFilter = document.getElementById('filter-generacion').value;
    const grupoFilter = document.getElementById('filter-grupo').value;
    const sexoFilter = document.getElementById('filter-sexo').value;
    
    const cards = document.querySelectorAll('.student-card');
    
    cards.forEach(card => {
        const carrera = card.querySelector('.carrera').textContent;
        const semestre = card.querySelector('.semestre').textContent;
        const matricula = card.querySelector('.matricula').textContent;
        
        // Extraer generación de la matrícula (asumiendo formato 23xxxx para generación 2023)
        const generacion = '20' + matricula.substring(0, 2);
        
        // Aplicar filtros
        const carreraMatch = !carreraFilter || carrera === carreraFilter;
        const generacionMatch = !generacionFilter || generacion.includes(generacionFilter);
        const grupoMatch = !grupoFilter || (card.dataset.grupo && card.dataset.grupo === grupoFilter);
        const sexoMatch = !sexoFilter || (card.dataset.sexo && card.dataset.sexo === sexoFilter);
        
        if (carreraMatch && generacionMatch && grupoMatch && sexoMatch) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Función para limpiar filtros
function clearFilters() {
    document.getElementById('filter-carrera').value = '';
    document.getElementById('filter-generacion').value = '';
    document.getElementById('filter-grupo').value = '';
    document.getElementById('filter-sexo').value = '';
    
    const cards = document.querySelectorAll('.student-card');
    cards.forEach(card => {
        card.style.display = 'flex';
    });
    
    document.getElementById('search-input').value = '';
}
