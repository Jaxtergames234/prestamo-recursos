# 🎓 GestRes

### Sistema de Gestión de Préstamo y Reserva de Recursos

GestRes es una aplicación web desarrollada en **React** que permite administrar de forma sencilla los recursos institucionales, facilitando su **reserva, préstamo y control** tanto para administradores como para usuarios.

---

## 🚀 ¿Qué hace?

*  Gestión de recursos (salones, laboratorios, equipos)
*  Sistema de reservas
*  Control de préstamos y devoluciones
*  Manejo de usuarios
*  Panel con métricas y reportes
*  Autenticación con Firebase

---

##  Estructura del proyecto

```
src/
├── components/
│   ├── UI.jsx          # Componentes reutilizables
│   └── TopNav.jsx      # Navegación principal
│
├── pages/
│   ├── admin/          # Panel de administración
│   │   ├── Dashboard.jsx
│   │   ├── Resources.jsx
│   │   ├── Reservations.jsx
│   │   ├── Loans.jsx
│   │   ├── Users.jsx
│   │   └── Reports.jsx
│   │
│   └── user/           # Vista del usuario
│       ├── Home.jsx
│       ├── Catalog.jsx
│       ├── MyReservations.jsx
│       └── MyLoans.jsx
│
├── data/
│   └── firebaseService.js  # Conexión con Firebase
│
├── styles/
│   └── globals.css     # Estilos globales
│
├── utils/
│   └── useToast.js     # Notificaciones
│
└── App.jsx             # Lógica principal
```

---

##  Roles del sistema

* **Admin** → Control total del sistema
* **User** → Consulta, reservas y préstamos

---

##  Tecnologías

* React
* Firebase (Auth + Firestore)
* CSS personalizado

---

##  Ejecución

```bash
npm install
npm start
```

---

##  Notas

* El sistema está preparado para trabajar con **Firebase**
* La lógica está separada por módulos para facilitar mantenimiento
* Diseño enfocado en simplicidad y claridad

---

## Estado del proyecto

🟢 Funcional — listo para integrar backend y autenticación completa
