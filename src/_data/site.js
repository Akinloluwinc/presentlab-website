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

  nav: [
    { label: "Practices", url: "/#practices" },
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
      url: "/ai-digital/",
    },
    {
      slug: "health-security",
      name: "Health Security and Biosecurity",
      url: "/health-security/",
    },
    {
      slug: "social-economic-justice",
      name: "Social and Economic Justice",
      url: "/social-economic-justice/",
    },
    {
      slug: "philanthropy",
      name: "Philanthropy Advisory",
      url: "/philanthropy/",
    },
  ],

  // Kinds of note. Keys match the "type" field the editor writes into each note.
  typeList: [
    { key: "event", label: "Event", plural: "Events", path: "events" },
    { key: "method", label: "Method", plural: "Methods", path: "methods" },
    { key: "publication", label: "Publication", plural: "Publications", path: "publications" },
  ],
};
