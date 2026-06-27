/**
 * Builds a structured, model-agnostic refined prompt from a raw user input.
 * Kept intentionally lean — heavy style/photography/taxonomy rules live in the
 * system instruction's Step 0 lookup table and image rules. This file only adds
 * the per-request task framing and a completion checklist, to avoid double-
 * reasoning that burns thinking-token budget and causes truncated output.
 * @param {string} rawPrompt - The raw user prompt from the frontend
 * @returns {string} - Fully structured prompt for the AI generation API
 */
const buildRefinedPrompt = (rawPrompt) => {
  return `
GENERATION TASK
═══════════════
Build a complete, production-quality single-page website for:
"${rawPrompt}"

Apply Step 0 of your instructions: identify the domain, pick the matching style
row and hero treatment from the lookup table, and commit immediately. Do not
deliberate — pick and proceed straight to code.

VISUAL BAR TO HIT: this should look like a featured Dribbble shot from a studio
like Phenomenon Studio or an Awwwards site-of-the-day — not a wireframe, not a
template. If the domain calls for photo-led treatment (portfolio, agency, luxury,
restaurant, real estate, wellness, fashion, ecommerce), the hero MUST use a real
photograph via the seeded Lorem Picsum pattern from your instructions, with a
gradient scrim and confident type overlay — not a flat color or CSS-only hero.

REQUIRED SECTIONS (all must be fully coded, in order):
  1. Nav (sticky, mobile-responsive, transparent-to-solid on scroll if photo hero)
  2. Hero (real photo per the image rules, or CSS product mockup for dev/SaaS domains)
  3. 2-4 content sections (features/work/menu/services — match the domain; include
     real photography in at least 2 of these if the domain is photo-led)
  4. Trust layer (stats, testimonials with real portrait photos if photo-led, or
     client logos — whichever fits)
  5. Closing CTA section
  6. Footer — MANDATORY, must be fully styled with links + copyright bar

CRITICAL: the footer is part of the deliverable, not optional polish. If running
low on output space, simplify earlier sections (fewer cards, shorter copy) rather
than skipping or truncating the footer or omitting required photography.

REAL COPY ONLY — no lorem ipsum. Write actual microcopy for this specific domain.

ASSET RULES (non-negotiable, full detail in system instructions):
  • Fonts via <link> in HTML <head> only — never @import in CSS
  • Real photography via https://picsum.photos/seed/{word}/{w}/{h} ONLY — always
    seeded, always with explicit width/height and an onerror fallback
  • Zero source.unsplash.com or images.unsplash.com/photo-[id] URLs — both are
    unreliable and frequently 404
  • CSS-only visuals (mockups, shapes, icons) are for dev-tool/dashboard domains
    or as supporting decoration — not a substitute for required hero photography

OUTPUT FORMAT
═════════════
Return ONLY valid JSON, fully complete, no truncation:
{
  "html": "full document from <meta charset...> to </body>, footer included",
  "css": "full stylesheet from :root to the last media query, nothing cut off",
  "js": "all JS inside one DOMContentLoaded listener"
}
`;
};

module.exports = buildRefinedPrompt;