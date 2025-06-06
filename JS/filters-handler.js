/**
 * Sistema unificado de filtros para RASSPP
 * Maneja la funcionalidad de filtrado para todas las páginas
 */

class FiltersHandler {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.filterCarrera = document.getElementById('filter-carrera');
        this.filterGeneracion = document.getElementById('filter-generacion');
        this.filterGrupo = document.getElementById('filter-grupo');
        this.filterSexo = document.getElementById('filter-sexo');
        this.applyFiltersBtn = document.getElementById('apply-filters');
        this.clearFiltersBtn = document.getElementById('clear-filters');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Búsqueda en tiempo real
        this.searchInput?.addEventListener('input', () => this.handleSearch());
        
        // Filtros en tiempo real
        this.filterCarrera?.addEventListener('change', () => this.applyFilters());
        this.filterGeneracion?.addEventListener('input', () => this.applyFilters());
        this.filterGrupo?.addEventListener('input', () => this.applyFilters());
        this.filterSexo?.addEventListener('change', () => this.applyFilters());
        
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

    applyFilters() {
        const carreraFilter = this.filterCarrera?.value.toLowerCase();
        const generacionFilter = this.filterGeneracion?.value;
        const grupoFilter = this.filterGrupo?.value.toLowerCase();
        const sexoFilter = this.filterSexo?.value;
        
        const cards = document.querySelectorAll('.student-card');
        
        cards.forEach(card => {
            const carrera = card.querySelector('.carrera')?.textContent.toLowerCase() || '';
            const matricula = card.querySelector('.matricula')?.textContent || '';
            const grupo = (card.dataset.grupo || '').toLowerCase();
            const sexo = card.dataset.sexo || '';
            
            // Extraer generación de la matrícula (formato: 23xxxx para 2023)
            const generacion = matricula ? '20' + matricula.substring(0, 2) : '';
            
            // Aplicar todos los filtros
            const matchesCarrera = !carreraFilter || carrera.includes(carreraFilter);
            const matchesGeneracion = !generacionFilter || generacion.includes(generacionFilter);
            const matchesGrupo = !grupoFilter || grupo.includes(grupoFilter);
            const matchesSexo = !sexoFilter || sexo === sexoFilter;
            
            // Mostrar/ocultar basado en todos los filtros
            if (matchesCarrera && matchesGeneracion && matchesGrupo && matchesSexo) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });

        this.updateResults();
    }

    clearFilters() {
        // Limpiar campos
        if (this.filterCarrera) this.filterCarrera.value = '';
        if (this.filterGeneracion) this.filterGeneracion.value = '';
        if (this.filterGrupo) this.filterGrupo.value = '';
        if (this.filterSexo) this.filterSexo.value = '';
        if (this.searchInput) this.searchInput.value = '';
        
        // Mostrar todas las cards
        const cards = document.querySelectorAll('.student-card');
        cards.forEach(card => card.style.display = 'flex');
        
        this.updateResults();
    }

    updateResults() {
        const container = document.getElementById('alumnos-cards');
        const visibleCards = document.querySelectorAll('.student-card[style="display: flex;"]').length;
        const totalCards = document.querySelectorAll('.student-card').length;
        
        // Mostrar mensaje si no hay resultados
        if (visibleCards === 0 && totalCards > 0) {
            const noResults = document.querySelector('.no-results');
            if (!noResults) {
                const message = document.createElement('div');
                message.className = 'no-results';
                message.innerHTML = `
                    <i class="fas fa-search"></i>
                    <p>No se encontraron alumnos con los filtros seleccionados</p>
                `;
                container.appendChild(message);
            }
        } else {
            const noResults = document.querySelector('.no-results');
            if (noResults) {
                noResults.remove();
            }
        }
    }
}

// Inicializar el manejador de filtros cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new FiltersHandler();
});
