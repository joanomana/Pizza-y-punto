const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
    clienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    pizzas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pizza',
        required: true
    }],
    total: {
        type: Number,
        required: true,
        min: 0
    },
    fecha: {
        type: Date,
        default: Date.now
    },
    repartidorAsignado: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Repartidor',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Pedido', pedidoSchema);
