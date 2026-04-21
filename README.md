# GestRes — Sistema de Gestión de Préstamo y Reserva de Recursos

Frontend React listo para conectar con Firebase.

## Estructura del proyecto

```
src/
├── components/
│   ├── UI.jsx          # Componentes reutilizables (Button, Card, Modal, Table, etc.)
│   └── TopNav.jsx      # Barra de navegación superior
├── pages/
│   ├── admin/
│   │   ├── Dashboard.jsx      # Panel principal con métricas
│   │   ├── Resources.jsx      # CRUD de recursos
│   │   ├── Reservations.jsx   # Gestión de reservas
│   │   ├── Loans.jsx          # Gestión de préstamos y devoluciones
│   │   ├── Users.jsx          # CRUD de usuarios
│   │   └── Reports.jsx        # Reportes y estadísticas
│   └── user/
│       ├── Home.jsx           # Inicio / dashboard del usuario
│       ├── Catalog.jsx        # Catálogo de recursos con reservas
│       ├── MyReservations.jsx # Mis reservas
│       └── MyLoans.jsx        # Mis préstamos
├── data/
│   └── mockData.js     # Datos de prueba → reemplazar con Firebase
├── styles/
│   └── globals.css     # Variables CSS y estilos base
├── utils/
│   └── useToast.js     # Hook para notificaciones
└── App.jsx             # Enrutamiento principal
```

## Instalación y uso

```bash
npm install
npm start
```

## Integración con Firebase

### 1. Instalar Firebase
```bash
npm install firebase
```

### 2. Crear `src/firebase/config.js`
```js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  // ...
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

### 3. Crear `src/firebase/services.js`
Reemplaza las importaciones de `mockData.js` con llamadas reales:

```js
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from './config';

// Recursos
export const getResources = () => getDocs(collection(db, 'resources'));
export const addResource = (data) => addDoc(collection(db, 'resources'), data);
export const updateResource = (id, data) => updateDoc(doc(db, 'resources', id), data);
export const deleteResource = (id) => deleteDoc(doc(db, 'resources', id));

// Reservas
export const getReservations = () => getDocs(collection(db, 'reservations'));
export const addReservation = (data) => addDoc(collection(db, 'reservations'), data);
export const updateReservation = (id, data) => updateDoc(doc(db, 'reservations', id), data);

// Préstamos
export const getLoans = () => getDocs(collection(db, 'loans'));
export const addLoan = (data) => addDoc(collection(db, 'loans'), data);
export const updateLoan = (id, data) => updateDoc(doc(db, 'loans', id), data);

// Usuarios
export const getUsers = () => getDocs(collection(db, 'users'));
```

### 4. Autenticación
Reemplaza el selector de roles del `TopNav` con Firebase Auth:
```js
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
```

## Colecciones Firestore recomendadas

| Colección     | Campos principales                                              |
|---------------|-----------------------------------------------------------------|
| `resources`   | name, type, location, capacity, status, description            |
| `reservations`| resourceId, userId, date, startTime, endTime, purpose, status  |
| `loans`       | resourceId, userId, loanDate, dueDate, returnDate, status       |
| `users`       | name, email, role, department, active                           |

## Roles de usuario

- `student` — Estudiante: puede consultar y reservar recursos
- `teacher` — Docente: puede reservar con prioridad
- `admin` — Administrador: acceso completo al panel de gestión
