const conectarDB = require('./src/config/db');
const mainMenu = require('./src/cli/menu');
const { cargarDatosDePrueba } = require('./src/utils/helpers');

(async () => {
    try {
        await conectarDB();
        await cargarDatosDePrueba();
        await mainMenu();
    } catch (error) {
        console.error('❌ Error al iniciar la aplicación:', error.message);
        process.exit(1);
    }
})();
