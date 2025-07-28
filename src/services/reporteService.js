const Pedido = require('../models/pedido');
const Pizza = require('../models/pizza');

async function ingredientesMasUsadosUltimoMes() {
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);

    const resultados = await Pedido.aggregate([
        { $match: { fecha: { $gte: haceUnMes } } },
        { $unwind: '$pizzas' },
        {
        $lookup: {
            from: 'pizzas',
            localField: 'pizzas',
            foreignField: '_id',
            as: 'pizza'
        }
        },
        { $unwind: '$pizza' },
        { $unwind: '$pizza.ingredientes' },
        {
        $group: {
            _id: '$pizza.ingredientes',
            vecesUsado: { $sum: 1 }
        }
        },
        {
        $lookup: {
            from: 'ingredientes',
            localField: '_id',
            foreignField: '_id',
            as: 'ingrediente'
        }
        },
        { $unwind: '$ingrediente' },
        {
        $project: {
            nombre: '$ingrediente.nombre',
            tipo: '$ingrediente.tipo',
            vecesUsado: 1,
            _id: 0
        }
        },
        { $sort: { vecesUsado: -1 } }
    ]);

    console.table(resultados);
}

async function promedioPreciosPorCategoria() {
    const resultados = await Pizza.aggregate([
        {
        $group: {
            _id: '$categoria',
            promedioPrecio: { $avg: '$precio' }
        }
        },
        {
        $project: {
            categoria: '$_id',
            promedioPrecio: { $round: ['$promedioPrecio', 2] },
            _id: 0
        }
        },
        { $sort: { promedioPrecio: -1 } }
    ]);

    console.table(resultados);
}

async function categoriaMasVendida() {
    const resultados = await Pedido.aggregate([
        { $unwind: '$pizzas' },
        {
        $lookup: {
            from: 'pizzas',
            localField: 'pizzas',
            foreignField: '_id',
            as: 'pizza'
        }
        },
        { $unwind: '$pizza' },
        {
        $group: {
            _id: '$pizza.categoria',
            cantidadVendida: { $sum: 1 }
        }
        },
        {
        $project: {
            categoria: '$_id',
            cantidadVendida: 1,
            _id: 0
        }
        },
        { $sort: { cantidadVendida: -1 } }
    ]);

    console.table(resultados);
}

module.exports = {
    ingredientesMasUsadosUltimoMes,
    promedioPreciosPorCategoria,
    categoriaMasVendida
};
