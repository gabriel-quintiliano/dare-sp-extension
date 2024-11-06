async function preencherProcesso() {

	const runScripts = await getValueFromStorage('runScripts');
	if (!runScripts) return;

	const loadedSelectors = await aguardarCarregamento({ seletores: ["#numeroDigitoAnoUnificado", "#botaoConsultarProcessos"], timeoutInMs: 3000 });
	if (!loadedSelectors.length) return

	const curUnvalidatedIndex = await getValueFromStorage('curUnvalidatedIndex');
	const unvalidatedProcs = await getValueFromStorage('unvalidatedProcs');

	if (curUnvalidatedIndex >= unvalidatedProcs.length) return

	const curUnvalidatedProc = await getValueFromStorage('curUnvalidatedProc');

	const procFirstPartInput = document.querySelector("#numeroDigitoAnoUnificado")
	const procLastPartInput = document.querySelector("#foroNumeroUnificado")

	procFirstPartInput.value = curUnvalidatedProc.slice(0, 15)
	procLastPartInput.value = curUnvalidatedProc.slice(-4)

	document.querySelector("#botaoConsultarProcessos").click()
}

async function getValueFromStorage(key) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(key, (res) => {
			resolve(res[key]);
		})
	})
}

async function advanceCurUnvalidatedProc() {

	const curUnvalidatedIndex = await getValueFromStorage('curUnvalidatedIndex');
	const unvalidatedProcs = await getValueFromStorage('unvalidatedProcs');

	const newIndex = curUnvalidatedIndex + 1;

	//DEBUGGING

	chrome.storage.local.set(
		{ 'curUnvalidatedIndex': newIndex, 'curUnvalidatedProc': unvalidatedProcs[newIndex] })

	return new Promise((resolve, reject) => { resolve() })

}

async function aguardarCarregamento({ seletores = [], every = true, checkIntervalMs = 500, timeoutInMs = 10000 } = {}) {

	return new Promise((resolve, reject) => {
		const timeoutId = setTimeout(() => {
			reject(new Error("Timeout atingido"));

		}, timeoutInMs);

		const intervalId = setInterval(() => {
			let returnNow = false;

			if (every) {
				if (seletores.every(seletor => document.querySelector(seletor))) {
					clearTimeout(timeoutId);
					clearInterval(intervalId);
					resolve(seletores);
				}
			} else {
				const seletorEncontrado = seletores.find((seletor) => document.querySelector(seletor))
				clearTimeout(timeoutId);
				clearInterval(intervalId);
				resolve([seletorEncontrado]);
			}
		}, checkIntervalMs)
	})
}

preencherProcesso()

