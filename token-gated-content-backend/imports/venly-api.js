'use strict'

const fetch = require('node-fetch')

const { VENLY_API_CLIENT_ID, VENLY_API_SECRET_ID, VENLY_API_APPLICATION_ID } = process.env

const URLSearchParams = require('@ungap/url-search-params')
const tokenURL =
	'https://login-staging.arkane.network/auth/realms/Arkane/protocol/openid-connect/token'
const walletsURL = 'https://api-staging.arkane.network/api/wallets'
const profileURL = 'https://api-staging.arkane.network/api/profile'
const signaturesURL = 'https://api-staging.arkane.network/api/signatures'

let token = undefined

async function getToken() {
	if (token) return

	const body = (
		await new URLSearchParams({
			grant_type: 'client_credentials',
			client_id: VENLY_API_CLIENT_ID,
			client_secret: VENLY_API_SECRET_ID,
			application_id: VENLY_API_APPLICATION_ID,
		})
	).toString()

	try {
		const response = await fetch(tokenURL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body,
		})
		token = await response.json()
	} catch (err) {
		console.log(err)
	}
}

async function getWallets(userId) {
	await getToken()
	try {
		const requestOptions = {
			method: 'get',
			redirect: 'follow',
			headers: { Authorization: 'Bearer ' + token.access_token },
		}

		const url = userId ? walletsURL + '?identifier=user_id=' + userId : walletsURL
		const response = await fetch(url, requestOptions)

		const json = await response.json()
		if (json.result.length === 0) await createWallet(userId)
	} catch (err) {
		console.log(err)
	}
}

async function getWallet(walletId) {
	await getToken()
	try {
		const requestOptions = {
			method: 'get',
			redirect: 'follow',
			headers: { Authorization: 'Bearer ' + token.access_token },
		}

		const url = walletsURL + '/' + walletId
		const response = await fetch(url, requestOptions)
		const json = await response.json()
		if (json.result.length === 0)
			throw 'Cannot retrieve specified wallet! (check <user,walletId>, environment, network, etc.)'
		return json.result
	} catch (err) {
		console.log(err)
	}
}

async function createWallet(pincode, userId) {
	await getToken()
	try {
		const body = {
			pincode,
			description: 'My first unrecoverable wallet',
			identifier: 'type=unrecoverable',
			secretType: 'ETHEREUM',
			walletType: 'WHITE_LABEL',
		}

		const requestOptions = {
			method: 'post',
			redirect: 'follow',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + token.access_token,
			},
			body: JSON.stringify(body),
		}

		const url = userId ? walletsURL + '?identifier=user_id=' + userId : walletsURL
		const response = await fetch(url, requestOptions)
		const json = await response.json()

		return json.result
	} catch (err) {
		console.log(err)
	}
}

async function getProfile() {
	await getToken()

	const body = (
		await new URLSearchParams({
			grant_type: 'client_credentials',
			client_id: VENLY_API_CLIENT_ID,
			client_secret: VENLY_API_SECRET_ID,
			application_id: VENLY_API_APPLICATION_ID,
		})
	).toString()

	try {
		const requestOptions = {
			method: 'GET',
			redirect: 'follow',
			headers: { Authorization: 'Bearer ' + token.access_token },
		}
		const response = await fetch(profileURL, requestOptions)
		const { status } = response
		if (status !== 200) {
			console.log(status)
			console.log(response)
		}
		const json = await response.json()
		return json.result
	} catch (err) {
		console.log(err)
	}
}

async function sign(walletId, data, pincode) {
	await getToken()

	try {
		const body = {
			pincode,
			signatureRequest: {
				type: 'MESSAGE',
				secretType: 'ETHEREUM',
				walletId,
				data,
			},
		}

		const requestOptions = {
			method: 'post',
			redirect: 'follow',
			headers: {
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + token.access_token,
			},
			body: JSON.stringify(body),
		}

		const url = signaturesURL
		const response = await fetch(url, requestOptions)
		if (response.status !== 200) throw 'Cannot sign, venly endpoint status: ' + response.status
		const json = await response.json()
		return json.result
	} catch (err) {
		console.log(err)
	}
}

async function getSignature(address, walletId, pincode, data) {
	await getToken()
	const walletDetails = await getWallet(walletId)
	if (walletDetails.address !== address)
		throw `Retrieved address do not match ${walletDetails.address} != ${address}`

	return await sign(walletId, data, pincode)
}

module.exports = { getWallet, createWallet, getToken, getSignature, sign }
