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

type HTMLPIPElement = HTMLElement & {
  pictureInPicture: {
    close: () => void;
  };
};

function createPictureInPicture(config: Config = {}): HTMLPIPElement {
  const overlay = document.createElement('div') as unknown as HTMLPIPElement;

  overlay.className = 'pipOverlay';
  overlay.style.top = '1em';
  overlay.style.left = '1em';

  const dragHandle = createDragHandle();

  let originalWidth: number | undefined, originalHeight: number | undefined;

  // Detect when the overlay is finally added to the DOM and get its original width. Then destroy the observer.
  let observer: MutationObserver;
  observer = new MutationObserver(() => {
    if (document.contains(overlay)) {
      originalWidth = overlay.clientWidth;
      originalHeight = overlay.clientHeight;

      overlay.style.width = `${originalWidth}px`;
      overlay.style.height = `${originalHeight}px`;

      observer.disconnect();
    }
  });

  observer.observe(document, {
    attributes: false,
    childList: true,
    characterData: false,
    subtree: true,
  });

  /* If the overlay is dramatically resized, move the control bar to the left instead of the top. */
  const maxWidth = 200;
  const shrunkenClass = 'shrunk';
  // Do not allow less than these pixels to be hidden.
  const dragLimit = 40;

  let isDragging = false;

  const moveOverlay = (event: DragEvent) => {
    const overlayNewY = event.pageY - dragHandle.offsetTop;

    const { innerHeight, innerWidth } = window;
    if (innerHeight - overlayNewY > dragLimit) {
      overlay.style.top = `${overlayNewY}px`;
      const overlayEndY = overlayNewY + originalHeight;

      const heightDifference = overlayEndY - innerHeight;

      if (heightDifference > 0) {
        overlay.style.height = `${originalHeight - heightDifference}px`;
      } else {
        delete overlay.style.height;
      }
    }

    const overlayNewX = event.pageX - dragHandle.offsetLeft;

    if (innerWidth - overlayNewX > dragLimit) {
      overlay.style.left = `${overlayNewX}px`;

      const overlayEndX = overlayNewX + originalWidth;

      const widthDifference = overlayEndX - innerWidth;

      let finalWidth: number;

      if (widthDifference > 0) {
        finalWidth = originalWidth - widthDifference;

        overlay.style.width = `${finalWidth}px`;
      } else {
        finalWidth = originalWidth;

        delete overlay.style.width;
      }

      if (finalWidth < maxWidth) {
        overlay.classList.add(shrunkenClass);
      } else {
        overlay.classList.remove(shrunkenClass);
      }
    }
  };

  const ondragover = (event: DragEvent) => {
    event.preventDefault();
  };

  const ondrop = moveOverlay;

  dragHandle.ondragstart = (event) => {
    isDragging = true;

    event.dataTransfer.dropEffect = 'move';

    window.addEventListener('dragover', ondragover);
    window.addEventListener('drop', ondrop);
  };

  dragHandle.ondrag = throttle(moveOverlay, 1000 / 60);

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

  overlay.pictureInPicture = {
    close: config.events?.onclose ?? (() => {}),
  };

  return overlay;
}

let currentPIP: HTMLPIPElement | undefined;
export default function openPictureInPicture(
  config: Config = {},
): HTMLPIPElement {
  if (currentPIP) {
    currentPIP.pictureInPicture.close();
    currentPIP.remove();
  }

  return (currentPIP = createPictureInPicture(config));
}
