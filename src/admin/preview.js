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

  var NotePreview = createClass({
    render: function () {
      var entry = this.props.entry;
      var get = function (name) { return entry.getIn(["data", name]); };
      var type = get("type");
      var date = get("date");
      var facts = [];

      if (type === "event") {
        var when = formatDate(date, { weekday: "long" }) + " " + formatDate(date, { day: "numeric", month: "long", year: "numeric" });
        facts.push(fact("When", [
          h("span", { key: "d" }, when),
          get("time") ? h("span", { key: "t", className: "l2" }, get("time")) : h("span", { key: "t", className: "tbc" }, "Time to follow"),
        ]));
        facts.push(fact("Where", get("place")));
        facts.push(fact("Places", get("capacity")));
        facts.push(fact("Reserve", get("reserve") || h("span", { className: "tbc" }, "Details to follow")));
        facts.push(fact("Hosts", get("hosts")));
      } else {
        facts.push(fact("Published", formatDate(date, { month: "long", year: "numeric" })));
        facts.push(fact("Version", get("version")));
        facts.push(fact("Authors", get("authors")));
        facts.push(fact("Commissioned by", get("commissioned_by")));
        if (get("file") || get("link")) {
          facts.push(fact("Read it", [
            get("file") ? h("span", { key: "f", className: "l2" }, "Download the PDF") : null,
            get("link") ? h("span", { key: "l", className: "l2" }, "Read online") : null,
          ]));
        }
      }

      var practice = PRACTICES[get("practice")];
      return h("article", { className: "wrap entry" },
        h("div", { className: "grid" },
          h("p", { className: "crumb" }, h("span", null, "Notes"), h("span", { "aria-hidden": "true" }, "/"), h("em", null, TYPES[type] || "")),
          h("h1", null, get("title") || "Untitled note"),
          get("dek") ? h("p", { className: "dek" }, get("dek")) : null
        ),
        h("div", { className: "grid entry-body" },
          h("dl", { className: "facts" }, facts),
          h("div", { className: "prose" },
            this.props.widgetFor("body"),
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
})();
