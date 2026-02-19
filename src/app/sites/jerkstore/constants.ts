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

export const RANDOM_TOPICS = [
  "My boss's leadership style", "People who clap when the plane lands", "LinkedIn influencers",
  "My ex's mixtape", "Crypto bros", "My dating life", "The HR department", "Landlords",
  "Paper straws", "Slow Wi-Fi", "My own reflection", "People who use speakerphone in public",
  "QR code menus", "Unskipping YouTube ads", "Self-checkout weight discrepancies", "Acoustic guitar guys",
  "Gender reveal wildfires", "Corporate 'synergy'", "Reply-all email chains", "Astro-turfed lawns",
  "Subscription-based heated seats", "Sidewalk snails (slow walkers)", "Gym vloggers", "Sent from my iPhone",
  "Non-ironic NFTs", "Passive-aggressive Slack emojis", "Infinite group chats", "Influencers in the wild",
  "Glitter bombs", "Solo podcasters", "Hidden shipping fees", "The 2:00 PM slump", "Deconstructed salads",
  "Avocado toast inflation", "Pine needle IPAs", "Cracker-less charcuterie", "Oat milk elitists",
  "Truffle oil abusers", "Dry January proponents", "Lemon-water mixologists", "Raw denim purists",
  "Beige-core aesthetics", "MLM 'Boss Babes'", "Goat yoga", "Essential oil 'cures'", "Durian fruit",
  "Artisanal ice cubes", "Mandatory fun days", "The company mission statement", "Open-plan offices",
  "Breakroom fish-microwavers", "Emails that should have been meetings", "Performative productivity",
  "Non-casual Casual Fridays", "Low toner lies", "Work-life 'integration'", "Mailroom nepo-babies",
  "Icebreaker games", "The phrase 'Let's circle back'", "Unpaid internships", "LinkedIn work anniversaries",
  "Ghosters", "Relationship soft-launches", "Main character syndrome", "Unsolicited life advice",
  "Movie theater talkers", "The drunk designated driver", "Friends who don't 'like' posts", "Small talk weather",
  "High school reunions", "The 'I'm not like others' trope", "Astrology as a personality", "Situationships",
  "Love bombers", "Backhanded compliments", "Bluetooth pairing failures", "The Check Engine light",
  "Middle seats on budget airlines", "Spirit Airlines legroom", "Hotel resort fees", "TSA liquid rules",
  "Overhead bin hogs", "Two-year-old phone batteries", "9:00 AM software updates", "CAPTCHAs that fail humans",
  "Autocorrect's 'ducking' obsession", "Sunglasses FaceID", "The sound of chewing", "The DMV waiting room",
  "Daylight Savings Time", "The Game of Thrones finale", "Vindictive mosquitoes", "Wet socks",
  "Plate sticker residue", "Cart-abandoners", "3:00 AM mufflers", "Printer ink prices", "The 1% battery warning",
  "Sunday morning leaf blowers", "Slow lane tailgaters", "Three sneezes in a row", "Popcorn bag bottoms",
  "Low-rise jeans revivals", "The word 'Moist'", "Grammar correctors", "Generic hold music",
  "Barefoot flyers", "Popcorn kernel tooth-traps", "Pothole zip codes", "Notes app apologies",
  "Subway smells", "Close-door buttons that don't work", "The sheer audacity", "My bank balance",
  "Store-bought tomatoes", "The heat death of the universe", "My own poor choices", "Hobbyist gaslighting",
  "Manifesting", "Aggressive pigeons", "The last cup of coffee", "Live-Laugh-Love signs", "Mumble rap",
  "Pick-up artists", "Unsolicited dick pics", "Clickbait headlines", "Spoiler-heavy trailers",
  "Public transport toenail-clippers", "Self-help gurus", "The phrase 'No offense, but...'", "Micromanagers",
  "Door-to-door salespeople", "Telemarketers", "Spam folders", "Pop-up ads", "Cookie consent banners",
  "Stolen parking spots", "Stepped-on LEGOs", "Cold coffee", "Burned toast", "Empty toilet paper rolls",
  "Tangled earphones", "Buffering symbols", "Lost car keys", "Missing socks", "Biting your tongue",
  "Brain freezes", "Paper cuts", "Stubbed toes", "Bad haircuts", "Awkward silences", "Forgetting names",
  "Mistyping passwords", "Low shower pressure", "Luke-warm showers", "Noisy neighbors", "Barking dogs at night",
  "Leaf blowers in the wind", "Traffic jams", "Construction noise", "Car alarms", "Crying babies on planes",
  "Delayed flights", "Lost luggage", "Overbooked hotels", "Long lines", "Sold-out tickets", "Scalpers",
  "Price gouging", "Hidden fees", "Service charges", "Mandatory gratuity", "Tipping fatigue", "Inflation",
  "Recessions", "Tax season", "Audits", "Bureaucracy", "Red tape", "Politics", "The news", "Doomscrolling",
  "Clickbait", "Trolls", "Cyberbullying", "Doxing", "Scams", "Phishing", "Identity theft", "Data breaches",
  "Privacy concerns", "Surveillance", "Algorithmic bias", "Echo chambers", "Fake news", "Propaganda",
  "Conspiracy theories", "Flat Earthers", "Anti-vaxxers", "MLMs", "Cults", "The patriarchy", "Toxic masculinity",
  "Gatekeepers", "Karens", "Chads", "Beckys", "Boomers", "Millennials", "Gen Z", "Gen Alpha", "The generation gap",
  "Cultural appropriation", "Virtue signaling", "Cancel culture", "Call-out culture", "Wokeism", "Anti-wokeism",
  "Political correctness", "Microaggressions", "Privilege", "Inequality", "Injustice", "Corruption", "Greed",
  "Apathy", "Ignorance", "Arrogance", "Hypocrisy", "Dishonesty", "Betrayal", "Disappointment", "Regret",
  "Guilt", "Shame", "Insecurity", "Loneliness", "Boredom", "Existential dread", "Death", "Taxes",
  "The DMV", "The IRS", "The HOA", "The TSA", "The FBI", "The CIA", "The lizard people", "The Illuminati",
  "The Deep State", "The simulation we live in", "Glitch in the matrix", "Mandela effect", "Parallel universes",
  "Alien abductions", "Zombie apocalypse", "Climate change", "Natural disasters", "Pandemics", "Apocalypse",
  "Extinction", "Nothingness", "Entropy", "Chaos", "Order", "Control", "Free will", "Fate", "Destiny",
  "Karma", "Luck", "Coincidence", "Synchronicity", "Serendipity", "Murphy's Law", "Occam's Razor",
  "The Peter Principle", "The Dunning-Kruger effect", "The placebo effect", "The bystander effect",
  "The halo effect", "The spotlight effect", "The Zeigarnik effect", "The Pareto principle", "The Stroop effect",
  "The Mandela effect", "The butterfly effect", "The snowball effect", "The domino effect", "The IKEA effect",
  "The Streisand effect", "The Pygmalion effect", "The Golem effect", "The Hawthorne effect", "The placebo effect",
  "The nocebo effect", "The Barnum effect", "The Forer effect", "The Baader-Meinhof phenomenon",
  "The Tetris effect", "The Von Restorff effect", "The Primacy effect", "The Recency effect", "The Zeigarnik effect",
  "The Ostrich effect", "The Sunk Cost Fallacy", "The Gambler's Fallacy", "The Hot Hand Fallacy",
  "The Bandwagon Effect", "The Confirmation Bias", "The Anchoring Bias", "The Availability Heuristic",
  "The Representativeness Heuristic", "The Affect Heuristic", "The Hindsight Bias", "The Self-Serving Bias",
  "The Fundamental Attribution Error", "The Actor-Observer Bias", "The In-group Bias", "The Out-group Bias",
  "The IKEA effect", "The Endowment Effect", "The Loss Aversion Bias", "The Status Quo Bias", "The Decoy Effect"
];

