export interface Usuario {
  idUsuario: number;
  nombre: string;
  correo: string;
}

export interface Perfil {
  idUsuario: number;
  nombre: string;
  correo: string;
  fechaRegistro: string;
}

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  correo: string;
  password: string;
}

export interface PerfilUpdateRequest {
  nombre: string;
  correo: string;
  nuevaPassword?: string;
}

export interface AuthResponse {
  token: string;
}

export interface Ejercicio {
  idEjercicio: number;
  nombre: string;
  descripcion?: string | null;
  grupoMuscular: string;
  musculoPrincipal?: string | null;
  musculosSecundarios?: string[];
  slug?: string | null;
  equipamiento?: string | null;
  tipoEjercicio?: string | null;
  esEstiramiento: boolean;
  fotogramasSvg?: string[];
}

export interface RutinaEjercicio {
  idEjercicio: number;
  nombre: string;
  grupoMuscular: string;
  orden: number;
}

export interface Rutina {
  idRutina: number;
  nombre: string;
  descripcion?: string | null;
  fechaCreacion: string;
  ejercicios: RutinaEjercicio[];
}

export interface RutinaCreateRequest {
  nombre: string;
  descripcion?: string | null;
  ejercicios: {
    idEjercicio: number;
    orden: number;
  }[];
}

export interface SerieItem {
  idSerie?: number;
  idEjercicio: number;
  nombreEjercicio?: string;
  numeroSerie: number;
  peso: number;
  repeticiones: number;
}

export interface WorkoutCreateRequest {
  idRutina?: number | null;
  nombre?: string | null;
  fecha?: string | null;
  series: {
    idEjercicio: number;
    numeroSerie: number;
    peso: number;
    repeticiones: number;
  }[];
}

export interface WorkoutResumen {
  idEntrenamiento: number;
  idRutina?: number | null;
  nombre?: string | null;
  fecha: string;
  totalSeries: number;
  volumenTotal: number;
}

export interface WorkoutDetalle {
  idEntrenamiento: number;
  idRutina?: number | null;
  nombre?: string | null;
  fecha: string;
  volumenTotal: number;
  series: {
    idSerie: number;
    idEjercicio: number;
    nombreEjercicio: string;
    numeroSerie: number;
    peso: number;
    repeticiones: number;
  }[];
}

export interface VolumenEntrenamiento {
  idEntrenamiento: number;
  fecha: string;
  volumen: number;
}

export interface EjercicioFrecuente {
  idEjercicio: number;
  nombre: string;
  cantidadSeries: number;
}

export interface ProgresoGeneral {
  totalEntrenamientos: number;
  totalSeries: number;
  volumenTotal: number;
  pesoMaximo: number;
  ultimoEntrenamiento?: string | null;
  volumenPorEntrenamiento: VolumenEntrenamiento[];
  ejerciciosMasFrecuentes: EjercicioFrecuente[];
}

export interface PuntoProgreso {
  idEntrenamiento: number;
  fecha: string;
  pesoMaximo: number;
  totalRepeticiones: number;
  volumen: number;
}

export interface ProgresoEjercicio {
  idEjercicio: number;
  nombre: string;
  grupoMuscular: string;
  totalSeries: number;
  pesoMaximo: number;
  repeticionesMaximas: number;
  volumenTotal: number;
  evolucion: PuntoProgreso[];
}
