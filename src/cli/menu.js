const inquirer = require('inquirer');
const mongoose = require('mongoose');
const Cliente = require('../models/cliente');
const Pizza = require('../models/pizza');
const { realizarPedido } = require('../services/pedidoService');
const reportes = require('../services/reporteService');

async function mainMenu() {
    console.log('\n🍕 Bienvenido a la pizzeria de Juanito\n');
    const { opcion } = await inquirer.prompt({
        type: 'list',
        name: 'opcion',
        message: '¿Qué deseas hacer?',
        choices: [
        '📦 Realizar pedido',
        '👤 Gestionar clientes',
        '🍕 Gestionar pedidos',
        '📊 Ver reportes',
        '❌ Salir'
        ]
    });

    switch (opcion) {
        case '📦 Realizar pedido':
        await manejarPedido();
        break;

        case '📊 Ver reportes':
        await manejarReportes();
        break;

        case '❌ Salir':
        default:
        console.log('👋 ¡Hasta luego!');
        await mongoose.disconnect();
        process.exit(0);
    }

  await mainMenu(); // Recursión para volver al menú
}

async function manejarPedido() {
    const clientes = await Cliente.find();
    const pizzas = await Pizza.find();

    if (clientes.length === 0 || pizzas.length === 0) {
        console.log('⚠️ Debes tener al menos un cliente y una pizza registrada.');
        return;
    }

    const { clienteSeleccionado } = await inquirer.prompt({
        type: 'list',
        name: 'clienteSeleccionado',
        message: 'Selecciona un cliente:',
        choices: clientes.map(c => ({
        name: `${c.nombre} - ${c.telefono}`,
        value: c._id.toString()
        }))
    });

    const { pizzasSeleccionadas } = await inquirer.prompt({
        type: 'checkbox',
        name: 'pizzasSeleccionadas',
        message: 'Selecciona las pizzas para el pedido:',
        choices: pizzas.map(p => ({
        name: `${p.nombre} ($${p.precio})`,
        value: p._id.toString()
        }))
    });

    if (pizzasSeleccionadas.length === 0) {
        console.log('⚠️ Debes seleccionar al menos una pizza.');
        return;
    }

    await realizarPedido(clienteSeleccionado, pizzasSeleccionadas);
}


async function manejarReportes() {
    const { reporte } = await inquirer.prompt({
        type: 'list',
        name: 'reporte',
        message: 'Selecciona un reporte para mostrar:',
        choices: [
        '🥫 Ingredientes más usados (último mes)',
        '💰 Promedio de precios por categoría',
        '📈 Categoría más vendida históricamente'
        ]
    });

    console.log('\n📊 RESULTADOS:\n');

    if (reporte.includes('Ingredientes')) {
        await reportes.ingredientesMasUsadosUltimoMes();
    } else if (reporte.includes('Promedio')) {
        await reportes.promedioPreciosPorCategoria();
    } else if (reporte.includes('Categoría')) {
        await reportes.categoriaMasVendida();
    }

    console.log('\n🔚 Fin del reporte\n');
}

module.exports = mainMenu;
