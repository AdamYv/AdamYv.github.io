import React, { useState } from 'react';

export const Calculator: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string): number => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      case '=':
        return secondValue;
      default:
        return secondValue;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const buttons = [
    { label: 'C', onClick: clear, className: 'calc-button operator' },
    { label: '±', onClick: () => setDisplay(String(-parseFloat(display))), className: 'calc-button operator' },
    { label: '%', onClick: () => setDisplay(String(parseFloat(display) / 100)), className: 'calc-button operator' },
    { label: '÷', onClick: () => performOperation('÷'), className: 'calc-button operator' },
    
    { label: '7', onClick: () => inputNumber('7'), className: 'calc-button' },
    { label: '8', onClick: () => inputNumber('8'), className: 'calc-button' },
    { label: '9', onClick: () => inputNumber('9'), className: 'calc-button' },
    { label: '×', onClick: () => performOperation('×'), className: 'calc-button operator' },
    
    { label: '4', onClick: () => inputNumber('4'), className: 'calc-button' },
    { label: '5', onClick: () => inputNumber('5'), className: 'calc-button' },
    { label: '6', onClick: () => inputNumber('6'), className: 'calc-button' },
    { label: '-', onClick: () => performOperation('-'), className: 'calc-button operator' },
    
    { label: '1', onClick: () => inputNumber('1'), className: 'calc-button' },
    { label: '2', onClick: () => inputNumber('2'), className: 'calc-button' },
    { label: '3', onClick: () => inputNumber('3'), className: 'calc-button' },
    { label: '+', onClick: () => performOperation('+'), className: 'calc-button operator' },
    
    { label: '0', onClick: () => inputNumber('0'), className: 'calc-button', style: { gridColumn: 'span 2' } },
    { label: '.', onClick: inputDecimal, className: 'calc-button' },
    { label: '=', onClick: handleEquals, className: 'calc-button operator' },
  ];

  return (
    <div className="calculator">
      <div className="calculator-display">
        {display}
      </div>
      <div className="calculator-buttons">
        {buttons.map((button, index) => (
          <button
            key={index}
            className={button.className}
            onClick={button.onClick}
            style={button.style}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
};