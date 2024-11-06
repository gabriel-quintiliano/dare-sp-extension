async function obterValorCustas() {

	const runScripts = await getValueFromStorage('runScripts');
	if (!runScripts) return;

	const loadedSelectors = await aguardarCarregamento({
		seletores: ["body > div.unj-entity-header > div.unj-entity-header__details__barra > div > div.unj-ta-r > a > span.unj-link-collapse__show"], timeoutInMs: 3000
	});
	if (!loadedSelectors.length) return

	// clique no mais para expandir as infos do processo e pegar o valor das custas
	document.querySelector("body > div.unj-entity-header > div.unj-entity-header__details__barra > div > div.unj-ta-r > a > span.unj-link-collapse__show").click();

	// pega o valor da causa e remove o 'R$ ' do começo
	const valorCausa = document.querySelector("#valorAcaoProcesso").innerText.slice(3);
	const curUnvalidatedProc = await getValueFromStorage('curUnvalidatedProc');

	// [] | undefined
	const validatedProcs = await getValueFromStorage('validatedProcs');

	validatedProcs.push({ id: curUnvalidatedProc, caseValue: valorCausa });

	chrome.storage.local.set({ 'validatedProcs': validatedProcs });


	await advanceCurUnvalidatedProc();

	// clique para voltar para a página anterior
	// document.querySelector("body > div.unj-entity-header > div.unj-entity-header__actions__barra > div > div > div.col-3.col-md-4 > a").click()
	// esse código acima estava dando problema
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

obterValorCustas()
