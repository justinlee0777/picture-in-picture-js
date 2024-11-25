import '../index.css';

import createTriggerElement from '../src/create-trigger-element';

window.addEventListener('DOMContentLoaded', async () => {
  const content = document.createElement('iframe');

  content.src = 'https://www.youtube.com/embed/y25stK5ymlA?si=CLrutYOz4tk-r6Be';
  content.title = 'Youtube video player';
  content.setAttribute('frameborder', '0');
  content.setAttribute(
    'allow',
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
  );
  content.setAttribute('allowfullscreen', 'true');

  const trigger = createTriggerElement(content);

  document.body.appendChild(trigger);

  const content2 = document.createElement('iframe');

  content2.src =
    'https://www.youtube.com/embed/prGhk_Gvzwo?si=FPy-oTOekRVO745S';
  content2.title = 'Youtube video player';
  content2.setAttribute('frameborder', '0');
  content2.setAttribute(
    'allow',
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
  );
  content2.setAttribute('allowfullscreen', 'true');

  const trigger2 = createTriggerElement(content2, { autoLock: true });

  document.body.appendChild(trigger2);

  const content3 = document.createElement('img');

  content3.src =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_%28Vienna%29_-_Google_Art_Project.jpg/640px-Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_%28Vienna%29_-_Google_Art_Project.jpg';
  content3.style.height = '75vh';
  content3.style.width = '75vw';
  content3.style.objectFit = 'contain';

  const trigger3 = createTriggerElement(content3, { autoLock: true });

  document.body.appendChild(trigger3);

  document.body.style.display = 'flex';
  document.body.style.flexDirection = 'column';
  document.body.style.alignItems = 'center';
  document.body.style.gap = '1em';
});
