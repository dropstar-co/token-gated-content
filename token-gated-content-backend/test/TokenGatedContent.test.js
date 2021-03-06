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

async function cleanTestingEnvironment() {
	await chai.request(app).delete('/tokengatedcontent/delete')
}

describe('Check endpoints of TokenGatedContent', async function () {
	before(prepareTestingEnvironment)
	beforeEach(cleanTestingEnvironment)
	afterEach(cleanTestingEnvironment)
	after(cleanTestingEnvironment)

	it('should have a method for getting all token gated content links', async function () {
		this.timeout(TEST_TIMEOUT)
		await chai
			.request(app)
			.get('/tokengatedcontents/read')
			.then(function (res) {
				res.status.should.be.equals(200)
			})
	})

	it('should have a method for getting one token gated content link', async function () {
		this.timeout(TEST_TIMEOUT)
		await chai
			.request(app)
			.get('/tokengatedcontent/read')
			.query({ tokenAddress: 'A', tokenId: '0' })
			.then(function (res) {
				res.status.should.be.equals(200)
				res.body.length.should.be.equals(0)
			})
	})

	it('should have a method for creating token gated content link', async function () {
		this.timeout(TEST_TIMEOUT)
		await chai
			.request(app)
			.post('/tokengatedcontent/create')
			.send({
				tokenAddress: 'test',
				tokenId: 'test',
				balanceRequired: 'test',
				contentRoute: 'test',
				contentName: 'test',
			})
			.then(function (res) {
				res.status.should.be.equals(200)

				res.body.status.should.equal('ok')
				res.body.createdInstance.should.have.property('tokenAddress')
				res.body.createdInstance.should.have.property('tokenId')
				res.body.createdInstance.should.have.property('balanceRequired')
				res.body.createdInstance.should.have.property('contentRoute')
				res.body.createdInstance.should.have.property('contentName')
			})
	})

	it('should have a method for getting one token gated content link with an existing instance', async function () {
		this.timeout(TEST_TIMEOUT)
		await chai
			.request(app)
			.get('/tokengatedcontent/read')
			.query({ tokenAddress: TEST_TOKEN_ADDRESS, tokenId: TEST_TOKEN_ID })
			.then(function (res) {
				res.status.should.be.equals(200)
				res.body.length.should.be.equals(1)
			})
	})

	it('cleans testing instances', async function () {
		this.timeout(TEST_TIMEOUT)
		await chai
			.request(app)
			.delete('/tokengatedcontent/deletetest')
			.then(function (res) {
				res.status.should.be.equals(200)
				const { body } = res
			})
	})
})
