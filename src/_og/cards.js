// Generates 1200x630 typographic Open Graph PNG cards at build time in the
// Present Lab visual language: black ground, white lockup, Source Serif 4,
// and the tracked change (struck phrase + #00FF00 insertion) in titles only.
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import satori from "satori";
import { initWasm, Resvg } from "@resvg/resvg-wasm";

const require = createRequire(import.meta.url);

const WIDTH = 1200;
const HEIGHT = 630;

const dateFmt = (opts) => new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...opts });
const fullDateFmt = dateFmt({ day: "numeric", month: "long", year: "numeric" });
const monthYearFmt = dateFmt({ month: "long", year: "numeric" });

let resources = null;
const pngCache = new Map();

async function loadResources() {
  if (resources) return resources;
  const wasmBytes = readFileSync(require.resolve("@resvg/resvg-wasm/index_bg.wasm"));
  await initWasm(wasmBytes);

  const fontFile = (subset, weight = 400) =>
    readFileSync(require.resolve(`@fontsource/source-serif-4/files/source-serif-4-${subset}-${weight}-normal.woff`));

  // Load Latin, Latin-Ext and Vietnamese subsets so Nigerian diacritics (ṣ, ẹ, ọ) render cleanly.
  const fonts = [
    { name: "Source Serif 4", data: fontFile("latin", 400), weight: 400, style: "normal" },
    { name: "Source Serif 4", data: fontFile("latin-ext", 400), weight: 400, style: "normal" },
    { name: "Source Serif 4", data: fontFile("vietnamese", 400), weight: 400, style: "normal" },
  ];

  const logoBytes = readFileSync("src/assets/logo-lockup-white.png");
  const logoDataUri = `data:image/png;base64,${logoBytes.toString("base64")}`;

  resources = { fonts, logoDataUri };
  return resources;
}

const el = (type, style, ...children) => {
  const flat = children.flat().filter((c) => c !== null && c !== undefined && c !== false);
  return {
    type,
    props: {
      style,
      children: flat.length === 0 ? undefined : flat.length === 1 ? flat[0] : flat,
    },
  };
};

const textBox = (text, style = {}) =>
  el("div", { display: "flex", lineHeight: 1.08, letterSpacing: "-0.024em", ...style }, String(text));

const struck = (text, fontSize) =>
  el(
    "div",
    { display: "flex", position: "relative", color: "#8C8C87" },
    textBox(text, { fontSize }),
    el("div", {
      display: "flex",
      position: "absolute",
      left: -2,
      right: -2,
      top: Math.round(fontSize * 0.57),
      height: Math.max(3, Math.round(fontSize * 0.052)),
      backgroundColor: "#FFFFFF",
    }),
  );

const inserted = (text, fontSize) =>
  el(
    "div",
    { display: "flex", position: "relative", color: "#FFFFFF" },
    textBox(text, { fontSize }),
    el("div", {
      display: "flex",
      position: "absolute",
      left: 0,
      right: 0,
      bottom: Math.round(fontSize * 0.03),
      height: Math.max(4, Math.round(fontSize * 0.078)),
      backgroundColor: "#00FF00",
    }),
  );

function frame(logoDataUri, kicker, mainNode, footerNode = null) {
  const innerWidth = WIDTH - 128;
  const innerHeight = HEIGHT - 106;
  return el(
    "div",
    {
      display: "flex",
      flexDirection: "column",
      width: WIDTH,
      height: HEIGHT,
      backgroundColor: "#000000",
      color: "#FFFFFF",
      fontFamily: "Source Serif 4",
      padding: "52px 64px 54px 64px",
    },
    el(
      "div",
      {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: innerWidth,
        height: innerHeight,
      },
      el(
        "div",
        {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: innerWidth,
        },
        { type: "img", props: { src: logoDataUri, width: 140, height: 32 } },
        el(
          "div",
          {
            display: "flex",
            fontSize: 18,
            color: "#9A9A94",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          },
          kicker,
        ),
      ),
      el(
        "div",
        {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          flexGrow: 1,
          width: innerWidth,
          paddingTop: 10,
        },
        mainNode,
      ),
      footerNode || el("div", { display: "flex", height: 4 }),
    ),
  );
}

