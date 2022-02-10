'use strict'

const fs = require('fs')
const fetch = require('node-fetch')
const FormData = require('form-data')

const { Sequelize, DataTypes, Model, Op } = require('sequelize')
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
			'/tokengatedcontents/read',
			async function (req, res) {
				safe(res, async () => {
					const result = await this.TokenGatedContent.findAll({ logging: false })

					res.status(200).send(result)
				})
			}.bind(this),
		)

		app.post(
			'/tokengatedcontent/create',
			async function (req, res) {
				safe(res, async () => {
					checkDefined(req.body, 'tokenAddress')
					checkDefined(req.body, 'tokenId')
					checkDefined(req.body, 'balanceRequired')
					checkDefined(req.body, 'contentRoute')
					checkDefined(req.body, 'contentName')

					const createdInstance = (await this.TokenGatedContent.create(req.body)).dataValues
					res.status(200).send({ status: 'ok', createdInstance })
				})
			}.bind(this),
		)

		app.get(
			'/tokengatedcontent/read',
			async function (req, res) {
				safe(res, async () => {
					checkDefined(req.query, 'tokenAddress')
					checkDefined(req.query, 'tokenId')
					const { tokenAddress, tokenId } = req.query

					const result = await this.TokenGatedContent.findAll({
						where: { tokenAddress, tokenId },
					})

					res.status(200).send(result)
				})
			}.bind(this),
		)

		app.delete(
			'/tokengatedcontent/deletetest',
			async function (req, res) {
				safe(res, async () => {
					const deletetestResult = await this.TokenGatedContent.destroy({
						where: {
							tokenAddress: {
								[Op.like]: 'test',
							},
						},
					})
					res.status(200).send({ deletetestResult })
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
