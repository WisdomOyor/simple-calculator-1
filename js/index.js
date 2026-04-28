// === DOM Elements ===
const expressionDisplay = document.getElementById('expression');
const resultDisplay = document.getElementById('result');
const buttons = document.querySelectorAll('.btn');

// === Calculator State ===
let currentInput = '0';
let previousInput = '';
let operator = null;
let shouldResetCurrentInput = false;
let justEvaluated = false;
let expressionString = '';

// === Update Display ===
function updateDisplay() {
    let displayValue = currentInput;
    if (displayValue.includes('.') && displayValue.length > 12) {
        const num = parseFloat(displayValue);
        if (!isNaN(num)) {
            displayValue = num.toPrecision(10);
            if (displayValue.includes('.')) {
                displayValue = displayValue.replace(/\.?0+$/, '');
            }
        }
    }
    if (displayValue.length > 14) {
        displayValue = parseFloat(displayValue).toExponential(6);
    }
    resultDisplay.textContent = displayValue;
    resultDisplay.classList.remove('error');
    expressionDisplay.textContent = expressionString;
}

// === Format a number nicely ===
function formatNumber(num) {
    if (num === '' || num === null || num === undefined) return '0';
    const parsed = parseFloat(num);
    if (isNaN(parsed)) return '0';
    if (Number.isInteger(parsed) && !num.toString().includes('.')) {
        return parsed.toString();
    }
    let formatted = parsed.toPrecision(12);
    if (formatted.includes('.')) {
        formatted = formatted.replace(/\.?0+$/, '');
    }
    if (formatted.includes('e')) {
        formatted = parsed.toPrecision(8);
    }
    return formatted;
}

// === Reset everything ===
function clearAll() {
    currentInput = '0';
    previousInput = '';
    operator = null;
    shouldResetCurrentInput = false;
    justEvaluated = false;
    expressionString = '';
    updateDisplay();
}

// === Delete last character ===
function deleteLast() {
    if (justEvaluated) {
        clearAll();
        return;
    }
    if (shouldResetCurrentInput) return;
    if (currentInput.length === 1 || (currentInput.length === 2 && currentInput.startsWith('-'))) {
        currentInput = '0';
    } else {
        currentInput = currentInput.slice(0, -1);
    }
    if (expressionString.length > 0 && operator !== null) {
        const parts = expressionString.split(/ ([+\-×÷%]) /);
        if (parts.length === 2) {
            expressionString = parts[0] + ' ' + operatorSymbol(operator) + ' ' + currentInput;
        }
    } else if (expressionString.length > 0 && operator === null) {
        expressionString = currentInput;
    }
    updateDisplay();
}

// === Get operator display symbol ===
function operatorSymbol(op) {
    const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷', '%': '%' };
    return symbols[op] || op;
}

// === Handle Number Input ===
function handleNumber(value) {
    if (justEvaluated) {
        currentInput = value;
        previousInput = '';
        operator = null;
        expressionString = value;
        justEvaluated = false;
        shouldResetCurrentInput = false;
        updateDisplay();
        return;
    }
    if (shouldResetCurrentInput) {
        currentInput = value;
        shouldResetCurrentInput = false;
        if (operator && previousInput !== '') {
            expressionString = previousInput + ' ' + operatorSymbol(operator) + ' ' + currentInput;
        } else {
            expressionString = currentInput;
        }
        updateDisplay();
        return;
    }
    if (value === '.') {
        if (currentInput.includes('.')) return;
        if (currentInput === '0' || currentInput === '') {
            currentInput = '0.';
        } else {
            currentInput += '.';
        }
        if (operator && previousInput !== '') {
            expressionString = previousInput + ' ' + operatorSymbol(operator) + ' ' + currentInput;
        } else {
            expressionString = currentInput;
        }
        updateDisplay();
        return;
    }
    if (currentInput === '0' && value !== '.') {
        currentInput = value;
    } else if (currentInput === '-0') {
        currentInput = '-' + value;
    } else {
        if (currentInput.replace(/[^0-9]/g, '').length >= 14) return;
        currentInput += value;
    }
    if (operator && previousInput !== '') {
        expressionString = previousInput + ' ' + operatorSymbol(operator) + ' ' + currentInput;
    } else {
        expressionString = currentInput;
    }
    updateDisplay();
}

