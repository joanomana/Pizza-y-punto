const mongoose = require('mongoose');

const ingredienteSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    tipo: {
        type: String,
        required: true,
        enum: ['queso', 'salsa', 'topping', 'masa', 'otros']
    },
    stock: {
        type: Number,
        required: true,
        min: [0, 'El stock no puede ser negativo']
    }
}, { timestamps: true });

module.exports = mongoose.model('Ingrediente', ingredienteSchema);
