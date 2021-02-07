/* eslint-disable arrow-parens */
import create from './create';
import * as storage from './storage';

let timeStart;

function addZeroBeforeDigit(number) {
  const decimal = 10;
  return (parseInt(number, decimal) < 10 ? '0' : '') + number;
}

function updateTime() {
  const time = document.querySelector('.menu__time');
  const timeEnd = Date.now();
  const result = timeEnd - timeStart;
  const minutes = Math.floor(result / 1000 / 60);
  const seconds = Math.floor(result / 1000 - minutes * 60);
  time.innerHTML = `time: ${addZeroBeforeDigit(minutes)}<span>:</span>${addZeroBeforeDigit(seconds)}`;
  storage.set('time', time.innerText);
}
export default class Menu {
  constructor(field) {
    this.fieldSize = field.fieldSize;
    this.fieldSizes = field.fieldSizes;
    this.Field = field;
  }

  generateMenu() {
    const menu = document.querySelector('.menu');
    const menuBtn = document.querySelector('.menu__btn');
    const amountOfSizes = 6;
    const closeSign = '&times;';
    const updatingTime = 1000;
    create('time', 'menu__time', storage.get('time') || 'time: 00:00', menu);
    create('span', 'menu__counter', storage.get('counter') || 'move: 0', menu);
    const playAgainBtn = document.querySelector('.menu__playAgainBtn');
    timeStart = Date.now();
    const modalWindow = create('div', 'modal', null, document.body);
    const modalContent = create('div', 'content', null, modalWindow);
    create('button', 'content__sizeBtn', 'Field size', modalContent);
    create('button', 'content__saveBtn', 'Save game', modalContent);
    create('button', 'content__topBtn', 'Top 10', modalContent);
    create('button', 'content__soundsBtn', 'Sounds on/off', modalContent);
    const dropdown = create('select', 'dropdown', null, modalContent);

    for (let i = 0; i < amountOfSizes; i += 1) {
      const currentFieldSize = i + 3;
      create(
        'option',
        'option',
        `${currentFieldSize}x${currentFieldSize}`,
        dropdown,
        ['value', `[${currentFieldSize},${currentFieldSize}]`],
        ['option', ''],
      );
    }
    create('span', 'modal__closeBtn', closeSign, modalContent);

    setInterval(updateTime, updatingTime);
    menu.appendChild(playAgainBtn);
    menu.appendChild(menuBtn);
    menuBtn.addEventListener('click', () => this.openMenu());
    return this;
  }

  openMenu() {
    const modalWindow = document.querySelector('.modal');
    const sizeBtn = document.querySelector('.content__sizeBtn');
    const dropdown = document.querySelector('.dropdown');
    const closeBtn = document.querySelector('.modal__closeBtn');
    const saveBtn = document.querySelector('.content__saveBtn');
    const soundsBtn = document.querySelector('.content__soundsBtn');
    this.isSoundOn = true;
    modalWindow.style.display = 'flex';
    saveBtn.innerHTML = 'Save game';

    sizeBtn.addEventListener('click', () => {
      dropdown.style.display = 'block';
    });

    dropdown.addEventListener('click', () => {
      this.beforeSelected = this.selectedEl;
      this.selectedEl = dropdown.selectedIndex;
      storage.set('size', this.selectedEl + 3);
      if (this.beforeSelected === undefined) { return; }
      if (this.beforeSelected === this.selectedEl) { return; }
      const time = document.querySelector('.menu__time');
      const menu = document.querySelector('.menu');
      const counter = document.querySelector('.menu__counter');
      const main = document.querySelector('main');
      const field = document.querySelector('.field');
      main.removeChild(field);
     // main.removeChild(document.querySelector('.menu__playAgainBtn'));
      menu.removeChild(time);
      this.Field.counter = 0;
      storage.set('counter', 0);
      menu.removeChild(counter);
      const chosenSize = storage.get('size');
      const sizeIndex = this.fieldSizes.indexOf(chosenSize);
      const currentSize = sizeIndex + 3;
      const defaultSize = 4;
      this.Field.init(currentSize || defaultSize).generateLayout();
      dropdown.style.display = 'none';
    });

    soundsBtn.addEventListener('click', () => {
      if (this.isSoundOn) {
        this.isSoundOn = false;
        Array.from(document.querySelectorAll('.audio')).forEach(audio => {
          const sound = audio;
          sound.muted = true;
        });
        soundsBtn.innerText = 'Sounds turnedOff';
      } else {
        Array.from(document.querySelectorAll('audio')).forEach(audio => {
          const sound = audio;
          sound.muted = false;
        });
        this.isSoundOn = true;
        soundsBtn.innerText = 'Sounds turnedOn';
      }
    });
    saveBtn.addEventListener('click', () => {
      storage.set('keyButtons', this.Field.keyButtons);
      storage.set('time', document.querySelector('.menu__time'));
      saveBtn.innerHTML = 'Saved';
    });

    closeBtn.addEventListener('click', () => {
      modalWindow.style.display = 'none';
    });

    window.onclick = (event) => {
      if (event.target === modalWindow) {
        modalWindow.style.display = 'none';
      }
    };
    return this;
  }
}
