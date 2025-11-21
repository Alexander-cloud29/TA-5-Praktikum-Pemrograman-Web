// calculator.js

const display = document.getElementById('display');
const historyDisplay = document.getElementById('history-display');
const advancedPanel = document.getElementById('advanced-panel');
const showHistoryBtn = document.getElementById('show-history');
const showMemoryBtn = document.getElementById('show-memory');
const memoryBtn = document.getElementById('show-memory');

// --- STATE MANAGEMENT ---
let currentInput = '0';          // Nilai yang sedang di-input/ditampilkan di display utama
let currentExpression = '';      // Seluruh ekspresi yang akan dihitung (misal: "5+3*2")
let history = [];                // Max 5 entries
let memoryValue = 0;

// --- UTILITY FUNCTIONS ---

/**
 * Menangani pembagian dengan nol.
 * @param {number} value Hasil perhitungan
 * @returns {string|number} Pesan error atau nilai asli
 */
function handleDivisionByZero(value) {
    if (value === Infinity || value === -Infinity) {
        return 'Error: Dibagi 0';
    }
    if (isNaN(value)) {
        return 'Error: Operasi Invalid';
    }
    return value;
}

/**
 * Memperbarui tampilan utama dan riwayat.
 */
function updateDisplay() {
    display.textContent = currentInput;
    // Ganti simbol JS (* dan /) kembali ke simbol Display (× dan ÷)
    historyDisplay.textContent = currentExpression.replace(/\*/g, '×').replace(/\//g, '÷');
    memoryBtn.textContent = `Memory (${memoryValue})`;
}

/**
 * Membatasi riwayat hanya 5 entri.
 * @param {string} entry Entri riwayat baru
 */
function updateHistory(entry) {
    if (entry) {
        history.unshift(entry); // Tambahkan ke depan
        if (history.length > 5) {
            history.pop(); // Hapus entri terlama
        }
    }
    // Jika panel History sedang terbuka, render ulang
    if (!advancedPanel.classList.contains('hidden') && showHistoryBtn.classList.contains('bg-indigo-500')) {
        renderAdvancedPanel('history');
    }
}

// --- CORE CALCULATOR LOGIC ---

/**
 * Melakukan perhitungan ekspresi penuh menggunakan urutan operasi (BODMAS/PEMDAS)
 * melalui fungsi eval().
 */
function calculate() {
    if (currentExpression === '' || currentInput.includes('Error')) {
        return;
    }

    // Pastikan ekspresi tidak berakhir dengan operator (misal: "5 +")
    const lastChar = currentExpression.slice(-1);
    if (['+', '-', '*', '/'].includes(lastChar)) {
        // Hapus operator terakhir jika ada (agar eval tidak error)
        currentExpression = currentExpression.slice(0, -1);
    }

    let result;
    const expressionToSave = currentExpression.replace(/\*/g, '×').replace(/\//g, '÷');

    try {
        // Gunakan eval() untuk mengevaluasi ekspresi (mengikuti urutan operasi)
        result = eval(currentExpression);

        const errorCheck = handleDivisionByZero(result);

        if (typeof errorCheck === 'string') { // Jika terjadi Error
            currentInput = errorCheck;
            currentExpression = '';
        } else {
            // Jika sukses
            result = parseFloat(result.toFixed(10)); // Batasi desimal untuk menghindari error floating point JS
            updateHistory(`${expressionToSave} = ${result}`);
            currentInput = result.toString();
            currentExpression = result.toString(); // Set ekspresi ke hasil, siap untuk perhitungan berantai berikutnya
        }

    } catch (e) {
        currentInput = 'Syntax Error';
        currentExpression = '';
    }
    updateDisplay();
}

// --- EVENT HANDLERS ---

/**
 * Menangani masukan angka.
 * @param {string} number Angka (0-9)
 */
function inputNumber(number) {
    if (currentInput.includes('Error')) {
        currentInput = '0';
        currentExpression = '';
    }

    const lastChar = currentExpression.slice(-1);
    // Cek apakah karakter terakhir adalah operator JS (*, /, +, -)
    const isOperator = ['*', '/', '+', '-'].includes(lastChar);
    
    // Jika currentExpression kosong atau karakter terakhir adalah operator, mulai input angka baru
    if (currentExpression === '' || isOperator) {
        currentInput = number;
        currentExpression += number;
    } else {
        // Lanjutkan input angka saat ini
        currentInput = currentInput === '0' ? number : currentInput + number;
        // Hapus angka sebelumnya dari currentExpression (jika ada) dan tambahkan yang baru
        if(currentExpression.match(/[\d.]+$/)){
            currentExpression = currentExpression.replace(/[\d.]+$/, currentInput);
        } else {
            currentExpression += number;
        }
    }
    
    updateDisplay();
}

/**
 * Menangani tombol desimal.
 */
function inputDecimal() {
    if (currentInput.includes('Error')) return;

    if (!currentInput.includes('.')) {
        currentInput += '.';
        currentExpression += '.';
    }
    updateDisplay();
}

/**
 * Menangani tombol operator.
 * @param {string} nextOperator Operator (+, -, ×, ÷)
 */
function inputOperator(nextOperator) {
    if (currentInput.includes('Error') || currentExpression === '') {
        // Jika Error, atau belum ada input angka sama sekali
        return;
    }

    // Mengganti simbol display ke simbol JS untuk perhitungan
    const jsOperator = nextOperator === '×' ? '*' : nextOperator === '÷' ? '/' : nextOperator;

    const lastChar = currentExpression.slice(-1);

    // Cek apakah karakter terakhir adalah operator JS (+, -, *, /)
    if (['+', '-', '*', '/'].includes(lastChar)) {
        // Jika iya, ganti operator yang terakhir (Misal: 5+ menjadi 5-)
        currentExpression = currentExpression.slice(0, -1) + jsOperator;
    } else {
        // Tambahkan operator baru
        currentExpression += jsOperator;
    }

    // Reset currentInput agar siap menerima angka berikutnya
    currentInput = nextOperator;
    updateDisplay();
}

/**
 * Menangani tombol CLEAR (C) dan CLEAR ENTRY (CE).
 * @param {string} type Tipe clear (C atau CE)
 */
function clear(type) {
    if (type === 'C') { // Clear All
        currentInput = '0';
        currentExpression = '';
    } else if (type === 'CE') { // Clear Entry
        // Menghapus input terakhir (angka atau operator) dari currentExpression
        const lastChar = currentExpression.slice(-1);
        if (['+', '-', '*', '/'].includes(lastChar)) {
             // Jika operator terakhir dihapus, tampilkan angka sebelumnya
             currentExpression = currentExpression.slice(0, -1);
             const match = currentExpression.match(/[\d.]+$/);
             currentInput = match ? match[0] : '0';
        } else if (currentExpression.match(/[\d.]+$/)) {
            // Jika angka sedang diinput, hapus angka tersebut dari ekspresi
            currentExpression = currentExpression.replace(/[\d.]+$/, '');
            currentInput = '0';
        }
        
        if (currentExpression === '') {
            currentInput = '0';
        }
    }
    updateDisplay();
}

// --- ADVANCED FEATURES ---

/**
 * Menangani fungsi Memory (M+, M-, MR, MC).
 * @param {string} action Tindakan memori
 */
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
            // Memory Recall: menimpa input saat ini dan juga ekspresi
            currentInput = memoryValue.toString();
            currentExpression = memoryValue.toString();
            break;
        case 'MC':
            memoryValue = 0;
            break;
    }
    updateDisplay();
    // Jika panel Memory sedang terbuka, render ulang
    if (!advancedPanel.classList.contains('hidden') && showMemoryBtn.classList.contains('bg-indigo-500')) {
        renderAdvancedPanel('memory');
    }
}


