import MiniplayerIcon from './assets/mini-player-svgrepo-com.svg';
import iconSize from './consts/icon-size';
import openPictureInPicture from './open-picture-in-picture';

interface Config {
  onpipopened?: () => void;
  onpipclosed?: () => void;
}

interface CreateScreenConfig {
  height: number;
  width: number;
}

function createScreen({ width, height }: CreateScreenConfig): HTMLElement {
  const screen = document.createElement('p');

  screen.style.backgroundColor = 'black';
  screen.style.color = 'white';
  screen.style.lineHeight = `${height}px`;
  screen.style.height = `${height}px`;
  screen.style.textAlign = 'center';
  screen.style.width = `${width}px`;
  screen.style.verticalAlign = 'middle';

  // TODO customizable
  screen.textContent = 'This is displayed in picture-in-picture.';

  return screen;
}

/**
 * TODO Keep track of the PIP on the screen, so that triggers will close properly
 */
export default function createTriggerElement(
  content: Element,
  { onpipopened, onpipclosed }: Config = {},
): HTMLElement {
  const container = document.createElement('div');

  container.style.position = 'relative';

  const triggerButton = document.createElement('button');
  const triggerIconSize = '1em';

  triggerButton.style.alignItems = 'center';
  triggerButton.style.backgroundColor = 'grey';
  triggerButton.style.border = '0';
  triggerButton.style.borderRadius = '50%';
  triggerButton.style.display = 'flex';
  triggerButton.style.flexDirection = 'column';
  triggerButton.style.fontSize = '1rem';
  triggerButton.style.height = iconSize;
  triggerButton.style.justifyContent = 'center';
  triggerButton.style.width = iconSize;
  triggerButton.style.lineHeight = iconSize;
  triggerButton.style.padding = '0';

  const triggerIcon = document.createElement('img');
  triggerIcon.src = MiniplayerIcon;
  triggerIcon.style.height = triggerIconSize;
  triggerIcon.style.width = triggerIconSize;

  triggerButton.appendChild(triggerIcon);

  container.appendChild(triggerButton);

  triggerButton.style.position = 'absolute';
  triggerButton.style.top = '0';
  triggerButton.style.left = '0';
  triggerButton.style.transform = 'translate(-25%, -25%)';

  container.appendChild(content);

  // todo
  let pip: HTMLElement | undefined;

  let screen: HTMLElement;

  onpipclosed ||= () => {
    screen.remove();
    container.append(triggerButton, content);
    pip?.remove();
  };

  onpipopened ||= () => {
    screen = createScreen({
      width: content.clientWidth,
      height: content.clientHeight,
    });

    triggerButton.remove();

    // todo check if already exists
    pip = openPictureInPicture();

    pip.appendChild(content);

    container.appendChild(screen);

    document.body.appendChild(pip);
  };

  triggerButton.onclick = (event) => {
    event.preventDefault();
    onpipopened();
  };

  return container;
}
