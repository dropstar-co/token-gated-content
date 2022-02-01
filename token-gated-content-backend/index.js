require('dotenv').config()

const PORT = process.env.PORT

const { app } = require('./cors')

const server = app.listen(PORT, () => {
	console.log('Listening on port ' + PORT)
})

module.exports = server
