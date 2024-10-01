import MiniplayerIcon from './assets/mini-player-svgrepo-com.svg';
import openPictureInPicture, {
  HTMLPIPElement,
  Config as PictureInPictureConfig,
} from './open-picture-in-picture';

type Config = {
  /** Whether the trigger should be replaced with the trigger's content in terms of its place in its parent. */
  replaceWith?: boolean;

  /** If there is already a PIP on the screen, attach the PIP to this element. This will initialize it with the screen "This is displayed ..." */
  existingPIP?: HTMLPIPElement;

  /** Overrides logic of the component. */
  onpipopened?: () => void;
  /** Overrides logic of the component. */
  onpipclosed?: () => void;

  /** Does not override component's logic. If 'onpipopened' is configured, this is not called. */
  onpipcreated?: (pipElement: HTMLPIPElement) => void;
  /** Does not override component's logic. This is called after the destruction. If 'onpipclosed' is configured, this is not called. */
  onpipdestroyed?: (pipElement: HTMLPIPElement) => void;
} & PictureInPictureConfig['behavior'];

interface CreateScreenConfig {
  height: number;
  width: number;
}

function createScreen({ width, height }: CreateScreenConfig): HTMLElement {
  const screen = document.createElement('p');
  screen.className = 'screen';

  screen.style.height = `${height}px`;
  screen.style.lineHeight = `${height}px`;
  screen.style.width = `${width}px`;

  screen.textContent = 'This is displayed in picture-in-picture.';

  return screen;
}

export default function createTriggerElement(
  content: Element,
  {
    replaceWith,
    onpipopened,
    onpipclosed,
    autoLock,
    existingPIP,
    onpipcreated,
    onpipdestroyed,
  }: Config = {},
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'triggerContainer';

  const triggerButton = document.createElement('button');
  triggerButton.className = 'triggerButton';

  const triggerIcon = document.createElement('img');
  triggerIcon.className = 'triggerButtonIcon';
  triggerIcon.src = MiniplayerIcon;

  triggerButton.appendChild(triggerIcon);

  let pip: HTMLPIPElement | undefined = existingPIP;

  let screen: HTMLElement;

  onpipclosed ||= () => {
    screen.remove();
    container.append(triggerButton, content);
    pip?.remove();
    onpipdestroyed?.(pip!);

    pip = undefined;
  };

  if (replaceWith) {
    content.replaceWith(container);
  }

  if (pip) {
    container.appendChild(content);

    // Initialize the screen-initialized trigger with the should-be calculated dimensions of the content.
    let observer: MutationObserver;
    observer = new MutationObserver(() => {
      if (document.contains(container)) {
        screen = createScreen({
          width: content.clientWidth,
          height: content.clientHeight,
        });

        content.remove();

        container.appendChild(screen);

        observer.disconnect();
      }
    });

    observer.observe(document, {
      attributes: false,
      childList: true,
      characterData: false,
      subtree: true,
    });

    const originalPIPClose = pip.pictureInPicture.close;

    pip.pictureInPicture.close = () => {
      originalPIPClose();
      onpipclosed();
    };
  } else {
    container.appendChild(triggerButton);

    container.appendChild(content);
  }

  onpipopened ||= () => {
    screen = createScreen({
      width: content.clientWidth,
      height: content.clientHeight,
    });

    triggerButton.remove();

    pip = openPictureInPicture({
      events: {
        onclose: onpipclosed,
      },
      behavior: {
        autoLock,
      },
    });

    pip.appendChild(content);

    container.appendChild(screen);

    document.body.appendChild(pip);

    onpipcreated?.(pip);
  };

  triggerButton.onclick = (event) => {
    event.preventDefault();
    onpipopened();
  };

  return container;
}
