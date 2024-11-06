async function preencherProcPosErro() {

	const runScripts = await getValueFromStorage('runScripts');
	if (!runScripts) return;

	let curUnvalidatedProc = await getValueFromStorage('curUnvalidatedProc');
	// console.log('pos erro: ', curUnvalidatedProc)
	chrome.storage.local.set({ 'errorProc': curUnvalidatedProc })
	chrome.storage.local.set({ 'runScripts': false })
}

async function getValueFromStorage(key) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(key, (res) => {
			resolve(res[key]);
		})
	})
}

preencherProcPosErro()
