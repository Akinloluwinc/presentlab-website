// Animation and supplementary sidebar facts for this note.
// Kept here rather than in front matter so saving or publishing the note from /admin/
// never drops them. Delete the animation block to remove the animation.
export default {
  animation: {
    video: "/assets/uploads/rapid-preparedness-diagnostic-loop-v1.mp4",
    poster: "/assets/uploads/rapid-preparedness-diagnostic-loop-v1-poster.png",
    width: 1040,
    height: 1132,
    caption:
      "Each mark is one of the 31 items along a traveller’s path through the five functions, with the 13 supporting functions below. Circles are on-site items, squares are record items and green marks are the seven critical functions.",
  },
  extraFacts: [
    {
      label: "Assessor field pack",
      href: "mailto:info@presentlab.org?subject=Assessor%20field%20pack%20%E2%80%94%20Airport%20diagnostic%20v1.0",
      linkText: "Request via info@presentlab.org",
      note: "Available on request: workbook, printable forms, item anchors and calibration cases",
    },
    // Uncomment once deposited on Zenodo (Restricted Access for request-gated DOI) or protocols.io:
    // {
    //   label: "Archive",
    //   href: "https://doi.org/10.5281/zenodo.XXXXXXX",
    //   linkText: "Zenodo record",
    //   meta: "DOI, access on request",
    // },
    {
      label: "Partner brief",
      file: "/assets/uploads/present-lab-airport-diagnostic-partner-brief-v1.0.pdf",
      linkText: "One-page brief for airport operators and CAAs",
    },
    {
      label: "Licence",
      text: "CC BY-NC-SA 4.0",
    },
  ],
};
