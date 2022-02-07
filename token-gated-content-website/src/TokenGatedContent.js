import './App.css'
import { Button } from 'react-bootstrap'
import React, { useState, useEffect } from 'react'

import {
	VENLY_WIDGET_CLIENT_ID,
	TOKEN_GATED_CONTENT_BACKEND_URL,
	VENLY_CHAIN,
	VENLY_ENVIRONMENT,
} from './config'

import { VenlyConnect } from '@venly/connect'
import { useParams } from 'react-router-dom'

const venlyConnect = new VenlyConnect(VENLY_WIDGET_CLIENT_ID, { environment: VENLY_ENVIRONMENT })

async function connect(venlyConnect) {
	try {
		const account = await venlyConnect.flows.getAccount(VENLY_CHAIN)
		console.log(account)
		postAuth(account.auth, account.wallets)
	} catch (error) {
		console.log(error)
	}
}

function postAuth(auth, wallets) {
	console.log(auth.token)
	hideLoginButton()
	showUsername(auth)
	showWallets(wallets)
}

function hideLoginButton() {
	const button = document.querySelector('#connect')
	button.value = 'Already connected'
	button.disabled = true
}

function showUsername(auth) {
	const userName = document.querySelector('#user')
	userName.textContent = auth.idTokenParsed.nickname
}

function showWallets(wallets) {
	const ul = document.createElement('ul')
	for (const wallet of wallets) {
		const li = document.createElement('li')
		li.innerText = `${wallet.description} - ${wallet.address} `
		ul.appendChild(li)
	}
	const body = document.querySelector('body')
	body.appendChild(ul)
}

function TokenGatedContent() {
	const [data, setData] = useState('')
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const params = useParams()

	console.log({ params })

	async function checkAuthenticated() {
		const result = await venlyConnect.checkAuthenticated()
		result.authenticated(async function (auth) {
			const wallets = await venlyConnect.api.getWallets({ secretType: VENLY_CHAIN })
			postAuth(auth, wallets)
			setIsAuthenticated(true)
		})
	}

	async function loadNFTs() {
		const result = await fetch(TOKEN_GATED_CONTENT_BACKEND_URL + '/nonfungibles')
	}

	function init() {
		checkAuthenticated()
	}

	function updateData() {
		async function asyncFetchData() {
			const response = await fetch(`${TOKEN_GATED_CONTENT_BACKEND_URL}/status`)
			const json = await response.json()
			console.log({ json })
			setData(json.data)
		}
		asyncFetchData()
	}

	useEffect(init, [])
	useEffect(() => loadNFTs(), [isAuthenticated])

	return (
		<div>
			<h1>OTRA PAGINA!!</h1>

			<p>
				<Button id="connect" onClick={() => connect(venlyConnect)}>
					Do magic
				</Button>
			</p>
			<p>{JSON.stringify(data, null, 2)}</p>
			<p>{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>
		</div>
	)
}

export default TokenGatedContent
