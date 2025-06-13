// Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyDgpiwLo8E9Y7ctZu-PqEh8uaL6hEZXdLU",
    authDomain: "rassp-703df.firebaseapp.com",
    projectId: "rassp-703df",
    storageBucket: "rassp-703df.appspot.com",
    messagingSenderId: "951228921480",
    appId: "1:951228921480:web:a3a85933eb132b1748c951"
};

// Initialize Firebase
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
} catch (error) {
    console.error("Firebase initialization error:", error);
}

document.addEventListener('DOMContentLoaded', function() {
    // Get matricula from URL
    const urlParams = new URLSearchParams(window.location.search);
    const matricula = urlParams.get('matricula');

    if (matricula) {
        // Display student information
        displayStudentInfo(matricula);
        // Load public institutions by default
        displayPublicInstitutions();
    } else {
        // Handle error: matricula not found
        document.getElementById('student-info').textContent = 'Error: Matrícula no encontrada.';
    }
});

function displayStudentInfo(matricula) {
    // Fetch student data and service social institution from Firebase
    const alumnosRef = firebase.database().ref('alumnos/' + matricula);
    const servicioSocialRef = firebase.database().ref('servicio_social_instituciones/' + matricula);

    Promise.all([
        alumnosRef.once('value'),
        servicioSocialRef.once('value')
    ]).then(([alumnoSnapshot, servicioSnapshot]) => {
        const alumno = alumnoSnapshot.val();
        const institucionServicio = servicioSnapshot.val();

        if (alumno) {
            // Create HTML to display student information
            let studentInfoHTML = `
                <h2>${alumno.nombres} ${alumno.apellidoPaterno} ${alumno.apellidoMaterno}</h2>
                <p><strong>Matrícula:</strong> ${alumno.matricula}</p>
                <p><strong>Carrera:</strong> ${alumno.carrera}</p>
                <p><strong>Semestre:</strong> ${alumno.semestre}</p>
                <p><strong>Institución Actual (Servicio Social):</strong> ${institucionServicio ? `${institucionServicio.nombre} (Pública)` : 'No asignada'}</p>
            `;

            // Display student information in the student-info div
            document.getElementById('student-info').innerHTML = studentInfoHTML;
        } else {
            // Handle error: student not found
            document.getElementById('student-info').textContent = 'Error: Alumno no encontrado.';
        }
    }).catch((error) => {
        console.error('Error al cargar información del estudiante:', error);
        document.getElementById('student-info').textContent = 'Error al cargar información del estudiante.';
    });
}

function displayPublicInstitutions() {
    const institutionList = document.getElementById('institution-list');
    institutionList.innerHTML = ''; // Clear current list

    // Show loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.textContent = 'Cargando instituciones...';
    loadingMessage.className = 'message info';
    institutionList.appendChild(loadingMessage);

    // Get public institutions from Firebase
    const institucionesRef = firebase.database().ref('instituciones/publicas');

    institucionesRef.once('value')
        .then((snapshot) => {
            institutionList.innerHTML = ''; // Clear loading message

            if (!snapshot.exists()) {
                // No institutions found
                const noInstitutionsMessage = document.createElement('div');
                noInstitutionsMessage.textContent = 'No hay instituciones públicas registradas.';
                noInstitutionsMessage.className = 'message info';
                institutionList.appendChild(noInstitutionsMessage);
                return;
            }

            snapshot.forEach((childSnapshot) => {
                const institution = childSnapshot.val();
                const institutionName = childSnapshot.key;

                const institutionElement = document.createElement('div');
                institutionElement.textContent = institutionName;
                institutionElement.classList.add('institution-item');
                institutionElement.dataset.institutionName = institutionName;

                // Add institution details
                const detailsElement = document.createElement('div');
                detailsElement.classList.add('institution-details');
                detailsElement.innerHTML = `
                    <p><strong>RFC:</strong> ${institution.rfc || 'No especificado'}</p>
                    <p><strong>Contacto:</strong> ${institution.contact || 'No especificado'}</p>
                    <p><strong>Persona a cargo:</strong> ${institution.person || 'No especificado'}</p>
                    <p><strong>Dirección:</strong> ${institution.address || 'No especificada'}</p>
                `;
                institutionElement.appendChild(detailsElement);

                institutionElement.addEventListener('click', function() {
                    // Remove selected class from other institutions
                    const selectedInstitution = institutionList.querySelector('.selected');
                    if (selectedInstitution) {
                        selectedInstitution.classList.remove('selected');
                    }
                    // Add selected class to this institution
                    this.classList.add('selected');
                    
                    // Show assign button when an institution is selected
                    document.getElementById('assign-institution-button').style.display = 'block';
                });

                institutionList.appendChild(institutionElement);
            });
        })
        .catch((error) => {
            institutionList.innerHTML = ''; // Clear loading message
            console.error('Error al cargar instituciones:', error);
            const errorMessage = document.createElement('div');
            errorMessage.textContent = 'Error al cargar las instituciones. Por favor, intente de nuevo.';
            errorMessage.className = 'message error';
            institutionList.appendChild(errorMessage);
        });
}

