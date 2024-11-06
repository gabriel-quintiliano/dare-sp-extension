async function goToPrintingPage() {
	const loadedSelectors = await aguardarCarregamento({ seletores: ["#bt_salvar_custas"], timeoutInMs: 3000});
	
	if (loadedSelectors.length) {
		document.querySelector("#bt_salvar_custas").click()
  	}
}

async function aguardarCarregamento({ seletores = [], every = true, checkIntervalMs = 500, timeoutInMs = 10000 } = {}) {

	return new Promise((resolve, reject) => {
		const timeoutId = setTimeout(() => {
			resolve([]);
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

goToPrintingPage();
