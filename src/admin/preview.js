// Makes the editor's preview pane look like the published note.
// Uses the site's own stylesheet; createClass and h are provided by Decap CMS.
(function () {
  if (!window.CMS) return;
  CMS.registerPreviewStyle("/assets/css/site.css");
  CMS.registerPreviewStyle(".prose > div > * + * { margin-top: 1em; }", { raw: true });

  var TYPES = { event: "Event", method: "Method", publication: "Publication" };
  var PRACTICES = {
    "ai-digital": "AI and Digital Transformation",
    "health-security": "Health Security and Biosecurity",
    "social-economic-justice": "Social and Economic Justice",
    philanthropy: "Philanthropy Advisory",
  };
  var PRACTICE_SHORT = {
    "ai-digital": "AI and digital",
    "health-security": "Health security",
    "social-economic-justice": "Social and economic justice",
    philanthropy: "Philanthropy",
  };

  function formatDate(value, options) {
    if (!value) return "";
    var date = new Date(value);
    if (isNaN(date)) return "";
    return new Intl.DateTimeFormat("en-GB", Object.assign({ timeZone: "UTC" }, options)).format(date);
  }

  function fact(label, value, key) {
    if (!value) return null;
    return h("div", { key: key || label }, h("dt", null, label), h("dd", null, value));
  }

  function formatReserve(value) {
    if (!value) return h("span", { className: "tbc" }, "Details to follow");
    var text = String(value).trim();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return h("a", { href: "mailto:" + text }, text);
    if (/^https?:\/\/\S+$/.test(text)) return h("a", { href: text }, "Reserve a place");
    return text;
  }

  function renderFilm(f, getAsset, lead, key) {
    if (!f || !f.poster) return null;
    var posterSrc = String(getAsset(f.poster));
    var hasSource = Boolean(f.video || f.url);
    return h("figure", { key: key, className: "film" + (lead ? " film--lead" : "") },
      h("div", { className: "film-play" + (hasSource ? "" : " film-pending") },
        h("img", { src: posterSrc, alt: "", width: 1600, height: 900 }),
        h("span", { className: "film-label" },
          h("span", { className: "film-tri" }),
          f.title || "Film",
          f.length ? h("span", { className: "film-len" }, f.length) : null
        )
      ),
      hasSource ? null : h("figcaption", { className: "film-note" },
        "Preview only: the film plays here once its video file or link is added. Without one, it does not appear on the live site."
      )
    );
  }

  var NotePreview = createClass({
    render: function () {
      var entry = this.props.entry;
      var getAsset = this.props.getAsset;
      var get = function (name) { return entry.getIn(["data", name]); };
      var type = get("type");
      var date = get("date");
      var facts = [];
      var shownFilms = [];

      if (type === "event") {
        var when = formatDate(date, { weekday: "long" }) + " " + formatDate(date, { day: "numeric", month: "long", year: "numeric" });
        facts.push(fact("When", [
          h("span", { key: "d" }, when),
          get("time") ? h("span", { key: "t", className: "l2" }, get("time")) : h("span", { key: "t", className: "tbc" }, "Time to follow"),
        ]));
        facts.push(fact("Where", get("place")));
        facts.push(fact("Places", get("capacity")));
        facts.push(fact("Reserve", formatReserve(get("reserve"))));
        facts.push(fact("Hosts", get("hosts")));
      } else {
        facts.push(fact("Published", formatDate(date, { month: "long", year: "numeric" })));
        facts.push(fact("Version", get("version")));
        facts.push(fact("Authors", get("authors")));
        facts.push(fact("Commissioned by", get("commissioned_by")));
        if (get("app")) {
          facts.push(fact("Runs at", String(get("app")).replace(/^https?:\/\//, "")));
        }
        if (get("demo")) {
          facts.push(fact("Try it", "Explore the synthetic demo"));
        }
        var rawFilms = get("films");
        var filmItems = rawFilms && rawFilms.toJS ? rawFilms.toJS() : [];
        shownFilms = filmItems.filter(function (f) { return f && f.poster; });
        if (shownFilms.length) {
          facts.push(fact("Films", shownFilms.map(function (f, i) {
            return h("span", { key: i, className: "l2" }, (f.title || "Film") + (f.length ? " (" + f.length + ")" : ""));
          })));
        }
        if (get("file") || get("link")) {
          facts.push(fact("Read it", [
            get("file") ? h("span", { key: "f", className: "l2" }, "Download the PDF") : null,
            get("link") ? h("span", { key: "l", className: "l2" }, "Read online") : null,
          ]));
        }
      }

      var practiceKey = get("practice");
      var practice = PRACTICES[practiceKey];
      var guides = shownFilms.length > 1 ? shownFilms.length - 1 : 0;
      var guideHeading = guides === 1 ? "one guide" : (guides === 2 ? "two guides" : guides + " guides");

      return h("article", { className: "wrap entry" },
        h("div", { className: "grid" },
          h("p", { className: "crumb" }, h("span", null, "Notes"), h("span", { "aria-hidden": "true" }, "/"), h("em", null, TYPES[type] || "")),
          h("h1", null, get("title") || "Untitled note"),
          get("dek") ? h("p", { className: "dek" }, get("dek")) : null
        ),
        shownFilms.length ? h("div", { className: "grid film-row" }, renderFilm(shownFilms[0], getAsset, true, "film-1")) : null,
        h("div", { className: "grid entry-body" },
          h("dl", { className: "facts" }, facts),
          h("div", { className: "prose" },
            this.props.widgetFor("body"),
            guides ? h("h2", null, "How it works, in " + guideHeading) : null,
            guides ? shownFilms.slice(1).map(function (f, idx) {
              return renderFilm(f, getAsset, false, "film-" + (idx + 2));
            }) : null,
            practice ? h("p", { className: "filed" }, "Filed under ", h("span", { className: "tl" }, practice)) : null
          )
        )
      );
    },
  });

  ["events", "methods", "publications"].forEach(function (name) {
    CMS.registerPreviewTemplate(name, NotePreview);
  });

  // Practice pages: the head (name, edit, introduction) and the focus areas.
  var PracticePreview = createClass({
    render: function () {
      var entry = this.props.entry;
      var get = function (name) { return entry.getIn(["data", name]); };
      var focus = get("focus");
      var areas = focus && focus.toJS ? focus.toJS() : [];
      var name = PRACTICES[entry.get("slug")] || "";
      return h("div", null,
        h("article", { className: "wrap entry pp" },
          h("div", { className: "grid" },
            h("p", { className: "crumb" }, h("span", null, "Practices")),
            h("h1", null, name)
          ),
          h("div", { className: "grid pp-head" },
            h("p", { className: "pedit pp-edit" }, h("del", null, get("del") || ""), " ", h("ins", null, get("ins") || "")),
            h("p", { className: "pp-lead" }, get("lead") || "")
          )
        ),
        h("section", { className: "wrap sec" },
          h("div", { className: "grid opener" }, h("h2", { className: "h2" }, "What we focus on")),
          h("ul", { className: "focus" }, areas.map(function (area, i) {
            return h("li", { key: i }, h("h3", null, area.title || ""), h("p", null, area.text || ""));
          })),
          h("div", { className: "grid pp-more" }, h("div", { className: "prose" }, this.props.widgetFor("body")))
        )
      );
    },
  });
  ["ai-digital", "health-security", "social-economic-justice", "philanthropy"].forEach(function (name) {
    CMS.registerPreviewTemplate(name, PracticePreview);
  });

  // Work register: shows the home-page selection and the full list across practices.
  function renderWorkTable(rows, key) {
    return h("table", { key: key, className: "reg" },
      h("thead", null,
        h("tr", null,
          h("th", { scope: "col" }, "Where"),
          h("th", { scope: "col" }, "Work"),
          h("th", { scope: "col" }, "With"),
          h("th", { scope: "col" }, "Practice")
        )
      ),
      h("tbody", null, rows.map(function (item, idx) {
        return h("tr", { key: idx },
          h("td", { className: "w" }, item.where || ""),
          h("td", { className: "k" },
            item.work || "",
            item.year ? h("span", { className: "y" }, " " + item.year) : null
          ),
          h("td", { className: "p" }, item.with || ""),
          h("td", { className: "r" }, PRACTICE_SHORT[item.practice] || "")
        );
      }))
    );
  }

  var WorkPreview = createClass({
    render: function () {
      var raw = this.props.entry.getIn(["data", "items"]);
      var items = raw && raw.toJS ? raw.toJS() : [];
      var homeItems = items.filter(function (w) { return w && w.home; });
      var practiceOnly = items.filter(function (w) { return w && !w.home; });
      return h("div", null,
        h("section", { className: "wrap sec" },
          h("div", { className: "grid opener" },
            h("h2", { className: "h2" }, "Where we’ve worked"),
            h("p", null, "A selection across the four practices (" + homeItems.length + " shown on the home page).")
          ),
          renderWorkTable(homeItems, "home"),
          h("p", { className: "reg-note" }, "Findings and procedures belong to the institutions we support. We publish them only with their agreement.")
        ),
        practiceOnly.length ? h("section", { className: "wrap sec" },
          h("div", { className: "grid opener" },
            h("h2", { className: "h2" }, "On practice pages only"),
            h("p", null, "Entries with “Show on the home page” turned off appear only on their practice page.")
          ),
          renderWorkTable(practiceOnly, "practice-only")
        ) : null
      );
    },
  });
  CMS.registerPreviewTemplate("work-register", WorkPreview);
})();