/**
 * Merender panel History atau Memory.
 * @param {string} panelName Nama panel ('history' atau 'memory')
 */
function renderAdvancedPanel(panelName) {
    advancedPanel.classList.remove('hidden');

    // Reset warna tab
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

// calculator.js (Hanya bagian yang dimodifikasi/ditambah)

// --- ANIMATION FUNCTION ---
function animateButton(target) {
    target.classList.add('btn-pop');
    // Hapus class setelah animasi selesai (100ms sesuai CSS @keyframes pop)
    setTimeout(() => {
        target.classList.remove('btn-pop');
    }, 100);
}

// --- EVENT LISTENERS (Tombol Fisik) ---

document.getElementById('buttons-grid').addEventListener('click', (event) => {
    const target = event.target;
    const action = target.dataset.action;
    const value = target.dataset.value;

    if (!action) return;
    
    // Panggil fungsi animasi di sini!
    if(target.tagName === 'BUTTON') {
        animateButton(target);
    }

    switch (action) {
        // ... (Logika kalkulator tetap sama) ...
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
        // Panggil fungsi animasi di sini!
        animateButton(event.target);
        memoryAction(event.target.dataset.value);
    });
});

// ... (Bagian kode lainnya tetap sama) ...

// Listener untuk Tabs Advanced Features
const toggleAdvancedPanel = (panelName, targetBtn) => {
    const isCurrentlyOpen = !advancedPanel.classList.contains('hidden') && targetBtn.classList.contains('bg-indigo-500');

    // Jika sedang terbuka, tutup
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


// --- KEYBOARD SUPPORT ---

document.addEventListener('keydown', (event) => {
    const key = event.key;

    if (/[0-9]/.test(key)) {
        inputNumber(key);
    } else if (key === '.') {
        inputDecimal();
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        // Map keyboard operators to display symbols
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

// Inisialisasi tampilan awal
document.addEventListener('DOMContentLoaded', updateDisplay);