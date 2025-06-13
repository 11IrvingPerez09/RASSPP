document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    checkAuth();
    
    // Cargar alumnos al iniciar
    loadAlumnos();
    
    // Configurar eventos
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchStudents();
        }
    });
});

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
            
            // Verificar si completó prácticas profesionales
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
            }

            createStudentCard(alumnoData, docsServicio, practicasCompletadas, institucionServicio);
        });

        // Update student counter after loading
        updateStudentCounter();
    });
}

// Función para crear una tarjeta de alumno (solo consulta para jefe de carrera)
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
    card.dataset.grupo = alumnoData.grupo || '';
    card.dataset.sexo = alumnoData.sexo || '';
    card.dataset.semestre = alumnoData.semestre || '';
    card.dataset.status = status;
    
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
    
    // Crear contenedor de fechas
    const fechasContainer = document.createElement('div');
    fechasContainer.className = 'fechas-container';
    
    // Agregar o quitar el candado según el estado de las prácticas
    if (!practicasCompletadas) {
        const lockIcon = document.createElement('i');
        lockIcon.className = 'fas fa-lock lock-icon';
        studentInfo.appendChild(lockIcon);
    }
    
    studentInfo.appendChild(matricula);
    studentInfo.appendChild(nombre);
    studentInfo.appendChild(carrera);
    studentInfo.appendChild(semestre);
    studentInfo.appendChild(email);
    studentInfo.appendChild(institucion);
    studentInfo.appendChild(fechasContainer);
    
    // Estado del alumno (solo mostrar estado, sin botones)
    const studentStatus = document.createElement('div');
    studentStatus.className = 'student-status';
    
    const statusBadge = document.createElement('span');
    statusBadge.className = 'status';
    statusBadge.textContent = statusText;
    
    studentStatus.appendChild(statusBadge);
    
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

function applyFilters() {
    const carreraFilter = document.getElementById('filter-carrera').value;
    const semestreFilter = document.getElementById('filter-semestre').value;
    const grupoFilter = document.getElementById('filter-grupo').value;
    const generacionFilter = document.getElementById('filter-generacion').value.toLowerCase();
    const sexoFilter = document.getElementById('filter-sexo').value;
    const statusFilter = document.getElementById('filter-status').value;
    
    const cards = document.querySelectorAll('.student-card');
    
    cards.forEach(card => {
        const carrera = card.querySelector('.carrera').textContent;
        const semestre = card.dataset.semestre;
        const grupo = card.dataset.grupo;
        const matricula = card.querySelector('.matricula').textContent;
        const sexo = card.dataset.sexo;
        const status = card.dataset.status;
        
        // Extraer generación de la matrícula (asumiendo formato 23xxxx para generación 2023)
        const generacion = '20' + matricula.substring(0, 2);
        
        // Aplicar filtros
        const carreraMatch = !carreraFilter || carrera.includes(carreraFilter);
        const semestreMatch = !semestreFilter || semestre === semestreFilter;
        const grupoMatch = !grupoFilter || grupo === grupoFilter;
        const generacionMatch = !generacionFilter || generacion.includes(generacionFilter);
        const sexoMatch = !sexoFilter || sexo === sexoFilter;
        const statusMatch = !statusFilter || 
            (statusFilter === 'locked' && status === 'locked') ||
            (statusFilter === '0' && status === 'zero') ||
            (statusFilter === 'partial' && status === 'partial') ||
            (statusFilter === '6' && status === 'complete');
        
        if (carreraMatch && semestreMatch && grupoMatch && generacionMatch && sexoMatch && statusMatch) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });

    // Update counter after applying filters
    updateStudentCounter();

    // Update filter summary
    updateFilterSummary();
}

function updateFilterSummary() {
    const filterSummary = document.getElementById('filter-summary');
    const activeFilters = document.getElementById('active-filters');
    const filters = [];

    // Recopilar filtros activos
    const carrera = document.getElementById('filter-carrera').value;
    const semestre = document.getElementById('filter-semestre').value;
    const grupo = document.getElementById('filter-grupo').value;
    const generacion = document.getElementById('filter-generacion').value;
    const sexo = document.getElementById('filter-sexo').value;
    const status = document.getElementById('filter-status').value;

    if (carrera) filters.push(`Carrera: ${carrera}`);
    if (semestre) filters.push(`Semestre: ${semestre}`);
    if (grupo) filters.push(`Grupo: ${grupo}`);
    if (generacion) filters.push(`Generación: ${generacion}`);
    if (sexo) filters.push(`Sexo: ${sexo}`);
    if (status) {
        const statusText = status === 'locked' ? 'Bloqueado' :
                          status === '0' ? 'Sin documentos' : 
                          status === 'partial' ? 'En progreso' : 
                          'Completo';
        filters.push(`Estado: ${statusText}`);
    }

    if (filters.length > 0) {
        activeFilters.innerHTML = filters.map(filter => `<span class="filter-tag">${filter}</span>`).join('');
        filterSummary.style.display = 'block';
    } else {
        filterSummary.style.display = 'none';
    }
}

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
    document.getElementById('filter-summary').style.display = 'none';
    
    // Update counter after clearing filters
    updateStudentCounter();
}

// Función para actualizar el contador de estudiantes
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
