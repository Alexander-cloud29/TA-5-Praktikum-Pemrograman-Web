const display = document.getElementById('display');
const historyDisplay = document.getElementById('history-display');
const advancedPanel = document.getElementById('advanced-panel');
const showHistoryBtn = document.getElementById('show-history');
const showMemoryBtn = document.getElementById('show-memory');
const memoryBtn = document.getElementById('show-memory');

let currentInput = '0';
let currentExpression = '';
let history = [];
let memoryValue = 0;

function handleDivisionByZero(value) {
    if (value === Infinity || value === -Infinity) {
        return 'Error: Dibagi 0';
    }
    if (isNaN(value)) {
        return 'Error: Operasi Invalid';
    }
    return value;
}

function updateDisplay() {
    display.textContent = currentInput;
    historyDisplay.textContent = currentExpression.replace(/\*/g, '×').replace(/\//g, '÷');
    memoryBtn.textContent = `Memory (${memoryValue})`;
}

function updateHistory(entry) {
    if (entry) {
        history.unshift(entry);
        if (history.length > 5) {
            history.pop();
        }
    }
    if (!advancedPanel.classList.contains('hidden') && showHistoryBtn.classList.contains('bg-indigo-500')) {
        renderAdvancedPanel('history');
    }
}

function calculate() {
    if (currentExpression === '' || currentInput.includes('Error')) {
        return;
    }

    const lastChar = currentExpression.slice(-1);
    if (['+', '-', '*', '/'].includes(lastChar)) {
        currentExpression = currentExpression.slice(0, -1);
    }

    let result;
    const expressionToSave = currentExpression.replace(/\*/g, '×').replace(/\//g, '÷');

    try {
        result = eval(currentExpression);

        const errorCheck = handleDivisionByZero(result);

        if (typeof errorCheck === 'string') {
            currentInput = errorCheck;
            currentExpression = '';
        } else {
            result = parseFloat(result.toFixed(10));
            updateHistory(`${expressionToSave} = ${result}`);
            currentInput = result.toString();
            currentExpression = result.toString();
        }

    } catch (e) {
        currentInput = 'Syntax Error';
        currentExpression = '';
    }
    updateDisplay();
}

function inputNumber(number) {
    if (currentInput.includes('Error')) {
        currentInput = '0';
        currentExpression = '';
    }

    const lastChar = currentExpression.slice(-1);
    const isOperator = ['*', '/', '+', '-'].includes(lastChar);
    
    if (currentExpression === '' || isOperator) {
        currentInput = number;
        currentExpression += number;
    } else {
        currentInput = currentInput === '0' ? number : currentInput + number;
        if(currentExpression.match(/[\d.]+$/)){
            currentExpression = currentExpression.replace(/[\d.]+$/, currentInput);
        } else {
            currentExpression += number;
        }
    }
    
    updateDisplay();
}

function inputDecimal() {
    if (currentInput.includes('Error')) return;

    if (!currentInput.includes('.')) {
        currentInput += '.';
        currentExpression += '.';
    }
    updateDisplay();
}

function inputOperator(nextOperator) {
    if (currentInput.includes('Error') || currentExpression === '') {
        return;
    }

    const jsOperator = nextOperator === '×' ? '*' : nextOperator === '÷' ? '/' : nextOperator;

    const lastChar = currentExpression.slice(-1);

    if (['+', '-', '*', '/'].includes(lastChar)) {
        currentExpression = currentExpression.slice(0, -1) + jsOperator;
    } else {
        currentExpression += jsOperator;
    }

    currentInput = nextOperator;
    updateDisplay();
}

function clear(type) {
    if (type === 'C') {
        currentInput = '0';
        currentExpression = '';
    } else if (type === 'CE') {
        const lastChar = currentExpression.slice(-1);
        if (['+', '-', '*', '/'].includes(lastChar)) {
             currentExpression = currentExpression.slice(0, -1);
             const match = currentExpression.match(/[\d.]+$/);
             currentInput = match ? match[0] : '0';
        } else if (currentExpression.match(/[\d.]+$/)) {
            currentExpression = currentExpression.replace(/[\d.]+$/, '');
            currentInput = '0';
        }
        
        if (currentExpression === '') {
            currentInput = '0';
        }
    }
    updateDisplay();
}

function memoryAction(action) {
    if (currentInput.includes('Error')) {
        return;
    }
    const currentValue = parseFloat(currentInput);

    switch (action) {
        case 'M+':
            memoryValue += currentValue;
            break;
        case 'M-':
            memoryValue -= currentValue;
            break;
        case 'MR':
            currentInput = memoryValue.toString();
            currentExpression = memoryValue.toString();
            break;
        case 'MC':
            memoryValue = 0;
            break;
    }
    updateDisplay();
    if (!advancedPanel.classList.contains('hidden') && showMemoryBtn.classList.contains('bg-indigo-500')) {
        renderAdvancedPanel('memory');
    }
}

function renderAdvancedPanel(panelName) {
    advancedPanel.classList.remove('hidden');

    showHistoryBtn.classList.remove('bg-indigo-500', 'text-white');
    showHistoryBtn.classList.add('bg-gray-300', 'text-gray-800');
    showMemoryBtn.classList.remove('bg-indigo-500', 'text-white');
    showMemoryBtn.classList.add('bg-gray-300', 'text-gray-800');

    if (panelName === 'history') {
        let content = '<ul class="divide-y divide-gray-200">';
        if (history.length === 0) {
            content += '<li class="p-2 text-center text-gray-500 italic">Riwayat Kosong</li>';
        } else {
            history.forEach(item => {
                content += `<li class="p-2 text-sm">${item}</li>`;
            });
        }
        content += '</ul>';
        advancedPanel.innerHTML = content;
        showHistoryBtn.classList.remove('bg-gray-300', 'text-gray-800');
        showHistoryBtn.classList.add('bg-indigo-500', 'text-white');

    } else if (panelName === 'memory') {
        advancedPanel.innerHTML = `<p class="text-lg font-bold text-center p-2">Memory Value: ${memoryValue.toFixed(10)}</p>`;
        showMemoryBtn.classList.remove('bg-gray-300', 'text-gray-800');
        showMemoryBtn.classList.add('bg-indigo-500', 'text-white');
    }
}

function animateButton(target) {
    target.classList.add('btn-pop');
    setTimeout(() => {
        target.classList.remove('btn-pop');
    }, 100);
}

document.getElementById('buttons-grid').addEventListener('click', (event) => {
    const target = event.target;
    const action = target.dataset.action;
    const value = target.dataset.value;

    if (!action) return;
    
    if(target.tagName === 'BUTTON') {
        animateButton(target);
    }

    switch (action) {
        case 'number':
            inputNumber(value);
            break;
        case 'decimal':
            inputDecimal();
            break;
        case 'operator':
            inputOperator(value);
            break;
        case 'clear':
            clear(value);
            break;
        case 'equals':
            calculate();
            break;
    }
});

document.querySelectorAll('.btn-memory').forEach(btn => {
    btn.addEventListener('click', (event) => {
        animateButton(event.target);
        memoryAction(event.target.dataset.value);
    });
});

const toggleAdvancedPanel = (panelName, targetBtn) => {
    const isCurrentlyOpen = !advancedPanel.classList.contains('hidden') && targetBtn.classList.contains('bg-indigo-500');

    if (isCurrentlyOpen) {
        advancedPanel.classList.add('hidden');
        targetBtn.classList.remove('bg-indigo-500', 'text-white');
        targetBtn.classList.add('bg-gray-300', 'text-gray-800');
    } else {
        renderAdvancedPanel(panelName);
    }
};

showHistoryBtn.addEventListener('click', () => toggleAdvancedPanel('history', showHistoryBtn));
showMemoryBtn.addEventListener('click', () => toggleAdvancedPanel('memory', showMemoryBtn));

document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (/[0-9]/.test(key)) {
        inputNumber(key);
    } else if (key === '.') {
        inputDecimal();
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        const operatorMap = { '*': '×', '/': '÷' };
        inputOperator(operatorMap[key] || key);
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clear('C');
    } else if (key === 'Backspace') {
        clear('CE');
    }
});

document.addEventListener('DOMContentLoaded', updateDisplay);
