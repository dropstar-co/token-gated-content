'use strict'

const fs = require('fs')
require('dotenv')

const { ethers } = require('ethers')
const { ALCHEMY_HTTPS, CHAIN_ID } = process.env

let provider = new ethers.providers.JsonRpcProvider(ALCHEMY_HTTPS)

// The provider also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, we need the account signer...
//const signer = provider.getSigner()

function getContractAt(contractAddress, contractAbi) {
	const contract = new ethers.Contract(contractAddress, contractAbi, provider)
	return contract
}

function getERC1155At(contractAddress) {
	let rawdata = fs.readFileSync(
		'./abi/@openzeppelin/contracts/token/ERC1155/ERC1155.sol/ERC1155.json',
	)
	let abi = JSON.parse(rawdata)
	const contract = getContractAt(contractAddress, abi)
	return contract
}

module.exports = { provider, getContractAt, getERC1155At }
