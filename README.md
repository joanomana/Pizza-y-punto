# 🍕 Pizzeria Juanito - Sistema de Gestión de Pizzería (CLI + MongoDB)

Este proyecto es una aplicación de consola desarrollada en **Node.js** que permite a la cadena de pizzerías *Pizza y Punto* gestionar pedidos, ingredientes, clientes, repartidores y analizar sus ventas mediante consultas con **MongoDB Aggregation Framework** y **transacciones seguras**.

---

## 🚀 Funcionalidades Principales

- Registrar pedidos completos con validación de stock y repartidor asignado.
- Controlar el inventario de ingredientes.
- Administrar clientes y repartidores (crear, actualizar, eliminar).
- Crear nuevas pizzas desde consola seleccionando sus ingredientes.
- Generar reportes agregados de ventas, ingredientes y tendencias.
- Gestionar el ciclo de vida de los pedidos (pendiente, completado, cancelado, eliminado).

---

## 🧱 Estructura del Proyecto

```
pizza-y-punto/
├── src/
├   ├── cli/                 # Menús interactivos con inquirer
├   ├── config/              # Conexión a MongoDB
├   ├── models/              # Modelos de Mongoose
├   ├── services/            # Lógica de negocio modular
├   ├── utils/               # Herramientas como datos de prueba
├── .env                 # Variables de entorno
├── .gitignore           # ignorar modulos y variables de entorno
├── index.js             # Punto de entrada
├── package.json
├── package-lock.json
└── README.md
```

---

## 🛠️ Requisitos

- Node.js v16+  
- MongoDB Atlas (o local)  
- npm

---

## 📦 Instalación y ejecución

```bash
# 1. Instala dependencias
npm install

# 2. Configura el entorno
cp .env.example .env
# Edita .env con tu cadena de conexión MongoDB
# opcional: se pude ejecutar tambien de manera local

# 3. Ejecuta el sistema
node index.js
```

> Al iniciar por primera vez, se cargarán datos de prueba si la base de datos está vacía.

---

## 🧩 Comandos disponibles desde el menú

- 📦 Realizar pedido  
- 👤 Gestionar clientes  
- 📦 Gestionar ingredientes (crear, eliminar, modificar stock)  
- 🍕 Gestionar pedidos (marcar como completado, cancelar, eliminar)  
- 🛵 Gestionar repartidores (crear, eliminar)  
- ➕ Crear nueva pizza  
- 📊 Ver reportes agregados

---

## 💼 Estructura de transacciones

Al realizar un pedido (`realizarPedido()`), se ejecuta una transacción con:

1. Verificación de stock para todos los ingredientes.
2. Descuento de stock.
3. Asignación automática de repartidor disponible.
4. Registro del pedido completo.

Si alguna operación falla, **se revierte automáticamente** y no se registra el pedido.

---

## 📊 Consultas agregadas con Aggregation Framework

Desde el menú de reportes puedes acceder a:

1. **Ingredientes más usados (último mes)**  
   → Agrupa por `pizza.ingredientes` desde pedidos recientes.

2. **Promedio de precios por categoría de pizza**  
   → `$group` por `categoria`, `$avg` en `precio`.

3. **Categoría más vendida históricamente**  
   → `$lookup` y `$group` por `categoria`.

---

## ✨ Ejemplos de uso

- Crear cliente: desde menú "Gestionar clientes" → "➕ Crear nuevo cliente"
- Crear pizza: desde menú principal → "➕ Crear nueva pizza"
- Realizar pedido: selecciona cliente + pizzas, validación automática de stock y asignación de repartidor.
- Finalizar pedido: menú "Gestionar pedidos" → "✅ Marcar como terminado"
- Cancelar pedido: solo si aún está pendiente.
- Eliminar pedido: solo si está `completado` o `cancelado`.

---

## 🧪 Tecnologías utilizadas

- Node.js
- MongoDB + Mongoose
- Inquirer.js
- Dotenv
- MongoDB Atlas (opcional)

