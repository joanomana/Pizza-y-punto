const mongoose = require('mongoose');

const pizzaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    categoria: {
        type: String,
        required: true,
        enum: ['tradicional', 'especial', 'vegana', 'personalizada']
    },
    precio: {
        type: Number,
        required: true,
        min: [0, 'El precio debe ser mayor o igual a 0']
    },
    ingredientes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ingrediente',
        required: true
    }]
}, { timestamps: true });

module.exports = mongoose.model('Pizza', pizzaSchema);
