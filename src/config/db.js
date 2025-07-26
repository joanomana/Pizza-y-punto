require('dotenv').config();
const mongoose = require('mongoose');

const conectarDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Pizzeria'; // Valida la existencia del .env para la conexion a atlas, en caso de no existir, conecta a la base de datos local
    try {
        await mongoose.connect(uri);

        console.log(`✅ Conectado a MongoDB: ${uri.includes('localhost') ? 'Local' : 'Atlas'}`);
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = conectarDB;
