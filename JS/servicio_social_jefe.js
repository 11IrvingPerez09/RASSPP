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

    // Event listeners para los botones de filtros
    const applyFiltersBtn = document.querySelector('.apply-filters');
    const clearFiltersBtn = document.querySelector('.clear-filters');
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
});

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

// Función para cargar alumnos desde Firebase (servicio social)
function loadAlumnos() {
    const alumnosRef = firebase.database().ref('alumnos');
    const gestorPracticasRef = firebase.database().ref('gestor_alumnos');
    const gestorServicioRef = firebase.database().ref('gestor_servicio_social');
    const servicioSocialInstitucionesRef = firebase.database().ref('servicio_social_instituciones');
    const alumnosContainer = document.getElementById('alumnos-cards');

    Promise.all([
        alumnosRef.once('value'),
        gestorPracticasRef.once('value'),
        gestorServicioRef.once('value'),
        servicioSocialInstitucionesRef.once('value')
    ]).then(([alumnosSnapshot, gestorPracticasSnapshot, gestorServicioSnapshot, servicioSocialInstitucionesSnapshot]) => {
        const alumnos = alumnosSnapshot.val();
        const documentosPracticas = gestorPracticasSnapshot.val();
        const documentosServicio = gestorServicioSnapshot.val();
        const servicioSocialInstituciones = servicioSocialInstitucionesSnapshot.val();

        alumnosContainer.innerHTML = '';

        if (!alumnos) {
            alumnosContainer.innerHTML = '<div class="no-data"><i class="fas fa-user-graduate"></i><p>No hay alumnos registrados</p></div>';
            return;
        }

        Object.entries(alumnos).forEach(([matricula, alumnoData]) => {
            const docsPracticas = documentosPracticas && documentosPracticas[matricula] ? documentosPracticas[matricula] : null;
            const docsServicio = documentosServicio && documentosServicio[matricula] ? documentosServicio[matricula] : null;
            const institucionServicio = servicioSocialInstituciones && servicioSocialInstituciones[matricula] ? servicioSocialInstituciones[matricula] : null;
            
            // Verificar si completó prácticas profesionales (usando los mismos campos que en practicas_profesionales_jefe.js)
            let practicasCompletadas = false;
            if (docsPracticas) {
                const documentosRequeridos = [
                    docsPracticas.cartaPracticas,
                    docsPracticas.cartaAceptacion,
                    docsPracticas.bitacora,
                    docsPracticas.reporte,
                    docsPracticas.cartaTermino,
                    docsPracticas.completion
                ];
                const documentosCompletados = documentosRequeridos.filter(doc => doc === true).length;
                practicasCompletadas = documentosCompletados === 6;
                console.log(`Alumno ${matricula}: ${documentosCompletados}/6 documentos completados en prácticas`, docsPracticas);
            } else {
                console.log(`Alumno ${matricula}: No tiene datos de prácticas profesionales`);
            }

            createStudentCard(alumnoData, docsServicio, practicasCompletadas, institucionServicio);
        });
        
        // Update student counter after loading all students
        updateStudentCounter();
    });
}

