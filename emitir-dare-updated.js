async function emitirDares() {

	const runScripts = await getValueFromStorage('runScripts');
	if (!runScripts) return;
	console.log("passou de runScripts")

	const loadedSelectors = await aguardarCarregamento({ seletores: ["#bt_add_servico"], timeoutInMs: 3000 });
	if (!loadedSelectors.length) return
	console.log("passou de loadedSelectors")

	const curValidatedIndex = await getValueFromStorage('curValidatedIndex');
	const validatedProcs = await getValueFromStorage('validatedProcs');

	if (curValidatedIndex >= validatedProcs.length) {
		chrome.storage.local.clear();
		return
	}
	console.log("passou de curValidatedProc")

	const curValidatedProc = await getValueFromStorage('curValidatedProc');
	console.log('validatedProcs: ', validatedProcs)
	console.log('curValidatedProc: ', curValidatedProc)
	console.log('curValidatedIndex: ', curValidatedIndex)
	console.log('validatedProcs[curValidatedIndex].id: ', validatedProcs[curValidatedIndex].id)
	const taxpayerDoc = await getValueFromStorage('taxpayerDoc');
	await pesquisarCpfOuCnpj(taxpayerDoc);
	await pesquisarProcesso(validatedProcs[curValidatedIndex].id);
	await preencherValorCausa(validatedProcs[curValidatedIndex].caseValue);

	await advanceCurValidatedProc();
}

async function getValueFromStorage(key) {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(key, (res) => {
			resolve(res[key]);
		})
	})
}


async function advanceCurValidatedProc() {

	const curValidatedIndex = await getValueFromStorage('curValidatedIndex');
	const validatedProcs = await getValueFromStorage('validatedProcs');

	const newIndex = curValidatedIndex + 1;

	//DEBUGGING
	// console.log('curValidatedIndex após atualização: ', curValidatedIndex)
	// console.log('validatedProcs: ', validatedProcs)
	// console.log('curValidatedProc: ', validatedProcs[curValidatedIndex])

	chrome.storage.local.set({ 'curValidatedIndex': newIndex, 'curValidatedProc': validatedProcs[newIndex] })

	return new Promise((resolve, reject) => { resolve() })
}


async function pesquisarCpfOuCnpj(cpfOuCnpj) {

	const docInput = document.querySelector("#contribuinte_cpfCnpj");
	const telInput = document.querySelector("#telefone");
	const endInput = document.querySelector("#endereco");

	docInput.value = cpfOuCnpj;
	// click no botão para validar cpf ou cnpj
	document.querySelector("#contribuinte_cpfCnpj_button").click()

	telInput.value = '(00) 00000-0000';
	endInput.value = 'ARARAS';


	return new Promise((resolve, reject) => {
		const servType = document.querySelector("#tipoServicos_chosen > a > span");
		const intervalId = setInterval(() => {
			try {
				console.log('pesquisarCpfOuCnpj');
				if (servType.innerText.toLowerCase() === 'satisfação da execução - 230-6') {
					clearInterval(intervalId);
					// click no botão 'avançar'
					document.querySelector("#bt_add_servico").click()
					resolve(true)
				}
			} catch (e) {
				console.log(e);
				clearInterval(intervalId);
			}
		}, 500);
	})
}

async function pesquisarProcesso(processo) {
	await aguardarCarregamento({ seletores: ["#txt_numeroProcesso"] });

	return new Promise((resolve, reject) => {
		const intervalId = setInterval(() => {
			console.log('pesquisarProcesso');
			const procInput = document.querySelector("#txt_numeroProcesso");
			if (procInput) {
				clearInterval(intervalId);
				procInput.value = processo;
				// click no botão 'buscar' (o processo)
				document.querySelector("#bt_validar_processo").click()
				resolve(true)
			}
		}, 500);
	})
}

async function preencherValorCausa(valorCausa) {

	await aguardarCarregamento({ seletores: ["#valorReceita", "#valorReceita"] });

	return new Promise((resolve, reject) => {

		const valorCausaInput = document.querySelector("#valorCausa");
		const valorReceitaInput = document.querySelector("#valorReceita");
		valorCausaInput.value = valorCausa;

		if (Number(valorCausa.replace(',','.').replace('.','')) < 17300) {
			valorReceitaInput.value = '171,30';
		}

		// click no botão 'adicionar' (o processo)
		// document.querySelector("#bt_salvar_servico").click()
		resolve(true)
	})
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

emitirDares();
