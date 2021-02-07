/* eslint-disable arrow-parens */
import create from './create';
import sound from './assets/sound.wav';

function playSound(event) {
  const audio = document.querySelector('.audio');
  const target = event.target.closest('.field__key');

  if (!audio) return;

  target.classList.add('playing');
  audio.currentTime = 0;
  audio.play();
}
export default class Sounds {
  constructor(field) {
    this.Field = field;
  }

  init() {
    this.keySounds = Array.from(document.querySelectorAll('.field__key'));
    const fieldKeyElements = document.querySelectorAll('.field__key');

    fieldKeyElements.forEach((element) => element.addEventListener('mousedown', playSound));
    create('audio', 'audio', null, document.querySelector('main'), [
      'src',
      sound,
    ]);

    return this;
  }
}
