const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const Modules = require('./modules')

var app = express()
app.set('json spaces', 4)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

//Allow all if DOMAINS is null
const allowedOrigins = process.env.DOMAINS ? process.env.DOMAINS : undefined

app.use(
	cors({
		origin: function (origin, callback) {
			if (allowedOrigins) {
				if (!origin) {
					return callback(null, true)
				}

				if (allowedOrigins.indexOf(origin) === -1) {
					console.log('origin: ' + origin)

					let msg = 'The CORS policy for this site does not allow access from the specified Origin.'
					return callback(new Error(msg), false)
				}
			}

			return callback(null, true)
		},
	}),
)

const modules = new Modules(app)

module.exports.app = app
module.exports.modules = modules
