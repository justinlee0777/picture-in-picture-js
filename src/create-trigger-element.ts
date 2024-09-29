import MiniplayerIcon from './assets/mini-player-svgrepo-com.svg';
import openPictureInPicture, {
  Config as PictureInPictureConfig,
} from './open-picture-in-picture';

type Config = {
  onpipopened?: () => void;
  onpipclosed?: () => void;
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
  { onpipopened, onpipclosed, autoLock }: Config = {},
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'triggerContainer';

  const triggerButton = document.createElement('button');
  triggerButton.className = 'triggerButton';

  const triggerIcon = document.createElement('img');
  triggerIcon.className = 'triggerButtonIcon';
  triggerIcon.src = MiniplayerIcon;

  triggerButton.appendChild(triggerIcon);

  container.appendChild(triggerButton);

  container.appendChild(content);

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
  };

  triggerButton.onclick = (event) => {
    event.preventDefault();
    onpipopened();
  };

  return container;
}
