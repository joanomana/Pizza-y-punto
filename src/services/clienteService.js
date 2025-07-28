const Cliente = require('../models/cliente');
const inquirer = require('inquirer');
const Pedido = require('../models/pedido');


async function listarClientes() {
    const clientes = await Cliente.find();
    if (clientes.length === 0) {
        console.log('📭 No hay clientes registrados.');
        return [];
    }

    console.log('\n👥 Lista de clientes:');
    clientes.forEach((c, i) => {
        console.log(`${i + 1}. ${c.nombre} - 📞 ${c.telefono} - 🏠 ${c.direccion}`);
    });
    return clientes;
}

async function crearCliente() {
    const nuevo = await inquirer.prompt([
        { name: 'nombre', message: 'Nombre del cliente:', validate: v => v.length > 0 || 'Campo obligatorio' },
        { name: 'telefono', message: 'Teléfono:', validate: v => /^\d{7,15}$/.test(v) || 'Número inválido' },
        { name: 'direccion', message: 'Dirección:', validate: v => v.length > 0 || 'Campo obligatorio' }
    ]);

    await Cliente.create(nuevo);
    console.log('✅ Cliente creado con éxito');
}

async function actualizarCliente(clientes) {
    if (clientes.length === 0) return;

    const { clienteId } = await inquirer.prompt({
        type: 'list',
        name: 'clienteId',
        message: 'Selecciona el cliente a actualizar:',
        choices: clientes.map(c => ({ name: `${c.nombre} - 📞 ${c.telefono}`, value: c._id.toString() }))
    });

    const cliente = await Cliente.findById(clienteId);
    const actualizados = await inquirer.prompt([
        { name: 'nombre', message: `Nuevo nombre (${cliente.nombre}):`, default: cliente.nombre },
        { name: 'telefono', message: `Nuevo teléfono (${cliente.telefono}):`, default: cliente.telefono },
        { name: 'direccion', message: `Nueva dirección (${cliente.direccion}):`, default: cliente.direccion }
    ]);

    await Cliente.findByIdAndUpdate(clienteId, actualizados);
    console.log('✅ Cliente actualizado correctamente');
}

async function eliminarCliente(clientes) {
    if (clientes.length === 0) return;

    const { clienteId } = await inquirer.prompt({
        type: 'list',
        name: 'clienteId',
        message: 'Selecciona el cliente a eliminar:',
        choices: clientes.map(c => ({ name: `${c.nombre} - 📞 ${c.telefono}`, value: c._id.toString() }))
    });

    const { confirmar } = await inquirer.prompt({
        type: 'confirm',
        name: 'confirmar',
        message: '¿Estás seguro de eliminar este cliente?',
        default: false
    });
    const pedidosPendientes = await Pedido.find({ clienteId });

    if (pedidosPendientes.length > 0) {
        console.log('❌ Este cliente tiene pedidos registrados. No se puede eliminar hasta que no tenga pedidos activos.');
        return;
    }

    if (confirmar) {
        await Cliente.findByIdAndDelete(clienteId);
        console.log('🗑️ Cliente eliminado');
    } else {
        console.log('❎ Operación cancelada');
    }
}

module.exports = {
    listarClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente
};
