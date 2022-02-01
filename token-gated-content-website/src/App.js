import logo from './logo.svg'
import './App.css'
import { Button } from 'react-bootstrap'
import React, { useState, useEffect } from 'react'

import fetch from 'node-fetch'

async function signAndSend() {
	console.log('AAA')
}

function App() {
	const [count, setCount] = useState(0)

	useEffect(() => {
		// Update the document title using the browser API
		document.title = `You clicked ${count} times`
	})

	return (
		<div>
			<p>You clicked {count} times</p>
			<button onClick={() => setCount(count + 1)}>Click me</button>
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
