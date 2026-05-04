# Totem Odontológico - Especificaciones y Funcionalidades

Este documento resume las capacidades, características técnicas y el propósito del sistema de auto-registro ("Totem") desarrollado para el consultorio odontológico.

---

## 1. Propósito del Sistema
El "Odonto App" es una aplicación web diseñada para funcionar como un **Totem de Auto-gestión**. Su objetivo principal es permitir que los pacientes que ingresan al consultorio puedan registrarse o actualizar sus datos personales de forma autónoma y rápida. Al finalizar, el sistema genera automáticamente la impresión física de un formulario pre-formateado con sus datos, agilizando el trabajo de la recepción.

---

## 2. Funcionalidades Principales

### 👨‍⚕️ Gestión de Pacientes (Registro e Historial)
*   **Búsqueda Inteligente (DNI):** El paciente ingresa su DNI y el sistema busca instantáneamente en la base de datos local. Si el paciente ya existe, sus datos se cargan automáticamente para que solo tenga que confirmarlos o actualizarlos.
*   **Auditoría Invisible (Historial de Visitas):** El sistema mantiene un registro oculto (`observacion`) que guarda la fecha exacta de cada visita del paciente y detalla qué acciones realizó (ej. *"ingreso sus datos por primera vez"*, *"modifico el campo obra social"*, o *"sin cambios"*).

### 📝 Formulario Paso a Paso (Wizard)
*   **Interfaz Amigable:** Diseñada con pantallas grandes y botones accesibles, ideal para pantallas táctiles (Touch) o uso con teclado/mouse.
*   **Validaciones en Tiempo Real:** Verifica que el DNI sea válido, calcula la edad automáticamente a partir de la fecha de nacimiento, y exige campos obligatorios de forma clara.

### 🏥 Cobertura Médica (Obra Social)
*   **Buscador Inteligente:** Un menú desplegable (Autocomplete) con más de 45 obras sociales pre-cargadas. Permite buscar escribiendo, navegar con las flechas del teclado y limpiar la selección fácilmente con un botón (X).
*   **Lógica Condicional:** Si el paciente selecciona la opción "Particular", el campo de "Número de Afiliado" desaparece de la pantalla y no se imprime en el papel.

### 🖨️ Impresión Silenciosa y Precisa
*   **Plantilla a Medida:** Utiliza una grilla CSS calibrada al milímetro para que los datos impresos caigan exactamente sobre los renglones de las planillas físicas pre-impresas del consultorio.
*   **Impresión en Segundo Plano:** Al hacer clic en "Aceptar", el sistema inyecta la planilla en un *iframe* invisible y manda la orden a la impresora sin mostrar ventanas de diálogo ni previsualizaciones.

### 🔌 Tolerancia a Fallos
*   **Modo Offline:** Si por alguna razón la base de datos se desconecta, el sistema guarda temporalmente la información en memoria y la sincroniza automáticamente (en segundo plano) en cuanto se restablece la conexión.

---

## 3. Especificaciones Técnicas

*   **Frontend (Interfaz Visual):** 
    *   Framework: **Angular (v18)** usando *Standalone Components*.
    *   Gestión del Estado: Reactividad moderna utilizando **Signals**.
    *   Estilos: SCSS puro, enfocado fuertemente en directivas `@media print` para lograr la precisión milimétrica requerida en la impresión A4.
*   **Backend (Servidor):**
    *   Tecnología: **Node.js** con el framework **Express**.
    *   Función: Recibe las peticiones del frontend y gestiona la lectura/escritura de los pacientes.
*   **Base de Datos:**
    *   Tecnología: **MongoDB** (motor NoSQL) controlado vía **Mongoose**.
    *   Despliegue: Se ejecuta de manera local (Community Server) para garantizar latencia cero y funcionamiento independiente de Internet.
*   **Entorno de Ejecución (Kiosko):**
    *   Navegador: **Google Chrome**.
    *   Banderas Especiales: Se inicia con `--kiosk` (Pantalla completa obligatoria, sin barras de herramientas) y `--kiosk-printing` (Saltar la ventana de configuración de la impresora y usar la impresora por defecto de Windows).
    *   Automatización: Controlado por un script de Windows (`.bat`) que orquesta el arranque del servidor y del navegador.
