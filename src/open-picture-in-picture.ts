import throttle from 'lodash-es/throttle';
import iconSize from './consts/icon-size';

interface Config {
  events?: {
    onclose?: () => void;
  };
}

function createDragHandle(): HTMLElement {
  const handle = document.createElement('div');

  handle.draggable = true;

  handle.style.backgroundColor = 'grey';
  handle.style.borderRadius = '50%';
  handle.style.height = iconSize;
  handle.style.width = iconSize;
  handle.style.lineHeight = iconSize;
  handle.style.textAlign = 'center';
  handle.style.verticalAlign = 'middle';

  handle.textContent = '\u2725';

  return handle;
}

function createCloseButton(): HTMLButtonElement {
  const button = document.createElement('button');

  button.style.backgroundColor = 'grey';
  button.style.border = '0';
  button.style.borderRadius = '50%';
  button.style.fontSize = '1rem';
  button.style.height = iconSize;
  button.style.width = iconSize;
  button.style.lineHeight = iconSize;
  button.style.padding = '0';
  button.style.textAlign = 'center';
  button.style.verticalAlign = 'middle';

  button.textContent = '\u2716';

  return button;
}

export default function openPictureInPicture(config: Config = {}): HTMLElement {
  const overlay = document.createElement('div');

  overlay.style.borderRadius = '4px';
  overlay.style.overflow = 'hidden';
  overlay.style.padding = '.5em';
  overlay.style.position = 'fixed';
  overlay.style.resize = 'both';

  overlay.onresize = (event) => {
    event.preventDefault();
  };

  const dragHandle = createDragHandle();

  dragHandle.style.position = 'absolute';
  dragHandle.style.transform = 'translate(-25%, -25%)';

  const closeButton = createCloseButton();

  closeButton.style.position = 'absolute';
  closeButton.style.left = `calc(${iconSize} * 3/2)`;
  closeButton.style.transform = 'translate(-25%, -25%)';

  closeButton.onclick = config.events?.onclose;

  overlay.append(closeButton);

  dragHandle.ondrag = throttle((event: DragEvent) => {
    event.preventDefault();

    event.dataTransfer.setDragImage(document.createElement('div'), 0, 0);

    overlay.style.top = `${event.pageY}px`;
    overlay.style.left = `${event.pageX}px`;
  }, 1000 / 60);

  overlay.appendChild(dragHandle);

  return overlay;
}
