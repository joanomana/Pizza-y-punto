const Cliente = require('../models/cliente');
const Ingrediente = require('../models/ingrediente');
const Pizza = require('../models/pizza');
const Repartidor = require('../models/repartidor');

async function cargarDatosDePrueba() {
    const [clientes, ingredientes, pizzas, repartidores] = await Promise.all([
        Cliente.countDocuments(),
        Ingrediente.countDocuments(),
        Pizza.countDocuments(),
        Repartidor.countDocuments()
    ]);

    if (clientes > 0 || ingredientes > 0 || pizzas > 0 || repartidores > 0) {
        console.log('ℹ️ Los datos ya existen. No se cargaron datos de prueba.');
        return;
    }

    // 1. Ingredientes
    const ingredientesBase = await Ingrediente.insertMany([
        { nombre: 'Queso mozzarella', tipo: 'queso', stock: 100 },
        { nombre: 'Salsa de tomate', tipo: 'salsa', stock: 100 },
        { nombre: 'Jamón', tipo: 'topping', stock: 100 },
        { nombre: 'Pepperoni', tipo: 'topping', stock: 100 },
        { nombre: 'Champiñones', tipo: 'topping', stock: 100 },
        { nombre: 'Aceitunas', tipo: 'topping', stock: 100 }
    ]);

    // 2. Pizzas
    await Pizza.insertMany([
        {
        nombre: 'Pizza Jamón y Queso',
        categoria: 'tradicional',
        precio: 20000,
        ingredientes: [
            ingredientesBase.find(i => i.nombre === 'Queso mozzarella')._id,
            ingredientesBase.find(i => i.nombre === 'Salsa de tomate')._id,
            ingredientesBase.find(i => i.nombre === 'Jamón')._id
        ]
        },
        {
        nombre: 'Pizza Pepperoni',
        categoria: 'especial',
        precio: 22000,
        ingredientes: [
            ingredientesBase.find(i => i.nombre === 'Queso mozzarella')._id,
            ingredientesBase.find(i => i.nombre === 'Salsa de tomate')._id,
            ingredientesBase.find(i => i.nombre === 'Pepperoni')._id
        ]
        },
        {
        nombre: 'Pizza Veggie',
        categoria: 'vegana',
        precio: 21000,
        ingredientes: [
            ingredientesBase.find(i => i.nombre === 'Salsa de tomate')._id,
            ingredientesBase.find(i => i.nombre === 'Champiñones')._id,
            ingredientesBase.find(i => i.nombre === 'Aceitunas')._id
        ]
        }
    ]);

    // 3. Clientes
    await Cliente.insertMany([
        { nombre: 'Ana Gómez', telefono: '3216549870', direccion: 'Cra 10 #20-30' },
        { nombre: 'Carlos Ruiz', telefono: '3001122334', direccion: 'Cl 45 #12-05' },
        { nombre: 'Laura Martínez', telefono: '3129988776', direccion: 'Av Siempre Viva #123' }
    ]);

    // 4. Repartidores
    await Repartidor.insertMany([
        { nombre: 'Luis Pérez', zona: 'Norte' },
        { nombre: 'Andrea Torres', zona: 'Centro' },
        { nombre: 'Juan Díaz', zona: 'Sur' }
    ]);

    console.log('✅ Datos de prueba cargados exitosamente');
}

module.exports = { cargarDatosDePrueba };
