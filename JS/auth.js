if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const database = firebase.database();
const firestore = firebase.firestore();

// Clase Alumno con getters y setters
class Alumno {
    constructor(data) {
        this._matricula = data.matricula || '';
        this._nombres = data.nombres || '';
        this._apellidoPaterno = data.apellidoPaterno || '';
        this._apellidoMaterno = data.apellidoMaterno || '';
        this._email = data.email || '';
        this._carrera = data.carrera || '';
        this._semestre = data.semestre || '';
        this._grupo = data.grupo || '';
        this._sexo = data.sexo || '';
        this._generacion = data.generacion || '';
        this._discapacidad = data.discapacidad || null;
        this._telefono = data.telefono || null;
        this._createdAt = data.createdAt || null;
    }

    // Getter para el nombre completo
    get nombreCompleto() {
        return `${this._nombres} ${this._apellidoPaterno} ${this._apellidoMaterno}`;
    }

    // Getter y Setter para la matrícula
    get matricula() {
        return this._matricula;
    }

    set matricula(value) {
        if (!value || typeof value !== 'string') {
            throw new Error('La matrícula debe ser una cadena no vacía.');
        }
        this._matricula = value;
    }

    // Getter y Setter para la carrera
    get carrera() {
        return this._carrera;
    }

    set carrera(value) {
        if (!value || typeof value !== 'string') {
            throw new Error('La carrera debe ser una cadena no vacía.');
        }
        this._carrera = value;
    }

    // Getter y Setter para el semestre
    get semestre() {
        return this._semestre;
    }

    set semestre(value) {
        if (!value || !['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'].includes(value)) {
            throw new Error('El semestre debe ser un valor válido entre 1 y 10.');
        }
        this._semestre = value;
    }

    // Getters para las otras propiedades (para compatibilidad)
    get nombres() {
        return this._nombres;
    }

    get apellidoPaterno() {
        return this._apellidoPaterno;
    }

    get apellidoMaterno() {
        return this._apellidoMaterno;
    }

    get email() {
        return this._email;
    }

    get grupo() {
        return this._grupo;
    }

    get sexo() {
        return this._sexo;
    }

    get generacion() {
        return this._generacion;
    }

    get discapacidad() {
        return this._discapacidad;
    }

    get telefono() {
        return this._telefono;
    }

    get createdAt() {
        return this._createdAt;
    }

        toJSON() {
        return {
            matricula: this._matricula,
            nombres: this._nombres,
            apellidoPaterno: this._apellidoPaterno,
            apellidoMaterno: this._apellidoMaterno,
            email: this._email,
            carrera: this._carrera,
            semestre: this._semestre,
            grupo: this._grupo,
            sexo: this._sexo,
            generacion: this._generacion,
            discapacidad: this._discapacidad,
            telefono: this._telefono,
            createdAt: this._createdAt,
            tipo: this._tipo || 'Servicio Social' // Añadido para diferenciar
        };
    }
}

// Función para mostrar errores
function showAuthError(message, elementId = '') {
    const errorElement = elementId ? document.getElementById(elementId) : 
                         document.getElementById('admin-message') || 
                         document.getElementById('jefe-message') || 
                         document.getElementById('register-message');
    
    // Obtener los campos de entrada según la página
    const inputs = document.querySelectorAll('.login-box input');
    const emailContainer = document.querySelector('.email-container');
    
    // Agregar clase de error a los campos
    inputs.forEach(input => input.classList.add('error'));
    if (emailContainer) emailContainer.classList.add('error');
    
    // Convertir mensajes de error a formato amigable
    let userFriendlyMessage = message;
    
    if (message.includes('INVALID_LOGIN_CREDENTIALS')) {
        userFriendlyMessage = "La matrícula o contraseña son incorrectos. Por favor verifica tus datos.";
    } else if (message.includes('user-not-found')) {
        userFriendlyMessage = "No se encontró ningún usuario con esta matrícula.";
    } else if (message.includes('wrong-password')) {
        userFriendlyMessage = "La contraseña ingresada es incorrecta.";
    } else if (message.includes('invalid-email')) {
        userFriendlyMessage = "El formato de la matrícula no es válido.";
    } else if (message.includes('email-already-in-use')) {
        userFriendlyMessage = "Esta matrícula ya está registrada en el sistema.";
    } else if (message.includes('weak-password')) {
        userFriendlyMessage = "La contraseña debe tener al menos 6 caracteres.";
    }
    
    if (errorElement) {
        errorElement.textContent = userFriendlyMessage;
        errorElement.style.color = '#D81E05';
        
        // Remover las clases de error después de 5 segundos
        setTimeout(() => {
            errorElement.textContent = '';
            inputs.forEach(input => input.classList.remove('error'));
            if (emailContainer) emailContainer.classList.remove('error');
        }, 5000);
    }
    console.error(message); // Mantener el mensaje original en la consola para debugging
}

