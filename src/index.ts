const inputs = <NodeListOf<HTMLInputElement>>(
	document.querySelectorAll('input[type="text"]')
);

let inputStates: Record<number, string> = {};

const moveCaret = (input: HTMLInputElement, distance: number) => {
	const caret = input.selectionStart;
	if (caret !== null && (caret !== 0 || distance > 0))
		input.setSelectionRange(caret + distance, caret + distance);
};

const NORMAL_KEYBINDINGS: Record<
	string,
	({ input, id }: { input: HTMLInputElement; id: number }) => any
> = {
	i: ({ input, id }) => {
		input.classList.remove("vimput-normal");
		inputStates[id] = "insert";
	},
	h: ({ input }) => moveCaret(input, -1),
	l: ({ input }) => moveCaret(input, 1)
};

for (let i = 0; i < inputs.length; i++) {
	const input = inputs[i];

	inputStates[i] = "insert";

	input.addEventListener("keydown", (e) => {
		if (e.key === "Escape") {
			e.preventDefault();

			if (inputStates[i] === "insert") {
				input.classList.add("vimput-normal");
				inputStates[i] = "normal";
			}

			return;
		}

		if (inputStates[i] === "insert") return;
		e.preventDefault();

		if (e.key in NORMAL_KEYBINDINGS)
			NORMAL_KEYBINDINGS[e.key]({ input, id: i });
	});
}
