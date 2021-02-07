import Field from './Field';
import 'normalize.css';
import './css/style.scss';
import * as storage from './storage';

const fieldSizes = [3, 4, 5, 6, 7, 8];

const chosenSize = storage.get('size');
const size = fieldSizes.indexOf(chosenSize) + 3;
const defaultSize = 4;
new Field(fieldSizes).init(size || defaultSize).generateLayout();