// Función de login para administradores (actualizada)
function adminLogin() {
    const usernameInput = document.getElementById('admin-email-username');
    const passwordInput = document.getElementById('admin-password');
    const messageElement = document.getElementById('admin-message');

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        showAuthError("Por favor, complete todos los campos", 'admin-message');
        return;
    }

    const email = `${username}@ulsaneza.edu.mx`;
    
    messageElement.textContent = "Iniciando sesión...";
    messageElement.style.color = "#333";

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            // Verificar si el correo está verificado
            if (!user.emailVerified) {
                return user.sendEmailVerification().then(() => {
                    auth.signOut();
                    throw new Error("Se envió un correo de verificación. Por favor verifique su correo antes de iniciar sesión.");
                });
            }

            // Redirección exitosa
            messageElement.textContent = "¡Bienvenido! Redirigiendo...";
            messageElement.style.color = "green";
            setTimeout(() => {
                window.location.href = "menu_principal.html";
            }, 1500);
        })
 .catch((error) => {
  let errorMessage = "Error al iniciar sesión, \n Verifica tu correo y contraseña.";



  showAuthError(errorMessage, 'admin-message');
});

}

// Función de login para jefes de carrera (actualizada)
function jefeLogin() {
    const usernameInput = document.getElementById('jefe-email-username');
    const passwordInput = document.getElementById('jefe-password');
    const messageElement = document.getElementById('jefe-message');

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        showAuthError("Por favor, complete todos los campos", 'jefe-message');
        return;
    }

    const email = `${username}@ulsaneza.edu.mx`;
    
    messageElement.textContent = "Iniciando sesión...";
    messageElement.style.color = "#333";

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            if (!user.emailVerified) {
                return user.sendEmailVerification().then(() => {
                    auth.signOut();
                    throw new Error("Se envió un correo de verificación. Por favor verifique su correo antes de iniciar sesión.");
                });
            }

            // Verificar en Realtime Database si es jefe de carrera y obtener su nombre
            return database.ref(`jefes_carrera/${user.uid}`).once('value')
                .then((snapshot) => {
                    if (!snapshot.exists()) {
                        auth.signOut();
                        throw new Error("No tienes permisos de jefe de carrera");
                    }
                    
                    // Guardar el nombre completo en localStorage para usarlo en la página de bienvenida
                    const jefeData = snapshot.val();
                    localStorage.setItem('jefeFullName', jefeData.fullname);
                    
                    messageElement.textContent = "¡Bienvenido! Redirigiendo...";
                    messageElement.style.color = "green";
                    setTimeout(() => {
                        window.location.href = "menu_principal_jefe.html";
                    }, 1500);
                });
        })
        .catch((error) => {
            let errorMessage = "Error al iniciar sesión";
            
            switch(error.code) {
                case 'auth/user-not-found':
                    errorMessage = "Usuario no registrado";
                    break;
                case 'auth/wrong-password':
                    errorMessage = "Contraseña incorrecta";
                    break;
                case 'auth/invalid-email':
                    errorMessage = "Formato de correo inválido";
                    break;
                default:
                    errorMessage = error.message || errorMessage;
            }
            
            showAuthError(errorMessage, 'jefe-message');
        });
}

