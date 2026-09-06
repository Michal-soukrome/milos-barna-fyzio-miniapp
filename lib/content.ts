// ---------------------------------------------------------------------------
// All patient-facing content lives in this one file.
// To add or edit a topic, add/edit an entry below — no other code changes needed.
// ---------------------------------------------------------------------------

export type AgeGroup = "child" | "adult" | "senior";

export type Topic = {
  slug: string; // used in the URL: /t/<slug>
  title: string; // shown to the patient
  bodyPart: string; // e.g. "Knee", "Ankle", "Wrist / Hand", "Spine", "General"
  ageGroups: AgeGroup[]; // who this applies to
  symptoms: string[]; // tags used by the quick-find filter
  summary: string; // one-line description shown in doctor's list
  sections: { heading: string; text: string }[]; // PLACEHOLDER — replace with the doctor's real guidance
  warningSigns: string[]; // "Seek care immediately if..." — PLACEHOLDER
};

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  child: "Child",
  adult: "Adult",
  senior: "Senior",
};

// NOTE: All body text below is placeholder copy so the app is demoable.
// Replace every "sections" and "warningSigns" entry with the doctor's actual,
// reviewed medical guidance before this goes live with real patients.
export const topics: Topic[] = [
  {
    slug: "cast-care",
    title: "Caring for your cast",
    bodyPart: "General",
    ageGroups: ["child", "adult", "senior"],
    symptoms: ["cast", "swelling", "itching"],
    summary: "Keeping a cast dry, clean, and what itching/swelling means",
    sections: [
      {
        heading: "Keeping it dry",
        text: "PLACEHOLDER — doctor to fill in: how to shower/bathe safely, what to do if it gets wet.",
      },
      {
        heading: "Itching",
        text: "PLACEHOLDER — doctor to fill in: why casts itch, what not to insert inside the cast.",
      },
      {
        heading: "Normal vs. not normal swelling",
        text: "PLACEHOLDER — doctor to fill in: how much swelling of fingers/toes is expected.",
      },
    ],
    warningSigns: [
      "PLACEHOLDER — e.g. fingers/toes turn blue, cold, or numb",
      "PLACEHOLDER — e.g. pain that keeps increasing despite medication",
    ],
  },
  {
    slug: "ankle-sprain-rehab",
    title: "Recovering from an ankle sprain",
    bodyPart: "Ankle",
    ageGroups: ["adult", "senior"],
    symptoms: ["swelling", "bruising", "pain when walking"],
    summary: "RICE protocol, weight-bearing timeline, when to return to sport",
    sections: [
      {
        heading: "The first 48 hours",
        text: "PLACEHOLDER — doctor to fill in: rest, ice, compression, elevation guidance.",
      },
      {
        heading: "Getting back on your feet",
        text: "PLACEHOLDER — doctor to fill in: expected timeline for weight-bearing.",
      },
    ],
    warningSigns: [
      "PLACEHOLDER — e.g. unable to bear any weight after 3-4 days",
      "PLACEHOLDER — e.g. visible deformity",
    ],
  },
  {
    slug: "knee-swelling-post-op",
    title: "Swelling after knee surgery",
    bodyPart: "Knee",
    ageGroups: ["adult", "senior"],
    symptoms: ["swelling", "warmth", "post-surgery"],
    summary: "What's expected after knee surgery vs. signs of infection/clot",
    sections: [
      {
        heading: "What's normal",
        text: "PLACEHOLDER — doctor to fill in: expected swelling timeline post-op.",
      },
    ],
    warningSigns: [
      "PLACEHOLDER — e.g. calf pain and swelling on one side (possible clot)",
      "PLACEHOLDER — e.g. fever, redness spreading, wound discharge",
    ],
  },
  {
    slug: "crutches-how-to",
    title: "Using crutches safely",
    bodyPart: "General",
    ageGroups: ["child", "adult", "senior"],
    symptoms: ["crutches", "balance", "stairs"],
    summary: "Correct height, walking technique, stairs, avoiding falls",
    sections: [
      {
        heading: "Fitting your crutches",
        text: "PLACEHOLDER — doctor to fill in: correct crutch height and hand position.",
      },
      {
        heading: "Stairs",
        text: "PLACEHOLDER — doctor to fill in: 'up with the good, down with the bad' technique.",
      },
    ],
    warningSigns: [
      "PLACEHOLDER — e.g. numbness/tingling in hands or armpits (crutch pressure)",
    ],
  },
  {
    slug: "post-op-wound-care",
    title: "Caring for your surgical wound",
    bodyPart: "General",
    ageGroups: ["adult", "senior"],
    symptoms: ["wound", "dressing", "post-surgery"],
    summary: "Dressing changes, showering, signs of infection",
    sections: [
      {
        heading: "Changing the dressing",
        text: "PLACEHOLDER — doctor to fill in: how often, how to keep it sterile.",
      },
    ],
    warningSigns: [
      "PLACEHOLDER — e.g. increasing redness, warmth, or discharge",
      "PLACEHOLDER — e.g. fever above 38°C / 100.4°F",
    ],
  },
  {
    slug: "wrist-fracture-basics",
    title: "After a wrist fracture",
    bodyPart: "Wrist / Hand",
    ageGroups: ["child", "adult", "senior"],
    symptoms: ["fracture", "splint", "swelling"],
    summary: "Splint care, finger movement, expected healing time",
    sections: [
      {
        heading: "Keeping fingers moving",
        text: "PLACEHOLDER — doctor to fill in: why gentle finger movement is encouraged.",
      },
    ],
    warningSigns: [
      "PLACEHOLDER — e.g. fingers turning pale or numb",
    ],
  },
];

export const BODY_PARTS = Array.from(new Set(topics.map((t) => t.bodyPart)));

export function getTopicBySlug(slug: string): Topic | undefined {
  return topics.find((t) => t.slug === slug);
}
