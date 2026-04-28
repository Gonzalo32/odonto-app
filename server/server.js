const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/senza_totem';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

const Patient = require('./models/Patient');

app.post('/api/patients', async (req, res) => {
  try {
    const patientData = req.body;

    if (!patientData.dni) {
      return res.status(400).json({ error: 'DNI es requerido' });
    }

    const patient = await Patient.findOneAndUpdate(
      { dni: patientData.dni },
      { $set: patientData },
      { upsert: true, new: true }
    );

    const wasNew = !patient.createdAt || patient.createdAt === patient.updatedAt;
    res.status(200).json({ message: wasNew ? 'Paciente creado' : 'Paciente actualizado', data: patient });
  } catch (error) {
    console.error('Error guardando paciente:', error);
    res.status(500).json({ error: 'Failed to save patient' });
  }
});

app.get('/api/patients', async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

const angularBuildPath = path.join(__dirname, '../dist/totem-app/browser');
app.use(express.static(angularBuildPath));

// Catch-all: debe ir al final para que el routing de Angular funcione
app.get('*', (req, res) => {
  res.sendFile(path.join(angularBuildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