// Función para registrar jefes de carrera (actualizada)
function registerJefe() {
    const usernameInput = document.getElementById('register-email-username');
    const passwordInput = document.getElementById('register-password');
    const fullnameInput = document.getElementById('register-fullname');
    const carreras = Array.from(document.querySelectorAll('input[name="carreras"]:checked')).map(input => input.value);
    const messageElement = document.getElementById('register-message');

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const fullname = fullnameInput.value.trim();

    if (!username || !password || !fullname || carreras.length === 0) {
        showAuthError("Por favor, complete todos los campos y seleccione al menos una carrera", 'register-message');
        return;
    }

    const email = `${username}@ulsaneza.edu.mx`;
    
    messageElement.textContent = "Registrando usuario...";
    messageElement.style.color = "#333";

    auth.createUserWithEmailAndPassword(email, password)
.then((userCredential) => {
    const user = userCredential.user;
    console.log("Usuario creado:", user.uid); // 👈 AGREGADO

    return database.ref(`jefes_carrera/${user.uid}`).set({
        fullname: fullname,
        email: email,
        carreras: carreras,
        createdAt: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
        console.log("Datos guardados en Realtime DB ✅"); // 👈 AGREGADO
        return user.sendEmailVerification();
    });
})
        .then(() => {
            messageElement.textContent = "Registro exitoso. Se envió un correo de verificación.";
            messageElement.style.color = "green";
            setTimeout(() => {
                window.location.href = "login_jefe.html";
            }, 3000);
        })
        .catch((error) => {
            let errorMessage = "Error al registrar";
            
            switch(error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = "El correo ya está registrado";
                    break;
                case 'auth/weak-password':
                    errorMessage = "La contraseña debe tener al menos 6 caracteres";
                    break;
                default:
                    errorMessage = error.message || errorMessage;
            }
            
            showAuthError(errorMessage, 'register-message');
        });
}

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
        tipo: 'Prácticas Profesionales',
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
        tipo: 'Prácticas Profesionales'
    };

    messageElement.textContent = "Registrando alumno...";
    messageElement.style.color = "#333";

    // Guardar en Firebase
    database.ref(`alumnos/${matricula}`).set(alumnoData)
        .then(() => {
            return database.ref(`gestor_alumnos/${matricula}`).set(documentosIniciales);
        })
        .then(() => {
            messageElement.textContent = "Alumno registrado exitosamente";
            messageElement.style.color = "green";
            setTimeout(() => {
                window.location.href = 'practicas_profesionales.html';
            }, 1500);
        })
        .catch((error) => {
            showAuthError(`Error al registrar: ${error.message}`, 'register-message');
        });
}

// Función para cerrar sesión (actualizada)
function logout() {
    auth.signOut()
        .then(() => {
            // Redirigir según el tipo de usuario
            const currentPage = window.location.pathname;
            if (currentPage.includes('admin')) {
                window.location.href = '../index.html';
            } else if (currentPage.includes('jefe')) {
                window.location.href = '../index.html';
            } else {
                window.location.href = '../index.html';
            }
        })
        .catch((error) => {
            console.error("Error al cerrar sesión:", error);
            showAuthError("Error al cerrar sesión");
        });
}

// Verificar autenticación al cargar la página
function checkAuth() {
    auth.onAuthStateChanged((user) => {
        const currentPage = window.location.pathname;
        
        const protectedPages = [
            'menu_principal.html',
            'menu_principal_jefe.html',
            'servicio_social.html',
            'practicas_profesionales.html',
            'gestion_carrera.html',
            'alta_alumno.html',
            'alta_alumno_servicio.html',
            'gestion_practicas.html',
            'gestion_servicio.html'
        ];

        const isProtectedPage = protectedPages.some(page => currentPage.includes(page));

        if (isProtectedPage && !user) {
            if (currentPage.includes('admin') || currentPage.includes('alta_alumno')) {
                window.location.href = 'login_admin.html';
            } else if (currentPage.includes('jefe') || currentPage.includes('gestion')) {
                window.location.href = 'login_jefe.html';
            } else {
                window.location.href = 'index.html';
            }
        } else if (user && (currentPage.includes('login') || currentPage.includes('register'))) {
            if (user.email.endsWith('@ulsaneza.edu.mx')) {
                // Verificar en Realtime Database
                database.ref(`jefes_carrera/${user.uid}`).once('value')
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            window.location.href = 'menu_principal_jefe.html';
                        } else {
                            window.location.href = 'menu_principal.html';
                        }
                    });
            }
        }
    });
}

// Inicializar verificación de autenticación
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Agregar listeners para limpiar estados de error al escribir
    const inputs = document.querySelectorAll('.login-box input');
    const emailContainer = document.querySelector('.email-container');
    
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('error');
            if (emailContainer && input.parentElement === emailContainer) {
                emailContainer.classList.remove('error');
            }
        });
    });
});

