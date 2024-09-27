import createTriggerElement from '../src/create-trigger-element';
import openPictureInPicture from '../src/open-picture-in-picture';

window.addEventListener('DOMContentLoaded', async () => {
  // const pip = openPictureInPicture();

  const content = document.createElement('iframe');

  content.src = 'https://www.youtube.com/embed/y25stK5ymlA?si=CLrutYOz4tk-r6Be';
  content.title = 'Youtube video player';
  content.setAttribute('frameborder', '0');
  content.setAttribute(
    'allow',
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
  );
  content.setAttribute('allowfullscreen', 'true');

  // pip.appendChild(content);

  const trigger = createTriggerElement(content);

  document.body.appendChild(trigger);
});
