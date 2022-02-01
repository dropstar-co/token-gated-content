'use strict'

require('dotenv').config()

const Endpoints = require('./imports/endpoints')
const Database = require('./imports/database')
const TokenGatedContent = require('./imports/model/TokenGatedContent')

class Modules {
	constructor(app) {
		this.app = app
		this.init()
	}

	async init() {
		await this.initDB()

		await this.registerAPI()

		if (process.env.POPULATE) {
			console.log('### Populating db ###')
			const populate = require('./imports/populate')
			await populate.populate(this.sequelize, 10000, 11)
			await populate.populate(this.sequelize, 5000, 8)
			await populate.populate(this.sequelize, 1000, 5)
			console.log('### Finised populating db ###')
		}
	}

	async registerAPI() {
		this.endpoints = new Endpoints(this.app, this.sequelize)
		this.tokenGatedContent = new TokenGatedContent(this.app, this.sequelize)

		this.reegistered = true
	}

	async initDB() {
		this.sequelize = await Database.init()
	}
}

module.exports = Modules
