# Hero Scene Illustrations

Each project page includes an inline SVG scene so it looks good out of the box.
If you drop in a matching PNG here, it will replace the SVG automatically at runtime.

## Expected filenames

| File                | Used by                     | Alt text hint                                     |
|---------------------|-----------------------------|---------------------------------------------------|
| `teach-sort.png`    | projects/teach-computer-to-sort.html | Kid showing an apple and banana to a smiling computer |
| `chatbot.png`       | projects/custom-chatbot.html         | Kid chatting with a friendly cartoon robot            |
| `movies.png`        | projects/movie-recommender.html      | Movie posters connecting to a central recommender     |
| `study-buddy.png`   | projects/study-buddy.html            | Notes flowing into a chatbot terminal                 |

## Guidelines

- **Aspect:** ~2:1 (e.g. 1280×640). It scales to fit the `.scene-slot` container.
- **Format:** PNG with transparent or light background works best. JPG is fine too; just rename the `data-img` attribute in the HTML.
- **Style:** Cute, kid-friendly illustration. Soft colors, clear shapes, no text (the page supplies text).
- **Fallback:** If the file is missing or fails to load, the inline SVG stays — nothing breaks.

## How the swap works

Each project page has a `<div class="scene-slot" data-img="../images/scenes/NAME.png">` with an inline SVG inside. At load time, `js/common.js` preloads the PNG; if it loads successfully, the inline SVG is replaced with the image.
