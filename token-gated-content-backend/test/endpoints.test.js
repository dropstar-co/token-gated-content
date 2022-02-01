require('dotenv').config()

const { app } = require('../cors')
const chai = require('chai')

const chaiHttp = require('chai-http')
chai.use(chaiHttp)
require('should')

const { waitForAPIready } = require('./util/express')

const {
	TEST_TIMEOUT,
	TEST_PINCODE,
	TEST_ADDRESS,
	TEST_WALLET_ID,
	TEST_ADDRESS_BAD,
	TEST_WALLET_ID_BAD,
	TEST_TOKEN_ADDRESS,
	TEST_TOKEN_ID,
} = process.env

const utcUnixTimestamp = Math.floor(new Date().getTime() / 1000)
const data = `Date: ${utcUnixTimestamp}:\nAddress: ${TEST_ADDRESS}\ntokenAddress: ${TEST_TOKEN_ADDRESS}\ntokenId: ${TEST_TOKEN_ID}\nI am the owner of ${TEST_ADDRESS} and I want to check the token gated content for tokenAddress ${TEST_TOKEN_ADDRESS} and tokenId ${TEST_TOKEN_ID}`
let signature = ''

async function prepareTestingEnvironment() {
	await waitForAPIready()
}

async function cleanTestingEnvironment() {}

describe('Check heatmap endpoint ', async function () {
	before(prepareTestingEnvironment)
	beforeEach(cleanTestingEnvironment)
	afterEach(cleanTestingEnvironment)
	after(cleanTestingEnvironment)

	it('should wait for api ready', async function () {
		this.timeout(TEST_TIMEOUT)
		await chai
			.request(app)
			.get('/status')
			.then(function (res) {
				res.status.should.be.equals(200)
			})
	})

	it('should generate a message to be signed', async function () {
		this.timeout(TEST_TIMEOUT)
		await chai
			.request(app)
			.post('/generatemessage')
			.send({ address: TEST_ADDRESS, tokenAddress: TEST_TOKEN_ADDRESS, tokenId: TEST_TOKEN_ID })
			.then(function (res) {
				res.status.should.be.equals(200)
			})
	})

	it('should get the signature from venly', async function () {
		this.timeout(TEST_TIMEOUT)

		await chai
			.request(app)
			.post('/generatesignature')
			.send({ address: TEST_ADDRESS, walletId: TEST_WALLET_ID, pincode: TEST_PINCODE, data })
			.then(async function (res) {
				res.status.should.be.equals(200)
				res.body.should.have.property('signature')
				res.body.signature.should.have.property('signature')
				signature = res.body.signature.signature
			})
	})

	it('should send the signed message and recover it properly', async function () {
		this.timeout(TEST_TIMEOUT)

		await chai
			.request(app)
			.post('/gatedcontent')
			.send({
				address: TEST_ADDRESS,
				walletId: TEST_WALLET_ID,
				pincode: TEST_PINCODE,
				data,
				signature,
			})
			.then(async function (res) {
				res.status.should.be.equals(200)
			})
	})

	it('should fail when address and recovered address from the signed message do not match', async function () {
		this.timeout(TEST_TIMEOUT)

		await chai
			.request(app)
			.post('/gatedcontent')
			.send({ address: TEST_ADDRESS_BAD, walletId: TEST_WALLET_ID_BAD, signature, data })
			.then(async function (res) {
				res.status.should.be.equals(400)
				res.body.status.should.be.equals('nok')
			})
	})
	/*
	 */
})
