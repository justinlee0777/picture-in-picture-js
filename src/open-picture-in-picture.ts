import throttle from 'lodash-es/throttle';

interface Config {
  events?: {
    onclose?: () => void;
  };
}

function createControlBar(): HTMLElement {
  const controlBar = document.createElement('div');

  controlBar.className = 'controlBar';

  return controlBar;
}

function createDragHandle(): HTMLElement {
  const handle = document.createElement('div');
  handle.className = 'dragHandle';

  handle.draggable = true;

  handle.textContent = '\u2725';

  return handle;
}

function createCloseButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'closeButton';

  button.textContent = '\u2716';

  return button;
}

export default function openPictureInPicture(config: Config = {}): HTMLElement {
  const overlay = document.createElement('div');

  overlay.className = 'pipOverlay';

  const dragHandle = createDragHandle();

  // Slight offset on the dragging coordinates so the cursor is still somewhat center on the drag icon.
  const offset = 10;
  let isDragging = false;

  const ondragover = (event: DragEvent) => {
    event.preventDefault();
  };

  const ondrop = (event) => {
    event.preventDefault();
    overlay.style.top = `${event.pageY - offset}px`;
    overlay.style.left = `${event.pageX - offset}px`;
  };

  dragHandle.ondragstart = (event) => {
    isDragging = true;

    event.dataTransfer.dropEffect = 'move';

    window.addEventListener('dragover', ondragover);
    window.addEventListener('drop', ondrop);
  };

  dragHandle.ondrag = throttle((event: DragEvent) => {
    overlay.style.top = `${event.pageY - offset}px`;
    overlay.style.left = `${event.pageX - offset}px`;
  }, 1000 / 60);

  dragHandle.ondragend = () => {
    isDragging = false;

    window.removeEventListener('dragover', ondragover);
    window.removeEventListener('drop', ondrop);
  };

  const closeButton = createCloseButton();

  closeButton.onclick = config.events?.onclose;

  const controlBar = createControlBar();

  controlBar.append(dragHandle, closeButton);

  controlBar.style.opacity = '0';

  overlay.append(controlBar);

  overlay.onmouseenter = () => {
    controlBar.style.opacity = '1';
  };

  overlay.onmouseleave = () => {
    if (!isDragging) {
      controlBar.style.opacity = '0';
    }
  };

  return overlay;
}
