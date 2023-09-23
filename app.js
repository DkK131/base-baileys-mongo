//https://bot-whatsapp.netlify.app/docs/add-action/

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

const flowO1 = addKeyword('Info') //A partir de aqui me empieza a explicar la informacion del producto
    .addAnswer('¡Perfecto!')
    .addAnswer(
        'Permitame presentarnos, somos la muebleria *Lleiny Dayana* y nos ubicamos actualmente en Altamira, Tamaulipas',
        {media: 'https://i.imgur.com/bMWGNT6.jpg'} //Se envía logo de la empresa
    )
    .addAnswer('Son abanicos con aspas de 18" de metal y cuenta con 3 velocidades, *¡ideal para estos dias calurosos!* 🔆☀️', {
        media: 'https://i.imgur.com/iYNfiQR.jpg'//Manda la imagen del producto
    })
    .addAnswer([
        'Con *mas del 30% de descuento* sobre el precio original, de $1800mxn bajan hasta *¡$1200mxn!* ✨',
        '*Precio al contado',
        '**Envio gratis* en la Zona Conurbada'
    ])
    
    //A partir de aqui empiezo a solicitar y recopilar la informacion del cliente, conforme a sus respuestas

    //Aqui solicito el nombre del cliente y lo guardo en la variable myState.name
    .addAnswer('Para concretar una entrega, me podrias proporcionar tu *nombre*', {capture:true}, 
        async(ctx, {flowDynamic, state}) => {
            state.update({name: ctx.body})
            console.log('Nombre cliente: ', ctx.body)
            console.log('Numero de telefono de cliente: ', ctx.from) //Para poder recuperar el numero de telefono del cliente
            flowDynamic('¡Muchas gracias!')
        }
    )

    //Aqui solicito la direccion del cliente y la guardo en la variable myState.address
    .addAnswer('¿Cual es su direccion?', {capture:true},
        async(ctx, {flowDynamic, state}) => {
            state.update({address: ctx.body})
            console.log('Direccion cliente: ', ctx.body)
            console.log('Cliente: ', ctx.from)
            flowDynamic('¡Ya casi terminamos!')
        }    
    )
    
    .addAnswer('Su informacion quedo de la siguiente manera:', null, async (_, {flowDynamic, state}) => {
            const myState = state.getMyState()
            flowDynamic(
                [
                    'Nombre: ', myState.name,
                    'Direccion: ', myState.address,
                ]
            )
        }
    )
    .addAnswer('Su informacion ya ha sido almacenada y solamente la utilizaremos para el envio de su producto', {delay:250,})
    .addAnswer(
        [
            'Tambien le recordamos que su pago sera *contraentrega*.🫡',
            'Lo que significa que hasta que usted *reciba su producto*, lo paga. 😉'
        ], {delay: 250,}
    )
    .addAnswer('Y en un momento más, uno de nuestros *Agentes* se pondrá en contacto con ud. para la entrega de su producto 😁😁👌')
    .addAnswer('Le informamos que nuestras entregas son *gratuitas* para *Altamira, Tampico y Madero*')
    .addAnswer('Muchisimas gracias por su preferencia 😁', {delay: 1000,})


//Al recibir la palabra 'Per' manda un mensaje para temas personales
const flowO2 = addKeyword('Per')
    .addAnswer('Dime, ¿en que puedo ayudarte? 🫡', {capture:true}, (ctx) => {
        console.log('Mensaje personal: ', ctx.body)
    })


//Flujo de entrada, primer mensaje que se envía
const flowPrincipal = addKeyword(['hola', 'ola', 'alo', 'oli', 'buen dia', 'buena noche', 'buena tarde', 'tardes'])
    .addAnswer('*¡Hola!* 😃')
    .addAnswer(
        [
            'Digame en que le puedo apoyar el dia de hoy',
            'Envie un *Info* para informacion acerca de nuestros productos en existencia.',
            'Envie un *Tarjeta* si necesita el número de tarjeta para abonar a su crédito',
            'Envie un *Per* si es un tema personal.'
        ])


//Flujo en el que se envía el número de tarjeta para transferencias
const flowCuenta = addKeyword(['numero de cuenta', 'tarjeta', 'deposito'])
    .addAnswer('Claro!, con mucho gusto 😁')
    .addAnswer(['Mi numero de tarjeta es: ',
                '*4152-3135-5676-7940*',
                'Está a nombre de Andres Emmanuel Mendoza Acosta'
    ])
    .addAnswer('Te agradecería mucho si me mandas un *comprobante de pago* 😉😉', {capture:true}, (ctx) => {
        console.log('Comprobante de pago: ', ctx.body,)
    })


const main = async () => {
    const adapterDB = new MongoAdapter({
        dbUri: MONGO_DB_URI,
        dbName: MONGO_DB_NAME, //Aquí se está habilitando la base de datos
    })
    const adapterFlow = createFlow([flowPrincipal, flowCuenta, flowO1, flowO2])//Aquí estoy poniendo cuales son los flujos principales
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()
