import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import './index.css'
import App from './App'
import TokenGatedContent from './TokenGatedContent'
import Admin from './Admin'

import reportWebVitals from './reportWebVitals'

ReactDOM.render(
	<React.StrictMode>
		<Router>
			<Routes>
				<Route path="/" element={<App />} />
				<Route path="tokengatedcontent/:tokenAddress/:tokenId" element={<TokenGatedContent />} />
				<Route path="admin/" element={<Admin />} />
			</Routes>
		</Router>
	</React.StrictMode>,
	document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