// Función para crear una tarjeta de alumno
function createStudentCard(alumnoData, documentos, practicasCompletadas, institucionServicio) {
    const alumnosContainer = document.getElementById('alumnos-cards');
    
    // Determinar estado basado en documentos
    let status = 'zero';
    let statusText = 'No iniciado';
    
    // Verificar si las prácticas están completadas
    if (practicasCompletadas) {
        // Si las prácticas están completas, mostrar el estado de servicio social
        if (documentos && Object.values(documentos).some(doc => doc === true)) {
            const totalDocumentos = 6;
            const documentosCompletados = Object.values(documentos).filter(doc => doc === true).length;
            
            if (documentosCompletados === totalDocumentos) {
                status = 'complete';
                statusText = 'Completo';
            } else if (documentosCompletados > 0) {
                status = 'partial';
                statusText = `${documentosCompletados}/${totalDocumentos} documentos`;
            }
        } else {
            // Si las prácticas están completas pero no ha iniciado servicio social
            status = 'zero';
            statusText = 'No iniciado - 0/6 documentos';
        }
    } else {
        // Si las prácticas no están completas, mostrar estado bloqueado
        status = 'locked';
        statusText = 'Bloqueado - Complete Prácticas Profesionales';
    }

    // Crear elementos HTML
    const card = document.createElement('div');
    card.className = `student-card status-${status}`;
    card.dataset.matricula = alumnoData.matricula;
    card.dataset.practicasCompletadas = practicasCompletadas;
    
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
    institucion.textContent = `Institución: ${institucionServicio ? `${institucionServicio.nombre} (Pública)` : 'No asignada'}`;
    
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
        if (practicasCompletadas) {
            openModal(alumnoData.matricula);
        } else {
            alert('El alumno debe completar sus Prácticas Profesionales primero');
        }
    });

    const modifyInstitutionButton = document.createElement('button');
    modifyInstitutionButton.className = 'btn-modify-institution';
    modifyInstitutionButton.textContent = 'Modificar Institución';
    modifyInstitutionButton.disabled = !practicasCompletadas;
    if (practicasCompletadas) {
        modifyInstitutionButton.addEventListener('click', () => {
            modifyInstitutionServicio(alumnoData.matricula);
        });
    }

    const editButton = document.createElement('button');
    editButton.className = 'btn-edit';
    editButton.textContent = 'Modificar Alumno';
    editButton.addEventListener('click', () => {
        if (practicasCompletadas) {
            openEditModal(alumnoData.matricula);
        } else {
            alert('El alumno debe completar sus Prácticas Profesionales primero');
        }
    });

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn-delete';
    deleteButton.textContent = 'Dar de baja';
    deleteButton.addEventListener('click', () => {
        if (practicasCompletadas) {
            confirmDelete(alumnoData.matricula);
        } else {
            alert('El alumno debe completar sus Prácticas Profesionales primero');
        }
    });

    // Agregar o quitar el candado según el estado de las prácticas
    if (!practicasCompletadas) {
        const lockIcon = document.createElement('i');
        lockIcon.className = 'fas fa-lock lock-icon';
        studentInfo.appendChild(lockIcon);
        
        // Deshabilitar botones visualmente
        viewButton.disabled = true;
        editButton.disabled = true;
        deleteButton.disabled = true;
    } else {
        // Habilitar botones para alumnos desbloqueados
        viewButton.disabled = false;
        editButton.disabled = false;
        deleteButton.disabled = false;
    }
    
    // Construir la estructura
    // Crear contenedor de fechas
    const fechasContainer = document.createElement('div');
    fechasContainer.className = 'fechas-container';
    
    studentInfo.appendChild(matricula);
    studentInfo.appendChild(nombre);
    studentInfo.appendChild(carrera);
    studentInfo.appendChild(semestre);
    studentInfo.appendChild(email);
    studentInfo.appendChild(institucion);
    studentInfo.appendChild(fechasContainer);
    
    studentStatus.appendChild(statusBadge);
    studentStatus.appendChild(viewButton);
    studentStatus.appendChild(editButton);
    studentStatus.appendChild(modifyInstitutionButton);
    studentStatus.appendChild(deleteButton);
    
    card.appendChild(studentInfo);
    card.appendChild(studentStatus);
    
    alumnosContainer.appendChild(card);

    // Obtener fechas de servicio social
    database.ref(`fechas_servicio_social/${alumnoData.matricula}`).once('value')
        .then((snapshot) => {
            const fechasData = snapshot.val();
            if (fechasData) {
                const fechaInicio = new Date(fechasData.fechaInicio);
                const fechaLimite = new Date(fechasData.fechaLimite);
                const hoy = new Date();
                
                // Formatear fechas
                const formatoFecha = { year: 'numeric', month: 'long', day: 'numeric' };
                const fechaInicioStr = fechaInicio.toLocaleDateString('es-MX', formatoFecha);
                const fechaLimiteStr = fechaLimite.toLocaleDateString('es-MX', formatoFecha);
                
                // Calcular días restantes
                const diasRestantes = Math.ceil((fechaLimite - hoy) / (1000 * 60 * 60 * 24));
                
                // Agregar fechas al contenedor de fechas
                const fechasContainer = card.querySelector('.fechas-container');
                if (fechasContainer) {
                    fechasContainer.innerHTML = `
                        <span class="fecha">Fecha de inicio: ${fechaInicioStr}</span>
                        <span class="fecha ${diasRestantes <= 30 ? 'urgente' : ''}">
                            Fecha límite: ${fechaLimiteStr}
                            ${diasRestantes <= 30 ? ` (${diasRestantes} días restantes)` : ''}
                        </span>
                    `;
                }
            }
        });
}

