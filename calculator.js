class Calculator {
    constructor() {
        this.display = document.getElementById('display');
        this.history = document.getElementById('history');
        this.expression = '';
        this.angleMode = 'deg'; // 'deg' or 'rad'
    }

    appendNumber(num) {
        // Prevent multiple leading zeros
        if (this.expression === '0' && num === '0') return;
        if (this.expression === '0' && num !== '.') {
            this.expression = num;
        } else {
            this.expression += num;
        }
        this.updateDisplay();
    }

    appendDecimal() {
        // Get the last number in the expression
        const lastNumber = this.expression.split(/[\+\-\*\/\(\)]/).pop();
        
        // Only add decimal if the last number doesn't already have one
        if (!lastNumber.includes('.')) {
            if (this.expression === '' || /[\+\-\*\/\(]$/.test(this.expression)) {
                this.expression += '0.';
            } else {
                this.expression += '.';
            }
            this.updateDisplay();
        }
    }

    appendOperator(op) {
        if (this.expression === '') return;
        
        // Replace the last operator if one was just added
        if (/[\+\-\*\/]$/.test(this.expression)) {
            this.expression = this.expression.slice(0, -1) + op;
        } else {
            this.expression += op;
        }
        this.updateDisplay();
    }

    appendFunction(func) {
        const functionMap = {
            'sqrt': 'Math.sqrt',
            'pow': '**2',
            'cbrt': 'Math.cbrt',
            'reciprocal': '1/',
            'sin': `Math.sin`,
            'cos': `Math.cos`,
            'tan': `Math.tan`,
            'log': 'Math.log10',
            'ln': 'Math.log',
            'factorial': 'factorial',
            'pi': String(Math.PI),
            'e': String(Math.E)
        };

        if (func === 'pow') {
            if (this.expression === '') return;
            this.expression += '**2';
        } else if (func === 'reciprocal') {
            if (this.expression === '') return;
            this.expression = `1/(${this.expression})`;
        } else if (func === 'pi') {
            this.expression += String(Math.PI);
        } else if (func === 'e') {
            this.expression += String(Math.E);
        } else if (func === 'factorial') {
            if (this.expression === '') return;
            this.expression = `factorial(${this.expression})`;
        } else if (['sin', 'cos', 'tan'].includes(func)) {
            const angle = this.angleMode === 'deg' ? `toRad` : '';
            this.expression += `Math.${func}(${this.expression}${angle ? '*Math.PI/180' : ''})`;
            this.expression = this.expression.replace(this.expression.substring(0, this.expression.lastIndexOf('Math')), '');
            this.expression = `Math.${func}(${this.expression.substring(this.expression.lastIndexOf('(')+1)}`;
            if (this.expression.endsWith(')')) {
                this.expression = this.expression.slice(0, -1);
            }
            this.expression = `${func}(`;
        } else if (func === 'log' || func === 'ln') {
            this.expression += `${func}(`;
        } else if (func === 'sqrt') {
            this.expression += 'sqrt(';
        } else if (func === 'cbrt') {
            this.expression += 'cbrt(';
        }
        
        this.updateDisplay();
    }

    deleteChar() {
        this.expression = this.expression.slice(0, -1);
        this.updateDisplay();
    }

    clear() {
        this.expression = '';
        this.updateDisplay();
    }

    toggleSign() {
        if (this.expression === '') return;
        
        // Get the last number
        const parts = this.expression.split(/(?=[+\-*/])/);
        const lastPart = parts[parts.length - 1];
        
        if (lastPart.startsWith('-')) {
            parts[parts.length - 1] = lastPart.slice(1);
        } else {
            parts[parts.length - 1] = '-' + lastPart;
        }
        
        this.expression = parts.join('');
        this.updateDisplay();
    }

    setAngleMode(mode) {
        this.angleMode = mode;
        
        // Update button states
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }

    calculate() {
        if (this.expression === '') return;

        try {
            let expr = this.expression;

            // Replace function names with Math equivalents
            expr = expr.replace(/sqrt\(/g, 'Math.sqrt(');
            expr = expr.replace(/cbrt\(/g, 'Math.cbrt(');
            expr = expr.replace(/sin\(/g, this.angleMode === 'deg' ? '(Math.sin((Math.PI/180)*' : 'Math.sin(');
            expr = expr.replace(/cos\(/g, this.angleMode === 'deg' ? '(Math.cos((Math.PI/180)*' : 'Math.cos(');
            expr = expr.replace(/tan\(/g, this.angleMode === 'deg' ? '(Math.tan((Math.PI/180)*' : 'Math.tan(');
            expr = expr.replace(/log\(/g, 'Math.log10(');
            expr = expr.replace(/ln\(/g, 'Math.log(');
            expr = expr.replace(/factorial\(/g, 'factorial(');
            expr = expr.replace(/\*\*2/g, '**2');

            // Add closing parentheses for degree conversions
            if (this.angleMode === 'deg') {
                const sinMatches = (expr.match(/Math\.sin\(/g) || []).length;
                const cosMatches = (expr.match(/Math\.cos\(/g) || []).length;
                const tanMatches = (expr.match(/Math\.tan\(/g) || []).length;
                
                if (sinMatches > 0 || cosMatches > 0 || tanMatches > 0) {
                    // Count existing parentheses and add closing ones
                    const openCount = (expr.match(/\(/g) || []).length;
                    const closeCount = (expr.match(/\)/g) || []).length;
                    expr += ')'.repeat(Math.max(0, openCount - closeCount));
                }
            }

            // Evaluate the expression
            const result = eval(expr);

            // Check if result is valid
            if (isNaN(result) || !isFinite(result)) {
                this.display.value = 'Error';
            } else {
                // Round to avoid floating point errors
                const roundedResult = Math.round(result * 1000000000) / 1000000000;
                this.expression = String(roundedResult);
                this.updateDisplay();
                this.history.textContent = expr + ' =';
            }
        } catch (error) {
            this.display.value = 'Error';
            console.error('Calculation error:', error);
        }
    }

    updateDisplay() {
        this.display.value = this.expression || '0';
    }
}

// Factorial function
function factorial(n) {
    n = Math.floor(n);
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Initialize calculator
const calculator = new Calculator();

// Keyboard support
document.addEventListener('keydown', (e) => {
    const key = e.key;
    
    if (key >= '0' && key <= '9') {
        calculator.appendNumber(key);
    } else if (key === '.') {
        calculator.appendDecimal();
    } else if (key === '+' || key === '-' || key === '*') {
        calculator.appendOperator(key);
    } else if (key === '/') {
        e.preventDefault();
        calculator.appendOperator('/');
    } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculator.calculate();
    } else if (key === 'Backspace') {
        calculator.deleteChar();
    } else if (key === 'Escape') {
        calculator.clear();
    }
});
