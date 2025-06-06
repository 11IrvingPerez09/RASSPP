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

    // Getter para el nombre completo (útil para mostrar en la UI)
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

    // Método para obtener los datos en el formato esperado por Firebase
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
            createdAt: this._createdAt
        };
    }
}

export default Alumno;