const SITE = "https://www.intersportsinfra.com";

// Strip simple HTML tags so schema text matches the visible answer text.
const plain = (s) => String(s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "src/style.css": "style.css" });
  eleventyConfig.addPassthroughCopy({ "src/script.js": "script.js" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/llms.txt": "llms.txt" });
  eleventyConfig.addPassthroughCopy({ "admin": "admin" });
  eleventyConfig.addFilter("jsonify", (v) => JSON.stringify(v));

  // 1400000 -> "14,00,000" (Indian grouping), used so stats are real numbers in the HTML.
  eleventyConfig.addFilter("inr", (v) => Number(v).toLocaleString("en-IN"));

  // FAQPage schema from a flat list of { q, a_paragraphs } (sport pages)
  // or from groups of { faqs: [...] } (FAQ page).
  eleventyConfig.addFilter("faqSchema", (faqs, groups) => {
    let items = faqs || [];
    if (!items.length && groups) items = groups.flatMap((g) => g.faqs || []);
    if (!items.length) return "";
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: items.map((f) => ({
        "@type": "Question",
        name: plain(f.q),
        acceptedAnswer: { "@type": "Answer", text: plain((f.a_paragraphs || [f.a]).join(" ")) },
      })),
    });
  });

  // Service + breadcrumb schema for the five sport pages (sport.njk layout).
  eleventyConfig.addFilter("serviceSchema", (crumb, description, url) => {
    if (!crumb) return "";
    const pageUrl = SITE + url;
    return JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          name: crumb + " — Design & Construction",
          serviceType: crumb + " construction",
          url: pageUrl,
          description: plain(description),
          provider: { "@id": SITE + "/#business" },
          areaServed: { "@type": "Country", name: "India" },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
            { "@type": "ListItem", position: 2, name: "Services", item: SITE + "/services/" },
            { "@type": "ListItem", position: 3, name: crumb, item: pageUrl },
          ],
        },
      ],
    });
  });

  return {
    dir: {
      input: "content",
      includes: "../_includes",
      data: "../_data",
      output: "_site",
    },
  };
};