// Modal y funciones para servicio social

function openModal(matricula) {
    const modal = document.getElementById('student-modal');
    const details = document.getElementById('student-details');
    const message = document.getElementById('modal-message');
    message.textContent = '';

    // Cargar datos del alumno desde la tabla principal de alumnos
    database.ref(`alumnos/${matricula}`).once('value', (snapshot) => {
        const alumno = snapshot.val();
        if (alumno) {
            details.dataset.matricula = matricula;
            details.innerHTML = `
                <h2>Detalles del Estudiante - Servicio Social</h2>
                <p><strong>Matrícula:</strong> ${alumno.matricula || '-'}</p>
                <p><strong>Nombre:</strong> ${alumno.nombres || '-'} ${alumno.apellidoPaterno || '-'} ${alumno.apellidoMaterno || '-'}</p>
                <p><strong>Carrera:</strong> ${alumno.carrera || '-'}</p>
                <p><strong>Semestre:</strong> ${alumno.semestre || '-'}</p>
                <p><strong>Grupo:</strong> ${alumno.grupo || '-'}</p>
                <p><strong>Generación:</strong> ${alumno.generacion || '-'}</p>
                <p><strong>Sexo:</strong> ${alumno.sexo || '-'}</p>
                <p><strong>Institución:</strong> ${alumno.institucion ? `${alumno.institucion.nombre} (${alumno.institucion.tipo === 'public' ? 'Pública' : 'Privada'})` : 'No asignada'}</p>
                <h3>Documentos de Servicio Social</h3>
            `;
        }
    });

    // Cargar documentos de servicio social (empezando desde 0)
    database.ref(`gestor_servicio_social/${matricula}`).once('value', (snapshot) => {
        const documentos = snapshot.val();
        
        // Solo mostrar documentos marcados si el estudiante ya inició el servicio social
        if (documentos && Object.values(documentos).some(doc => doc === true)) {
            document.getElementById('carta-practicas').checked = documentos.cartaPracticas || false;
            document.getElementById('carta-aceptacion').checked = documentos.cartaAceptacion || false;
            document.getElementById('bitacora').checked = documentos.bitacora || false;
            document.getElementById('reporte').checked = documentos.reporte || false;
            document.getElementById('carta-termino').checked = documentos.cartaTermino || false;
            document.getElementById('completion').checked = documentos.completion || false;
        } else {
            // Si no ha iniciado, todos los checkboxes deben estar desmarcados
            document.getElementById('carta-practicas').checked = false;
            document.getElementById('carta-aceptacion').checked = false;
            document.getElementById('bitacora').checked = false;
            document.getElementById('reporte').checked = false;
            document.getElementById('carta-termino').checked = false;
            document.getElementById('completion').checked = false;
        }
    });

    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('student-modal');
    modal.style.display = 'none';
}

