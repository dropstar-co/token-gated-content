'use strict'

require('dotenv').config()

const { Sequelize } = require('sequelize')

var sequelize

async function init() {
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		logging: process.env.logging ? true : false,
	})

	try {
		await sequelize.authenticate()
	} catch (error) {
		console.error('Unable to connect to the database:', error)
	}

	return sequelize
}

exports.init = init