// Event listener for add institution button
document.getElementById('add-institution-button').addEventListener('click', function() {
    document.getElementById('new-institution-form').style.display = 'block';
});

// Event listener for save institution button
document.getElementById('save-institution-button').addEventListener('click', function() {
    // Get values from the form
    const institutionName = document.getElementById('institution-name').value;
    const institutionRFC = document.getElementById('institution-rfc').value;
    const institutionContact = document.getElementById('institution-contact').value;
    const institutionPerson = document.getElementById('institution-person').value;
    const institutionAddress = document.getElementById('institution-address').value;

    if (!institutionName) {
        const message = document.createElement('div');
        message.className = 'message error';
        message.textContent = 'El nombre de la institución es obligatorio.';
        document.getElementById('new-institution-form').appendChild(message);
        return;
    }

    // Save to both instituciones/publicas and instituciones_servicio
    const institution = {
        rfc: institutionRFC,
        contact: institutionContact,
        person: institutionPerson,
        address: institutionAddress
    };

    // Save to instituciones/publicas
    const publicasRef = firebase.database().ref('instituciones/publicas/' + institutionName);
    // Save to instituciones_servicio
    const servicioRef = firebase.database().ref('instituciones_servicio/' + institutionName);

    Promise.all([
        publicasRef.set(institution),
        servicioRef.set(institution)
    ])
        .then(() => {
            // Show success message
            const message = document.createElement('div');
            message.className = 'message success';
            message.textContent = 'Institución guardada correctamente.';
            document.getElementById('new-institution-form').appendChild(message);

            // Clear the form
            document.getElementById('institution-name').value = '';
            document.getElementById('institution-rfc').value = '';
            document.getElementById('institution-contact').value = '';
            document.getElementById('institution-person').value = '';
            document.getElementById('institution-address').value = '';
            
            // Hide the form
            document.getElementById('new-institution-form').style.display = 'none';

            // Refresh the institutions list
            displayPublicInstitutions();
        })
        .catch((error) => {
            console.error('Error al guardar la institución:', error);
            // Show error message
            const message = document.createElement('div');
            message.className = 'message error';
            message.textContent = error.message || 'Error al guardar la institución.';
            document.getElementById('new-institution-form').appendChild(message);
        });
});

// Event listener for assign institution button
document.getElementById('assign-institution-button').addEventListener('click', function() {
    // Get selected institution
    const institutionList = document.getElementById('institution-list');
    const selectedInstitution = institutionList.querySelector('.selected');

    if (selectedInstitution) {
        const institutionName = selectedInstitution.dataset.institutionName;

        // Get matricula from URL
        const urlParams = new URLSearchParams(window.location.search);
        const matricula = urlParams.get('matricula');

        // Save institution info to servicio_social_instituciones in Firebase
        const servicioSocialRef = firebase.database().ref('servicio_social_instituciones/' + matricula);
        servicioSocialRef.update({ 
            nombre: institutionName,
            tipo: 'public'
        })
            .then(() => {
                // Show success message
                const message = document.createElement('div');
                message.className = 'message success';
                message.textContent = 'Institución asignada correctamente.';
                document.getElementById('institution-list').appendChild(message);

                // Redirect back after 2 seconds
                setTimeout(() => {
                    window.location.href = 'servicio_social.html';
                }, 2000);
            })
            .catch((error) => {
                console.error('Error al asignar la institución:', error);
                // Show error message
                const message = document.createElement('div');
                message.className = 'message error';
                message.textContent = 'Error al asignar la institución.';
                document.getElementById('institution-list').appendChild(message);
            });
    } else {
        // Show error message
        const message = document.createElement('div');
        message.className = 'message error';
        message.textContent = 'Por favor, seleccione una institución.';
        document.getElementById('institution-list').appendChild(message);
    }
});
