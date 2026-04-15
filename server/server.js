const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/odonto_app';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Models
const Patient = require('./models/Patient');

// API Routes
app.post('/api/patients', async (req, res) => {
  try {
    const patientData = req.body;
    const newPatient = new Patient(patientData);
    await newPatient.save();
    console.log('Patient saved:', newPatient.dni);
    res.status(201).json({ message: 'Patient saved successfully', data: newPatient });
  } catch (error) {
    console.error('Error saving patient:', error);
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

// Front-end Unificado: Servir archivos estáticos de Angular
const angularBuildPath = path.join(__dirname, '../dist/totem-app/browser');
app.use(express.static(angularBuildPath));

// Catch-all route para que el routing de Angular funcione (debe ir al final)
app.get('*', (req, res) => {
  res.sendFile(path.join(angularBuildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend unified at http://localhost:${PORT}`);
});
