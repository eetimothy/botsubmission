//load libraries
require('dotenv').config()
const morgan = require('morgan')
const express = require('express')
const jwt = require('jsonwebtoken')
const cors = require('cors')
const { pool, mkQuery } = require('./db_utils/mysqldb')
const nodemailer = require('nodemailer')
const Mailgen = require('mailgen')
const fs = require('fs')
const multer = require('multer')
const AWS = require('aws-sdk')
const router = express.Router()
const multerS3 = require('multer-s3')

//routes
// router.get('main', getCurrentUser)

const PORT = parseInt(process.env.PORT) || 3000

const app = express()
app.use(morgan('combined'))

app.use(cors())
app.use(express.json())
app.use(express.static(__dirname + '/client'))
app.use(express.urlencoded({ extended: true }))

//digitalocean database setup
const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint('sfo2.digitaloceanspaces.com'),
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    BUCKET_NAME: 'timojs'
})

//application/x-www.form-urlencoded
app.post('/user-info', express.urlencoded({ extended: true }),
    (req, res) => {
        console.info('>> payload: ', req.body)

        res.status(200).type('application/json')
        res.json({ message: 'accepted' })
    }
)

//upload an image to S3
const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: 'timojs',
      acl: 'public-read',
      metadata: function (req, file, cb) {
        cb(null, {
            fieldName: file.fieldname,
            originalFileName: file.originalname,
            uploadTimeStamp: new Date().toString(),
        });
      },
      key: function (request, file, cb) {
        console.log(file);
        cb(null, new Date().getTime()+'_'+ file.originalname);
      }
    })
  }).single('upload');

  app.post('/upload', (request, response, next)=> {
    upload(request, response, (error)=> {
        if (error) {
          console.log(error);
          response.status(500).json({error: error.message});
        }
        console.log('File uploaded successfully.');
        response.status(200).json({
          message: "uploaded",
          s3_file_key: response.req.file.location
        });
    });
});

async function downloadFromS3(params, res){
    const metaData = await s3.headObject(params).promise();
    console.log(metaData);
    res.set({
        'X-Original-Name': metaData.Metadata.originalfilename,
        'X-Create-Time': metaData.Metadata.uploadtimestamp
      })
    s3.getObject(params, function(err, data) {
        if (err) console.log(err, err.stack);
        let fileData= data.Body.toString('utf-8');
        res.send(fileData);
    });
}

app.get('/blob/:key', (req,res)=>{
    const keyFilename = req.params.key;
    var params = {
        Bucket: process.env.BUCKET_NAME,
        Key: keyFilename
    };
    downloadFromS3(params, res);
});

//load telegraf lib
const { Telegraf, Markup } = require('telegraf')
const { MenuTemplate, MenuMiddleware } = require('telegraf-inline-menu')
const bot = new Telegraf(process.env.BOT_TOKEN)
const PAYMENT_TOKEN = '284685063:TEST:MTVkOGZhMWQwMzE4'
const { invoice, replyOptions } = require('./telegram/telegram')

//create a menu for telegram
const menu = new MenuTemplate( ctx => 
    `Welcome to Botworker.io! 
    Which BOT would you like to purchase today? You can simply type /retailbot to purchase the Retail BOT or select from the Menu below!`)

//middleware for telegram
const menuMiddleware = new MenuMiddleware('/', menu)

//const { transporter } = require('./controller/signupController')
const { EMAIL, EMAIL_PASSWORD, MAIN_URL } = require('./config')
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'abcd1234'

const SQL_SELECT_USER = `SELECT EMAIL from USER where email = ? AND password = sha1(?)`
const SQL_INSERT_USER = `INSERT INTO USER (email, password, username, mobile) values (?, sha1(?), ?, ?)`
const inserter = mkQuery(SQL_INSERT_USER, pool)

// Passport core
const passport = require('passport')
// Passport strategy
const LocalStrategy = require('passport-local').Strategy

const mkAuth = (passport) => {
    return (req, resp, next) => {
        passport.authenticate('local',
            (err, user, info) => {
                if ((null != err) || (!user)) {
                    resp.status(401)
                    resp.type('application/json')
                    resp.json({ error: err })
                    return
                }
                // attach user to the request object
                req.user = user
                next()
            }
        )(req, resp, next)
    }
}

// configure passport with a strategy
passport.use(
    new LocalStrategy(
        { usernameField: 'email', passwordField: 'password' },
        async (user, password, done) => {
            // perform the authentication
            console.info(`LocalStrategy> email: ${user}, password: ${password}`)
            const conn = await pool.getConnection()
            try {
                const [result, _] = await conn.query(SQL_SELECT_USER, [user, password])
                console.info('>>> result: ', result)
                if (result.length > 0)
                    done(null, {
                        email: result[0].email,
                        //avatar: `https://i.pravatar.cc/400?u=${result[0].email}`,
                        loginTime: (new Date()).toString()
                    })
                else
                    done('Incorrect login', false)
            } catch (e) {
                done(e, false)
            } finally {
                conn.release()
            }
        }
    )
)

