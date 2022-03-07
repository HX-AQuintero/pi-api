const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
    sequelize.define('temperament', {
        temperament: {                  //Atributo donde se almacenarán los temperamentos de la API
            type: DataTypes.STRING,
            allowNull: true,
        },
    },{timestamps: false});
};
/* 
const {Model, DataTypes} = require('sequelize');

class Temperament extends Model {}
Temperament.init({
    temperament: {                     //atributo
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    sequelize, // Instancia de conexión
    modelName: 'Temperament' //nombre del modelo
});

module.exports = Temperament; */