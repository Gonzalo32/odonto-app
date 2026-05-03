const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  dni: { type: String, required: true },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  telefono: String,
  fechaNacimiento: String,
  obraSocial: String,
  numeroAfiliado: String,
  localidad: String,
  domicilio: String,
  observacion: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', PatientSchema);
