/**
 * Sistema unificado de filtros avanzados para RASSPP
 * Maneja la funcionalidad de filtrado dinámico para todas las páginas
 */

class FiltersHandler {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.filterCarrera = document.getElementById('filter-carrera');
        this.filterSemestre = document.getElementById('filter-semestre');
        this.filterGeneracion = document.getElementById('filter-generacion');
        this.filterGrupo = document.getElementById('filter-grupo');
        this.filterSexo = document.getElementById('filter-sexo');
        this.filterInstitucion = document.getElementById('filter-institucion');
        this.filterStatus = document.getElementById('filter-status');
        this.applyFiltersBtn = document.querySelector('.apply-filters');
        this.clearFiltersBtn = document.querySelector('.clear-filters');
        this.filterSummary = document.getElementById('filter-summary');
        this.activeFiltersDiv = document.getElementById('active-filters');
        this.resultsCountDiv = document.getElementById('results-count');
        
        this.loadCarreras();
        this.setupEventListeners();
        
        // Inicializar contador y monitorear cambios en tiempo real
        this.initializeCounter();
        this.monitorStudentCards();
    }

    async loadCarreras() {
        const carrerasLoading = document.getElementById('carreras-loading');
        const carreraSelect = this.filterCarrera;
        
        if (!carreraSelect || !carrerasLoading) return;
        
        try {
            carrerasLoading.style.display = 'block';
            
            // Obtener todas las carreras únicas desde Firebase
            const alumnosRef = firebase.database().ref('alumnos');
            const snapshot = await alumnosRef.once('value');
            const alumnosData = snapshot.val();
            
            if (alumnosData) {
                const carreras = new Set();
                
                Object.values(alumnosData).forEach(alumno => {
                    if (alumno.carrera && alumno.carrera.trim()) {
                        carreras.add(alumno.carrera.trim());
                    }
                });
                
                // Limpiar opciones existentes (excepto la primera)
                while (carreraSelect.children.length > 1) {
                    carreraSelect.removeChild(carreraSelect.lastChild);
                }
                
                // Agregar carreras ordenadas alfabéticamente
                Array.from(carreras).sort().forEach(carrera => {
                    const option = document.createElement('option');
                    option.value = carrera;
                    option.textContent = `🎓 ${carrera}`;
                    carreraSelect.appendChild(option);
                });
                
                console.log(`✅ Cargadas ${carreras.size} carreras únicas`);
            }
        } catch (error) {
            console.error('❌ Error al cargar carreras:', error);
            const errorOption = document.createElement('option');
            errorOption.value = '';
            errorOption.textContent = '❌ Error al cargar carreras';
            carreraSelect.appendChild(errorOption);
        } finally {
            carrerasLoading.style.display = 'none';
        }
    }

    setupEventListeners() {
        // Búsqueda en tiempo real
        this.searchInput?.addEventListener('input', () => this.handleSearch());
        
        // Filtros en tiempo real
        this.filterCarrera?.addEventListener('change', () => this.applyFilters());
        this.filterSemestre?.addEventListener('change', () => this.applyFilters());
        this.filterGeneracion?.addEventListener('input', () => this.applyFilters());
        this.filterGrupo?.addEventListener('change', () => this.applyFilters());
        this.filterSexo?.addEventListener('change', () => this.applyFilters());
        this.filterInstitucion?.addEventListener('change', () => this.applyFilters());
        this.filterStatus?.addEventListener('change', () => this.applyFilters());
        
        // Botones
        this.applyFiltersBtn?.addEventListener('click', () => this.applyFilters());
        this.clearFiltersBtn?.addEventListener('click', () => this.clearFilters());
    }

    handleSearch() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.student-card');
        
        cards.forEach(card => {
            const nombre = card.querySelector('.nombre')?.textContent.toLowerCase() || '';
            const matricula = card.querySelector('.matricula')?.textContent.toLowerCase() || '';
            const carrera = card.querySelector('.carrera')?.textContent.toLowerCase() || '';
            
            if (nombre.includes(searchTerm) || 
                matricula.includes(searchTerm) || 
                carrera.includes(searchTerm)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });

        this.updateResults();
    }

    async applyFilters() {
        const carreraFilter = this.filterCarrera?.value;
        const semestreFilter = this.filterSemestre?.value;
        const generacionFilter = this.filterGeneracion?.value;
        const grupoFilter = this.filterGrupo?.value;
        const sexoFilter = this.filterSexo?.value;
        const institucionFilter = this.filterInstitucion?.value;
        const statusFilter = this.filterStatus?.value;
        
        const cards = document.querySelectorAll('.student-card');
        let visibleCount = 0;
        
        // Obtener datos de Firebase para filtros más precisos
        try {
            const alumnosRef = firebase.database().ref('alumnos');
            const gestorRef = firebase.database().ref('gestor_alumnos');
            
            const [alumnosSnapshot, gestorSnapshot] = await Promise.all([
                alumnosRef.once('value'),
                gestorRef.once('value')
            ]);
            
            const alumnosData = alumnosSnapshot.val() || {};
            const gestorData = gestorSnapshot.val() || {};
            
            cards.forEach(card => {
                const matricula = card.dataset.matricula;
                const alumno = alumnosData[matricula] || {};
                const practicas = gestorData[matricula] || {};
                
                // Calcular documentos completados
                const checkCount = [
                    practicas.cartaPracticas,
                    practicas.cartaAceptacion,
                    practicas.bitacora,
                    practicas.reporte,
                    practicas.cartaTermino,
                    practicas.completion
                ].filter(Boolean).length;
                
                // Aplicar filtros
                const matchesCarrera = !carreraFilter || alumno.carrera === carreraFilter;
                const matchesSemestre = !semestreFilter || alumno.semestre === semestreFilter;
                const matchesGeneracion = !generacionFilter || 
                    (alumno.generacion && alumno.generacion.includes(generacionFilter));
                const matchesGrupo = !grupoFilter || alumno.grupo === grupoFilter;
                const matchesSexo = !sexoFilter || alumno.sexo === sexoFilter;
                
                // Filtro de tipo de institución
                let matchesInstitucion = true;
                if (institucionFilter && alumno.institucion) {
                    matchesInstitucion = alumno.institucion.tipo === institucionFilter;
                } else if (institucionFilter && !alumno.institucion) {
                    matchesInstitucion = false;
                }
                
                let matchesStatus = true;
                if (statusFilter) {
                    if (statusFilter === '0') {
                        matchesStatus = checkCount === 0;
                    } else if (statusFilter === 'partial') {
                        matchesStatus = checkCount > 0 && checkCount < 6;
                    } else if (statusFilter === '6') {
                        matchesStatus = checkCount === 6;
                    }
                }
                
                // Mostrar/ocultar basado en todos los filtros
                if (matchesCarrera && matchesSemestre && matchesGeneracion && 
                    matchesGrupo && matchesSexo && matchesInstitucion && matchesStatus) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
        } catch (error) {
            console.error('❌ Error al aplicar filtros:', error);
            // Fallback a filtrado básico
            this.applyBasicFilters();
        }

        this.updateFilterSummary();
        this.updateResults();
    }

    applyBasicFilters() {
        const carreraFilter = this.filterCarrera?.value.toLowerCase();
        const semestreFilter = this.filterSemestre?.value;
        const generacionFilter = this.filterGeneracion?.value;
        const grupoFilter = this.filterGrupo?.value;
        const sexoFilter = this.filterSexo?.value;
        const institucionFilter = this.filterInstitucion?.value;
        
        const cards = document.querySelectorAll('.student-card');
        
        cards.forEach(card => {
            const carrera = card.querySelector('.carrera')?.textContent.toLowerCase() || '';
            const semestre = card.querySelector('.semestre')?.textContent.replace('Semestre: ', '') || '';
            const matricula = card.querySelector('.matricula')?.textContent || '';
            
            // Extraer generación de la matrícula (formato: 23xxxx para 2023)
            const generacion = matricula ? '20' + matricula.substring(0, 2) : '';
            
            // Aplicar filtros básicos
            const matchesCarrera = !carreraFilter || carrera.includes(carreraFilter);
            const matchesSemestre = !semestreFilter || semestre === semestreFilter;
            const matchesGeneracion = !generacionFilter || generacion.includes(generacionFilter);
            const matchesGrupo = !grupoFilter; // Requiere datos de Firebase
            const matchesSexo = !sexoFilter; // Requiere datos de Firebase
            const matchesInstitucion = !institucionFilter; // Requiere datos de Firebase
            
            // Mostrar/ocultar basado en filtros disponibles
            if (matchesCarrera && matchesSemestre && matchesGeneracion && 
                matchesGrupo && matchesSexo && matchesInstitucion) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }

    updateFilterSummary() {
        const activeFilters = [];
        
        if (this.filterCarrera?.value) {
            activeFilters.push(`Carrera: ${this.filterCarrera.value}`);
        }
        if (this.filterSemestre?.value) {
            activeFilters.push(`Semestre: ${this.filterSemestre.value}`);
        }
        if (this.filterGeneracion?.value) {
            activeFilters.push(`Generación: ${this.filterGeneracion.value}`);
        }
        if (this.filterGrupo?.value) {
            activeFilters.push(`Grupo: ${this.filterGrupo.value}`);
        }
        if (this.filterSexo?.value) {
            activeFilters.push(`Sexo: ${this.filterSexo.value}`);
        }
        if (this.filterInstitucion?.value) {
            const institucionText = this.filterInstitucion.options[this.filterInstitucion.selectedIndex].text;
            activeFilters.push(`Institución: ${institucionText}`);
        }
        if (this.filterStatus?.value) {
            const statusText = this.filterStatus.options[this.filterStatus.selectedIndex].text;
            activeFilters.push(`Estado: ${statusText}`);
        }
        
        if (activeFilters.length > 0) {
            this.filterSummary.style.display = 'block';
            this.activeFiltersDiv.innerHTML = activeFilters.map(filter => 
                `<span class="filter-tag">${filter}</span>`
            ).join('');
        } else {
            this.filterSummary.style.display = 'none';
        }
    }

    clearFilters() {
        // Limpiar todos los campos
        if (this.filterCarrera) this.filterCarrera.value = '';
        if (this.filterSemestre) this.filterSemestre.value = '';
        if (this.filterGeneracion) this.filterGeneracion.value = '';
        if (this.filterGrupo) this.filterGrupo.value = '';
        if (this.filterSexo) this.filterSexo.value = '';
        if (this.filterInstitucion) this.filterInstitucion.value = '';
        if (this.filterStatus) this.filterStatus.value = '';
        if (this.searchInput) this.searchInput.value = '';
        
        // Ocultar resumen de filtros
        this.filterSummary.style.display = 'none';
        
        // Mostrar todas las cards
        const cards = document.querySelectorAll('.student-card');
        cards.forEach(card => card.style.display = 'flex');
        
        this.updateResults();
        
        console.log('🧹 Filtros limpiados');
    }

    updateResults() {
        const container = document.getElementById('alumnos-cards');
        const visibleCards = document.querySelectorAll('.student-card[style*="flex"]');
        const totalCards = document.querySelectorAll('.student-card').length;
        const studentCounter = document.getElementById('student-counter');
        const counterText = document.getElementById('counter-text');
        const counterNumber = document.getElementById('counter-number');
        
        // Actualizar contador en el resumen del sidebar
        if (this.resultsCountDiv) {
            this.resultsCountDiv.textContent = `Mostrando ${visibleCards.length} de ${totalCards} alumnos`;
        }

        // Actualizar el contador prominente (siempre visible)
        if (studentCounter && counterText && counterNumber) {
            const hasActiveFilters = this.hasActiveFilters();
            const filterDescription = this.getActiveFiltersDescription();
            
            studentCounter.style.display = 'block';
            counterText.textContent = filterDescription;
            counterNumber.textContent = visibleCards.length;
        }
        
        // Mostrar mensaje si no hay resultados
        if (visibleCards.length === 0 && totalCards > 0) {
            let noResults = document.querySelector('.no-results');
            if (!noResults) {
                noResults = document.createElement('div');
                noResults.className = 'no-results';
                noResults.innerHTML = `
                    <i class="fas fa-search"></i>
                    <h3>No se encontraron resultados</h3>
                    <p>No hay alumnos que coincidan con los filtros seleccionados</p>
                    <button onclick="new FiltersHandler().clearFilters()" class="btn-primary">
                        <i class="fas fa-eraser"></i> Limpiar Filtros
                    </button>
                `;
                container.appendChild(noResults);
            }
        } else {
            const noResults = document.querySelector('.no-results');
            if (noResults) {
                noResults.remove();
            }
        }
        
        console.log(`📊 Resultados: ${visibleCards.length}/${totalCards} alumnos visibles`);
    }

    hasActiveFilters() {
        return !!(
            this.searchInput?.value ||
            this.filterCarrera?.value ||
            this.filterSemestre?.value ||
            this.filterGeneracion?.value ||
            this.filterGrupo?.value ||
            this.filterSexo?.value ||
            this.filterInstitucion?.value ||
            this.filterStatus?.value
        );
    }

    getActiveFiltersDescription() {
        const filters = [];
        
        // Prioridad para búsqueda
        if (this.searchInput?.value) {
            return `Resultados de búsqueda: "${this.searchInput.value}"`;
        }
        
        if (this.filterInstitucion?.value) {
            const tipo = this.filterInstitucion.value === 'public' ? 'instituciones públicas' : 'instituciones privadas';
            return `Estudiantes en ${tipo}`;
        }
        
        if (this.filterCarrera?.value) {
            filters.push(`carrera ${this.filterCarrera.value}`);
        }
        if (this.filterSemestre?.value) {
            filters.push(`${this.filterSemestre.value}° semestre`);
        }
        if (this.filterGrupo?.value) {
            filters.push(`grupo ${this.filterGrupo.value}`);
        }
        if (this.filterGeneracion?.value) {
            filters.push(`generación ${this.filterGeneracion.value}`);
        }
        if (this.filterSexo?.value) {
            filters.push(this.filterSexo.value.toLowerCase());
        }
        if (this.filterStatus?.value) {
            const statusText = this.filterStatus.options[this.filterStatus.selectedIndex].text;
            filters.push(statusText.toLowerCase());
        }

        if (filters.length === 0) {
            return 'Mostrando todos los estudiantes';
        }

        return `Estudiantes de ${filters.join(', ')}`;
    }

    initializeCounter() {
        // Mostrar contador inmediatamente con 0 estudiantes
        const studentCounter = document.getElementById('student-counter');
        const counterText = document.getElementById('counter-text');
        const counterNumber = document.getElementById('counter-number');
        
        if (studentCounter && counterText && counterNumber) {
            studentCounter.style.display = 'block';
            counterText.textContent = 'Cargando estudiantes...';
            counterNumber.textContent = '0';
        }
        
        // Actualizar cada 500ms mientras se cargan los datos
        this.updateInterval = setInterval(() => {
            this.updateResults();
        }, 500);
        
        // Detener el intervalo después de 10 segundos para evitar sobrecarga
        setTimeout(() => {
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
            }
        }, 10000);
    }

    monitorStudentCards() {
        // Usar MutationObserver para detectar cuando se agregan nuevas cards
        const container = document.getElementById('alumnos-cards');
        if (!container) return;

        const observer = new MutationObserver((mutations) => {
            let hasNewCards = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Verificar si se agregaron nuevas student-cards
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE && 
                            (node.classList?.contains('student-card') || 
                             node.querySelector?.('.student-card'))) {
                            hasNewCards = true;
                        }
                    });
                }
            });
            
            if (hasNewCards) {
                // Actualizar contador cuando se detecten nuevas cards
                this.updateResults();
            }
        });

        // Observar cambios en el contenedor de alumnos
        observer.observe(container, {
            childList: true,
            subtree: true
        });

        // Guardar referencia para poder desconectar si es necesario
        this.cardObserver = observer;
    }
}

// Inicializar el manejador de filtros cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que Firebase esté inicializado
    if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
        new FiltersHandler();
    } else {
        // Reintentar después de un breve delay
        setTimeout(() => {
            new FiltersHandler();
        }, 1000);
    }
});

// Funciones globales para compatibilidad
function applyFilters() {
    const handler = new FiltersHandler();
    handler.applyFilters();
}

function clearFilters() {
    const handler = new FiltersHandler();
    handler.clearFilters();
}
