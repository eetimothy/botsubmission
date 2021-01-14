const { Telegraf, Markup } = require('telegraf')
const { MenuTemplate, MenuMiddleware } = require('telegraf-inline-menu')
const bot = new Telegraf(process.env.COME_MONEY_COME_TOKEN)
const PAYMENT_TOKEN = '284685063:TEST:MTVkOGZhMWQwMzE4'

//create a menu
const menu = new MenuTemplate( ctx => `Welcome to Botworker.io! Which type of BOT would you like to purchase today?`)

menu.interact('Retail Bot', 'retailbot', {
    do: async (ctx) => ctx.replyWithInvoice(invoice),
})

  menu.interact('Helpdesk Bot', 'helpdeskbot', {
    do: async (ctx) => ctx.replyWithInvoice(invoice),
    joinLastRow: true
  })

  menu.interact('OnlyFams Bot', 'onlyfamsbot', {
    do: async (ctx) => ctx.replyWithInvoice(invoice),
    joinLastRow: true
  })

//middleware
const menuMiddleware = new MenuMiddleware('/', menu)

const products = [
    {
        name: 'Retail Bot',
        price: 300.00,
        description: 'A hired gun. Sells for you through telegram.'
    },
    {
        name: 'Helpdesk Bot',
        price: 250.00,
        description: 'Let him handle your customers needs .. or scoldings perhaps?'
    },
    {
        name: 'OnlyFams Bot',
        price: 1800.00,
        description: 'Accept Memberships and accepts recurring payments from your Fam-ily.'
    }
]

const invoice = {
        provider_token: PAYMENT_TOKEN,
        start_parameter: 'BotWorker-io',
        title: 'Bot',
        description: 'Your hired gun that works from telegram.',
        currency: 'SGD',
        //photo_url:'https://media.npr.org/assets/img/2014/08/07/monkey-selfie_custom-7117031c832fc3607ee5b26b9d5b03d10a1deaca-s400-c85.jpg',
        is_flexible: false,
        need_shipping_address: true,
        prices: [
            { label: 'Retail Bot', amount: 30000 },
        ],
        payload: {}
    }

    const shippingOptions = [
        {
          id: 'Self Collection',
          title: 'Self Collect',
          prices: [{ label: 'Self Collection', amount: 0 }]
        },
        {
          id: 'Express Delivery',
          title: 'Express Delivery',
          prices: [{ label: 'Express', amount: 200 }]
        }
      ]

const replyOptions = Markup.inlineKeyboard([
    Markup.button.pay('💸 Pay'),
    Markup.button.url('❤️', 'http://www.gridsg.com'),
])

//bot.start(ctx => ctx.reply("Welcome to BotWorker.io, which BOT would you like to purchase today?"))
// bot.command('start', ctx => menuMiddleware.replyToContext(ctx))
// bot.command('retailbot', (ctx) => ctx.replyWithInvoice(invoice, replyOptions))


// bot.on('shipping_query', (ctx) => ctx.answerShippingQuery(true, shippingOptions))
// bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true))
// bot.on('successful_payment', () => console.log('Woohoo! I made a sale'))
// bot.launch()

// //Enable graceful stop
// process.once('SIGINT', () => bot.stop('SIGINT'))
// process.once('SIGTERM', () => bot.stop('SIGTERM'))

module.exports = { invoice, replyOptions }