export enum HeatLevel {
  MILD = "mild",
  SPICY = "spicy",
  NUCLEAR = "nuclear"
}

export const HEAT_LEVELS = [
  { value: HeatLevel.MILD, label: "Mild", desc: "Mild", color: "bg-blue-500" },
  { value: HeatLevel.SPICY, label: "Spicy", desc: "Zesty", color: "bg-orange-500" },
  { value: HeatLevel.NUCLEAR, label: "Nuclear", desc: "Taco bell aftermath", color: "bg-red-600" },
];

export const LOADING_MESSAGES = [
  "Analyzing insecurities...", "Judging life choices...", "Accessing trauma database...",
  "Consulting the dark web...", "Preparing emotional damage...", "Reviewing search history...",
  "Scanning for weakness...", "Loading insults...", "Calculating cringe levels..."
];

export const CREDIT_COSTS = {
  LONG_ROAST: 2,
  STANDARD_PACK: 5,
};

export const FREE_ROAST_LIMIT = 3;
export const CREDIT_PACKAGES = [
  {
    id: "pkg_basic",
    credits: 50,
    amount: 100,
    name: "The Turd",
    description: "Pity Support Us",
  },
  {
    id: "pkg_pro",
    credits: 275,
    amount: 500,
    name: "Loaded",
    description: "$199,995 cheaper than a Lambo",
    popular: true,
  },
  {
    id: "pkg_elite",
    credits: 600,
    amount: 1000,
    name: "Doomsday",
    description: "Your Mom Loves It",
  },
] as const;

export type CreditPackageId = typeof CREDIT_PACKAGES[number]["id"];

export const CREDIT_PACKAGES_MAP = Object.fromEntries(
  CREDIT_PACKAGES.map(pkg => [pkg.id, pkg])
) as Record<CreditPackageId, typeof CREDIT_PACKAGES[number]>;