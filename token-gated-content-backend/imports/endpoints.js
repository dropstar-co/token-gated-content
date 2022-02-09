'use strict'

const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('../swagger.json')
const { asyncFlatMap } = require('./async-flat-map')

const { ethers } = require('ethers')

const { getSignature, getToken } = require('./venly-api')
const { getERC1155At } = require('./web3')

const SIGNATURE_TIMESPAN = parseInt(process.env.SIGNATURE_TIMESPAN)

const sqlRow = {
	tokenAddress: '0x86d75abe8e4d078380e8d335edcd7c86c623b4fc',
	tokenId: '0',
	balanceRequired: '1',
	contentRoute: './content/photo-1453728013993-6d66e9c9123a.jpeg',
	contentName: '0x86d75abe8e4d078380e8d335edcd7c86c623b4fc_0',
}

const { Sequelize, DataTypes, Model } = require('sequelize')
const TokenGatedContentBuilder = require('../database/models/tokengatedcontent')

function extractFieldsFromData(data) {
	const split = data.split('\n')

	const date = split[0].split(': ')[1]
	const address = split[1].split(': ')[1]
	const tokenAddress = split[2].split(': ')[1]
	const tokenId = split[3].split(': ')[1]

	return { date, address, tokenAddress, tokenId }
}

function checkSignatureTimestampValid(dataObject) {
	const signatureTimestamp = parseInt(dataObject.date)
	const utcUnixTimestamp = Math.floor(new Date().getTime() / 1000)

	return signatureTimestamp + SIGNATURE_TIMESPAN >= utcUnixTimestamp
}

module.exports = class Endpoints {
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

		app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

		app.get(
			'/status',
			async function (_req, res) {
				safe(res, async () => {
					res.status(200).send({ status: 'ok', message: 'I am great!' })
				})
			}.bind(this),
		)
		app.get(
			'/bearertokenprovider',
			async function (_req, res) {
				safe(res, async () => {
					console.log('Called bearertokenprovider')
					const token = await getToken()

					console.log({ token })
					await res.status(200).send({ status: 'ok', token })
				})
			}.bind(this),
		)

		app.post(
			'/generatemessage',
			async function (_req, res) {
				safe(res, async () => {
					const { address, tokenAddress, tokenId } = _req.body

					await checkDefined(_req.body, 'address')
					await checkDefined(_req.body, 'tokenAddress')
					await checkDefined(_req.body, 'tokenId')

					const utcUnixTimestamp = Math.floor(new Date().getTime() / 1000)
					const data = `Date: ${utcUnixTimestamp}\nAddress: ${address}\ntokenAddress: ${tokenAddress}\ntokenId: ${tokenId}\nI am the owner of ${address} and I want to check the token gated content for tokenAddress ${tokenAddress} and tokenId ${tokenId}`

					const generatemessageFindAllResult = await this.TokenGatedContent.findAll({
						logging: false,
						where: { tokenAddress, tokenId },
					})
					if (generatemessageFindAllResult.length === 0) {
						const message = `No token gated content for ${tokenAddress}/${tokenId}`
						res.status(404).send({
							status: 'nok',
							message,
						})
					} else {
						res.status(200).send({ status: 'ok', data })
					}
				})
			}.bind(this),
		)

		app.post(
			'/generatesignature',
			async function (_req, res) {
				safe(res, async () => {
					const { data, walletId, address, pincode } = _req.body
					checkDefined(_req.body, 'walletId')
					checkDefined(_req.body, 'data')
					checkDefined(_req.body, 'address')
					checkDefined(_req.body, 'pincode')

					const signature = await getSignature(address, walletId, pincode, data)

					res.status(200).send({ message: 'ok', signature })
				})
			}.bind(this),
		)

		app.post(
			`/gatedcontent`,
			async function (_req, res) {
				safe(res, async () => {
					const { signature, data, address } = _req.body
					checkDefined(_req.body, 'signature')
					checkDefined(_req.body, 'data')
					checkDefined(_req.body, 'address')
					const recoveredAddress = ethers.utils.verifyMessage(data, signature)

					if (address !== recoveredAddress) {
						errorResponse(
							res,
							`Address specified and recovered do not match (${address} != ${recoveredAddress})`,
						)
						return
					}

					const dataObject = extractFieldsFromData(data)

					if (!checkSignatureTimestampValid(dataObject)) {
						const utcUnixTimestamp = Math.floor(new Date().getTime() / 1000)
						errorResponse(
							res,
							`Old timestamp ${dataObject.date} + ${SIGNATURE_TIMESPAN} < ${utcUnixTimestamp}`,
						)
						return
					}

					const { tokenAddress, tokenId } = dataObject
					const results = await this.TokenGatedContent.findAll({
						logging: false,
						where: { tokenAddress, tokenId },
					})

					if (results.length === 0) {
						errorResponse(res, `No gated content for ${tokenAddress}, ${tokenId}`)
						return
					}

					const erc1155 = getERC1155At(dataObject.tokenAddress)
					const balance = (
						await erc1155.balanceOf(address, parseInt(dataObject.tokenId))
					).toString()

					if (balance < sqlRow.balanceRequired) {
						errorResponse(
							res,
							`You do not have enought tokens to access this content (${balance}<${balanceRequired})`,
						)
						return
					}

					res.status(200).download(sqlRow.contentRoute, sqlRow.contentName)
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
