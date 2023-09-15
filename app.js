const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MongoAdapter = require('@bot-whatsapp/database/mongo')

/**
 * Declaramos las conexiones de Mongo
 */

const MONGO_DB_URI = 'mongodb://0.0.0.0:27017'
const MONGO_DB_NAME = 'db_bot'

//Flujo de conversación

const flujoBD = addKeyword('Buen día!')
.addAnswer('https://photos.app.goo.gl/mDYyko9NGQSEcYNo9')

const flujoAU = addKeyword('Au revoir!')
.addAnswer('https://photos.app.goo.gl/LGVgDZk68qUXSKBGA')

const flujoKR = addKeyword('나중에 봐요!')
.addAnswer('https://photos.app.goo.gl/Q97u9zSZiZMV1WaBA')

const flowPrincipal = addKeyword(['hola', 'ola', 'alo', 'oli', 'buen dia'])
    .addAnswer('🙌 Hola! Te presento a mi Chatbot!')
    .addAnswer(
        [
            'Estoy haciendo pruebas con esta tecnología tan interesante.',
            'Si puedes hacerme un favor, sería que me mandaras una dirección de email.',
            'No es necesario que exista, pero sí que tenga el "@".',
            'Todo esto porque estoy haciendo una revisión de las comprobaciones.'
        ])
    .addAnswer('Entonces...')
    .addAnswer( '¿Cuál es tu *email*?', {capture:true}, (ctx, {fallBack}) => {
        if(!ctx.body.includes('@')){
            return fallBack()
        }
        console.log('Mensaje entrante: ', ctx.body)
    })
    .addAnswer('Muchas gracias!!!! OwO')
    /*
            *Con Baileys no puedo desplegar botones, solamente con la API de META o con Twilio*

    .addAnswer('Por cierto, ¿podrías elegir alguna de las siguientes opciones?', {
        buttons:[
            {
                body: 'Buen día!'
            },
            {
                body: 'Au revoir!'
            },
            {
                body: '나중에 봐요!'
            }
        ]
    })*/


const flowDePrueba = addKeyword(['productos'])
.addAnswer('🙌 Claro, estos son los productos con los que contamos actualmente:*')
.addAnswer(
    [
        'Por favor seleccione uno, para darle más información*',
        '👉 *Articulo 1* ',
        '👉 *Articulo 2*',
        '👉 *Articulo 3* ',
    ],
    null,
    null,
)

const main = async () => {
    const adapterDB = new MongoAdapter({
        dbUri: MONGO_DB_URI,
        dbName: MONGO_DB_NAME,
    })
    const adapterFlow = createFlow([flowPrincipal, flowDePrueba, flujoAU, flujoBD,flujoKR])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()
