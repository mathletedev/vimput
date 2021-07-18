const inputs = <NodeListOf<HTMLInputElement>>(
	document.querySelectorAll('input[type="text"]')
);

let inputStates: Record<number, "normal" | "insert"> = {};

const MODIFIERS: Record<string, string> = {
	Control: "^"
};

let pressedModifiers = new Set<string>();

const moveCaret = (input: HTMLInputElement, distance: number) => {
	const caret = input.selectionStart;
	if (
		caret !== null &&
		(caret !== 0 || distance > 0) &&
		(caret !== input.value.length - 1 || distance < 0)
	)
		input.setSelectionRange(caret + distance, caret + distance);
};

const setCaret = (input: HTMLInputElement, position: number) => {
	input.setSelectionRange(position, position);
};

const NORMAL_KEYBINDINGS: Record<
	string,
	({ input, id }: { input: HTMLInputElement; id: number }) => any
> = {
	h: ({ input }) => moveCaret(input, -1),
	l: ({ input }) => moveCaret(input, 1),
	i: ({ input, id }) => {
		inputStates[id] = "insert";
		input.classList.remove("vimput-normal");
	},
	a: ({ input, id }) => {
		if (input.selectionStart === null) return;

		const caret = input.selectionStart + 1;
		input.setSelectionRange(caret, caret);

		inputStates[id] = "insert";
		input.classList.remove("vimput-normal");
	},
	A: ({ input, id }) => {
		setCaret(input, input.value.length);

		inputStates[id] = "insert";
		input.classList.remove("vimput-normal");
	},
	"0": ({ input }) => setCaret(input, 0),
	$: ({ input }) => setCaret(input, input.value.length),
	w: ({ input }) => {
		const caret = input.selectionStart;
		if (caret === null) return;

		let nextWord = input.value.indexOf(" ", caret) + 1;
		if (nextWord === 0) return setCaret(input, input.value.length - 1);
		setCaret(input, nextWord);
	},
	b: ({ input }) => {
		const caret = input.selectionStart;
		if (caret === null) return;

		let prevWord = input.value.lastIndexOf(" ", caret - 2) + 1;
		if (prevWord === 0) return setCaret(input, 0);
		setCaret(input, prevWord);
	},
	x: ({ input }) => {
		const caret = input.selectionStart;
		if (caret === null) return;

		input.value = input.value.slice(0, caret) + input.value.slice(caret + 1);
		setCaret(
			input,
			caret === input.value.length ? input.value.length - 1 : caret
		);
	}
};

for (let i = 0; i < inputs.length; i++) {
	const input = inputs[i];

	inputStates[i] = "insert";

	input.addEventListener(
		"keydown",
		(e) => {
			e.stopPropagation();

			if (
				inputStates[i] === "normal" &&
				input.selectionStart === input.value.length
			) {
				setCaret(input, input.value.length - 1);
			}

			if (Object.keys(MODIFIERS).includes(e.key)) {
				pressedModifiers.add(e.key);
				return;
			}

			if (e.key === "Escape") {
				e.preventDefault();

				if (inputStates[i] === "insert") {
					const caret = input.selectionStart;
					setCaret(input, (caret || 0) - 1);

					input.classList.add("vimput-normal");
					inputStates[i] = "normal";
				}

				return;
			}

			if (inputStates[i] === "insert") return;
			e.preventDefault();

			let key = "";

			for (const modifier of Array.from(pressedModifiers).sort())
				key += MODIFIERS[modifier];
			key += e.key;

			if (key in NORMAL_KEYBINDINGS) NORMAL_KEYBINDINGS[key]({ input, id: i });
		},
		{ capture: true }
	);

	input.addEventListener("keyup", (e) => {
		if (Object.keys(MODIFIERS).includes(e.key)) {
			pressedModifiers.delete(e.key);
			return;
		}
	});
}
