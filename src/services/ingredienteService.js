const Ingrediente = require('../models/ingrediente');
const inquirer = require('inquirer');

async function listarIngredientes() {
    const ingredientes = await Ingrediente.find();
    if (ingredientes.length === 0) {
        console.log('📭 No hay ingredientes registrados.');
        return [];
    }

    console.log('\n🧀 Inventario de ingredientes:\n');
    ingredientes.forEach((ing, i) => {
        console.log(`${i + 1}. ${ing.nombre} (${ing.tipo}) - Stock: ${ing.stock}`);
    });
    return ingredientes;
}

async function crearIngrediente() {
    const nuevo = await inquirer.prompt([
        { name: 'nombre', message: 'Nombre del ingrediente:', validate: v => v.length > 0 || 'Campo obligatorio' },
        { name: 'tipo', message: 'Tipo (queso, salsa, topping, masa):', validate: v => v.length > 0 || 'Campo obligatorio' },
        { name: 'stock', message: 'Stock inicial:', validate: v => !isNaN(v) && v >= 0 || 'Debe ser un número válido' }
    ]);

    await Ingrediente.create({ ...nuevo, stock: parseInt(nuevo.stock) });
    console.log('✅ Ingrediente creado con éxito');
}

async function modificarStock(ingredientes) {
    if (ingredientes.length === 0) return;

    const { ingId } = await inquirer.prompt({
        type: 'list',
        name: 'ingId',
        message: 'Selecciona el ingrediente a modificar stock:',
        choices: ingredientes.map(i => ({ name: `${i.nombre} (${i.stock})`, value: i._id.toString() }))
    });

    const { cantidad } = await inquirer.prompt({
        type: 'number',
        name: 'cantidad',
        message: '¿Cuánto deseas agregar (+) o restar (-) del stock?',
        validate: v => !isNaN(v)
    });

    await Ingrediente.findByIdAndUpdate(ingId, { $inc: { stock: cantidad } });
    console.log('✅ Stock actualizado');
}

async function eliminarIngrediente(ingredientes) {
    if (ingredientes.length === 0) return;

    const { ingId } = await inquirer.prompt({
        type: 'list',
        name: 'ingId',
        message: 'Selecciona el ingrediente a eliminar:',
        choices: ingredientes.map(i => ({ name: `${i.nombre}`, value: i._id.toString() }))
    });

    const { confirmar } = await inquirer.prompt({
        type: 'confirm',
        name: 'confirmar',
        message: '¿Estás seguro de eliminar este ingrediente?',
        default: false
    });

    if (confirmar) {
        await Ingrediente.findByIdAndDelete(ingId);
        console.log('🗑️ Ingrediente eliminado');
    } else {
        console.log('❎ Operación cancelada');
    }
}

module.exports = {
    listarIngredientes,
    crearIngrediente,
    modificarStock,
    eliminarIngrediente
};
