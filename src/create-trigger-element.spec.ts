jest.mock('./assets/mini-player-svgrepo-com.svg', () => () => './example.png');

jest.mock('./open-picture-in-picture', () => ({ events }) => {
  const overlay = document.createElement('div');

  overlay.className = 'pipOverlay';

  (overlay as any).pictureInPicture = {
    close: events.onclose,
  };

  return overlay;
});

import createTriggerElement from './create-trigger-element';
import { HTMLPIPElement } from './open-picture-in-picture';

describe('createTriggerElement', () => {
  let content: HTMLElement;

  beforeEach(() => {
    content = document.createElement('p');

    content.textContent =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
  });

  afterEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  });

  test('creates', () => {
    const triggerElement = createTriggerElement(content);

    expect(triggerElement.className).toBe('triggerContainer');

    const triggerButton = triggerElement.querySelector('.triggerButton');

    expect(triggerButton).toBeTruthy();

    expect(triggerButton!.querySelector('.triggerButtonIcon')).toBeTruthy();

    expect(triggerElement.contains(content)).toBe(true);
  });

  test('opens the picture-in-picture', () => {
    const triggerElement = createTriggerElement(content);

    expect(triggerElement.querySelector('.screen')).toBeFalsy();

    const triggerButton = triggerElement.querySelector(
      '.triggerButton',
    )! as HTMLElement;

    triggerButton.click();

    expect(triggerElement.querySelector('.triggerButton')).toBeFalsy();
    expect(triggerElement.contains(content)).toBe(false);

    const screen = triggerElement.querySelector('.screen')!;

    expect(screen).toBeTruthy();
    expect(screen.textContent).toBe('This is displayed in picture-in-picture.');

    const pip = document.body.querySelector('.pipOverlay')!;

    expect(pip).toBeTruthy();
    expect(pip.contains(content)).toBe(true);
  });

  test('closes the picture-in-picture', () => {
    const triggerElement = createTriggerElement(content);

    const triggerButton = triggerElement.querySelector(
      '.triggerButton',
    )! as HTMLElement;

    triggerButton.click();

    const pip = document.body.querySelector('.pipOverlay')! as HTMLPIPElement;

    pip.pictureInPicture.close();

    expect(triggerElement.querySelector('.triggerButton')).toBeTruthy();
    expect(triggerElement.querySelector('.screen')).toBeFalsy();
    expect(document.body.querySelector('.pipOverlay')).toBeFalsy();
    expect(triggerElement.contains(content));
  });
});