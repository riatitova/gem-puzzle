/* eslint-disable arrow-parens */
/* eslint-disable no-alert */
import * as storage from './storage';
import create from './create';
import Menu from './Menu';
import Sounds from './Sounds';

const main = create('main', 'main', [
  create('h1', 'title', '15 puzzle'),
  create('div', 'menu', null),
  create('button', 'menu__playAgainBtn', 'Play again'),
  create('button', 'menu__btn', 'Menu'),
]);

const victoryCombination3by3 = [1, 2, 3, 4, 5, 6, 7, 8, 0];
const victoryCombination4by4 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];

function getIndexOfNumber(array, number) {
  const minIndexValue = -1;
  let indexOfNumber = [];
  for (let i = 0; i < array.length; i += 1) {
    const index = array[i].indexOf(+number);
    if (index > minIndexValue) {
      indexOfNumber = [i, index];
      break;
    }
  }
  return indexOfNumber;
}

function swap(firstNode, secondNode) {
  const afterSecondNode = secondNode.nextElementSibling;
  const parent = secondNode.parentNode;

  if (firstNode === afterSecondNode) {
    parent.insertBefore(firstNode, secondNode);
  } else {
    firstNode.replaceWith(secondNode);
    parent.insertBefore(firstNode, afterSecondNode);
  }
}

function compare(...arrays) {
  const [first, second] = arrays.map(array => array);
  return (
    first.length === second.length && first.every((value, index) => value === second[index])
  );
}

function countInversions(array, emptyCell, parity, iterator) {
  let changedParity = parity;
  for (let j = iterator + 1; j < array.length; j += 1) {
    if (array[iterator] > array[j] && array[j] !== emptyCell) {
      changedParity += 1;
    }
  }
  return changedParity;
}

function isSolvable(width, even, zeroRow, parity) {
  if (width % 2 === even) {
    if (zeroRow % 2 === even) {
      return parity % 2 === even;
    }
    return parity % 2 !== even;
  }
  return parity % 2 === even;
}

function checkField(numbers) {
  const array = [...numbers];
  const width = Math.sqrt(array.length);
  const rowStart = 0;
  const emptyCell = 0;
  const even = 0;
  let parity = 0;
  let currentRow = 0;
  let zeroRow = 0;
  for (let i = 0; i < array.length; i += 1) {
    if (i % width === rowStart) {
      currentRow += 1;
    }
    if (array[i] === emptyCell) {
      zeroRow = currentRow;
    } else {
      parity = countInversions(array, emptyCell, parity, i);
    }
  }
  return isSolvable(width, even, zeroRow, parity);
}

const getRandomInt = max => Math.floor(Math.random() * Math.floor(max));
export default class Field {
  constructor(fieldSizes) {
    this.fieldSizes = fieldSizes;
    this.counter = 0;
  }

  init(fieldSize) {
    this.fieldSize = fieldSize;
    this.container = create('div', 'field', null, main);
    document.body.prepend(main);
    return this;
  }

  generateLayout() {
    const cells = [];
    const numSet = new Set();
    const currentSize = this.fieldSize * this.fieldSize;

    function generateRandomField() {
      while (numSet.size < currentSize) {
        numSet.add(getRandomInt(currentSize));
      }
      return numSet;
    }

    const getFieldNumbers = () => {
      let iter = 0;
      while (!checkField(numSet)) {
        numSet.clear();
        generateRandomField();
      }
      const numbersSet = [...numSet];
      for (let i = 0; i < this.fieldSize; i += 1) {
        cells[i] = [];
        for (let inside = 0; inside < this.fieldSize; inside += 1) {
          cells[i].push(numbersSet[iter]);
          iter += 1;
        }
      }
    };

    const fillField = () => {
      const darkBlueColor = '#2F2963';
      const emptyCell = 0;
      for (let i = 0; i < this.fieldSize; i += 1) {
        for (let j = 0; j < this.fieldSize; j += 1) {
          const letter = create('div', 'letter', `${cells[i][j]}`);
          const divElement = create('div', 'field__key', letter, null, [
            'number',
            `${cells[i][j]}`,
          ]);
          this.container.appendChild(divElement);
          if (cells[i][j] === emptyCell) {
            divElement.style.backgroundColor = darkBlueColor;
            divElement.firstChild.remove();
          }
          this.container.style.gridTemplateColumns = `repeat(${this.fieldSize}, 1fr)`;
        }
      }
    };

    generateRandomField();
    getFieldNumbers();
    new Menu(this).generateMenu();
    fillField();
    this.cells = cells;
    new Sounds(this).init();
    this.playAgain();

    this.container.addEventListener('mousedown', event => {
      event.stopPropagation();
      const cellDiv = event.target.closest('.field__key');
      if (!cellDiv) return;
      const {
        dataset: { number },
      } = cellDiv;
      const cellIndex = getIndexOfNumber(cells, number);
      if (!cellIndex) { return; }
      this.move(number, cellIndex);
      this.checkVictory();
    });
  }

  move(number, cellIndex) {
    const cells = [...this.cells];
    const emptyCell = 0;
    const minDistance = 1;
    const tooFar = [2, 2];
    const zeroKey = document.querySelector('[data-number="0"]');
    const zeroCellIndex = getIndexOfNumber(cells, emptyCell);
    const currentNumber = document.querySelector(`[data-number='${number}']`);
    const x = cellIndex[0];
    const y = cellIndex[1];
    const xZero = zeroCellIndex[0];
    const yZero = zeroCellIndex[1];

    const closestCell = cellIndex.map((item, index) => {
      const distance = Math.abs(item - zeroCellIndex[index]);
      return distance > minDistance ? tooFar : distance;
    });

    const differenceByX = 0;
    const differenceByY = 1;
    const isClose = closestCell.includes(differenceByX) && closestCell.includes(differenceByY);

    if (isClose) {
      swap(currentNumber, zeroKey);
      const counter = document.querySelector('.menu__counter');
      this.counter += 1;
      counter.innerHTML = `move: ${this.counter}`;
      storage.set('counter', this.counter);
      const tmp = this.cells[x][y];
      this.cells[x][y] = this.cells[xZero][yZero];
      this.cells[xZero][yZero] = tmp;
    }
  }

  checkVictory() {
    const field3by3Size = 3;
    const field4by4Size = 4;

    if (storage.get('size') === field3by3Size) {
      const simpleArray = this.cells.flat();
      if (compare(simpleArray, victoryCombination3by3)) {
        alert(`Ура! Вы решили головоломку за ${storage.get('time')} и ${storage.get('move')} ходов`);
      }
    }
    if (storage.get('size') === field4by4Size) {
      const simpleArray = this.cells.flat();
      if (compare(simpleArray, victoryCombination4by4)) {
        alert(`Ура! Вы решили головоломку за ${storage.get('time')} и ${storage.get('move')} ходов`);
      }
    }
  }

  playAgain() {
    const menu = document.querySelector('.menu');
    const playAgainBtn = document.querySelector('.menu__playAgainBtn');

    playAgainBtn.addEventListener('click', () => {
      const counter = document.querySelector('.menu__counter');
      const time = document.querySelector('.menu__time');
      main.removeChild(this.container);
      menu.removeChild(time);
      this.counter = 0;
      storage.set('counter', 0);
      menu.removeChild(counter);
      this.container = create('div', 'field', null, main);
      this.generateLayout();
    });
  }
}
