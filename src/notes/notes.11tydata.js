// Settings shared by every note in this folder. Each note is one Markdown file,
// written by hand or through the editor at /admin/.
export default {
  layout: "layouts/note.njk",
  section: "notes",
  ogType: "article",
  eleventyComputed: {
    permalink: (data) => `/notes/${data.page.fileSlug}/`,
    metaTitle: (data) => `${data.title} — Notes — Present Lab`,
    metaDescription: (data) => data.dek,
  },
};
