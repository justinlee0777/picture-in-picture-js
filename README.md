# Picture-In-Picture

Render any element on the page as a draggable, resizable overlay.

### Installation

Run

```
npm i picture-in-picture-js
```

### Usage

You need to import the library's CSS stylesheet. In your own CSS file, add:

```
import '~picture-in-picture-js/index.css';
```

or whatever is suitable if you're using a CSS-in-JS approach.

To create your own overlay:

```
import { openPictureInPicture } from 'picture-in-picture-js';

const pipElement = openPictureInPicture();

pipElement.appendChild(
    // Merely as an example.
    document.getElementById('certainVideo)
);

document.body.appendChild(pipElement);
```

Or if you want to make an inline element a trigger for the overlay and let `picture-in-picture-js` handle the rest:

```
import { createTriggerElement } from 'picture-in-picture-js';

createTriggerElement(
    document.getElementById('certainVideo)
);
```

### Caveats

`picture-in-picture-js` is a pale imitation of two existing Picture-in-Picture APIs:

1. [The <video> Picture in Picture](https://developer.mozilla.org/en-US/docs/Web/API/Picture-in-Picture_API)
2. [The generic Picture in Picture](https://developer.mozilla.org/en-US/docs/Web/API/Document_Picture-in-Picture_API)

The first API has good support across modern browsers but only works for `<video>` elements.

The second API has poor support across modern browsers, namely Safari and Firefox.

I was motivated to create this for long articles where the reader would need certain assets (as diagrams, how-to videos) as a point of reference while reading. I could not use the aforementioned first API as I insisted on using YouTube videos.

Thus, the warning: **if your use case can be supported by the first API, you should do so.**

In contrast to the video API, `picture-in-picture-js` will stay only on the page in which the element is declared. The overlay will not follow the user as they move from tab to tab, or from application to application on their device.
