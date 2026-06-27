const { GoogleGenAI, Type } = require("@google/genai");
const SYSTEM_INSTRUCTION = require("../constants/systemInstruction");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generates an elite, ultra-modern, responsive website from a structured prompt.
 * Model-agnostic system instruction — works with Gemini Flash, Pro, and Claude Opus.
 * @param {string} refinedPrompt - The structured prompt from buildRefinedPrompt()
 * @returns {Promise<{html: string, css: string, js: string}>}
 */
const generateCodeUsingAi = async (refinedPrompt) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: refinedPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,

        temperature: 0.25,

        // Raised ceiling — full html+css+js for a multi-section photo-led page can
        // run 9000-16000 tokens combined (img tags with onerror fallbacks add length).
        // Truncation = black sections/empty footer/missing images.
        maxOutputTokens: 65536,

        thinkingConfig: {
          // Style + hero-treatment + photo-seed selection is a lookup-table decision,
          // not open-ended reasoning. 4096 gives enough room to pick from the taxonomy
          // without starving the actual code generation that follows.
          thinkingBudget: 4096,
        },

        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            html: {
              type: Type.STRING,
              description:
                "Complete document markup from <meta charset> through </body>. All elements closed. IDs and classes match CSS and JS exactly. Hero and photo-led sections must include real <img> tags using the seeded Lorem Picsum pattern with width/height and onerror fallback. Must include a complete footer section — never end mid-section.",
            },
            css: {
              type: Type.STRING,
              description:
                "Full stylesheet starting with :root token block, then all rules through the last media query. Includes hero overlay/scrim styles for photo legibility. No markdown fences. No comments. Must be complete — never truncated mid-rule.",
            },
            js: {
              type: Type.STRING,
              description:
                "All JavaScript inside a single DOMContentLoaded listener. Includes nav scroll, mobile menu, IntersectionObserver reveals, smooth scroll, stat counters, and any prompt-specific interactions.",
            },
          },
          required: ["html", "css", "js"],
        },
      },
    });

    // Guard against finishReason MAX_TOKENS truncation before parsing
    const candidate = response.candidates?.[0];
    if (candidate?.finishReason === "MAX_TOKENS") {
      throw new Error(
        "Generation truncated due to token limit — output was incomplete. Retry or simplify the prompt.",
      );
    }

    const generatedCodeData = JSON.parse(response.text);

    // Sanity check: catch silent truncation that still produced valid-ish JSON
    const { html, css, js } = generatedCodeData;
    if (!html || !css || !js || html.length < 200 || css.length < 200) {
      throw new Error(
        "Generated output looks incomplete (too short) — likely truncated.",
      );
    }

    return generatedCodeData;
  } catch (error) {
    console.error("AI Generation Engine error:", error);
    throw error;
  }
};

module.exports = generateCodeUsingAi;