function updateDocumentos(matricula) {
    const message = document.getElementById('modal-message');

    // Primero verificar si el alumno completó prácticas profesionales
    database.ref(`gestor_alumnos/${matricula}`).once('value')
        .then((snapshot) => {
            const practicasData = snapshot.val();
            if (!practicasData) {
                throw new Error('No se encontraron datos de prácticas profesionales');
            }

            // Verificar usando los mismos campos que en el sistema de prácticas
            const documentosRequeridos = [
                practicasData.cartaPracticas,
                practicasData.cartaAceptacion,
                practicasData.bitacora,
                practicasData.reporte,
                practicasData.cartaTermino,
                practicasData.completion
            ];
            const documentosCompletados = documentosRequeridos.filter(doc => doc === true).length;
            const practicasCompletadas = documentosCompletados === 6;
            
            if (!practicasCompletadas) {
                throw new Error(`El alumno debe completar sus Prácticas Profesionales primero (${documentosCompletados}/6 completados)`);
            }

            // Si las prácticas están completas, proceder con la actualización
            const documentosData = {
                cartaPracticas: document.getElementById('carta-practicas').checked,
                cartaAceptacion: document.getElementById('carta-aceptacion').checked,
                bitacora: document.getElementById('bitacora').checked,
                reporte: document.getElementById('reporte').checked,
                cartaTermino: document.getElementById('carta-termino').checked,
                completion: document.getElementById('completion').checked
            };

            // Verificar si es el primer documento que se marca como completado
            return database.ref(`gestor_servicio_social/${matricula}`).once('value')
                .then((docSnapshot) => {
                    const currentDocs = docSnapshot.val() || {};
                    const currentDocsCompleted = Object.values(currentDocs).filter(doc => doc === true).length;
                    const newDocsCompleted = Object.values(documentosData).filter(doc => doc === true).length;

                    // Si es el primer documento completado, agregar fechas
                    if (currentDocsCompleted === 0 && newDocsCompleted > 0) {
                        const fechaInicio = new Date().toISOString();
                        const fechaLimite = new Date();
                        fechaLimite.setMonth(fechaLimite.getMonth() + 6);
                        
                        // Guardar documentos y fechas
                        const updates = {};
                        updates[`gestor_servicio_social/${matricula}`] = documentosData;
                        updates[`fechas_servicio_social/${matricula}`] = {
                            fechaInicio: fechaInicio,
                            fechaLimite: fechaLimite.toISOString()
                        };
                        return database.ref().update(updates);
                    } else if (newDocsCompleted > 0) {
                        // Si ya hay documentos iniciados, solo actualizar documentos
                        return database.ref(`gestor_servicio_social/${matricula}`).set(documentosData);
                    } else {
                        // Si se desmarcaron todos los documentos, eliminar el registro
                        const updates = {};
                        updates[`gestor_servicio_social/${matricula}`] = null;
                        updates[`fechas_servicio_social/${matricula}`] = null;
                        return database.ref().update(updates);
                    }
                });
        })
        .then(() => {
            message.textContent = 'Documentos actualizados correctamente';
            message.className = 'message success';
            setTimeout(closeModal, 2000);
            loadAlumnos();
        })
        .catch((error) => {
            message.textContent = error.message;
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
            // Eliminar tanto los documentos como la institución de servicio social
            const updates = {};
            updates[`gestor_servicio_social/${currentDeleteMatricula}`] = null;
            updates[`servicio_social_instituciones/${currentDeleteMatricula}`] = null;
            return database.ref().update(updates);
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

function modifyInstitutionServicio(matricula) {
    window.location.href = `modificar_institucion_servicio.html?matricula=${matricula}`;
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
    
    // Update counter after search
    updateStudentCounter();
}

// Función para aplicar filtros
function applyFilters() {
    const carrera = document.getElementById('filter-carrera').value;
    const semestre = document.getElementById('filter-semestre').value;
    const grupo = document.getElementById('filter-grupo').value;
    const generacion = document.getElementById('filter-generacion').value.toLowerCase();
    const sexo = document.getElementById('filter-sexo').value;
    const status = document.getElementById('filter-status').value;

    const cards = document.querySelectorAll('.student-card');
    let processedCards = 0;

    cards.forEach(card => {
        const matricula = card.dataset.matricula;

        // Obtener los datos del alumno desde Firebase
        firebase.database().ref(`alumnos/${matricula}`).once('value').then(snapshot => {
            const alumno = snapshot.val();
            let showCard = true;

            if (carrera && alumno.carrera !== carrera) {
                showCard = false;
            }

            if (semestre && alumno.semestre !== semestre) {
                showCard = false;
            }

            if (grupo && alumno.grupo !== grupo) {
                showCard = false;
            }

            if (generacion && (!alumno.generacion || !alumno.generacion.toLowerCase().includes(generacion))) {
                showCard = false;
            }

            if (sexo && alumno.sexo !== sexo) {
                showCard = false;
            }

            // Filtro por estado de documentos
            if (status) {
                const practicasCompletadas = card.dataset.practicasCompletadas === 'true';
                const statusClass = card.className;
                
                if (status === 'locked' && practicasCompletadas) {
                    showCard = false;
                } else if (status === '0' && (practicasCompletadas && !statusClass.includes('status-zero'))) {
                    showCard = false;
                } else if (status === 'partial' && !statusClass.includes('status-partial')) {
                    showCard = false;
                } else if (status === '6' && !statusClass.includes('status-complete')) {
                    showCard = false;
                }
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

// Función para limpiar filtros
function clearFilters() {
    document.getElementById('filter-carrera').value = '';
    document.getElementById('filter-semestre').value = '';
    document.getElementById('filter-grupo').value = '';
    document.getElementById('filter-generacion').value = '';
    document.getElementById('filter-sexo').value = '';
    document.getElementById('filter-status').value = '';
    
    const cards = document.querySelectorAll('.student-card');
    cards.forEach(card => {
        card.style.display = 'flex';
    });
    
    document.getElementById('search-input').value = '';
    
    // Update counter after clearing filters
    updateStudentCounter();
}

// Variables globales para el modal de edición
let currentEditMatricula = null;

// Función para abrir el modal de edición
function openEditModal(matricula) {
    currentEditMatricula = matricula;
    const modal = document.getElementById('edit-student-modal');
    const errorElement = document.getElementById('edit-error');
    errorElement.textContent = '';

    // Cargar datos actuales del alumno
    database.ref(`alumnos/${matricula}`).once('value', (snapshot) => {
        const alumno = snapshot.val();
        if (alumno) {
            document.getElementById('edit-semestre').value = alumno.semestre || '';
            document.getElementById('edit-grupo').value = alumno.grupo || '';
            document.getElementById('edit-generacion').value = alumno.generacion || '';
        }
    });

    modal.style.display = 'flex';
}

// Función para cerrar el modal de edición
function closeEditModal() {
    const modal = document.getElementById('edit-student-modal');
    modal.style.display = 'none';
    currentEditMatricula = null;
    
    // Limpiar campos
    document.getElementById('edit-semestre').value = '';
    document.getElementById('edit-grupo').value = '';
    document.getElementById('edit-generacion').value = '';
    document.getElementById('edit-error').textContent = '';
}

// Función para guardar los cambios del alumno
function saveStudentChanges() {
    const semestre = document.getElementById('edit-semestre').value;
    const grupo = document.getElementById('edit-grupo').value.toUpperCase();
    const generacion = document.getElementById('edit-generacion').value;
    const errorElement = document.getElementById('edit-error');

    // Validaciones
    if (!semestre || !grupo || !generacion) {
        errorElement.textContent = 'Todos los campos son obligatorios';
        return;
    }


    if (!/^\d{4}-\d{4}$/.test(generacion)) {
        errorElement.textContent = 'La generación debe tener el formato YYYY-YYYY (ej: 2023-2025)';
        return;
    }

    // Actualizar datos en Firebase
    const updates = {};
    updates[`alumnos/${currentEditMatricula}/semestre`] = semestre;
    updates[`alumnos/${currentEditMatricula}/grupo`] = grupo;
    updates[`alumnos/${currentEditMatricula}/generacion`] = generacion;

    database.ref().update(updates)
        .then(() => {
            closeEditModal();
            // Mostrar mensaje de éxito
            const messageElement = document.getElementById('modal-message');
            if (messageElement) {
                messageElement.textContent = 'Datos del alumno actualizados correctamente';
                messageElement.className = 'message success';
            }
            // Recargar la lista de alumnos para mostrar los cambios
            loadAlumnos();
        })
        .catch((error) => {
            errorElement.textContent = 'Error al actualizar los datos: ' + error.message;
        });
}
