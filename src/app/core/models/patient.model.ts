export interface Patient {
  id?: string | number;
  _id?: string;
  apellido: string;
  nombre: string;
  dni: string;
  domicilio: string;
  localidad: string;
  telefono?: string;
  fechaNacimiento: string;
  edad?: number;
  obraSocial?: string;
  numeroAfiliado?: string;
  creadoEn?: string | Date;
  actualizadoEn?: string | Date;
}
