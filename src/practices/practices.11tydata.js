// Settings shared by the four practice pages. Each page is one Markdown file named after
// the practice's address (health-security.md becomes /health-security/), editable at /admin/.
import site from "../_data/site.js";

const infoFor = (data) => site.practices.find((p) => p.slug === data.page.fileSlug);

export default {
  layout: "layouts/practice.njk",
  eleventyComputed: {
    info: (data) => infoFor(data),
    permalink: (data) => `/${data.page.fileSlug}/`,
    metaTitle: (data) => `${infoFor(data)?.name} — Present Lab`,
    metaDescription: (data) => data.lead,
  },
};
