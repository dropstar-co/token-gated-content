'use strict'

import logo from './logo.svg'
import './App.css'
import { Button } from 'react-bootstrap'
import React, { useState, useEffect } from 'react'

import { VenlyConnect } from '@venly/connect'

import { VENLY_API_CLIENT_ID, TOKEN_GATED_CONTENT_BACKEND_URL } from './config'

async function signAndSend() {
	console.log('AAA')
}

function App() {
	const [count, setCount] = useState(0)
	const [data, setDate] = useState('')
	const [profile, setProfile] = useState({})

	function init() {}

	function updateCounter() {
		// Update the document title using the browser API
		document.title = `You clicked ${count} times`
	}

	async function updateData() {
		const response = await fetch(`${TOKEN_GATED_CONTENT_BACKEND_URL}/status`)
		const json = await response.json()
		console.log({ json })
	}

	useEffect(init, [])
	useEffect(updateCounter, [count])
	useEffect(updateData, [count])

	return (
		<div>
			<p>You clicked {count} times</p>
			<p>
				<button onClick={() => setCount(count + 1)}>Click me</button>
			</p>

			<p>
				<button
					onClick={async () => {
						const venlyConnect = new VenlyConnect('Testaccount-capsule', {
							environment: 'production',
							bearerTokenProvider: async () => {
								const resultBearerTokenProvider = await fetch(
									`${TOKEN_GATED_CONTENT_BACKEND_URL}/bearertokenprovider`,
								)
								const json = await resultBearerTokenProvider.json()
								const { access_token } = json.token
								console.log({ access_token })
								return json.access_token
							},
						})

						console.log({ venlyConnect })
						const profile = await venlyConnect.api.getProfile()

						console.log(profile)
						console.log({ profile })

						setProfile(profile)
					}}>
					venlyConnect.api.getProfile()
				</button>
			</p>

			<p>data</p>
			<p>{data}</p>
		</div>
	)

	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<p>
					Edit <code>src/App.js</code> and save to reload.
				</p>

				<p>
					<Button variant="danger" onClick={signAndSend}>
						Danger
					</Button>{' '}
					<Button variant="info">Info</Button>{' '}
				</p>
				<a
					className="App-link"
					href="https://reactjs.org"
					target="_blank"
					rel="noopener noreferrer">
					Learn React
				</a>
			</header>
		</div>
	)
}

export default App
