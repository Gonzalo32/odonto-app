export interface Patient {
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
  creadoEn?: Date;
  actualizadoEn?: Date;
}
