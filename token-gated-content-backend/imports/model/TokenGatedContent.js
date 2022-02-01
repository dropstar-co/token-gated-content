'use strict'

const fs = require('fs')
const fetch = require('node-fetch')
const FormData = require('form-data')

const { Sequelize, DataTypes, Model } = require('sequelize')
const TokenGatedContentBuilder = require('../../database/models/tokengatedcontent')

module.exports = class TokenGatedContent {
	constructor(app, sequelize) {
		this.app = app
		this.TokenGatedContent = TokenGatedContentBuilder(sequelize, DataTypes)
		this.registerAPI()
	}

	registerAPI() {
		const { app } = this
		const safe = this.safe.bind(this)
		const checkDefined = this.checkDefined.bind(this)
		const errorResponse = this.errorResponse.bind(this)

		app.get(
			'/tokengatedcontents',
			async function (req, res) {
				safe(res, async () => {
					const result = await this.TokenGatedContent.findAll({ logging: false })

					res.status(200).send(result)
				})
			}.bind(this),
		)

		app.get(
			'/tokengatedcontent',
			async function (req, res) {
				safe(res, async () => {
					checkDefined(req.query, 'tokenAddress')
					checkDefined(req.query, 'tokenId')
					const { tokenAddress, tokenId } = req.query

					const result = await this.TokenGatedContent.findAll({
						where: { tokenAddress, tokenId },
						logging: false,
					})

					res.status(200).send(result)
				})
			}.bind(this),
		)

		this.registered = true
	}

	async safe(res, fn) {
		try {
			await fn.apply(this, arguments)
		} catch (err) {
			console.log(err)
			res.status(400).send({ status: 'nok', message: `Invalid API format: ${err}` })
		}
	}

	checkDefined(json, field) {
		if (json[field] == undefined) throw `'${field}' field is not defined`
	}

	async errorResponse(res, message) {
		res.status(400).send({ status: 'nok', message })
	}
}
