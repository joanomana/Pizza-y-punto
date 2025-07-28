const inquirer = require('inquirer');
const mongoose = require('mongoose');
const Cliente = require('../models/cliente');
const Pizza = require('../models/pizza');
const { realizarPedido } = require('../services/pedidoService');
const reportes = require('../services/reporteService');
const Repartidor = require('../models/repartidor');
const Ingrediente = require('../models/ingrediente');
const Pedido = require('../models/pedido');


const {
    listarClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente
} = require('../services/clienteService');

const {
    listarIngredientes,
    crearIngrediente,
    modificarStock,
    eliminarIngrediente
} = require('../services/ingredienteService');

const {
    listarRepartidores,
    crearRepartidor,
    eliminarRepartidor
} = require('../services/repartidorService');

const { crearPizza } = require('../services/pizzaService');


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
        '📦 Gestionar ingredientes',
        '📊 Ver reportes',
        '🛵 Gestionar repartidores',
        '➕ Crear nueva pizza',
        '❌ Salir'
        ]
    });

    switch (opcion) {
        case '📦 Realizar pedido':
            await manejarPedido();
            break;

        case '👤 Gestionar clientes':
            await gestionarClientes();
            break;

        case '🍕 Gestionar pedidos':
            await gestionarPedidos();
            break;

        case '📊 Ver reportes':
            await manejarReportes();
            break;

        case '📦 Gestionar ingredientes':
            await gestionarIngredientes();
            break;

        case '🛵 Gestionar repartidores':
            await gestionarRepartidores();
            break;

        case '➕ Crear nueva pizza':
            await crearPizza();
            break;

        case '❌ Salir':
            default:
                console.log('👋 ¡Hasta luego!');
                await mongoose.disconnect();
                process.exit(0);
    }

    await mainMenu(); 
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

async function gestionarPedidos() {
    const pedidos = await Pedido.find()
        .populate('clienteId', 'nombre telefono')
        .populate('repartidorAsignado', 'nombre zona')
        .populate('pizzas', 'nombre precio');

    if (pedidos.length === 0) {
        console.log('📭 No hay pedidos registrados.');
        return;
    }

    console.log('\n📦 Pedidos registrados:\n');
    pedidos.forEach((pedido, i) => {
        const pizzasNombres = pedido.pizzas.map(p => p.nombre).join(', ');
        console.log(`${i + 1}. Cliente: ${pedido.clienteId.nombre} | Tel: ${pedido.clienteId.telefono}`);
        console.log(`   Pizzas: ${pizzasNombres}`);
        console.log(`   Total: $${pedido.total}`);
        console.log(`   Repartidor: ${pedido.repartidorAsignado.nombre} (${pedido.repartidorAsignado.zona})`);
        console.log(`   Estado: ${pedido.estado}`);
        console.log(`   Fecha: ${pedido.fecha.toLocaleString()}\n`);
    });

    const { accion } = await inquirer.prompt({
        type: 'list',
        name: 'accion',
        message: '¿Qué deseas hacer con los pedidos?',
        choices: [
        '✅ Marcar pedido como terminado',
        '❌ Cancelar pedido',
        '🗑️ Eliminar pedido',
        '🔙 Volver'
        ]
    });

    if (accion === '🔙 Volver') return;

    const { pedidoId } = await inquirer.prompt({
        type: 'list',
        name: 'pedidoId',
        message: 'Selecciona el pedido:',
        choices: pedidos.map(p => ({
        name: `${p.clienteId.nombre} | Total: $${p.total} | Estado: ${p.estado}`,
        value: p._id.toString()
        }))
    });

    const pedido = await Pedido.findById(pedidoId);

    if (accion === '✅ Marcar pedido como terminado') {
        if (pedido.estado !== 'pendiente') {
        console.log('⚠️ Solo puedes completar pedidos pendientes.');
        return;
        }
        await Pedido.findByIdAndUpdate(pedidoId, { estado: 'completado' });
        await Repartidor.findByIdAndUpdate(pedido.repartidorAsignado, { estado: 'disponible' });
        console.log('✅ Pedido marcado como completado y repartidor liberado.');
    }

    if (accion === '❌ Cancelar pedido') {
        if (pedido.estado === 'completado') {
        console.log('❌ No puedes cancelar un pedido que ya fue completado.');
        return;
        }
        await Pedido.findByIdAndUpdate(pedidoId, { estado: 'cancelado' });
        await Repartidor.findByIdAndUpdate(pedido.repartidorAsignado, { estado: 'disponible' });
        console.log('🗑️ Pedido cancelado y repartidor liberado.');
    }

    if (accion === '🗑️ Eliminar pedido') {
        if (!['completado', 'cancelado'].includes(pedido.estado)) {
        console.log('❌ Solo se pueden eliminar pedidos completados o cancelados.');
        return;
        }
        await Pedido.findByIdAndDelete(pedidoId);
        console.log('🗑️ Pedido eliminado permanentemente.');
    }

    await gestionarPedidos();
}

async function gestionarIngredientes() {
    const ingredientes = await listarIngredientes();

    const { accion } = await inquirer.prompt({
        type: 'list',
        name: 'accion',
        message: '¿Qué deseas hacer con los ingredientes?',
        choices: [
        '➕ Crear ingrediente',
        '➖ Eliminar ingrediente',
        '🛠️ Modificar stock',
        '🔙 Volver'
        ]
    });

    if (accion === '➕ Crear ingrediente') await crearIngrediente();
    else if (accion === '➖ Eliminar ingrediente') await eliminarIngrediente(ingredientes);
    else if (accion === '🛠️ Modificar stock') await modificarStock(ingredientes);

    if (accion !== '🔙 Volver') await gestionarIngredientes();
}

async function gestionarRepartidores() {
    const repartidores = await listarRepartidores();

    const { accion } = await inquirer.prompt({
        type: 'list',
        name: 'accion',
        message: '¿Qué deseas hacer con los repartidores?',
        choices: [
        '➕ Crear repartidor',
        '🗑️ Eliminar repartidor',
        '🔙 Volver'
        ]
    });

    if (accion === '➕ Crear repartidor') await crearRepartidor();
    else if (accion === '🗑️ Eliminar repartidor') await eliminarRepartidor(repartidores);

    if (accion !== '🔙 Volver') await gestionarRepartidores();
}

async function gestionarClientes() {
    const clientes = await listarClientes();

    const { accion } = await inquirer.prompt({
        type: 'list',
        name: 'accion',
        message: '¿Qué deseas hacer con los clientes?',
        choices: [
        '➕ Crear nuevo cliente',
        '🔁 Actualizar cliente existente',
        '❌ Eliminar cliente',
        '🔙 Volver'
        ]
    });

    switch (accion) {
        case '➕ Crear nuevo cliente':
        await crearCliente();
        break;
        case '🔁 Actualizar cliente existente':
        await actualizarCliente(clientes);
        break;
        case '❌ Eliminar cliente':
        await eliminarCliente(clientes);
        break;
        case '🔙 Volver':
        default:
        return;
    }

    await gestionarClientes(); 
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
