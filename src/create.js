function addChildren(child, element) {
  const currentElement = element;
  if (child && Array.isArray(child)) {
    child.forEach((childElement) => childElement && currentElement.appendChild(childElement));
  } else if (child && typeof child === 'object') {
    currentElement.appendChild(child);
  } else if (child && typeof child === 'string') {
    currentElement.innerHTML = child;
  }
  return currentElement;
}

function addAttributes(element, classNames, child, parent, dataAttributes) {
  const attributeNames = /value|id|placeholder|cols|rows|autocorrect|spellcheck|src/;
  let currentElement = element;

  if (classNames) currentElement.classList.add(...classNames.split(' '));
  currentElement = addChildren(child, currentElement);
  if (parent) { parent.appendChild(currentElement); }

  if (dataAttributes.length) {
    dataAttributes.forEach(([attrName, attrValue]) => {
      if (attributeNames.test(attrName)) {
        currentElement.setAttribute(attrName, attrValue);
      } else {
        currentElement.dataset[attrName] = attrValue;
      }
    });
  }
  return currentElement;
}

export default function create(elementName, classNames, child, parent, ...dataAttributes) {
  let element = null;
  try {
    element = document.createElement(elementName);
  } catch (error) {
    throw new Error('Give a proper tag name');
  }

  element = addAttributes(element, classNames, child, parent, dataAttributes);
  return element;
}
