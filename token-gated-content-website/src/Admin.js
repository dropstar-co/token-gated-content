import './App.css'
import { Button } from 'react-bootstrap'
import React, { useState, useEffect, useMemo } from 'react'

import { TOKEN_GATED_CONTENT_BACKEND_URL } from './config'
import TokenGatedContentTable from './components/TokenGatedContentTable'

function Admin() {
	const [tokenGatedContents, setTokenGatedContents] = useState([])

	console.log({ tokenGatedContents })

	function deleteRow(id) {
		console.log({ deleteRowId: id })
	}

	useEffect(() => {
		async function init() {
			const url = TOKEN_GATED_CONTENT_BACKEND_URL + '/tokengatedcontents/read'

			const tokenGatedContentsRead = await fetch(url)
			const tokenGatedContentsNew = await tokenGatedContentsRead.json()
			console.log({ tokenGatedContentsNew })

			setTokenGatedContents(tokenGatedContentsNew)
		}
		init()
	}, [])

	const columns = useMemo(
		() => [
			{
				Header: 'Token address',
				accessor: 'tokenAddress',
			},
			{
				Header: 'Token id',
				accessor: 'tokenId',
			},
			{
				Header: 'Balance required',
				accessor: 'balanceRequired',
			},
			{
				Header: 'Content route',
				accessor: 'contentRoute',
			},
			{
				Header: 'Content name',
				accessor: 'contentName',
			},
			{
				Header: 'Delete row',
				accessor: 'id',
				Cell: ({ cell }) => {
					return (
						<button value={cell.row.id} onClick={() => deleteRow(cell.row.id)}>
							Delete
						</button>
					)
				},
			},
		],
		[],
	)

	const data = useMemo(() => tokenGatedContents, [tokenGatedContents])

	return (
		<div>
			<h1> Admin page</h1>
			<TokenGatedContentTable columns={columns} data={data} />
		</div>
	)
}

export default Admin
