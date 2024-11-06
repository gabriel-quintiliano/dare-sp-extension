const seletorPagImpressao = {
	elemExclusivo: "#form_boleto_custas > table.relatorio > tbody > tr > td:nth-child(5) > a"
}

async function imprimirGuia() {
	await aguardarCarregamento({ seletores: [seletorPagImpressao.elemExclusivo] });

	document.querySelector(seletorPagImpressao.elemExclusivo).click()
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

imprimirGuia()
