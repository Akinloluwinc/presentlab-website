// A looping animation for this note, shown after its first paragraph (src/_includes/partials/animation.njk).
// It is set here rather than in the note's front matter, so that saving or publishing the note
// from the editor never drops it. Delete this file to remove the animation.
export default {
  animation: {
    video: "/assets/uploads/rapid-preparedness-diagnostic-loop-v1.mp4",
    poster: "/assets/uploads/rapid-preparedness-diagnostic-loop-v1-poster.png",
    width: 1040,
    height: 1132,
    caption:
      "Each mark is one of the 31 items, along a traveller’s path through the five functions, with the supporting functions below. Green marks are critical functions.",
  },
};