// === Handle Operator Input ===
function handleOperator(value) {
    const current = parseFloat(currentInput);
    if (justEvaluated) {
        previousInput = formatNumber(currentInput);
        operator = value;
        expressionString = previousInput + ' ' + operatorSymbol(operator);
        shouldResetCurrentInput = true;
        justEvaluated = false;
        updateDisplay();
        return;
    }
    if (operator !== null && !shouldResetCurrentInput && previousInput !== '') {
        const result = calculate(parseFloat(previousInput), current, operator);
        if (result === null) {
            currentInput = 'Error';
            previousInput = '';
            operator = null;
            expressionString = 'Error';
            shouldResetCurrentInput = true;
            justEvaluated = false;
            resultDisplay.classList.add('error');
            updateDisplay();
            return;
        }
        currentInput = formatNumber(result);
        previousInput = formatNumber(result);
        operator = value;
        expressionString = previousInput + ' ' + operatorSymbol(operator);
        shouldResetCurrentInput = true;
        updateDisplay();
        return;
    }
    if (currentInput === 'Error') {
        clearAll();
        return;
    }
    if (!isNaN(current) || currentInput === '0') {
        previousInput = formatNumber(currentInput);
    } else {
        previousInput = '0';
    }
    operator = value;
    expressionString = previousInput + ' ' + operatorSymbol(operator);
    shouldResetCurrentInput = true;
    justEvaluated = false;
    updateDisplay();
}

// === Core Calculation ===
function calculate(a, b, op) {
    let result;
    switch (op) {
        case '+': result = a + b; break;
        case '-': result = a - b; break;
        case '*': result = a * b; break;
        case '/': if (b === 0) return null; result = a / b; break;
        case '%': if (b === 0) return null; result = a % b; break;
        default: return b;
    }
    if (Math.abs(result) < 1e-12) result = 0;
    if (!isFinite(result)) return null;
    return result;
}

// === Handle Equals ===
function handleEquals() {
    if (justEvaluated) return;
    if (operator === null) {
        expressionString = currentInput + ' =';
        previousInput = '';
        justEvaluated = true;
        shouldResetCurrentInput = true;
        updateDisplay();
        return;
    }
    if (shouldResetCurrentInput && previousInput !== '') {
        expressionString = previousInput + ' ' + operatorSymbol(operator) + ' ' + formatNumber(currentInput) + ' =';
        shouldResetCurrentInput = true;
        justEvaluated = true;
        updateDisplay();
        return;
    }
    const prev = parseFloat(previousInput);
    const curr = parseFloat(currentInput);
    if (isNaN(prev) || isNaN(curr)) {
        clearAll();
        return;
    }
    const result = calculate(prev, curr, operator);
    if (result === null) {
        currentInput = 'Error';
        expressionString = previousInput + ' ' + operatorSymbol(operator) + ' ' + currentInput + ' =';
        resultDisplay.classList.add('error');
        previousInput = '';
        operator = null;
        shouldResetCurrentInput = true;
        justEvaluated = true;
        updateDisplay();
        return;
    }
    const formattedResult = formatNumber(result);
    expressionString = previousInput + ' ' + operatorSymbol(operator) + ' ' + formatNumber(currentInput) + ' =';
    currentInput = formattedResult;
    previousInput = formattedResult;
    operator = null;
    shouldResetCurrentInput = true;
    justEvaluated = true;
    updateDisplay();
}

// === Handle Percentage ===
function handlePercentage() {
    const current = parseFloat(currentInput);
    if (isNaN(current)) {
        clearAll();
        return;
    }
    const result = current / 100;
    currentInput = formatNumber(result);
    if (operator && previousInput !== '') {
        expressionString = previousInput + ' ' + operatorSymbol(operator) + ' ' + currentInput;
    } else {
        expressionString = currentInput;
    }
    updateDisplay();
}

// === Button Click Handler ===
buttons.forEach(button => {
    button.addEventListener('click', (e) => {
        const action = button.dataset.action;
        const value = button.dataset.value;
        switch (action) {
            case 'number':
                if (value === '%') {
                    handlePercentage();
                } else {
                    handleNumber(value);
                }
                break;
            case 'operator':
                if (value === '%') {
                    handlePercentage();
                } else {
                    handleOperator(value);
                }
                break;
            case 'equals':
                handleEquals();
                break;
            case 'clear':
                clearAll();
                break;
            case 'delete':
                deleteLast();
                break;
        }
    });
    button.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });
});

// === Keyboard Support ===
document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key >= '0' && key <= '9') {
        e.preventDefault();
        handleNumber(key);
    } else if (key === '.') {
        e.preventDefault();
        handleNumber('.');
    } else if (key === '+') {
        e.preventDefault();
        handleOperator('+');
    } else if (key === '-') {
        e.preventDefault();
        handleOperator('-');
    } else if (key === '*') {
        e.preventDefault();
        handleOperator('*');
    } else if (key === '/') {
        e.preventDefault();
        handleOperator('/');
    } else if (key === '%') {
        e.preventDefault();
        handlePercentage();
    } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        e.preventDefault();
        clearAll();
    } else if (key === 'Backspace') {
        e.preventDefault();
        deleteLast();
    }
});

// === Initialize ===
updateDisplay();