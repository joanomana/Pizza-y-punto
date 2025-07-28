const Pizza = require('../models/pizza');
const Ingrediente = require('../models/ingrediente');
const inquirer = require('inquirer');

async function crearPizza() {
    const ingredientes = await Ingrediente.find();

    if (ingredientes.length === 0) {
        console.log('⚠️ No hay ingredientes disponibles para crear pizzas.');
        return;
    }

    const pizzaData = await inquirer.prompt([
        {
        name: 'nombre',
        message: 'Nombre de la pizza:',
        validate: v => v.length > 0 || 'Campo obligatorio'
        },
        {
        name: 'categoria',
        type: 'list',
        message: 'Categoría:',
        choices: ['tradicional', 'especial', 'vegana', 'personalizada']
        },
        {
        name: 'precio',
        message: 'Precio:',
        validate: v => !isNaN(v) && v >= 0 || 'Debe ser un número válido'
        }
    ]);

    const { ingredientesSeleccionados } = await inquirer.prompt({
        type: 'checkbox',
        name: 'ingredientesSeleccionados',
        message: 'Selecciona los ingredientes de la pizza:',
        choices: ingredientes.map(ing => ({ name: `${ing.nombre} (${ing.tipo})`, value: ing._id.toString() }))
    });

    if (ingredientesSeleccionados.length === 0) {
        console.log('❌ No se puede crear una pizza sin ingredientes.');
        return;
    }

    await Pizza.create({
        nombre: pizzaData.nombre,
        categoria: pizzaData.categoria,
        precio: parseFloat(pizzaData.precio),
        ingredientes: ingredientesSeleccionados
    });

    console.log('✅ Pizza creada con éxito');
}

module.exports = { crearPizza };
