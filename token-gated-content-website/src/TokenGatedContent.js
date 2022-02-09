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
	const [venlyWallets, setVenlyWallets] = useState([])
	const [venlyAuth, setVenlyAuth] = useState({})
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
			let generateMessageResponse
			{
				const body = JSON.stringify({ address: venlyWallets[0].address, tokenAddress, tokenId })
				const url = `${TOKEN_GATED_CONTENT_BACKEND_URL}/generatemessage`
				const headers = { 'Content-Type': 'application/json' }
				generateMessageResponse = await fetch(url, { method: 'POST', headers, body })
			}

			if (generateMessageResponse.status === 200) console.log('Request ok')
			else if (generateMessageResponse.status === 400) console.log('Bad request')
			else if (generateMessageResponse.status === 404) console.log('No token gated content here')
			else console.log(`other error ${generateMessageResponse.status}`)

			if (generateMessageResponse.status !== 200) return

			const json = await generateMessageResponse.json()

			const { data } = json
			setData(data)
			const walletId = venlyWallets[0].id
			const { secretType } = venlyWallets[0]

			const resultSignMessage = await venlyConnect.createSigner().signMessage({
				walletId,
				secretType,
				data,
			})

			console.log(JSON.stringify({ resultSignMessage }, null, 2))

			if (resultSignMessage.status !== 'SUCCESS') return

			const { signature } = resultSignMessage.result

			console.log('setting signature')
			console.log(signature)

			let gatedcontentResponse
			{
				const body = JSON.stringify({ address: venlyWallets[0].address, signature, data })
				const url = `${TOKEN_GATED_CONTENT_BACKEND_URL}/gatedcontent`
				const headers = { 'Content-Type': 'application/json' }
				gatedcontentResponse = await fetch(url, { method: 'POST', headers, body })
				console.log({ gatedcontentResponse })
			}

			if (gatedcontentResponse.status === 200) console.log('Content is being served')
			else if (gatedcontentResponse.status === 403) console.log('You have not enough tokens')
			else console.log(`Other error happened ${gatedcontentResponse.status}`)

			const imageBlob = await gatedcontentResponse.blob()
			/*
			const reader = new FileReader()
			reader.readAsDataURL(imageBlob)
			reader.onloadend = () => {
				const base64data = reader.result
				console.log(base64data)
			}
			*/

			const imageDisplay = document.querySelector('#content')
			imageDisplay.src = URL.createObjectURL(imageBlob)
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
			<div id="data">{data}</div>
			<img
				id="content"
				src="https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg"
			/>
		</div>
	)
}

export default TokenGatedContent
