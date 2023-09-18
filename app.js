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
    .addAnswer([
        '¡Perfecto!',
        'Permitame presentarnos, somos la muebleria *Lleiny Deyanara* y nos ubicamos actualmente en Altamira, Tamaulipas',
        'Como una celebracion por el Mes Patrio 🎉🎉 tenemos nuestros abanicos con una oferta especial 😉'
    ])
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
    //Aqui solicito la fecha de entrega del producto y la guardo en la variable myState.date
    .addAnswer(
        [
            'Por ultimo, pero no menos importante... ¿En que fecha le podemos dejar el articulo?',
            '*Formato DD/MM/AAAA*, por favor'
        ], {capture:true},
        async(ctx, {flowDynamic, state}) =>{
            state.update({date: ctx.body})
            console.log ('Fecha de entrega: ', ctx.body)
            console.log('Cliente: ', ctx.from)
            flowDynamic('¡Perfecto!')
        }    
    )
    .addAnswer(
        [
            'Le informamos que nuestras entregas son *gratuitas* para *Altamira, Tampico y Madero*',
            'Asimismo, las entregas son entre las *10:00 a 18:00* de lunes a sabado'
        ]
    )
    .addAnswer(
        [
        'Si tiene disponibilidad de horario, escriba *Disponible*',
        'Si prefiere su entrega a una hora especifica, escriba *Especifica*'
        ], {capture:true}, (ctx) => {
                if(ctx.body=='Disponible'){
                    async(ctx, {flowDynamic, state}) => {
                        state.update({time: ctx.body})
                        console.log('Entrega a cualquier hora')
                        console.log('Cliente: ', ctx.from)
                        flowDynamic('¡Su entrega sera entre *10:00-18:00*!')
                     }
                }
                else if(ctx.body=='Especifica'){
                    flowDynamic('Digame a que hora le gustaria recibir su producto'),
                    async(ctx, {flowDynamic, state}) => {
                        state.update({time: ctx.body})
                        console.log('Hora de entrega: ', ctx.body)
                        console.log('Cliente: ', ctx.from)
                        const myState = state.getMyState()
                        await flowDynamic('Su hora de entrega sera', myState.time)
                    }
                }
                delay(4000)
            }
    )
    .addAnswer('Su informacion quedo de la siguiente manera:', null, async (_, {flowDynamic, state}) => {
            const myState = state.getMyState()
            flowDynamic(
                [
                    'Nombre: ', myState.name,
                    'Direccion: ', myState.address,
                    'Fecha: ', myState.date,
                    'Hora: ', myState.time
                ]
            ), delay(2000)
        }
    )
    .addAnswer('Su informacion ya ha sido almacenada y solamente la utilizaremos para el envio de su producto')
    .addAnswer(
        [
            'Tambien le recordamos que su pago sera *contraentrega*.🫡',
            'Lo que significa que hasta que usted *reciba su producto*, lo paga. 😉'
        ]
    )
    .addAnswer('Muchisimas gracias por su preferencia 😁')


const flowO2 = addKeyword('Per')
    .addAnswer('Dime, ¿en que puedo ayudarte? 🫡', {capture:true}, (ctx) => {
        console.log('Mensaje personal: ', ctx.body)
    })

const flowPrincipal = addKeyword(['hola', 'ola', 'alo', 'oli', 'buen dia', 'buena noche', 'buena tarde', 'tardes'])
    .addAnswer('*¡Hola!*')
    .addAnswer(
        [
            'Digame en que le puedo apoyar el dia de hoy',
            'Envie un *Info* para informacion acerca de nuestros productos en existencia.',
            'Envie un *Per* si es un tema personal.'
        ])
    //.addAnswer('Entonces...')
    /*.addAnswer( '¿Cuál es tu *email*?', {capture:true}, (ctx, {fallBack}) => {
        if(!ctx.body.includes('@')){
            return fallBack()
        }
        console.log('Mensaje entrante: ', ctx.body)
    })
    .addAnswer('Muchas gracias!!!! OwO')
    */
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
const flowCuenta = addKeyword(['numero de cuenta', 'tarjeta', 'deposito'])
    .addAnswer('Claro!, con mucho gusto')
    .addAnswer(['Mi numero de tarjeta es: ',
                '*4152-3135-5676-7940*',
                'Está a nombre de Andres Emmanuel Mendoza Acosta'
    ])
    .addAnswer('Te agradecería mucho si me mandas un *comprobante de pago*', {capture:true}, (ctx) => {
        console.log('Comprobante de pago: ', ctx.body,)
    })


const flowDePrueba = addKeyword(['productos'])
.addAnswer('🙌 Claro, estos son los productos con los que contamos actualmente:*')
.addAnswer(
    [
        'Por favor seleccione uno, para darle más información*',
        '👉 *Articulo 1* ',
        '👉 *Articulo 2*',
        '👉 *Articulo 3* ',
    ],
)

const main = async () => {
    const adapterDB = new MongoAdapter({
        dbUri: MONGO_DB_URI,
        dbName: MONGO_DB_NAME,
    })
    const adapterFlow = createFlow([flowPrincipal, flowDePrueba, flowCuenta, flowO1])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
}

main()
