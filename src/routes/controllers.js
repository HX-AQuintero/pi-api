const axios = require('axios');
const { Dog, Temperament } = require('../db.js');

//--------------------------------DB------------------------------------------

const getDogsfromDB = async() => {
    try {
        const dataDogsDB = await Dog.findAll({
            include: {
                model: Temperament,
                attributes: ['temperament'],
                through: {
                    attributes: [],     // Valida que solo traiga los atributos pedidos del modelo Temperament
                },
            },
        });
        const infoDB = await dataDogsDB.map(e => {
            return{
                id: e.id,
                name: e.name,
                heightMin: parseInt(e.heightMin),
                heightMax: parseInt(e.heightMax),
                weightMin: parseInt(e.weightMin),
                weightMax: parseInt(e.weightMax),
                lifespan: e.lifespan,
                temperament: e.temperaments.map(
                    temp => temp.temperament).join(', '),
                image: e.image,
                createdInDb: e.createdInDb,
                }
            });
            return infoDB;
    } catch(error){
        console.log(error);
    }
    
};

//--------------------------------------API-------------------------------------

const getDogsfromApi = async() => {
    const getdataDogsApi = await axios.get('https://api.thedogapi.com/v1/breeds');
    const dataDogsApi = await getdataDogsApi.data.map(d => {
        return {
            id: d.id,
            name: d.name,
            temperament: d.temperament,
            image: d.image.url,
            heightMax: parseInt(d.height.metric.slice(4).trim()),
            heightMin: parseInt(d.height.metric.slice(0,2).trim()),
            weightMax: parseInt(d.weight.metric.slice(4).trim()),
            weightMin: parseInt(d.weight.metric.slice(0,2).trim()),
            lifespan: d.life_span,
        };
    });
    //console.log(dataDogsApi);
    return dataDogsApi;
};

//----------------------------Uno toda la info-------------------------------------

const getAllDogs = async () => {
    const apiInfoDog = await getDogsfromApi();
    const dbInfoDog = await getDogsfromDB();
    const totalDogsAll = dbInfoDog.concat(apiInfoDog);
    return totalDogsAll;
};
//console.log(getAllDogs());
module.exports = {
    getDogsfromApi, getAllDogs, getDogsfromDB
}