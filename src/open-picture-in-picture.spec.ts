jest.mock('lodash-es/throttle', () => (fn) => fn);

import openPictureInPicture from './open-picture-in-picture';

describe('openPictureInPicture()', () => {
  function createMockDragEvent(
    type: 'dragstart' | 'drag' | 'dragend' | 'drop',
    pageY: number,
    pageX: number,
  ): DragEvent {
    const event = new Event(type) as any;

    event.pageX = pageX;
    event.pageY = pageY;

    event.dataTransfer = {
      setDragImage: jest.fn(),
    };

    return event;
  }

  function createMockTouchEvent(
    type: 'touchstart' | 'touchmove' | 'touchend',
    clientY: number,
    clientX: number,
  ): TouchEvent {
    const event = new Event(type) as any;

    if (type !== 'touchend') {
      event.touches = [
        {
          clientX,
          clientY,
        },
      ];
    } else {
      event.changedTouches = [
        {
          clientX,
          clientY,
        },
      ];
    }

    return event;
  }

  afterEach(() => {
    document.getElementsByTagName('html')[0].innerHTML = '';
  });

  test('opens', () => {
    const pip = openPictureInPicture();

    expect(pip.className).toBe('pipOverlay');

    const controlBar = pip.querySelector('.controlBar')!;

    expect(controlBar).toBeTruthy();

    expect(controlBar.querySelector('.closeButton')).toBeTruthy();
  });

  test('starts PIP at the top-left corner', () => {
    const pip = openPictureInPicture();

    expect(pip.style.top).toBe('1em');
    expect(pip.style.left).toBe('1em');
  });

  test('opens only one PIP at a time', () => {
    const pip1 = openPictureInPicture();

    document.body.appendChild(pip1);

    const pip2 = openPictureInPicture();

    document.body.appendChild(pip2);

    expect(document.querySelectorAll('.pipOverlay').length).toBe(1);

    expect(document.body.contains(pip1)).toBe(false);
  });

  test('initializes width and height', async () => {
    const content = document.createElement('p');

    content.textContent =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

    const pip = openPictureInPicture();

    pip.appendChild(content);

    // JSDOM does no sizing
    jest.spyOn(pip, 'clientWidth', 'get').mockReturnValue(150);
    jest.spyOn(pip, 'clientHeight', 'get').mockReturnValue(300);

    document.body.appendChild(pip);

    await new Promise(process.nextTick);

    expect(pip.style.width).toBe('150px');
    expect(pip.style.height).toBe('300px');
  });

  test('shrinks the PIP', async () => {
    const content = document.createElement('p');

    content.textContent =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

    const pip = openPictureInPicture();

    pip.appendChild(content);

    // JSDOM does no sizing
    jest.spyOn(pip, 'clientWidth', 'get').mockReturnValue(150);
    jest.spyOn(pip, 'clientHeight', 'get').mockReturnValue(300);

    document.body.appendChild(pip);

    await new Promise(process.nextTick);

    pip.animate = () => ({ finished: Promise.resolve() }) as any;

    const controlBar = pip.querySelector('.controlBar')!;

    controlBar.dispatchEvent(new MouseEvent('dblclick'));

    await new Promise((resolve) => setTimeout(resolve, 1000 / 6));

    expect(pip.style.width).toBe('75px');
    expect(pip.style.height).toBe('150px');
  });

  test('moves the PIP', async () => {
    const content = document.createElement('p');

    content.textContent =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

    const pip = openPictureInPicture();

    pip.appendChild(content);

    document.body.appendChild(pip);

    await new Promise(process.nextTick);

    const controlBar = pip.querySelector('.controlBar')!;

    controlBar.dispatchEvent(createMockDragEvent('dragstart', 0, 0));

    controlBar.dispatchEvent(createMockDragEvent('drag', 150, 150));

    expect(pip.style.top).toBe('150px');
    expect(pip.style.left).toBe('150px');

    controlBar.dispatchEvent(createMockDragEvent('drag', 75, 225));

    expect(pip.style.top).toBe('75px');
    expect(pip.style.left).toBe('225px');

    window.dispatchEvent(createMockDragEvent('drop', 100, 100));

    expect(pip.style.top).toBe('100px');
    expect(pip.style.left).toBe('100px');

    controlBar.dispatchEvent(createMockDragEvent('dragend', 0, 0));

    window.dispatchEvent(createMockDragEvent('drop', 225, 225));

    expect(pip.style.top).toBe('225px');
    expect(pip.style.left).toBe('225px');
  });

  test('does not move the PIP past a certain point', async () => {
    const content = document.createElement('p');

    content.textContent =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

    const pip = openPictureInPicture();

    pip.appendChild(content);

    document.body.appendChild(pip);

    await new Promise(process.nextTick);

    const controlBar = pip.querySelector('.controlBar')!;

    controlBar.dispatchEvent(createMockDragEvent('dragstart', 0, 0));

    controlBar.dispatchEvent(createMockDragEvent('drag', 150, 1000));
    expect(pip.style.top).toBe('150px');
    expect(pip.style.left).toBe('1em');

    controlBar.dispatchEvent(createMockDragEvent('drag', 1000, 150));
    expect(pip.style.top).toBe('150px');
    expect(pip.style.left).toBe('150px');
  });

  test('shrinks the PIP when going off bounds of the window', async () => {
    const content = document.createElement('p');

    content.textContent =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

    const pip = openPictureInPicture();

    pip.appendChild(content);

    // JSDOM does no sizing
    jest.spyOn(pip, 'clientWidth', 'get').mockReturnValue(150);
    jest.spyOn(pip, 'clientHeight', 'get').mockReturnValue(300);

    document.body.appendChild(pip);

    await new Promise(process.nextTick);

    const controlBar = pip.querySelector('.controlBar')!;

    controlBar.dispatchEvent(createMockDragEvent('dragstart', 0, 0));

    controlBar.dispatchEvent(createMockDragEvent('drag', 628, 924));

    expect(pip.style.top).toBe('628px');
    expect(pip.style.left).toBe('924px');
    expect(pip.style.height).toBe('140px');
    expect(pip.style.width).toBe('100px');
  });

  test('autolocks PIP on the corners of the screen', async () => {
    const content = document.createElement('p');

    content.textContent =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

    const pip = openPictureInPicture({ behavior: { autoLock: true } });

    pip.appendChild(content);

    // JSDOM does no sizing
    jest.spyOn(pip, 'clientWidth', 'get').mockReturnValue(150);
    jest.spyOn(pip, 'clientHeight', 'get').mockReturnValue(300);

    document.body.appendChild(pip);

    await new Promise(process.nextTick);

    const controlBar = pip.querySelector('.controlBar')!;

    pip.animate = () => ({ finished: Promise.resolve() }) as any;

    let originX = 100,
      originY = 100;

    jest
      .spyOn(pip, 'getBoundingClientRect')
      .mockImplementation(() => ({ x: originX, y: originY }) as any);

    controlBar.dispatchEvent(createMockDragEvent('dragstart', 0, 0));

    window.dispatchEvent(createMockDragEvent('drop', originY, originX));

    await new Promise((resolve) => setTimeout(resolve, 1000 / 6));

    controlBar.dispatchEvent(createMockDragEvent('dragend', 0, 0));

    expect(pip.style.top).toBe('1em');
    expect(pip.style.left).toBe('1em');

    originX = 1000;
    originY = 100;

    controlBar.dispatchEvent(createMockDragEvent('dragstart', 0, 0));

    window.dispatchEvent(createMockDragEvent('drop', originY, originX));

    await new Promise((resolve) => setTimeout(resolve, 1000 / 6));

    controlBar.dispatchEvent(createMockDragEvent('dragend', 0, 0));

    expect(pip.style.top).toBe('1em');
    expect(pip.style.left).toBe('calc(1024px - 150px - 1em)');

    originX = 1000;
    originY = 700;

    controlBar.dispatchEvent(createMockDragEvent('dragstart', 0, 0));

    window.dispatchEvent(createMockDragEvent('drop', originY, originX));

    await new Promise((resolve) => setTimeout(resolve, 1000 / 6));

    controlBar.dispatchEvent(createMockDragEvent('dragend', 0, 0));

    expect(pip.style.top).toBe('calc(768px - 300px - 1em)');
    expect(pip.style.left).toBe('calc(1024px - 150px - 1em)');

    originX = 100;
    originY = 700;

    controlBar.dispatchEvent(createMockDragEvent('dragstart', 0, 0));

    window.dispatchEvent(createMockDragEvent('drop', originY, originX));

    await new Promise((resolve) => setTimeout(resolve, 1000 / 6));

    controlBar.dispatchEvent(createMockDragEvent('dragend', 0, 0));

    expect(pip.style.top).toBe('calc(768px - 300px - 1em)');
    expect(pip.style.left).toBe('1em');
  });

  test('automatically slides the overlay to the side when autolock is enabled', async () => {
    const content = document.createElement('p');

    content.textContent =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

    const pip = openPictureInPicture({ behavior: { autoLock: true } });

    pip.appendChild(content);

    // JSDOM does no sizing
    jest.spyOn(pip, 'clientWidth', 'get').mockReturnValue(150);
    jest.spyOn(pip, 'clientHeight', 'get').mockReturnValue(300);

    document.body.appendChild(pip);

    await new Promise(process.nextTick);

    const controlBar = pip.querySelector('.controlBar')!;

    pip.animate = () => ({ finished: Promise.resolve() }) as any;

    let originX = 900,
      originY = 100;

    jest
      .spyOn(pip, 'getBoundingClientRect')
      .mockImplementation(() => ({ x: originX, y: originY }) as any);

    controlBar.dispatchEvent(createMockDragEvent('dragstart', 0, 0));

    window.dispatchEvent(createMockDragEvent('drop', originY, originX));

    await new Promise((resolve) => setTimeout(resolve, 1000 / 6));

    expect(pip.style.top).toBe('100px');
    expect(pip.style.left).toBe('984px');
  });

  test("closes the overlay properly if the overlay's close is modified (bit of a hack tbh)", () => {
    const content = document.createElement('p');

    content.textContent =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

    const pip = openPictureInPicture({ behavior: { autoLock: true } });

    pip.appendChild(content);

    const spy = jest.fn();

    const originalClose = pip.pictureInPicture.close;

    pip.pictureInPicture.close = () => {
      originalClose();
      spy();
    };

    const closeButton = pip.querySelector('.closeButton')! as HTMLButtonElement;

    closeButton.click();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  test('closes the overlay with a touch', () => {
    const content = document.createElement('p');

    content.textContent =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

    const onclose = jest.fn();
    const pip = openPictureInPicture({
      behavior: { autoLock: true },
      events: { onclose },
    });

    pip.appendChild(content);

    const closeButton = pip.querySelector('.closeButton')! as HTMLButtonElement;

    closeButton.ontouchstart!(createMockTouchEvent('touchstart', 0, 0));

    expect(onclose).toHaveBeenCalledTimes(1);
  });

  test('touch-drags on mobile', async () => {
    const content = document.createElement('p');

    content.textContent =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

    const pip = openPictureInPicture({ behavior: { autoLock: true } });

    pip.appendChild(content);

    // JSDOM does no sizing
    jest.spyOn(pip, 'clientWidth', 'get').mockReturnValue(150);
    jest.spyOn(pip, 'clientHeight', 'get').mockReturnValue(300);

    document.body.appendChild(pip);

    await new Promise(process.nextTick);

    const controlBar = pip.querySelector('.controlBar')! as HTMLElement;

    pip.animate = () => ({ finished: Promise.resolve() }) as any;

    let originX = 0,
      originY = 0;

    jest
      .spyOn(pip, 'getBoundingClientRect')
      .mockImplementation(() => ({ x: originX, y: originY }) as any);

    controlBar.ontouchstart!(
      createMockTouchEvent('touchstart', originY, originX),
    );

    originX = 225;
    originY = 75;

    controlBar.ontouchmove!(
      createMockTouchEvent('touchmove', originY, originX),
    );

    expect(pip.style.top).toBe('75px');
    expect(pip.style.left).toBe('225px');

    originX = 950;
    originY = 125;

    controlBar.ontouchmove!(
      createMockTouchEvent('touchmove', originY, originX),
    );

    expect(pip.style.top).toBe('125px');
    expect(pip.style.left).toBe('950px');

    controlBar.ontouchend!(createMockTouchEvent('touchend', originY, originX));

    await new Promise(process.nextTick);

    expect(pip.style.top).toBe('125px');
    expect(pip.style.left).toBe('984px');
  });
});
