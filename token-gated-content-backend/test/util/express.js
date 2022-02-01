'use strict'
const { app, modules } = require('../../cors')

const timeoutLength = 50

/**
 * Checks and wait for until the metaTx endpoints have been loaded in the app
 */
const waitForAppResponding = () => {
	return new Promise((resolve, reject) => {
		if ( modules.endpoints === undefined 
			|| modules.endpoints.registered === undefined 
		) {
			setTimeout(async () => {
				await waitForAppResponding()
				resolve('done')
			}, timeoutLength)
		} else {
			resolve('done')
		}
	})
}

/**
 * Waits until all application modules are up and running.
 */
async function waitForAPIready() {
	await waitForAppResponding()
}

module.exports.waitForAPIready = waitForAPIready