const localStrategyAuth = mkAuth(passport)



// initialize passport after json and form-urlencoded
app.use(passport.initialize())

app.post('/login',
    // passport middleware to perform login
    // passport.authenticate('local', { session: false }),
    // authenticate with custom error handling
    localStrategyAuth,
    (req, resp) => {
        // do something 
        console.info(`user: `, req.user)
        // generate JWT token
        const timestamp = (new Date()).getTime() / 1000
        const token = jwt.sign({
            sub: req.user.email,
            iss: 'myapp',
            iat: timestamp,
            //nbf: timestamp + 30,
            exp: timestamp + (60 * 60),
            data: {
                avatar: req.user.avatar,
                loginTime: req.user.loginTime
            }
        }, TOKEN_SECRET)

        resp.status(200)
        resp.type('application/json')
        resp.json({ message: `Login in at ${new Date()}`, token })
    }
)

// Look for token in HTTP header
// Authorization: Bearer <token>
app.get('/protected/secret',
    (req, resp, next) => {
        // check if the request has Authorization header
        const auth = req.get('Authorization')
        if (null == auth) {
            resp.status(403)
            resp.json({ message: 'Missing Authorization header' })
            return
        }
        // Bearer authorization
        // Bearer <token>
        const terms = auth.split(' ')
        if ((terms.length != 2) || (terms[0] != 'Bearer')) {
            resp.status(403)
            resp.json({ message: 'Incorrect Authorization' })
            return
        }

        const token = terms[1]
        try {
            // verify token
            const verified = jwt.verify(token, TOKEN_SECRET)
            console.info(`Verified token: `, verified)
            req.token = verified
            next()
        } catch (e) {
            resp.status(403)
            resp.json({ message: 'Incorrect token', error: e })
            return
        }

    },
    (req, resp) => {
        resp.status(200),
            resp.json({ meaning_of_life: 42 })
    }
)

//email form
let transporter = nodemailer.createTransport({
    service: "Yahoo",
    secure: true,
    auth: {
        user: EMAIL,
        pass: EMAIL_PASSWORD,
    },
});

let MailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: "Nodemailer",
        link: MAIN_URL,
    },
});

let response = {
    body: {
        name: 'Tim',
        intro: "Welcome to BotWorker.io! We're very excited to have you on board.",
    },
};

let mail = MailGenerator.generate(response);

//signup form
app.post('/signup', express.urlencoded({ extended: true }),
    (req, res) => {
        console.log('>>payload: ', req.body)
        inserter([req.body.email, req.body.password, req.body.username, req.body.mobile])
            .then((result) => {
                res.status(200).json(result)

                let message = {
                    from: EMAIL,
                    to: req.body.email,
                    subject: "SignUp successful",
                    html: `Dear, ${req.body.username} 
                    <p>Thank you for signing up and welcome onboard BotWorker!</p> 
                    <p>You can start creating your own Telegram Bot <a href="https://t.me/ComeMoneyCome_bot">Here</a>!</p>`,
                };
                transporter
                    .sendMail(message)
                    .then(() => {
                        return res
                            .status(200)
                            .json({ msg: 'you should receive an email' })
                    })
                    .catch((error) => {
                        console.error(error)
                    })
            }).catch((error) => {
                console.log(error)
            })
    })
    
const SQL_SELECT_USR = `SELECT email FROM user WHERE username = ?`
const getUser = mkQuery(SQL_SELECT_USR, pool)

// //GET /main/user
app.get('main/:username', async (req, res) => {
    
    try {
        const result = await getUser([req.params.username])
        if(!!result.length) {
            res.status(200).json(result[0])
        } else res.status(404).json({message: 'User not found!'})
    } catch (e) {
        res.status(500).json(e)
    }

})

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

    //start telegram
    bot.command('start', ctx => menuMiddleware.replyToContext(ctx))
    bot.command('retailbot', (ctx) => ctx.replyWithInvoice(invoice, replyOptions))
    
    
    bot.on('shipping_query', (ctx) => ctx.answerShippingQuery(true, shippingOptions))
    bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true))
    bot.on('successful_payment', () => console.log('Woohoo! I made a sale'))
    bot.launch()
    
    //Enable graceful stop
    process.once('SIGINT', () => bot.stop('SIGINT'))
    process.once('SIGTERM', () => bot.stop('SIGTERM'))


//start server only if both databases are connected
//IIFE
const p0 = (async () => {
    const conn = await pool.getConnection()
    await conn.ping()
    conn.release
    return true
})()

const p1 = new Promise(
    (resolve, reject) => {
        if ((!!process.env.ACCESS_KEY) && (!!process.env.SECRET_ACCESS_KEY))
                resolve()
        else
                reject('S3 keys not found')
    }
)

Promise.all([ p0, p1 ])
    .then((r) => {
        app.listen(PORT, () => {
            console.info(`Application started on port ${PORT} at ${new Date()}`)
        })
    })