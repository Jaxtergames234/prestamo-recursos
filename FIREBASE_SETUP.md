# 🔧 Configuración de Firebase

Esta aplicación ahora está lista para Firebase. Sigue estos pasos para configurarla:

## 1. Crea un proyecto en Firebase

1. Visita [Firebase Console](https://console.firebase.google.com)
2. Crea un nuevo proyecto
3. Ve a **Configuración del Proyecto** → **Tu Aplicación**
4. Selecciona **Aplicación web** (</>)
5. Copia las credenciales

## 2. Configura las variables de entorno

```bash
# Copia el archivo de ejemplo
cp .env.example .env
```

Edita `.env` y pega tus credenciales de Firebase:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=prestamo-recursos.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=prestamo-recursos-xxxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=prestamo-recursos-xxxxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## 3. Instala dependencias de Firebase

```bash
npm install firebase
```

## 4. Implementa las funciones de Firebase

Edita `src/data/firebaseService.js` y descomenta el código Firebase:

Debes implementar estas funciones:
- `getResources()` - Obtener todos los recursos
- `createResource()` - Crear nuevo recurso
- `updateResource()` - Actualizar recurso
- `deleteResource()` - Eliminar recurso
- `getReservations()` - Obtener reservas
- `createReservation()` - Crear reserva
- `updateReservation()` - Actualizar reserva
- `deleteReservation()` - Eliminar reserva
- `getLoans()` - Obtener préstamos
- `createLoan()` - Crear préstamo
- `updateLoan()` - Actualizar préstamo
- `deleteLoan()` - Eliminar préstamo
- `getUsers()` - Obtener usuarios
- `createUser()` - Crear usuario
- `updateUser()` - Actualizar usuario
- `getCurrentUser()` - Obtener usuario actual
- `getStats()` - Calcular estadísticas

## 5. Estructura de Firestore recomendada

```
firestore/
├── resources/
│   ├── r001
│   │   ├── name: "Salón 101"
│   │   ├── type: "salon"
│   │   ├── capacity: 40
│   │   ├── location: "Edificio A"
│   │   ├── status: "available"
│   │   └── description: "..."
│   └── ...
├── reservations/
│   ├── res001
│   │   ├── resourceId: "r001"
│   │   ├── resourceName: "Salón 101"
│   │   ├── userId: "u001"
│   │   ├── userName: "Usuario"
│   │   ├── date: "2026-04-19"
│   │   ├── startTime: "08:00"
│   │   ├── endTime: "10:00"
│   │   ├── purpose: "Clase"
│   │   └── status: "confirmed"
│   └── ...
├── loans/
│   ├── l001
│   │   ├── resourceId: "r001"
│   │   ├── resourceName: "Salón 101"
│   │   ├── userId: "u001"
│   │   ├── userName: "Usuario"
│   │   ├── loanDate: "2026-04-18"
│   │   ├── dueDate: "2026-04-19"
│   │   ├── returnDate: null
│   │   ├── status: "active"
│   │   └── notes: ""
│   └── ...
├── users/
│   ├── u001
│   │   ├── name: "Usuario"
│   │   ├── email: "user@example.com"
│   │   ├── role: "student"
│   │   ├── department: "Ingeniería"
│   │   ├── avatar: "U"
│   │   └── active: true
│   └── ...
```

## 6. Datos de ejemplo

Los datos de ejemplo han sido eliminados. Ahora puedes:

1. **Ingresarlos manualmente** en Firebase Console
2. **Usar un script de importación** para cargarlos en bulk
3. **Crearlos desde la interfaz** de la aplicación una vez implementado `createResource()`, etc.

## 7. Estructura de archivos

Los servicios de Firebase están en:
- `src/data/firebaseConfig.js` - Configuración
- `src/data/firebaseService.js` - Funciones (implementar)
- `src/data/mockData.js` - Solo constantes de UI (labels, colores)

## Ejemplo de implementación: `getResources()`

```javascript
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';

export async function getResources() {
  const querySnapshot = await getDocs(collection(db, 'resources'));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

¡Ahora estás listo para conectar Firebase y agregar tus datos!
