const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    telefono: {
        type: String,
        required: true,
        validate: {
        validator: (v) => /^\d{7,15}$/.test(v),
        message: props => `${props.value} no es un número de teléfono válido.`
        }
    },
    direccion: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Cliente', clienteSchema);
