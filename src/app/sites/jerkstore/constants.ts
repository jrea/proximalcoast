export const BUTTON_LABELS = [
  "Roast it, Broseph",
  "Destroy Me, No Cap",
  "Circle Back to My Failures",
  "Leverage My Insecurities",
  "SKIBIDI TOILET (REVERSE)",
  "Touch Grass, Then Roast",
  "Ratio This Man",
  "Financial Ruin Awaits",
  "Psychic Attack: INITIATE",
  "Negative Aura Detection",
  "Skill Issue Verified",
  "Slay Me (Legally)",
  "Main Character Syndrome",
  "Fanum Tax My Self-Esteem",
  "Gaslight Me, King",
  "Cancel Me Harder",
  "NPC Energy Detected",
  "I'm the Problem, It's Me",
  "Corporate Synergy: PAIN",
  "End My Career",
  "Humiliate Me for $5",
  "Nepo Baby Verification",
  "It's Giving Mid",
  "Caught in 8K (HDR)",
  "Rent Free in My Head",
  "Mewing Until Roasted",
  "Boomer Cringe Alert",
  "Toxic Trait Checker",
  "Unsubscribe from Sanity",
  "Harder, AI Daddy"
];

export const TOPIC_LABELS = [
  "Topic to Roast",
  "Target for Elimination",
  "Victim Name",
  "Subject of Failure",
  "Who's Catching These Hands?",
  "Identity to Deconstruct",
  "Ego to Deflate",
  "Your Mid Friend's Name",
  "Corporate Entity to Slander",
  "Self-Sabotage Subject",
  "Roast Recipient",
  "Future Therapist's Notes",
  "Entry for the Burn Book",
  "Negative Aura Source",
  "Skill Issue Candidate",
  "NPC Designated for Roasting",
  "Chief Failure Officer",
  "Main Character to Cancel",
  "Source of Chronic Cringe",
  "Input for Aggression",
  "Who Hurt You?",
  "Roast Material",
  "Psychological Target",
  "Mid Take Provocation",
  "L + Ratio Recipient",
  "Victim of Logic",
  "Delulu Patient Zero",
  "Rent Free Tenant",
  "Bore-ish Behavior Source",
  "Desiccated Soul ID"
];

export const STANDARD_LANGUAGES = [
  { label: "English", value: "English" },
  { label: "Spanish (Español)", value: "Spanish" },
  { label: "French (Français)", value: "French" },
  { label: "German (Deutsch)", value: "German" },
  { label: "Chinese (中文)", value: "Chinese" },
  { label: "Japanese (日本語)", value: "Japanese" },
  { label: "Russian (Русский)", value: "Russian" },
  { label: "Arabic (العربية)", value: "Arabic" },
];

export const PREMIUM_LANGUAGES = [
  ...STANDARD_LANGUAGES,
  { label: "Italian (Italiano)", value: "Italian" },
  { label: "Korean (한국어)", value: "Korean" },
  { label: "Portuguese (Português)", value: "Portuguese" },
  { label: "Hindi (हिन्दी)", value: "Hindi" },
  { label: "Dutch (Nederlands)", value: "Dutch" },
  { label: "Turkish (Türkçe)", value: "Turkish" },
  { label: "Vietnamese (Tiếng Việt)", value: "Vietnamese" },
  { label: "Polish (Polski)", value: "Polish" },
  { label: "Swedish (Svenska)", value: "Swedish" },
  { label: "Danish (Dansk)", value: "Danish" },
  { label: "Finnish (Suomi)", value: "Finnish" },
  { label: "Norwegian (Norsk)", value: "Norwegian" },
  { label: "Greek (Ελληνικά)", value: "Greek" },
  { label: "Hebrew (עברית)", value: "Hebrew" },
  { label: "Thai (ไทย)", value: "Thai" },
  { label: "Bengali (বাংলা)", value: "Bengali" },
  { label: "Elvish (Sindarin)", value: "Sindarin Elvish" },
  { label: "Elvish (Quenya)", value: "Quenya Elvish" },
  { label: "Klingon (tlhIngan Hol)", value: "Klingon" },
  { label: "Dothraki", value: "Dothraki" },
  { label: "High Valyrian", value: "High Valyrian" },
  { label: "Ancient Greek", value: "Ancient Greek" },
  { label: "Latin", value: "Latin" },
  { label: "Old English", value: "Old English" },
  { label: "Shakespearean", value: "Shakespearean English" },
  { label: "Victorian", value: "Victorian English" },
  { label: "Gen Z Slang", value: "Gen Z Slang" },
  { label: "Pirate Speak", value: "Pirate" },
  { label: "Minion Speak", value: "Minion" },
  { label: "Pig Latin", value: "Pig Latin" },
  { label: "Morse Code", value: "Morse Code" },
  { label: "Binary", value: "Binary" },
  { label: "Base64", value: "Base64" },
  { label: "Emoji Only (🚫🗣️)", value: "Emoji Only" },
  { label: "Brainrot / Skibidi", value: "Brainrot Slang" },
  { label: "Valley Girl", value: "Valley Girl" },
  { label: "Cockney Rhyming Slang", value: "Cockney Rhyming Slang" },
  { label: "Ye Olde English", value: "Ye Olde English" },
  { label: "Middle English", value: "Middle English" },
  { label: "Australian (Mate!)", value: "Australian Slang" },
  { label: "Texas Redneck", value: "Texas Redneck" },
  { label: "Lojban", value: "Lojban" },
  { label: "Esperanto", value: "Esperanto" },
];

export const PLANS = {
  SAVAGE: {
    id: "savage",
    name: "Savage",
  },
  ELITE: {
    id: "elite",
    name: "Elite",
  },
  FREE: {
    id: "free",
    name: "Free",
  }
} as const;

export type PlanId = keyof typeof PLANS;

export const getPlanFromId = (id: string | null | undefined) => {
  switch (id) {
    case 'savage': return PLANS.SAVAGE;
    case 'elite': return PLANS.ELITE;
    case 'free': return PLANS.FREE;
    default: return null;
  }
}
