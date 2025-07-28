const mongoose = require('mongoose');

const repartidorSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    zona: {
        type: String,
        required: true,
        trim: true
    },
    estado: {
        type: String,
        enum: ['disponible', 'ocupado'],
        default: 'disponible'
    }
}, { timestamps: true });

module.exports = mongoose.model('Repartidor', repartidorSchema);
