const mongoose = require('mongoose');
const Cliente = require('../models/cliente');
const Pizza = require('../models/pizza');
const Ingrediente = require('../models/ingrediente');
const Repartidor = require('../models/repartidor');
const Pedido = require('../models/pedido');

async function realizarPedido(clienteId, pizzaIds) {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // 1. Validar cliente
        const cliente = await Cliente.findById(clienteId).session(session);
        if (!cliente) throw new Error('Cliente no encontrado');

        // 2. Obtener pizzas
        const pizzas = await Pizza.find({ _id: { $in: pizzaIds } }).populate('ingredientes').session(session);
        if (pizzas.length !== pizzaIds.length) throw new Error('Una o más pizzas no existen');

        // 3. Calcular ingredientes totales requeridos
        const ingredientesNecesarios = {};

        pizzas.forEach(pizza => {
        pizza.ingredientes.forEach(ing => {
            const id = ing._id.toString();
            ingredientesNecesarios[id] = (ingredientesNecesarios[id] || 0) + 1;
        });
        });

        // 4. Verificar stock y preparar actualización
        for (const [id, cantidad] of Object.entries(ingredientesNecesarios)) {
        const ingrediente = await Ingrediente.findById(id).session(session);
        if (!ingrediente) throw new Error(`Ingrediente ${id} no encontrado`);
        if (ingrediente.stock < cantidad) {
            throw new Error(`Stock insuficiente de ${ingrediente.nombre}`);
        }

        await Ingrediente.updateOne(
            { _id: id },
            { $inc: { stock: -cantidad } },
            { session }
        );
        }

        // 5. Asignar repartidor disponible
        const repartidor = await Repartidor.findOneAndUpdate(
        { estado: 'disponible' },
        { estado: 'ocupado' },
        { new: true, session }
        );
        if (!repartidor) throw new Error('No hay repartidores disponibles');

        // 6. Calcular total
        const total = pizzas.reduce((sum, p) => sum + p.precio, 0);

        // 7. Registrar el pedido
        const pedido = new Pedido({
        clienteId,
        pizzas: pizzaIds,
        total,
        repartidorAsignado: repartidor._id
        });
        console.log('🛵 repartidor asignado:', repartidor.nombre);

        await pedido.save({ session });

        // 8. Confirmar transacción
        await session.commitTransaction();
        console.log('✅ Pedido registrado con éxito');
    } catch (error) {
        await session.abortTransaction();
        console.error('❌ Transacción fallida:', error.message);
    } finally {
        session.endSession();
    }
}

module.exports = { realizarPedido };
