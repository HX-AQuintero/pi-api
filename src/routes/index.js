const { Router } = require('express');
const router = Router();
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const axios = require('axios');
const { Dog, Temperament } = require('../db.js');
const { getAllDogs, getDogsfromApi } = require('./controllers.js')




// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

//------------------------------RUTAS-----------------------------------------

//GET /dogs:
//Obtener un listado de las razas de perro
//Debe devolver solo los datos necesarios para la ruta principal

//GET /dogs?name="...":
//Obtener un listado de las razas de perro que contengan la palabra ingresada como query parameter
//Si no existe ninguna raza de perro mostrar un mensaje adecuado

router.get('/dogs', async (req, res) => {
    const { name } = req.query;
    try{
        let dogsTotal = await getAllDogs();
        if(name) {
            let dogName = await dogsTotal.filter(e => e.name.
                toLowerCase().includes(name.toLowerCase()));
            dogName.length ? 
            res.status(200).send(dogName):
            res.status(404).send('There is not a dog with that name');
        } else {
            res.status(200).send(dogsTotal)
        }
    } catch(error){
        console.log(error);
    }
});

//----------------------------------------------------------------------------

//GET /dogs/{idRaza}:
//Obtener el detalle de una raza de perro en particular
//Debe traer solo los datos pedidos en la ruta de detalle de raza de perro
//Incluir los temperamentos asociados

router.get('/dogs/:idRaza', async (req, res) => {
    const idRaza = req.params.idRaza;
    try {
        let dogsTotal = await getAllDogs();
        if(idRaza){
            let dogId = await dogsTotal.filter(e => e.id == idRaza);
            dogId.length ? 
                res.status(200).json(dogId) :
                res.status(404).send('There is not a dog with that id')
        } else {
            res.status(200).send(dogsTotal)
        }
    } catch(error){
        console.log(error);
    }
})

//----------------------------------------------------------------------------

//GET /temperament:
//Obtener todos los temperamentos posibles
//En una primera instancia deberán obtenerlos desde la API externa 
//y guardarlos en su propia base de datos y luego ya utilizarlos desde allí

router.get('/temperament', async (req, res) => {
        try{
            const apiTemp = await getDogsfromApi();

            // arreglo con todos los temperamentos como strings:
            
            const temperaments = await apiTemp.map(e =>
            (e.temperament)); 

            /*temperaments = ['Active, Playful, Adveturous',
            'Curious, Funny, Fearless',
            'Brave, Playful, Intelligent, Stubborn'] */

            // arreglo con todos los temperamentos separados
            // por coma y espacio. el método flat, crea un nuevo
            // arreglo con TODOS los elementos concatenados:

            const arrayTemp = temperaments.map((temp) => 
            (temp ? temp.split(', ') : null)).flat();
            /* .split ---> [["Active", "Playful", "Adveturous"],
            ["Curious", "Funny", "Fearless"],
            ["Brave", "Playful", "Intelligent", "Stubborn"]] */ 

            /* arrayTemp = ["Active", "Playful", "Adveturous", "Curious",
            "Funny", "Fearless", "Brave", "Playful", 
            "Intelligent", "Stubborn"] */
            
            // arreglo para dejar temperamentos SIN repetir y no nulos
            // y agregarlos al modelo Temperament:

            const temperamentUnique = [...new Set(arrayTemp)];

            /* new Set(arrayTemp) ---> {"Active", "Playful", "Adventurous", "Curious",
            "Funny", "Fearless", "Brave", "Intelligent", "Stubborn"} */

            /* temperamentUnique = ["Active", "Playful", "Adveturous", "Curious", "Funny",
            "Fearless", "Brave", "Intelligent", "Stubborn"] */
            
            temperamentUnique.filter(temp => temp !== null).forEach(
                async (temp) => await Temperament.findOrCreate({
                    where: {temperament: temp},
                })
            );
            const allTemperaments = await Temperament.findAll({
                order: [["temperament", "ASC"]],
            });
            res.send(allTemperaments);
        } catch (error){
            console.log(error);
        }
});

//----------------------------------------------------------------------------

//POST /dog:
//Recibe los datos recolectados desde el formulario controlado
//de la ruta de creación de raza de perro por body
//Crea una raza de perro en la base de datos

router.post('/dog', async (req, res) => {
    let { name,
        heightMin,
        heightMax,
        weightMin,
        weightMax,
        lifespan, 
        temperament,
        image, 
        createdInDb } = req.body;

    if(!image){             // Toma imagen por default cuando no hay imagen por body
        image = 'https://media.istockphoto.com/vectors/dog-black-silhouette-isolated-on-white-background-sitting-pet-simple-vector-id1265211191?k=20&m=1265211191&s=612x612&w=0&h=S3FTUJHcxDTP5dp_qRWwmd51djcS3JOEEl_hXLIQj3g=';
    }

    if(name && heightMin && heightMax && weightMin &&
        weightMax && lifespan && temperament && image){
            let dogCreated = await Dog.create({             // Se crea la nueva raza de perro
                name: name,
                heightMax: parseInt(heightMax),
                heightMin: parseInt(heightMin),
                weightMax: parseInt(weightMax),
                weightMin: parseInt(weightMin),
                lifespan: lifespan,
                image: image,
                createdInDb: createdInDb,
            })

            let temperamentDB = await Temperament.findAll({ // Se traen los temperamentos que pide el usuario
                where: {temperament : temperament },
            });
            dogCreated.addTemperament(temperamentDB);       // Se agregan los temperamentos al perro creado
            res.status(200).send('Dog sucessfully created');

    } else{
        res.status(404).send('Complete all the fields')
    }
});



module.exports = router;
