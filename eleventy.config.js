// Builds presentlab.org: turns the templates and note files in src/ into the
// finished site in _site/, which Netlify publishes.
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import site from "./src/_data/site.js";

const dateFormat = (options) => new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...options });
const formats = {
  fullDate: dateFormat({ day: "numeric", month: "long", year: "numeric" }),
  weekday: dateFormat({ weekday: "long" }),
  monthYear: dateFormat({ month: "long", year: "numeric" }),
  month: dateFormat({ month: "long" }),
  dayMonth: dateFormat({ day: "numeric", month: "long" }),
};

// An event stays under "Coming up" until its date has passed (judged when the site is built).
const today = new Date();
today.setUTCHours(0, 0, 0, 0);
const isUpcoming = (note) => note.data.type === "event" && note.date >= today;

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const sentence = (text) => (text ? String(text).trim().replace(/[.\s]+$/, "") : "");

export default function (eleventyConfig) {
  // Copied to the site as they are.
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/admin");

  // The four practice pages, in the order set on each page.
  eleventyConfig.addCollection("practices", (api) =>
    api.getFilteredByGlob("src/practices/*.md").sort((a, b) => a.data.order - b.data.order),
  );

  // Every note, newest first.
  eleventyConfig.addCollection("notes", (api) =>
    api.getFilteredByGlob("src/notes/*.md").sort((a, b) => b.date - a.date || a.data.title.localeCompare(b.data.title)),
  );

  // Dates, always in UTC so a note's date never shifts by a day.
  for (const [name, format] of Object.entries(formats)) eleventyConfig.addFilter(name, (date) => format.format(date));
  eleventyConfig.addFilter("isoDate", (date) => date.toISOString().slice(0, 10));
  eleventyConfig.addFilter("isoMonth", (date) => date.toISOString().slice(0, 7));

  // Choosing and grouping notes.
  eleventyConfig.addFilter("ofType", (notes, type) => (type ? notes.filter((n) => n.data.type === type) : notes));
  eleventyConfig.addFilter("upcoming", (notes) => notes.filter(isUpcoming).sort((a, b) => a.date - b.date));
  eleventyConfig.addFilter("archive", (notes) => notes.filter((n) => !isUpcoming(n)));
  eleventyConfig.addFilter("isUpcoming", isUpcoming);
  eleventyConfig.addFilter("byYear", (notes) => {
    const years = new Map();
    for (const note of notes) {
      const year = note.date.getUTCFullYear();
      if (!years.has(year)) years.set(year, []);
      years.get(year).push(note);
    }
    return [...years].map(([year, items]) => ({ year, items }));
  });
  // Home page: three notes. The next event (or the latest one), the latest method and the
  // latest publication; if a kind has none, the next most recent note takes its place.
  eleventyConfig.addFilter("homeNotes", (notes) => {
    const latest = (type) => notes.find((n) => n.data.type === type);
    const next = notes.filter(isUpcoming).sort((a, b) => a.date - b.date)[0];
    const picks = [next || latest("event"), latest("method"), latest("publication")].filter(Boolean);
    for (const note of notes) if (picks.length < 3 && !picks.includes(note)) picks.push(note);
    return picks.sort((a, b) => isUpcoming(b) - isUpcoming(a) || b.date - a.date);
  });
  eleventyConfig.addFilter("others", (notes, url, count = 2) => notes.filter((n) => n.url !== url).slice(0, count));
  eleventyConfig.addFilter("filedUnder", (notes, slug) => notes.filter((n) => n.data.practice === slug));

  // Labels.
  eleventyConfig.addFilter("practice", (slug) => site.practices.find((p) => p.slug === slug));
  eleventyConfig.addFilter("typeLabel", (type) => site.typeList.find((t) => t.key === type)?.label || type);

  // The short line under a note in lists: where an event is, or who wrote a publication.
  eleventyConfig.addFilter("noteMeta", (note, variant) => {
    const d = note.data;
    if (d.type === "publication") return d.authors || "";
    if (d.type !== "event") return "";
    if (variant === "next") {
      const known = [d.place, d.capacity].map(sentence).filter(Boolean);
      const pending = [!d.time && "time", !d.reserve && "how to reserve a place"].filter(Boolean).join(" and ");
      const parts = known.map((s) => `${s}.`);
      if (pending) parts.push(`${pending[0].toUpperCase()}${pending.slice(1)} to follow.`);
      return parts.join(" ");
    }
    const parts = [isUpcoming(note) && "Coming up", sentence(d.place)].filter(Boolean);
    return parts.length ? `${parts.join(". ")}.` : "";
  });

  // "How to reserve" can be an email address, a web link or plain words.
  eleventyConfig.addFilter("reserveLink", (value) => {
    const text = String(value).trim();
    const safe = escapeHtml(text);
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return `<a href="mailto:${safe}">${safe}</a>`;
    if (/^https?:\/\/\S+$/.test(text)) return `<a href="${safe}">Reserve a place</a>`;
    return safe;
  });

  // The size of a file in src/, for download links ("8.8 MB"). Empty if the file is missing.
  eleventyConfig.addFilter("fileSize", (path) => {
    try {
      const bytes = statSync(`src${path}`).size;
      return bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`;
    } catch {
      return "";
    }
  });

  // Gives the stylesheet a new address whenever it changes, so browsers never keep an old copy.
  eleventyConfig.addFilter("version", (path) =>
    createHash("sha1").update(readFileSync(`src${path}`)).digest("hex").slice(0, 10),
  );
}

export const config = {
  dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
  templateFormats: ["njk", "md"],
  // Notes are plain Markdown: braces or other symbols in a note can never break the build.
  markdownTemplateEngine: false,
  htmlTemplateEngine: "njk",
};
