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

	console.log(`${tokenAddress} / ${tokenId} --> ${isAddress}`)

	async function checkAuthenticated() {
		const result = await venlyConnect.checkAuthenticated()
		result.authenticated(async function (auth) {
			const wallets = await venlyConnect.api.getWallets({ secretType: VENLY_CHAIN })
			postAuth(auth, wallets)
			setIsAuthenticated(true)
			setVenlyWallets(wallets)
			console.log({ wallets, auth })
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
		//console.log(auth.token)
		//console.log({ wallets })
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
		console.log('auth.idTokenParsed.nickname')
		console.log({ auth })
		console.log(auth.idTokenParsed.nickname)
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

	function updateData() {
		async function asyncFetchData() {
			const response = await fetch(`${TOKEN_GATED_CONTENT_BACKEND_URL}/generatemessage`, {
				method: 'POST',
				body: JSON.stringify({ address: '', tokenAddress, tokenId }),
			})
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
	}, [isAuthenticated])

	return (
		<div>
			<div id="user">Log in to see your user name</div>
			{!isAuthenticated ? (
				<p>
					<Button id="connect" onClick={() => connect(venlyConnect)}>
						Do magic
					</Button>
				</p>
			) : (
				''
			)}

			{hasTokenGatedContent ? (
				<h1>TokenGatedContent</h1>
			) : (
				<h1>404 no token gated content for this token</h1>
			)}

			<p>{JSON.stringify(data, null, 2)}</p>
			<p>{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>
		</div>
	)
}

export default TokenGatedContent
