
const display = document.getElementById("display");
const buttons = document.querySelector(".buttons");

let expression = "";
let justCalculated = false;

function calculateExpression(input) {
    const tokens = input.match(
        /(?:\d+\.?\d*|\.\d+)|[+\-*/%]/g
    );

    if (!tokens || tokens.join("") !== input) {
        throw new Error("Invalid expression");
    }

    let position = 0;

    function factor() {
        const token = tokens[position++];

        if (token === "+") return factor();
        if (token === "-") return -factor();

        if (token === undefined || !/^(?:\d+\.?\d*|\.\d+)$/.test(token)) {
            throw new Error("Invalid number");
        }

        return Number(token);
    }

    function term() {
        let value = factor();

        while (["*", "/", "%"].includes(tokens[position])) {
            const operator = tokens[position++];
            const right = factor();

            if ((operator === "/" || operator === "%") && right === 0) {
                throw new Error("Cannot divide by zero");
            }

            if (operator === "*") value *= right;
            if (operator === "/") value /= right;
            if (operator === "%") value %= right;
        }

        return value;
    }

    function sum() {
        let value = term();

        while (tokens[position] === "+" || tokens[position] === "-") {
            const operator = tokens[position++];
            const right = term();

            if (operator === "+") value += right;
            else value -= right;
        }

        return value;
    }

    const result = sum();

    if (position !== tokens.length || !Number.isFinite(result)) {
        throw new Error("Invalid calculation");
    }

    return result;
}

function calculate() {
    try {
        const result = calculateExpression(expression);
        expression = String(Number(result.toPrecision(12)));
        display.value = expression;
        justCalculated = true;
    } catch {
        display.value = "Error";
        expression = "";
        justCalculated = true;
    }
}

buttons.addEventListener("click", function (event) {
    const button = event.target.closest("button");
    if (!button) return;

    const action = button.dataset.action;
    const value = button.dataset.value;

    if (action === "clear") {
        expression = "";
        display.value = "";
        justCalculated = false;
        return;
    }

    if (action === "delete") {
        if (justCalculated) {
            expression = "";
            justCalculated = false;
        } else {
            expression = expression.slice(0, -1);
        }
        display.value = expression;
        return;
    }

    if (action === "calculate") {
        if (expression) calculate();
        return;
    }

    if (action === "sign") {
        if (justCalculated) justCalculated = false;

        const match = expression.match(/(\d+\.?\d*|\.\d+)$/);
        if (match) {
            const number = match[0];
            const start = match.index;
            const previous = expression[start - 1];

            if (previous === "-" &&
                (start === 1 || "+-*/%".includes(expression[start - 2]))) {
                expression =
                    expression.slice(0, start - 1) + number;
            } else {
                expression =
                    expression.slice(0, start) + "(-" + number + ")";
            }
        }

        display.value = expression;
        return;
    }

    if (value !== undefined) {
        if (justCalculated) {
            if (/[0-9.]/.test(value)) expression = "";
            justCalculated = false;
        }

        if (/[0-9]/.test(value) || value === ".") {
            expression += value;
        } else if ("+-*/%".includes(value)) {
            if (!expression && value !== "-") return;
            expression += value;
        }

        display.value = expression;
    }
});