// Agregar estas funciones a auth.js
function mostrarInstituciones() {
  const tipo = document.getElementById('tipo-institucion').value;
  const institucionesContainer = document.getElementById('instituciones-container');
  const institucionSelect = document.getElementById('institucion');
  
  institucionesContainer.style.display = 'block';
  document.getElementById('nueva-institucion-container').style.display = 'none';
  
  // Limpiar opciones anteriores
  institucionSelect.innerHTML = '<option value="" disabled selected>Seleccione institución</option>';
  
  // Obtener instituciones de Firebase
  database.ref(`instituciones/${tipo}`).once('value').then((snapshot) => {
    const instituciones = snapshot.val();
    
    if (instituciones) {
      Object.keys(instituciones).forEach(key => {
        const option = document.createElement('option');
        option.value = instituciones[key].nombre;
        option.textContent = instituciones[key].nombre;
        institucionSelect.appendChild(option);
      });
    }
    
    // Agregar opciones por defecto según el tipo
    if (tipo === 'publico') {
      agregarOpcionInstitucion(institucionSelect, 'SAT');
      agregarOpcionInstitucion(institucionSelect, 'IMSS');
    } else if (tipo === 'privado') {
      agregarOpcionInstitucion(institucionSelect, 'INGRAM');
    }
  });
}

function agregarOpcionInstitucion(select, nombre) {
  // Verificar si ya existe
  const existe = Array.from(select.options).some(opt => opt.value === nombre);
  if (!existe) {
    const option = document.createElement('option');
    option.value = nombre;
    option.textContent = nombre;
    select.appendChild(option);
  }
}

function mostrarAgregarInstitucion() {
  document.getElementById('nueva-institucion-container').style.display = 'block';
  document.getElementById('nueva-institucion').value = '';
}

function cancelarAgregarInstitucion() {
  document.getElementById('nueva-institucion-container').style.display = 'none';
}

function agregarInstitucion() {
  const tipo = document.getElementById('tipo-institucion').value;
  const nombre = document.getElementById('nueva-institucion').value.trim();
  
  if (!nombre) {
    showAuthError("Por favor ingrese el nombre de la institución", 'register-message');
    return;
  }
  
  // Guardar en Firebase
  const nuevaInstitucion = {
    nombre: nombre,
    tipo: tipo,
    createdAt: firebase.database.ServerValue.TIMESTAMP
  };
  
  database.ref(`instituciones/${tipo}`).push(nuevaInstitucion)
    .then(() => {
      // Actualizar el select
      mostrarInstituciones();
      document.getElementById('nueva-institucion-container').style.display = 'none';
      document.getElementById('institucion').value = nombre;
    })
    .catch(error => {
      showAuthError("Error al agregar institución: " + error.message, 'register-message');
    });
}

// Variables para almacenar temporalmente la matrícula a eliminar
let currentDeleteMatricula = null;

function confirmDelete(matricula) {
  currentDeleteMatricula = matricula;
  document.getElementById('delete-modal').style.display = 'block';
  document.getElementById('admin-password-confirm').value = '';
  document.getElementById('delete-error').textContent = '';
}

function closeDeleteModal() {
  document.getElementById('delete-modal').style.display = 'none';
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

  // Reautenticar al administrador
  user.reauthenticateWithCredential(credential)
    .then(() => {
      // Eliminar al alumno de ambas ubicaciones
      const deletePromises = [
        database.ref(`alumnos/${currentDeleteMatricula}`).remove(),
        database.ref(`gestor_alumnos/${currentDeleteMatricula}`).remove()
      ];
      
      return Promise.all(deletePromises);
    })
    .then(() => {
      closeDeleteModal();
      // Mostrar mensaje de éxito
      const messageElement = document.getElementById('modal-message');
      if (messageElement) {
        messageElement.textContent = 'Alumno dado de baja correctamente';
        messageElement.className = 'message success';
      }
      // Recargar la lista de alumnos
      loadAlumnos();
    })
    .catch((error) => {
      console.error('Error al dar de baja:', error);
      let errorMessage = 'Error al dar de baja';
      
      switch(error.code) {
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