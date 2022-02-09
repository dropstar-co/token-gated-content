import './App.css'
import { Button } from 'react-bootstrap'
import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers'

import {
	VENLY_WIDGET_CLIENT_ID,
	TOKEN_GATED_CONTENT_BACKEND_URL,
	VENLY_CHAIN,
	VENLY_ENVIRONMENT,
} from './config'

import { VenlyConnect } from '@venly/connect'
import { useParams } from 'react-router-dom'

const venlyConnect = new VenlyConnect(VENLY_WIDGET_CLIENT_ID, { environment: VENLY_ENVIRONMENT })

function TokenGatedContent() {
	const [data, setData] = useState('')
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [hasTokenGatedContent, setHasTokenGatedContent] = useState(false)
	const [venlyWallets, setVenlyWallets] = useState([])
	const params = useParams()

	const { tokenAddress, tokenId } = params

	const isAddress = ethers.utils.isAddress(tokenAddress)

	async function checkAuthenticated() {
		const result = await venlyConnect.checkAuthenticated()
		result.authenticated(async function (auth) {
			const wallets = await venlyConnect.api.getWallets({ secretType: VENLY_CHAIN })
			postAuth(auth, wallets)
			setIsAuthenticated(true)
			setVenlyWallets(wallets)
		})
	}

	function init() {
		checkAuthenticated()
	}

	async function connect(venlyConnect) {
		try {
			const account = await venlyConnect.flows.getAccount(VENLY_CHAIN)
			postAuth(account.auth, account.wallets)
			setVenlyWallets(account.wallets)
		} catch (error) {
			console.log(error)
		}
	}

	function postAuth(auth, wallets) {
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
			li.innerText = `${wallet.description} - ${wallet.address}`
			ul.appendChild(li)
		}
		const body = document.querySelector('body')
		body.appendChild(ul)
	}

	function updateData() {
		async function asyncFetchData() {
			if (venlyWallets.length === 0) return
			const body = JSON.stringify({ address: venlyWallets[0].address, tokenAddress, tokenId })
			const generateMessageURL = `${TOKEN_GATED_CONTENT_BACKEND_URL}/generatemessage`
			const headers = { 'Content-Type': 'application/json' }
			const response = await fetch(generateMessageURL, { method: 'POST', headers, body })
			const json = await response.json()
			console.log({ json })
			setHasTokenGatedContent(response.status === 200)
			setData(json.data)
		}
		asyncFetchData()
	}

	useEffect(init, [])
	useEffect(() => {
		if (isAuthenticated) updateData()
	}, [isAuthenticated, venlyWallets])

	return (
		<div>
			<div id="user">Log in to see your user name</div>
			<p>
				<Button id="connect" onClick={() => connect(venlyConnect)}>
					Connect Venly Wallet
				</Button>
			</p>
		</div>
	)
}

export default TokenGatedContent