function renderCardTree(card, logoDataUri) {
  if (card.kind === "home") {
    const size = 66;
    return frame(
      logoDataUri,
      "Evidence-led design studio",
      el(
        "div",
        { display: "flex", flexDirection: "column", rowGap: 8 },
        el(
          "div",
          { display: "flex", flexDirection: "row", alignItems: "baseline", columnGap: 18 },
          textBox("Building", { fontSize: size }),
          struck("a better future for all", size),
        ),
        el(
          "div",
          { display: "flex", flexDirection: "row", alignItems: "baseline" },
          inserted("a world that works for more of us", size),
          textBox(".", { fontSize: size }),
        ),
      ),
      el(
        "div",
        {
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
          paddingTop: 20,
          borderTop: "1px solid #2E2E2B",
          fontSize: 21,
          color: "#9A9A94",
        },
        el("div", { display: "flex" }, "Four practices, one method"),
        el("div", { display: "flex" }, "Abuja, Nigeria"),
      ),
    );
  }

  if (card.kind === "practice") {
    const totalLen = (card.del || "").length + (card.ins || "").length;
    const size = totalLen > 24 ? 68 : 82;
    return frame(
      logoDataUri,
      "Practice",
      el(
        "div",
        { display: "flex", flexDirection: "column", rowGap: 26 },
        el(
          "div",
          { display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "baseline", columnGap: 24, rowGap: 8 },
          struck(card.del, size),
          el("div", { display: "flex", flexDirection: "row", alignItems: "baseline" }, inserted(card.ins, size), textBox(".", { fontSize: size })),
        ),
        el("div", { display: "flex", fontSize: 32, lineHeight: 1.2, letterSpacing: "-0.012em", color: "#C9C9C3" }, card.name),
      ),
      el(
        "div",
        {
          display: "flex",
          width: WIDTH - 128,
          paddingTop: 20,
          borderTop: "1px solid #2E2E2B",
          fontSize: 20,
          color: "#9A9A94",
          lineHeight: 1.38,
        },
        el("div", { display: "flex", maxWidth: 960 }, card.blurb || ""),
      ),
    );
  }

  if (card.kind === "notes-index") {
    const size = 84;
    return frame(
      logoDataUri,
      card.kicker,
      el(
        "div",
        { display: "flex", flexDirection: "column", rowGap: 26 },
        el(
          "div",
          { display: "flex", flexDirection: "row", alignItems: "baseline", columnGap: 24 },
          struck("Insights", size),
          el("div", { display: "flex", flexDirection: "row", alignItems: "baseline" }, inserted("Notes", size), textBox(".", { fontSize: size })),
        ),
        el("div", { display: "flex", fontSize: 28, lineHeight: 1.35, color: "#C9C9C3", maxWidth: 920 }, card.subtitle),
      ),
      el(
        "div",
        {
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
          width: WIDTH - 128,
          paddingTop: 20,
          borderTop: "1px solid #2E2E2B",
          fontSize: 20,
          color: "#9A9A94",
        },
        el("div", { display: "flex" }, "presentlab.org/notes"),
        el("div", { display: "flex" }, "Abuja, Nigeria"),
      ),
    );
  }

  // Individual note: plain white title, no tracked change (per editorial style rules).
  const len = (card.title || "").length;
  const titleSize = len > 68 ? 50 : len > 42 ? 58 : 68;
  return frame(
    logoDataUri,
    card.kicker,
    el(
      "div",
      { display: "flex", flexDirection: "column", rowGap: 22, maxWidth: 1000 },
      textBox(card.title, { fontSize: titleSize, lineHeight: 1.06, letterSpacing: "-0.024em" }),
      card.dek
        ? el("div", { display: "flex", fontSize: 24, lineHeight: 1.38, color: "#C9C9C3", maxWidth: 900 }, card.dek)
        : null,
    ),
    el(
      "div",
      {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
        paddingTop: 20,
        borderTop: "1px solid #2E2E2B",
        fontSize: 20,
        color: "#9A9A94",
      },
      el("div", { display: "flex", color: "#C9C9C3" }, card.metaLeft || "presentlab.org"),
      el("div", { display: "flex" }, card.metaRight || ""),
    ),
  );
}

async function renderPng(card, res) {
  const key = createHash("sha1").update(JSON.stringify(card)).digest("hex");
  const cached = pngCache.get(key);
  if (cached) return cached;

  const tree = renderCardTree(card, res.logoDataUri);
  const svg = await satori(tree, { width: WIDTH, height: HEIGHT, fonts: res.fonts });
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: WIDTH } });
  const rendered = resvg.render();
  const png = rendered.asPng();
  rendered.free();
  pngCache.set(key, png);
  return png;
}

function noteMetaLeft(note) {
  const d = note.data;
  if (d.type === "event") return [d.place, d.capacity].filter(Boolean).join(" · ") || "Present Lab event";
  if (d.type === "publication") return d.authors || "Present Lab publication";
  if (d.version) return /^(pilot|version)/i.test(d.version) ? d.version : `Version ${d.version}`;
  return "Present Lab method";
}

export async function writeOgCards({ outputDir, site, practices, notes }) {
  const res = await loadResources();
  const cards = [
    { kind: "home", out: "assets/og/home.png" },
    {
      kind: "notes-index",
      out: "assets/og/notes.png",
      kicker: "Dated notes",
      subtitle: "The events we host, the methods we are developing, and what we publish.",
    },
    ...site.typeList.map((t) => ({
      kind: "notes-index",
      out: `assets/og/notes-${t.path}.png`,
      kicker: `Notes · ${t.plural}`,
      subtitle: t.description,
    })),
    ...practices.map((item) => ({
      kind: "practice",
      out: `assets/og/practices/${item.fileSlug}.png`,
      name: item.data.info?.name || item.fileSlug,
      del: item.data.del,
      ins: item.data.ins,
      blurb: item.data.blurb,
    })),
    ...notes.map((note) => {
      const d = note.data;
      const typeLabel = site.typeList.find((t) => t.key === d.type)?.label || d.type || "Note";
      const when = d.type === "event" ? fullDateFmt.format(note.date) : monthYearFmt.format(note.date);
      const prac = site.practices.find((p) => p.slug === d.practice);
      return {
        kind: "note",
        out: `assets/og/notes/${note.fileSlug}.png`,
        kicker: `${typeLabel} · ${when}`,
        title: d.title,
        dek: d.dek,
        metaLeft: noteMetaLeft(note),
        metaRight: prac ? prac.name : site.name,
      };
    }),
  ];

  for (const card of cards) {
    const png = await renderPng(card, res);
    const dest = join(outputDir, card.out);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, png);
  }
}
