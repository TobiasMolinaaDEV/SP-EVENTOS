# Sistema dashboard estilo ERP 
Sistema dashboard de gestion de datos tipo ERP con calendario, facturacion, control de stock y reservacion de pedidos.


# 📦 SP Eventos – Sistema de Reservas

Sistema web para gestión de reservas de eventos con calendario, desarrollado con:

* Frontend: React + Tailwind
* Backend: Node.js + Express
* Base de datos: PostgreSQL

---

# 🚀 Requisitos

* Node.js instalado
* PostgreSQL instalado y corriendo
* pgAdmin (opcional)

---

# ⚙️ Configuración inicial

## 1. Base de datos

Crear base de datos en PostgreSQL:

```sql
CREATE DATABASE sp_eventos;
```

Crear tabla:

```sql
CREATE TABLE reservas (
  id SERIAL PRIMARY KEY,
  cliente TEXT,
  evento TEXT,
  fecha DATE,
  estado TEXT,
  total INTEGER
);
```

---

## 2. Backend

Ir a la carpeta backend:

```bash
cd backend
```

Instalar dependencias:

```bash
npm install
```

Crear archivo `.env`:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=sp_eventos
DB_PASSWORD=TU_PASSWORD
DB_PORT=5432
```

---

## ▶️ Levantar backend

```bash
node server.js
```

O con auto-reinicio:

```bash
npx nodemon server.js
```

Backend disponible en:

```
http://localhost:3001
```

---

## 3. Frontend

Desde la carpeta raíz:

```bash
npm install
npm run dev
```

Frontend disponible en:

```
http://localhost:5173
```

---

# 🔄 Uso diario

Cada vez que abras el proyecto:

```bash
1. Iniciar PostgreSQL
2. cd backend → node server.js
3. cd raíz → npm run dev
```

---

# 📌 Funcionalidades

* Crear reservas
* Editar reservas
* Eliminar reservas
* Persistencia en PostgreSQL
* Calendario dinámico
* Visualización por día

---

# ⚠️ Errores comunes

* Backend no corre → verificar terminal
* No carga datos → backend apagado
* Error DB → revisar `.env`
* Fetch error → revisar URL del backend

---

# 📈 Próximas mejoras

* Login de administrador
* Dashboard con métricas
* Drag & drop en calendario
* Gestión de stock

---

# 🧠 Notas

* El campo `total` se guarda como número (sin `$`)
* Las fechas se manejan sin hora
* El calendario se alimenta automáticamente de las reservas

---
