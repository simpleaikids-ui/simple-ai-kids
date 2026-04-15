# Project Walkthrough Videos

Each project page has a `<div class="video-slot">` that can render either:

1. **A YouTube embed** — set `data-yt="YOUTUBE_ID"` on the slot.
2. **A local MP4** — set `data-src="../videos/FILE.mp4"` on the slot.
3. **A placeholder card** — leave both blank (current default).

## Examples

```html
<!-- YouTube -->
<div class="video-slot"
     data-yt="dQw4w9WgXcQ"
     data-title="Watch: Teaching the Computer to Sort"></div>

<!-- Local MP4 -->
<div class="video-slot"
     data-src="../videos/teach-sort.mp4"
     data-title="Watch: Teaching the Computer to Sort"></div>
```

## Suggested filenames

| File                | Used by                              |
|---------------------|--------------------------------------|
| `teach-sort.mp4`    | projects/teach-computer-to-sort.html |
| `chatbot.mp4`       | projects/custom-chatbot.html         |
| `movie-recs.mp4`    | projects/movie-recommender.html      |
| `study-buddy.mp4`   | projects/study-buddy.html            |

## Guidelines

- **Length:** 1–3 minutes is plenty. Kids have short attention spans; show the highlights.
- **Format:** MP4 (H.264) works everywhere. Keep under ~30 MB for quick loading.
- **Captions:** Burn in captions or use YouTube's captions — some kids watch muted.
- **Narration:** Kid-friendly voice, simple vocabulary, slow enough to follow.
