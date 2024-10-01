import throttle from 'lodash-es/throttle';

export interface Config {
  behavior?: {
    /** Automatically lock the overlay into one of the four quarters of the screen. */
    autoLock?: boolean;
  };
  events?: {
    onclose?: () => void;
  };
}

function createControlBar(): HTMLElement {
  const controlBar = document.createElement('div');

  controlBar.className = 'controlBar';

  return controlBar;
}

function createCloseButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'closeButton';

  button.textContent = '\u2716';

  return button;
}

export type HTMLPIPElement = HTMLElement & {
  pictureInPicture: {
    close: () => void;
  };
};

function createPictureInPicture(config: Config = {}): HTMLPIPElement {
  const overlay = document.createElement('div') as unknown as HTMLPIPElement;

  overlay.className = 'pipOverlay';
  overlay.style.top = '1em';
  overlay.style.left = '1em';

  // Detect when the overlay is finally added to the DOM and get its original width. Then destroy the observer.
  let originalWidth: number | undefined, originalHeight: number | undefined;
  let currentWidth: number | undefined, currentHeight: number | undefined;

  let observer: MutationObserver;
  observer = new MutationObserver(() => {
    if (document.contains(overlay)) {
      originalWidth = currentWidth = overlay.clientWidth;
      originalHeight = currentHeight = overlay.clientHeight;

      overlay.style.width = `${currentWidth}px`;
      overlay.style.height = `${currentHeight}px`;

      observer.disconnect();
    }
  });

  observer.observe(document, {
    attributes: false,
    childList: true,
    characterData: false,
    subtree: true,
  });

  const closeButton = createCloseButton();

  closeButton.onclick = config.events?.onclose ?? null;

  // beginning of control bar code

  const controlBar = createControlBar();

  controlBar.append(closeButton);

  controlBar.style.opacity = '0';

  // when the control bar is double-clicked, expand or shrink the overlay by twice its current size.
  // this is a mobile-specific feature.
  controlBar.ondblclick = () => {
    let newWidth, newHeight;

    if (overlay.clientWidth < originalWidth!) {
      currentWidth = originalWidth;
      currentHeight = originalHeight;
    } else {
      currentWidth = originalWidth! / 2;
      currentHeight = originalHeight! / 2;
    }

    newWidth = `${currentWidth}px`;
    newHeight = `${currentHeight}px`;

    overlay
      .animate([{ width: newWidth, height: newHeight }], { duration: 1000 / 6 })
      .finished.then(() => {
        overlay.style.width = newWidth;
        overlay.style.height = newHeight;
      });
  };

  // Dragging code
  controlBar.draggable = true;

  /* If the overlay is dramatically resized, move the control bar to the left instead of the top. */
  const shrunkenClass = 'shrunk';
  // Do not allow less than these pixels to be hidden.
  const dragLimit = 40;

  let isDragging = false;

  const autoLock = config?.behavior?.autoLock ?? false;

  const moveOverlay = (event: DragEvent) => {
    const overlayNewY = event.pageY - controlBar.offsetTop;

    const { innerHeight, innerWidth } = window;
    if (innerHeight - overlayNewY > dragLimit) {
      overlay.style.top = `${overlayNewY}px`;
      const overlayEndY = overlayNewY + currentHeight!;

      const heightDifference = overlayEndY - innerHeight;

      let finalHeight: number;

      if (heightDifference > 0) {
        finalHeight = currentHeight! - heightDifference;
      } else {
        finalHeight = currentHeight!;
      }

      overlay.style.height = `${finalHeight}px`;
    }

    const overlayNewX = event.pageX - controlBar.offsetLeft;

    if (innerWidth - overlayNewX > dragLimit) {
      overlay.style.left = `${overlayNewX}px`;

      const overlayEndX = overlayNewX + currentWidth!;

      const widthDifference = overlayEndX - innerWidth;

      let finalWidth: number;

      if (widthDifference > 0) {
        finalWidth = currentWidth! - widthDifference;
        overlay.classList.add(shrunkenClass);
      } else {
        finalWidth = currentWidth!;
        overlay.classList.remove(shrunkenClass);
      }

      overlay.style.width = `${finalWidth}px`;
    }
  };

  const ondragover = (event: DragEvent) => {
    event.preventDefault();
  };

  const ondrop = (event: DragEvent) => {
    isDragging = false;
    moveOverlay(event);

    if (autoLock) {
      const { x, y } = overlay.getBoundingClientRect();
      const isShrunk = overlay.classList.contains('shrunk');

      const { innerWidth, innerHeight } = window;

      const midpointX = innerWidth / 2;
      const midpointY = innerHeight / 2;

      let left: string;
      let top: string;

      if (isShrunk) {
        left = `${innerWidth - dragLimit}px`;
      } else if (x < midpointX) {
        left = '1em';
      } else {
        left = `calc(${innerWidth}px - ${overlay.clientWidth}px - 1em)`;
      }

      if (isShrunk) {
        top = `${y}px`;
      } else if (y < midpointY) {
        top = '1em';
      } else {
        top = `calc(${innerHeight}px - ${overlay.clientHeight}px - 1em)`;
      }

      overlay
        .animate([{ top, left }], { duration: 1000 / 6 })
        .finished.then(() => {
          overlay.style.top = top;
          overlay.style.left = left;
        });
    }
  };

  controlBar.ondragstart = (event) => {
    isDragging = true;

    const img = new Image();
    img.src =
      'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    event.dataTransfer!.setDragImage(img, 0, 0);
    event.dataTransfer!.dropEffect = 'move';

    window.addEventListener('dragover', ondragover);
    window.addEventListener('drop', ondrop);
  };

  controlBar.ondrag = throttle((event: DragEvent) => {
    if (isDragging) {
      moveOverlay(event);
    }
  }, 1000 / 60);

  controlBar.ondragend = () => {
    isDragging = false;

    window.removeEventListener('dragover', ondragover);
    window.removeEventListener('drop', ondrop);
  };

  // end of dragging code

  // end of control bar code

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
