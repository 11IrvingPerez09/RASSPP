document.addEventListener('DOMContentLoaded', () => {
    const userIcon = document.querySelector('.user-icon');
    const logoutSection = document.getElementById('logout-section');
    const searchInput = document.getElementById('search-input');
    const studentList = document.getElementById('student-list');
  
    // Toggle logout section
    function toggleLogout() {
      logoutSection.style.display = logoutSection.style.display === 'block' ? 'none' : 'block';
    }
  
    // Sample student data (to be replaced with Firebase data)
    let students = [
      { name: "Juan Pérez", generacion: "2023", carrera: "Ingeniería", semestre: "5", grupo: "A" },
      { name: "María López", generacion: "2022", carrera: "Derecho", semestre: "7", grupo: "B" },
      { name: "Carlos Gómez", generacion: "2023", carrera: "Medicina", semestre: "6", grupo: "A" }
    ];
  
    // Load students from Firebase (placeholder)
    function loadStudents() {
      // Replace with actual Firebase query based on user ID and filters
      const user = firebase.auth().currentUser;
      if (user) {
        database.ref('jefe_carrera/' + user.uid + '/alumnos').once('value')
          .then((snapshot) => {
            students = snapshot.val() || [];
            filterStudents();
          });
      }
    }
  
    // Filter students based on checkboxes and search
    function filterStudents() {
      const searchTerm = searchInput.value.toLowerCase();
      const filters = {
        generacion: document.querySelector('input[name="generacion"]').checked,
        carrera: document.querySelector('input[name="carrera"]').checked,
        semestre: document.querySelector('input[name="semestre"]').checked,
        grupo: document.querySelector('input[name="grupo"]').checked
      };
  
      const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm);
        const matchesFilters = Object.keys(filters).every(key => !filters[key] || student[key]);
        return matchesSearch && matchesFilters;
      });
  
      renderStudents(filteredStudents);
    }
  
    // Render student list
    function renderStudents(students) {
      studentList.innerHTML = '';
      students.forEach(student => {
        const div = document.createElement('div');
        div.className = 'student-item';
        div.textContent = `${student.name} - Gen: ${student.generacion}, Carr: ${student.carrera}, Sem: ${student.semestre}, Grupo: ${student.grupo}`;
        studentList.appendChild(div);
      });
    }
  
    // Event listeners
    searchInput.addEventListener('input', filterStudents);
    document.querySelectorAll('input[name^="generacion"], input[name^="carrera"], input[name^="semestre"], input[name^="grupo"]').forEach(checkbox => {
      checkbox.addEventListener('change', filterStudents);
    });
  
    // Initial load
    loadStudents();
  });