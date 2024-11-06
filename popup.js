const warning = document.getElementById('warning');
const warningProcReference = document.getElementById('warning-proc-reference');
const procRefSpan = document.getElementById('processo-incorreto');

chrome.storage.local.get(['errorProc', 'unvalidatedProcs', 'taxpayerDoc'], (res) => {

	if (!Object.entries(res)) {
		addProcInputHandler();
		return
	}

	if (res.errorProc) {
		warning.classList.remove('hide')
		warningProcReference.classList.remove('hide');
		procRefSpan.innerText = res.errorProc;
	}

	if (res.taxpayerDoc) {
		const taxpayerDoc = document.getElementById('taxpayerDoc');
		taxpayerDoc.value = res.taxpayerDoc;
	}

	if (res.unvalidatedProcs) {
		for (const processo of res.unvalidatedProcs) {
			addProcInputHandler({ proc: processo });
		}
	} else {
		addProcInputHandler()
	}


})

const status = document.getElementById('status');
chrome.storage.local.get(['runScripts'],
	(res) => {
		status.innerText = res.runScripts;
	})

document.getElementById('activateBtn').addEventListener('click', () => {
	chrome.storage.local.set({ 'runScripts': true }, () => {
		status.innerText = 'Activated';
	});
});

document.getElementById('deactivateBtn').addEventListener('click', () => {
	chrome.storage.local.set({ 'runScripts': false }, () => {
		status.innerText = 'Deactivated';
	});
});

document.getElementById('clearBtn').addEventListener('click', () => {
	chrome.storage.local.clear();
});

const inputs = Array.from(document.querySelectorAll('input'));
let isTaxpayerDocValid = false;
let areProcsValid = false;

const emitirDaresBtn = document.getElementById('emitirDaresBtn');
emitirDaresBtn.addEventListener('click', () => {

	if (!(isTaxpayerDocValid && areProcsValid)) {
		warning.classList.remove('hide');
		return
	}

	const taxpayerDocValue = document.getElementById('taxpayerDoc').value;
	const procIdInputsArr = Array.from(document.getElementsByClassName('procId'));
	const procIdValues = procIdInputsArr.map(input => input.value)
	chrome.storage.local.set({
		'runScripts': true,
		'taxpayerDoc': taxpayerDocValue,
		'unvalidatedProcs': procIdValues.slice(),
		'curUnvalidatedIndex': 0,
		'curValidatedIndex': 0,
		'curUnvalidatedProc': procIdValues[0],
		'curValidatedProc': null,
		'validatedProcs': []
	})

	chrome.tabs.create({
		url: 'https://esaj.tjsp.jus.br/cpopg/open.do'
	})
})

// Add a global event listener to the document
document.addEventListener('keydown', function (event) {
	// Check if the pressed key is 'Enter' (key code 13)
	if (event.key === 'Enter') {
		// Prevent the default behavior of the 'Enter' key (form submission)
		// event.preventDefault();

		// Find the currently focused input
		const focusedInput = document.activeElement;

		// Find the index of the focused input in the NodeList
		const currentIndex = Array.from(inputs).indexOf(focusedInput);

		// Calculate the index of the next input (circular, so it wraps around)
		const nextIndex = (currentIndex + 1) % inputs.length;

		// Set focus to the next input
		inputs[nextIndex].focus();
	}
})

const taxpayerDoc = document.getElementById('taxpayerDoc');
taxpayerDoc.addEventListener('focusout', (e) => {
	let inpValue = e.target.value;

	if (inpValue.includes('.')) {
		inpValue = inpValue.replace(/[.\-/]/g, '');
		e.target.value = inpValue;
		isTaxpayerDocValid = false;
	}

	if (inpValue.length === 11) {
		e.target.value = applyCpfMask(inpValue);
		isTaxpayerDocValid = true;
	} else if (inpValue.length === 14) {
		e.target.value = applyCnpjMask(inpValue);
		isTaxpayerDocValid = true;
	}
})

const procWrapper = document.getElementById('procWrapper');
const removerProcBtn = document.getElementById('removeProc');
removerProcBtn.addEventListener('click', () => {
	procWrapper.removeChild(procWrapper.lastElementChild)
})

const addProcBtn = document.getElementById('addProc');
addProcBtn.addEventListener('click', addProcInputHandler)

function applyCpfMask(value) {
	const p1 = value.slice(0, 3);
	const p2 = value.slice(3, 6);
	const p3 = value.slice(6, 9);
	const p4 = value.slice(9, 11);

	return `${p1}.${p2}.${p3}-${p4}`
}

function applyCnpjMask(value) {
	const p1 = value.slice(0, 2);
	const p2 = value.slice(2, 5);
	const p3 = value.slice(5, 8);
	const p4 = value.slice(8, 12);
	const p5 = value.slice(12, 14);

	return `${p1}.${p2}.${p3}/${p4}-${p5}`
}

function applyProcessMaskShort(value) {
	// 1507855-75.2019.8.26.0038
	const p1 = value.slice(0, 7);
	const p2 = value.slice(7, 9);
	const p3 = value.slice(9, 13);

	// default: .8.26.0038
	// const p4 = value.slice(13, 14);
	// const p5 = value.slice(14, 16);
	// const p6 = value.slice(16, 20);

	return `${p1}-${p2}.${p3}.8.26.0038`
}

function applyProcessMaskLong(value) {
	// 1507855-75.2019.8.26.0038
	const p1 = value.slice(0, 7);
	const p2 = value.slice(7, 9);
	const p3 = value.slice(9, 13);

	// default: .8.26.0038
	const p4 = value.slice(13, 14);
	const p5 = value.slice(14, 16);
	const p6 = value.slice(16, 20);

	return `${p1}-${p2}.${p3}.${p4}.${p5}.${p6}`
}

function onFocusOutHandlerForProcess(e) {
	let inpValue = e.target.value;

	if (inpValue.includes('-')) {
		// inpValue = value.replace('.', '').replace('-', '').replace('/', '');
		inpValue = inpValue.replace(/[.-]/g, '');
		e.target.value = inpValue;
		areProcsValid = false;
	}

	if (inpValue.length === 13) {
		e.target.value = applyProcessMaskShort(inpValue);
		areProcsValid = true;
	}

	if (inpValue.length === 20) {
		e.target.value = applyProcessMaskLong(inpValue);
		areProcsValid = true;
	}
}

function addProcInputHandler({ proc } = {}) {

	const newInput = document.createElement("input");
	newInput.type = "text";
	newInput.classList.add("procId", "form-control", "mb-2");
	newInput.addEventListener('focusout', onFocusOutHandlerForProcess)
	inputs.push(newInput)

	if (proc) {
		newInput.value = proc;
	}

	procWrapper.appendChild(newInput)
}