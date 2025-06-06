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

    console.log('Cargando alumnos desde Firebase...');
    alumnosRef.on('value', alumnosSnapshot => {
        console.log('Datos de alumnos recibidos:', alumnosSnapshot.val());
        gestorRef.once('value').then(gestorSnapshot => {
            const alumnos = alumnosSnapshot.val();
            const documentos = gestorSnapshot.val();

            alumnosContainer.innerHTML = '';

            if (!alumnos) {
                alumnosContainer.innerHTML = '<div class="no-data"><i class="fas fa-user-graduate"></i><p>No hay alumnos registrados</p></div>';
                return;
            }

            Object.entries(alumnos).forEach(([matricula, alumnoData]) => {
                console.log('Creando tarjeta para alumno:', alumnoData);
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
    card.dataset.grupo = alumnoData.grupo || '';
    card.dataset.sexo = alumnoData.sexo || '';
    
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
    
    // Añadir los elementos al contenedor studentInfo
    studentInfo.appendChild(matricula);
    studentInfo.appendChild(nombre);
    studentInfo.appendChild(carrera);
    studentInfo.appendChild(semestre);
    studentInfo.appendChild(email);
    studentInfo.appendChild(institucion);
    
    // Estado del alumno
    const studentStatus = document.createElement('div');
    studentStatus.className = 'student-status';
    
    const statusBadge = document.createElement('span');
    statusBadge.className = 'status';
    statusBadge.textContent = statusText;
    
    studentStatus.appendChild(statusBadge);
    
    card.appendChild(studentInfo);
    card.appendChild(studentStatus);
    
    alumnosContainer.appendChild(card);
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
