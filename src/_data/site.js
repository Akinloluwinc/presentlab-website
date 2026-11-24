// Facts used across the site. Change them here and every page follows.
export default {
  name: "Present Lab",
  url: "https://presentlab.org",
  tagline: "Building a world that works for more of us.",
  email: "info@presentlab.org",
  phone: "+234 818 332 7178",
  phoneHref: "tel:+2348183327178",
  location: "Abuja, Nigeria",
  legal: "Registered health research and social-justice consulting institution.",
  year: new Date().getUTCFullYear(),

  // True everywhere except the live site (Netlify sets CONTEXT=production for presentlab.org).
  // Deploy previews use it to show what a page will look like before every link is in place.
  preview: process.env.CONTEXT !== "production",

  // One line under the home page headline, linking to a note. Delete this block to remove it.
  announcement: {
    lead: "SIMEX is",
    del: "coming soon",
    ins: "open for testing",
    url: "/notes/simex/",
    link: "Read about SIMEX",
  },

  nav: [
    { label: "Practices", url: "/#practices", section: "practices" },
    { label: "Method", url: "/#method" },
    { label: "Work", url: "/#work" },
    { label: "Notes", url: "/notes/", section: "notes" },
    { label: "Contact", url: "/#contact" },
  ],

  // The four practices: names and addresses. Each page's words live in src/practices/.
  practices: [
    {
      slug: "ai-digital",
      name: "AI and Digital Transformation",
      shortName: "AI and digital",
      url: "/ai-digital/",
    },
    {
      slug: "health-security",
      name: "Health Security and Biosecurity",
      shortName: "Health security",
      url: "/health-security/",
    },
    {
      slug: "social-economic-justice",
      name: "Social and Economic Justice",
      shortName: "Social and economic justice",
      url: "/social-economic-justice/",
    },
    {
      slug: "philanthropy",
      name: "Philanthropy Advisory",
      shortName: "Philanthropy",
      url: "/philanthropy/",
    },
  ],

  // Kinds of note. Keys match the "type" field the editor writes into each note.
  typeList: [
    {
      key: "event",
      label: "Event",
      plural: "Events",
      path: "events",
      description: "Gatherings hosted by Present Lab in Abuja and online, coming up and in the archive.",
    },
    {
      key: "method",
      label: "Method",
      plural: "Methods",
      path: "methods",
      description: "Diagnostic tools, simulation platforms and working methods developed by Present Lab.",
    },
    {
      key: "publication",
      label: "Publication",
      plural: "Publications",
      path: "publications",
      description: "Research papers, reports and co-design toolkits published by Present Lab.",
    },
  ],
};
