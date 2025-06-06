function registerAlumno() {
    const matricula = document.getElementById('matricula').value.trim();
    const nombres = document.getElementById('nombres').value.trim();
    const apellidoPaterno = document.getElementById('apellido-paterno').value.trim();
    const apellidoMaterno = document.getElementById('apellido-materno').value.trim();
    const correoUsername = document.getElementById('correo-username').value.trim();
    const carrera = document.getElementById('carrera').value;
    const semestre = document.getElementById('semestre').value;
    const grupo = document.getElementById('grupo').value.trim();
    const sexo = document.getElementById('sexo').value;
    const generacion = document.getElementById('generacion').value.trim();
    const discapacidad = document.getElementById('discapacidad').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const tipoInstitucion = document.getElementById('tipo-institucion').value;
    const institucion = document.getElementById('institucion').value;
    const messageElement = document.getElementById('register-message');

    // Validaciones básicas
    if (!matricula || !nombres || !apellidoPaterno || !carrera || !semestre || !sexo || !generacion || !tipoInstitucion || !institucion) {
        showAuthError("Por favor, complete todos los campos obligatorios", 'register-message');
        return;
    }

    // Crear objeto alumno
    const alumnoData = {
        matricula,
        nombres,
        apellidoPaterno,
        apellidoMaterno,
        email: `${correoUsername}@ulsaneza.edu.mx`,
        carrera,
        semestre,
        grupo: grupo || '-',
        sexo,
        generacion,
        discapacidad: discapacidad || null,
        telefono: telefono || null,
        tipoInstitucion,
        institucion,
        tipo: 'Servicio Social',
        createdAt: firebase.database.ServerValue.TIMESTAMP
    };

    // Documentos iniciales
    const documentosIniciales = {
        cartaPracticas: false,
        cartaAceptacion: false,
        bitacora: false,
        reporte: false,
        cartaTermino: false,
        evaluacionFinal: false,
        tipo: 'Servicio Social'
    };

    messageElement.textContent = "Registrando alumno...";
    messageElement.style.color = "#333";

    // Guardar en Firebase en nodos separados para servicio social
    database.ref(`alumnos_servicio_social/${matricula}`).set(alumnoData)
        .then(() => {
            return database.ref(`gestor_servicio_social/${matricula}`).set(documentosIniciales);
        })
        .then(() => {
            messageElement.textContent = "Alumno registrado exitosamente";
            messageElement.style.color = "green";
            setTimeout(() => {
                window.location.href = 'servicio_social.html';
            }, 1500);
        })
        .catch((error) => {
            showAuthError(`Error al registrar: ${error.message}`, 'register-message');
        });
}
