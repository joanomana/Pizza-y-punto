const Repartidor = require('../models/repartidor');
const Pedido = require('../models/pedido');
const inquirer = require('inquirer');

async function listarRepartidores() {
    const repartidores = await Repartidor.find();
    if (repartidores.length === 0) {
        console.log('📭 No hay repartidores registrados.');
        return [];
    }

    console.log('\n🛵 Lista de repartidores:\n');
    repartidores.forEach((r, i) => {
        const estadoIcono = r.estado === 'disponible' ? '🟢' : '🔴';
        console.log(`${i + 1}. ${r.nombre} | Zona: ${r.zona} | Estado: ${estadoIcono} ${r.estado}`);
    });
    return repartidores;
}

async function crearRepartidor() {
    const nuevo = await inquirer.prompt([
        { name: 'nombre', message: 'Nombre del repartidor:', validate: v => v.length > 0 || 'Campo obligatorio' },
        { name: 'zona', message: 'Zona asignada:', validate: v => v.length > 0 || 'Campo obligatorio' }
    ]);

    await Repartidor.create({ ...nuevo, estado: 'disponible' });
    console.log('✅ Repartidor creado con éxito');
}

async function eliminarRepartidor(repartidores) {
    if (repartidores.length === 0) return;

    const { repId } = await inquirer.prompt({
        type: 'list',
        name: 'repId',
        message: 'Selecciona el repartidor a eliminar:',
        choices: repartidores.map(r => ({ name: `${r.nombre} (${r.zona})`, value: r._id.toString() }))
    });

    const pedidosPendientes = await Pedido.find({ repartidorAsignado: repId, estado: 'pendiente' });

    if (pedidosPendientes.length > 0) {
        console.log('❌ Este repartidor tiene pedidos pendientes. No se puede eliminar hasta que estén completados o cancelados.');
        return;
    }

    const { confirmar } = await inquirer.prompt({
        type: 'confirm',
        name: 'confirmar',
        message: '¿Estás seguro de eliminar este repartidor?',
        default: false
    });

    if (confirmar) {
        await Repartidor.findByIdAndDelete(repId);
        console.log('🗑️ Repartidor eliminado');
    } else {
        console.log('❎ Operación cancelada');
    }
}

module.exports = {
    listarRepartidores,
    crearRepartidor,
    eliminarRepartidor
};
