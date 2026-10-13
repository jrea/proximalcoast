import { PREMIUM_LANGUAGES } from "../constants";

export const LANGUAGE_CATEGORIES = [
  "Living languages",
  "Fictional languages",
  "Historical languages",
  "Slang and styles",
  "Codes and constructed languages",
] as const;

export type LanguageCategory = (typeof LANGUAGE_CATEGORIES)[number];

export interface LanguagePage {
  value: string;
  label: string;
  name: string;
  slug: string;
  category: LanguageCategory;
  description: string;
  intro: string;
  styleNotes: string[];
  promptExamples: string[];
  faq: { question: string; answer: string }[];
}

type LanguageEditorialContent = Omit<LanguagePage, "value" | "label">;

// Keep the editorial copy explicit. The canonical selector below determines
// which pages exist, and coverage checks make a new selector option a build error
// until its own page copy has been written.
const LANGUAGE_CONTENT: Record<string, LanguageEditorialContent> = {
  English: {
    name: "English",
    slug: "english",
    category: "Living languages",
    description: "Generate AI insults in English for group chats, awkward habits, and your own questionable decisions. Choose a topic and a roast intensity with Jerkstore.",
    intro: "Give your roast a clear target and let Jerkstore write the punchline in English. A forgotten deadline, a disastrous playlist, or the friend who turns every message into a podcast gives the generator more to work with than a name alone. Start with a specific habit and choose how sharp you want the reply to be.",
    styleNotes: [
      "Ask for a dry one-liner, playful sarcasm, or a dramatic put-down in the topic.",
      "Mention British, American, or another English variety if a particular vocabulary matters.",
      "Specific behavior usually gives the joke a stronger hook than a generic insult request.",
    ],
    promptExamples: [
      "Roast my habit of opening 47 browser tabs and calling it research in one dry English sentence.",
      "Give my friend's six-minute voice notes a playful British-English roast.",
      "Write an English comeback for my playlist that somehow makes every road trip feel longer.",
    ],
    faq: [
      { question: "Can I ask for British or American English insults?", answer: "Yes. Choose English and describe the variety in your topic, such as British English with dry sarcasm or American English with casual wording. That is a generation instruction, so review the result for the vocabulary you wanted." },
      { question: "What makes a good topic for an English AI roast?", answer: "Name the habit, object, or situation and add one concrete detail. 'My friend who brings a spreadsheet to brunch' gives the AI a clearer joke than 'my friend.' Add a desired length or tone if you have one." },
    ],
  },
  Spanish: {
    name: "Spanish",
    slug: "spanish",
    category: "Living languages",
    description: "Create AI insults in Spanish with Jerkstore. Turn everyday annoyances into Spanish roasts and guide the wording with a region, tone, and topic.",
    intro: "Build a Spanish roast around the thing that actually deserves a punchline: the group chat nobody answers, the meeting that should have been a message, or your heroic ability to lose your keys. Choose Spanish, describe the situation, and add the regional wording you prefer when that matters to your audience.",
    styleNotes: [
      "Specify Spain, Mexico, or another Spanish-speaking region when local expressions matter.",
      "Ask for neutral Spanish if the joke needs to travel across several countries.",
      "Tell the generator whether the exchange is friendly teasing or a sharper comeback.",
    ],
    promptExamples: [
      "Roast the friend who leaves every group message on read in casual Spanish with neutral vocabulary.",
      "Write a short Spanish comeback about my alarm clock losing the same argument every morning.",
      "Make a playful Spanish roast of a team meeting that could have been a two-line message.",
    ],
    faq: [
      { question: "Can the Spanish insult generator use a particular regional style?", answer: "Choose Spanish and include your preferred region in the topic. You can ask for Mexican Spanish, Spanish from Spain, or neutral wording. Jerkstore has one Spanish selector, so regional details come from your request rather than a separate dialect setting." },
      { question: "Should I enter my roast topic in Spanish?", answer: "You can describe the topic in Spanish or English and select Spanish for the output. A Spanish description can help explain local wordplay or context. Review AI-generated wording before sharing it, especially when a regional expression carries extra meaning." },
    ],
  },
  French: {
    name: "French",
    slug: "french",
    category: "Living languages",
    description: "Generate AI insults in French for playful banter, sarcastic replies, and everyday roast material. Set your topic and tone with Jerkstore.",
    intro: "Put your everyday disasters into a French roast: the coffee you reheated three times, the friend who says they are on the way from their sofa, or a presentation with more transitions than ideas. Jerkstore uses your topic as the starting point, so a clear situation helps the French punchline feel connected to the joke.",
    styleNotes: [
      "Describe whether you want casual conversation or a deliberately formal put-down.",
      "Mention France, Quebec, or another Francophone context if the vocabulary should fit it.",
      "For a quick reply, ask for one short sentence and a clear punchline.",
    ],
    promptExamples: [
      "Roast my reheated coffee in French with a short, sarcastic punchline.",
      "Write a casual French comeback for a friend who says 'I'm on my way' while still on the sofa.",
      "Give a slide deck with 80 animations and no point a politely cutting French roast.",
    ],
    faq: [
      { question: "Can French roasts be casual or formally sarcastic?", answer: "Yes. Add the register to your topic: casual French for a group chat, or formal wording for an exaggeratedly polite roast. The contrast between a courteous setup and a pointed observation can be the joke itself." },
      { question: "Does Jerkstore offer a separate Quebec French option?", answer: "The supported selector is French. If you want Quebec French or another Francophone variety, describe that preference in the topic. Treat the result as AI-generated comedy and check regional wording with someone familiar with the variety when precision matters." },
    ],
  },
  German: {
    name: "German",
    slug: "german",
    category: "Living languages",
    description: "Make AI insults in German with Jerkstore. Roast slow printers, chaotic calendars, and overconfident friends with a topic and adjustable intensity.",
    intro: "A German roast works best when it has something concrete to aim at. Give Jerkstore your printer's latest betrayal, a calendar that has declared war on free time, or your friend's suspiciously confident cooking advice. Ask for conversational German, a deadpan line, or a theatrically formal criticism to shape the delivery.",
    styleNotes: [
      "Ask for everyday German when the roast is meant for a chat rather than a speech.",
      "A deliberately long description can be a comic device; request a short line if brevity matters.",
      "Include the relationship to the recipient to guide formal or informal address.",
    ],
    promptExamples: [
      "Roast a printer that jams only when I am late in one deadpan German sentence.",
      "Write a conversational German comeback about my friend's confidence in burnt pasta.",
      "Give my impossible calendar a mock-formal German performance review.",
    ],
    faq: [
      { question: "Can I request informal German for a friend's roast?", answer: "Yes. Mention that the recipient is a friend and request informal German in the topic. If you want formal address or an exaggerated office tone, say so. The language selector alone does not tell the generator your relationship to the recipient." },
      { question: "How do I get a concise German insult?", answer: "Ask for one sentence or a short comeback and give a single comic detail. A request such as a roast of a printer that jams only before deadlines keeps the focus clear and discourages a long explanation." },
    ],
  },
  Chinese: {
    name: "Chinese",
    slug: "chinese",
    category: "Living languages",
    description: "Generate AI insults in Chinese with Jerkstore. Describe a roast topic and specify your preferred written style or script for the generated reply.",
    intro: "Turn notification overload, forgotten passwords, and heroic procrastination into AI roasts in Chinese. Jerkstore's selector uses the broad label Chinese, so add the written variety and script you want to the topic. Clear context helps the generator aim at the situation instead of producing an unrelated stock put-down.",
    styleNotes: [
      "Specify Simplified or Traditional characters when script choice matters.",
      "Describe the variety you want instead of assuming the broad Chinese label selects it.",
      "Ask for a brief conversational line if the roast is going into a message thread.",
    ],
    promptExamples: [
      "Roast my phone's endless notifications in conversational Mandarin using Simplified Chinese characters.",
      "Write a short Chinese roast of my habit of forgetting passwords; use Traditional characters.",
      "Make a playful Chinese comeback about my five productivity apps and zero finished tasks.",
    ],
    faq: [
      { question: "Can I ask for Simplified or Traditional Chinese insults?", answer: "Yes. Select Chinese and include the desired script in your topic. The generator follows that instruction, but AI output can mix conventions, so check the characters before sharing if consistent script is important." },
      { question: "Is the Chinese setting a dedicated Cantonese translator?", answer: "No dedicated Cantonese option is listed. Chinese is the supported selector label. You can describe a preferred variety in your topic, but the setting does not guarantee dialect accuracy, pronunciation guidance, or a verified translation." },
    ],
  },
  Japanese: {
    name: "Japanese",
    slug: "japanese",
    category: "Living languages",
    description: "Create AI insults in Japanese with Jerkstore. Pick a topic, set the heat, and guide the roast toward casual banter or mock-polite sarcasm.",
    intro: "Make the punchline about your alarm clock, your unfinished game backlog, or the friend who calls every purchase essential. Choose Japanese and tell Jerkstore how familiar or polite the exchange should sound. That extra context matters when you want the roast to fit a friendly message instead of an unexpectedly formal confrontation.",
    styleNotes: [
      "Explain whether the recipient is a friend or whether you want mock-polite wording.",
      "Ask for plain, conversational Japanese when readability matters more than elaborate wordplay.",
      "Japanese output is generated text; check nuance and politeness before sending it.",
    ],
    promptExamples: [
      "Roast my alarm clock's losing streak in casual Japanese for a friend group.",
      "Give my unfinished game backlog a short Japanese roast with mock-polite wording.",
      "Write a playful Japanese comeback for my friend who labels every gadget an essential purchase.",
    ],
    faq: [
      { question: "Can I make a Japanese roast sound friendly?", answer: "Start with Mild intensity and describe the relationship and desired register in the topic. Ask for playful Japanese banter between friends. Japanese phrasing can carry nuances of politeness, so review the result with the intended audience in mind." },
      { question: "Will Japanese insults include romaji or pronunciation?", answer: "Jerkstore generates a roast in the selected language; it does not provide a dedicated pronunciation lesson. You can request romaji in the topic, but formatting and accuracy are not guaranteed. Use a language reference if you need reliable reading guidance." },
    ],
  },
  Russian: {
    name: "Russian",
    slug: "russian",
    category: "Living languages",
    description: "Generate AI insults in Russian for broken gadgets, overstuffed schedules, and friendly roast battles. Give Jerkstore a topic and choose the intensity.",
    intro: "Your laptop fan sounds like it is preparing for takeoff, your inbox has become an archaeological site, and your to-do list has sequels. Give one of those details to Jerkstore and select Russian for the roast. You can ask for a short deadpan response or a more theatrical complaint without making the joke about anyone's background.",
    styleNotes: [
      "Russian output can use Cyrillic; request transliteration only if you need it.",
      "Specify the recipient and preferred formality to help the line fit the conversation.",
      "Ask for simple wording if the audience includes people learning Russian.",
    ],
    promptExamples: [
      "Roast my laptop fan that sounds ready for takeoff in one deadpan Russian sentence.",
      "Write a playful Russian insult about my inbox becoming an archaeological site.",
      "Give my never-ending to-do list a dramatic Russian roast with simple wording.",
    ],
    faq: [
      { question: "Are Russian roasts written in Cyrillic?", answer: "Russian commonly appears in Cyrillic, and the Russian setting asks the AI for that language. If you want a Latin-script transliteration, say so in the topic. Review the result because Jerkstore does not validate transliteration conventions." },
      { question: "Can I avoid profanity in a Russian insult?", answer: "Choose Mild, whose generation instructions prohibit swearing, and ask for playful wording. Language selection controls the requested language while intensity controls the style. Check the generated line if it will be shared in a setting with strict language rules." },
    ],
  },
  Arabic: {
    name: "Arabic",
    slug: "arabic",
    category: "Living languages",
    description: "Create AI insults in Arabic with Jerkstore. Describe the joke, request a preferred register or dialect, and choose how playful or sharp it should be.",
    intro: "Roast an eternally buffering video, a friend who treats lateness as a scheduling system, or your doomed attempt to keep a desk tidy. Select Arabic and describe the register you want. Because the app has one Arabic option, a request for Modern Standard Arabic or a particular dialect belongs in the topic itself.",
    styleNotes: [
      "Name Modern Standard Arabic or your preferred dialect in the request.",
      "Give the intended audience and relationship so the tone has useful context.",
      "Dialect expressions can shift meaning; check generated phrasing when local nuance matters.",
    ],
    promptExamples: [
      "Roast a video that buffers at every good moment in clear Modern Standard Arabic.",
      "Write a playful Arabic comeback for a friend who is always 'five minutes away'; use Egyptian Arabic.",
      "Give my desk's permanent clutter a short Arabic roast with simple vocabulary.",
    ],
    faq: [
      { question: "Which Arabic dialect does Jerkstore use?", answer: "Arabic is the selector option; it does not expose separate dialect controls. Describe the dialect or ask for Modern Standard Arabic in the topic. The output is an AI attempt at that instruction, so a dialect request does not guarantee native-level phrasing." },
      { question: "Can I write the roast topic in English and get an Arabic reply?", answer: "Yes. Describe the situation in English and select Arabic for the output. Include Arabic wording in the topic when a particular phrase is part of the joke, and explain the context rather than expecting a literal translation to preserve the humor." },
    ],
  },
  Italian: {
    name: "Italian",
    slug: "italian",
    category: "Living languages",
    description: "Generate AI insults in Italian with Jerkstore. Create playful Italian roasts of everyday habits, chaotic chats, and spectacularly bad ideas.",
    intro: "A group chat with seventeen plans and no decision is ready for a roast. So is your fifth attempt to organize a cupboard, or the friend who recommends a film and immediately tells you the ending. Choose Italian and give Jerkstore the comic detail you want the punchline to notice.",
    styleNotes: [
      "Ask for everyday Italian for a message or a deliberately theatrical tone for a bigger roast.",
      "Specify friendly teasing when you want the joke to feel like banter.",
      "The Italian selector does not promise regional dialect accuracy; describe regional preferences explicitly.",
    ],
    promptExamples: [
      "Roast a group chat with seventeen plans and no decision in conversational Italian.",
      "Write a playful Italian comeback about my fifth failed attempt to organize a cupboard.",
      "Give my spoiler-loving friend a theatrical Italian roast without swearing.",
    ],
    faq: [
      { question: "Can Italian AI insults sound theatrical?", answer: "Yes. Add a request for an exaggerated, theatrical delivery to the topic. You can also ask for a restrained one-liner. Keeping the roast tied to a specific habit helps either style have an actual joke to deliver." },
      { question: "Does the Italian setting include regional dialects?", answer: "The supported option is Italian. Regional dialects are not separate selector entries. Describe any preferred wording in your topic, and review the result if dialect fidelity matters; Jerkstore does not certify regional usage." },
    ],
  },
  Korean: {
    name: "Korean",
    slug: "korean",
    category: "Living languages",
    description: "Create AI insults in Korean for playful chat replies and everyday roast topics. Use Jerkstore to set the situation, tone, and requested level of formality.",
    intro: "Give your Korean roast a recognizable scene: headphones that vanish daily, a gaming teammate who blames the furniture, or a friend whose quick update becomes an entire series. Tell Jerkstore who the line is for and whether you want familiar or polite wording. A little relationship context helps the AI aim for the right register.",
    styleNotes: [
      "Specify a close-friend context or a polite style rather than leaving the relationship unclear.",
      "Ask for natural, short Korean wording if you want a quick chat reply.",
      "Review speech level and nuance; generated comedy is not a verified Korean translation.",
    ],
    promptExamples: [
      "Roast my headphones that disappear every day in casual Korean between close friends.",
      "Write a short Korean comeback about a gaming teammate blaming the chair for every loss.",
      "Give a friend's never-ending 'quick update' a mock-polite Korean roast.",
    ],
    faq: [
      { question: "Can I choose a Korean speech level for the roast?", answer: "Include the desired level of familiarity or politeness in your topic, such as casual speech between close friends. Jerkstore has a Korean language option rather than a separate speech-level selector. Check the result because speech level can change how a joke lands." },
      { question: "Are Korean AI insults suitable for a group chat?", answer: "They can be written for that context. Ask for short, playful Korean wording and choose Mild to request a roast without swearing. Make the joke about a recognizable habit or situation and review it before sending to your group." },
    ],
  },
  Portuguese: {
    name: "Portuguese",
    slug: "portuguese",
    category: "Living languages",
    description: "Generate AI insults in Portuguese with Jerkstore. Request Brazilian or European Portuguese in your topic and turn everyday frustrations into roasts.",
    intro: "Roast the delivery tracker that has been almost there for an hour, a friend who turns one question into twenty messages, or your collection of abandoned hobbies. Select Portuguese and describe whether you prefer Brazilian or European wording. The best starting point is a concrete situation your audience can picture.",
    styleNotes: [
      "Name Brazilian or European Portuguese when vocabulary and phrasing should fit a particular audience.",
      "Ask for a conversational reply if the roast is meant for a message thread.",
      "Use a single specific detail to keep a short Portuguese punchline focused.",
    ],
    promptExamples: [
      "Roast a delivery tracker stuck on 'almost there' in casual Brazilian Portuguese.",
      "Write a short European Portuguese comeback for a friend who sends twenty messages instead of one.",
      "Give my cupboard of abandoned hobby supplies a playful Portuguese roast.",
    ],
    faq: [
      { question: "Can I generate Brazilian Portuguese insults?", answer: "Yes. Select Portuguese and request Brazilian Portuguese in the topic. You can request European Portuguese the same way. These are instructions within one Portuguese setting, so review the output for the regional vocabulary and phrasing you wanted." },
      { question: "Will a Portuguese roast preserve an English pun?", answer: "A direct translation may lose the joke. Describe what makes the situation funny and ask for a fresh Portuguese punchline. That gives the AI room to write a roast for the selected language instead of forcing the original wordplay." },
    ],
  },
  Hindi: {
    name: "Hindi",
    slug: "hindi",
    category: "Living languages",
    description: "Create AI insults in Hindi with Jerkstore. Roast late replies, failed plans, and ordinary frustrations with the script and conversational style you request.",
    intro: "Your unread messages have their own unread messages, your study timetable is more ambitious than your day, and your charger is never where you left it. Give Jerkstore one of those situations and choose Hindi. Add whether you want Devanagari, Romanized wording, or a particular amount of English mixing so the request has a clear direction.",
    styleNotes: [
      "Specify Devanagari or Romanized Hindi when you have a script preference.",
      "Ask for Hindi without English mixing, or describe a Hinglish preference in the topic.",
      "Explain who the roast is for to guide familiar or respectful forms of address.",
    ],
    promptExamples: [
      "Roast my unread-message mountain in conversational Hindi using Devanagari.",
      "Write a playful Romanized Hindi comeback about my impossible study timetable.",
      "Give my constantly missing phone charger a short Hindi roast without English mixing.",
    ],
    faq: [
      { question: "Can I request Hindi insults in Roman letters?", answer: "Yes. Select Hindi and request Romanized Hindi in the topic. You can also explicitly request Devanagari. Jerkstore does not enforce a transliteration standard, so check readability if the roast is for an audience with a preferred spelling convention." },
      { question: "Does Hindi mode also support Hinglish requests?", answer: "Hindi is the supported selector entry. You can request Hindi-English mixing in your topic, but Hinglish is not a separate setting. State how much mixing you want so the AI has a clearer instruction than the language label alone." },
    ],
  },
  Dutch: {
    name: "Dutch",
    slug: "dutch",
    category: "Living languages",
    description: "Generate AI insults in Dutch for everyday roast material and quick comebacks. Give Jerkstore a situation and choose the intensity of the joke.",
    intro: "Make your Dutch roast about the charger borrowed forever, the recipe with fourteen unnecessary steps, or the friend who declares every broken object an easy fix. Select Dutch and ask for a concise reply or a longer comic takedown. The joke gets a stronger foothold when the topic includes the exact behavior you want to tease.",
    styleNotes: [
      "Ask for concise, conversational Dutch when you want a quick comeback.",
      "Mention the Netherlands or a Belgian Dutch context if that wording matters.",
      "Use everyday details instead of relying on a broad label for the person being roasted.",
    ],
    promptExamples: [
      "Roast a friend who borrowed my charger permanently in one conversational Dutch sentence.",
      "Write a playful Dutch insult about a recipe with fourteen steps to make toast.",
      "Give my friend's 'easy fix' that broke the shelf a short Dutch comeback.",
    ],
    faq: [
      { question: "Can I request Belgian Dutch wording?", answer: "Select Dutch and describe a Belgian Dutch or Flemish context in the topic. There is no separate regional selector. The AI can attempt the requested vocabulary, but local expressions should be reviewed if regional accuracy is important." },
      { question: "How can I make a Dutch roast more specific?", answer: "Replace a generic target with a recognizable behavior and consequence. A friend whose easy repair broke the shelf gives the generator a complete comic situation. Add 'one short Dutch sentence' if you want the result to work as a quick reply." },
    ],
  },
  Turkish: {
    name: "Turkish",
    slug: "turkish",
    category: "Living languages",
    description: "Create AI insults in Turkish with Jerkstore. Generate playful roasts and sharper comebacks around a topic, an audience, and your chosen heat level.",
    intro: "Put your overflowing camera roll, endlessly postponed workout, or friend's Olympic-level excuse-making into a Turkish roast. Jerkstore starts with the situation you describe, then follows the selected language and intensity. Ask for plain conversational wording if you want the line to feel at home in a message thread.",
    styleNotes: [
      "Describe a familiar or formal relationship to help set the form of address.",
      "Request standard Turkish or explain any local expression you want included.",
      "Short, concrete situations help the generator write a punchline without a long setup.",
    ],
    promptExamples: [
      "Roast my overflowing camera roll in short conversational Turkish.",
      "Write a playful Turkish comeback about my workout plan that starts every next Monday.",
      "Give my friend's elaborate excuses a mock-formal Turkish review.",
    ],
    faq: [
      { question: "Can Turkish AI insults use a formal tone?", answer: "Yes. Request formal Turkish or a mock-formal review in your topic. Explain the relationship to the recipient if the form of address matters. Formality is part of the generation request rather than a separate control." },
      { question: "Can I include a Turkish expression in my roast topic?", answer: "Yes. Add the expression and explain the joke you want it to serve. The AI may adapt it rather than repeat it exactly. Check the result for natural phrasing, particularly when the expression has a meaning that depends on context." },
    ],
  },
  Vietnamese: {
    name: "Vietnamese",
    slug: "vietnamese",
    category: "Living languages",
    description: "Generate AI insults in Vietnamese with Jerkstore. Create topic-based roasts and guide the wording with relationship context, register, and intensity.",
    intro: "The friend who records a concert through the entire song, the desk drawer full of dead pens, or your spectacularly optimistic morning routine can all become Vietnamese roast material. Describe the scene and the relationship to the recipient. That gives Jerkstore useful context for a language where forms of address deserve particular care.",
    styleNotes: [
      "Explain the recipient's relationship to you so the AI has context for forms of address.",
      "Ask for Vietnamese with diacritics and check them when copying the generated line.",
      "Name a preferred regional style if local wording matters to the conversation.",
    ],
    promptExamples: [
      "Roast my friend who films the entire concert in conversational Vietnamese between peers.",
      "Write a short Vietnamese roast of my desk drawer full of pens that do not work.",
      "Give my impossible morning routine a playful Vietnamese comeback with full diacritics.",
    ],
    faq: [
      { question: "Why should I describe the recipient for a Vietnamese roast?", answer: "Vietnamese forms of address depend on context and relationship. Mention whether the roast is for a close friend, a peer, or yourself, and request the tone you want. Review the output because the generator cannot know your relationship from a name alone." },
      { question: "Can I request a northern or southern Vietnamese style?", answer: "Yes, by describing the preference in your topic. Vietnamese is the only selector entry, so regional styles are instructions rather than dedicated modes. Check the generated vocabulary with your audience when regional nuance is central to the joke." },
    ],
  },
  Polish: {
    name: "Polish",
    slug: "polish",
    category: "Living languages",
    description: "Create AI insults in Polish for group-chat banter, self-roasts, and everyday irritations. Choose a topic and control the roast intensity with Jerkstore.",
    intro: "Give Polish roast mode a broken umbrella, a phone full of duplicate screenshots, or a friend who brings unsolicited advice to every conversation. Details make a better comic target than a vague request to insult someone. You can steer the result toward a short chat comeback or a more elaborate complaint by describing the delivery you want.",
    styleNotes: [
      "Include relevant context about the person if grammatical forms need to match them.",
      "Request simple, conversational Polish for a roast meant to be read quickly.",
      "Ask for a self-roast if you want the joke aimed squarely at your own habits.",
    ],
    promptExamples: [
      "Roast my umbrella that breaks at the first sign of rain in conversational Polish.",
      "Write a Polish self-roast about my collection of duplicate screenshots.",
      "Give my friend's endless unsolicited advice a short, playful Polish comeback.",
    ],
    faq: [
      { question: "Should I add grammatical context to a Polish roast request?", answer: "Add relevant details if the wording needs to refer to a particular person. Polish grammatical forms can depend on that context. The AI does not reliably infer everything from a name, so review the generated line before using it as a direct message." },
      { question: "Can Jerkstore write Polish self-roasts?", answer: "Yes. Make the topic explicitly about your own habit or mistake and choose Polish. A concrete detail, such as saving six copies of the same screenshot, helps produce a self-roast with a recognizable punchline." },
    ],
  },
  Swedish: {
    name: "Swedish",
    slug: "swedish",
    category: "Living languages",
    description: "Generate AI insults in Swedish with Jerkstore. Turn everyday habits and awkward situations into Swedish roasts with your chosen style and intensity.",
    intro: "Roast the flat-pack project you abandoned halfway through, the calendar invite without an agenda, or your habit of saving articles you will never read. Select Swedish and describe the delivery you want: understated, absurdly formal, or short enough for a chat reply. The scene supplies the joke; the tone shapes how it lands.",
    styleNotes: [
      "Ask for understated humor if you want a quiet punchline instead of a dramatic rant.",
      "Use standard conversational Swedish unless you have a particular local wording in mind.",
      "Specify one sentence when the roast needs to fit a quick reply.",
    ],
    promptExamples: [
      "Roast my unfinished flat-pack shelf in one understated Swedish sentence.",
      "Write a mock-formal Swedish complaint about a calendar invite with no agenda.",
      "Give my unread saved articles a playful Swedish roast for a group chat.",
    ],
    faq: [
      { question: "Can Swedish insults use understated humor?", answer: "Yes. Request an understated or deadpan Swedish line in your topic. Give the AI a clear contradiction to notice, such as a shelf project that has spent a month on the floor, so the joke can work without exaggerated wording." },
      { question: "Can I make the Swedish output easier for a learner to read?", answer: "Ask for simple Swedish, everyday vocabulary, and one short sentence. That is a useful instruction for the generator, but the result is still comedy rather than a graded language lesson or a checked translation." },
    ],
  },
  Danish: {
    name: "Danish",
    slug: "danish",
    category: "Living languages",
    description: "Create AI insults in Danish for playful banter, friendly replies, and everyday roasts. Set the topic, requested tone, and heat level in Jerkstore.",
    intro: "The bike lock you can never open, a streaming queue longer than your lifespan, or your friend's talent for choosing the slowest checkout line gives a Danish roast a clear starting point. Tell Jerkstore what went wrong and ask for the kind of reply you want. A single well-chosen detail can carry an entire one-liner.",
    styleNotes: [
      "Ask for casual written Danish if the line is intended for a message.",
      "Add a dry or exaggerated tone request to shape the delivery around the same topic.",
      "Danish mode generates written comedy and does not check pronunciation or spoken delivery.",
    ],
    promptExamples: [
      "Roast my bike lock that defeats its own owner in casual written Danish.",
      "Write a dry Danish comeback about my endless streaming watchlist.",
      "Give my friend's gift for finding the slowest checkout line a playful Danish roast.",
    ],
    faq: [
      { question: "Can I generate Danish insults for text messages?", answer: "Yes. Ask for casual written Danish and a short response in the topic. Describe the recipient's habit or the specific situation so the line has a punchline that makes sense in the conversation." },
      { question: "Does the Danish insult generator provide audio?", answer: "This language page leads to Jerkstore's text roast generator. It does not turn Danish output into a pronunciation-checked performance. If you plan to say the line aloud, use a reliable pronunciation resource and check the generated phrasing." },
    ],
  },
  Finnish: {
    name: "Finnish",
    slug: "finnish",
    category: "Living languages",
    description: "Generate AI insults in Finnish with Jerkstore. Create dry one-liners, playful self-roasts, and topic-based comebacks at your chosen intensity.",
    intro: "Choose a Finnish roast for your endless software update, your half-finished puzzle, or the friend who optimizes a game more than they play it. Give the generator the situation and the sort of wording you want. A short, dry line and a grand complaint can use the same topic but create very different effects.",
    styleNotes: [
      "State whether you prefer standard written Finnish or a casual conversational style.",
      "Keep the request focused on one problem when you want a compact roast.",
      "Avoid relying on machine-generated wordplay without checking that it makes sense in Finnish.",
    ],
    promptExamples: [
      "Roast a software update that takes longer than the work in one dry Finnish sentence.",
      "Write a playful Finnish self-roast about my permanently half-finished puzzle.",
      "Give my friend who optimizes games instead of playing them a conversational Finnish comeback.",
    ],
    faq: [
      { question: "Can I ask for colloquial Finnish insults?", answer: "Yes. Describe a casual conversational style in the topic, or ask for standard written Finnish if that is easier for your audience. The Finnish selector does not offer separate register controls, and colloquial wording should be reviewed for naturalness." },
      { question: "Is Finnish AI wordplay guaranteed to work?", answer: "No. Jerkstore generates comedy rather than checking a joke with a native-language editor. Give it a situation-based premise that does not depend on a fragile pun, and review any generated wordplay before sharing it." },
    ],
  },
  Norwegian: {
    name: "Norwegian",
    slug: "norwegian",
    category: "Living languages",
    description: "Create AI insults in Norwegian with Jerkstore. Request your preferred written form and turn specific habits or situations into playful roasts.",
    intro: "The group project with one active participant, your phone's suspicious battery estimate, or a friend who never returns borrowed books can become Norwegian roast material. Specify the written form you prefer in the topic and describe the joke's target. Jerkstore's Norwegian selector supplies the language instruction; your details give it a direction.",
    styleNotes: [
      "Request Bokmål or Nynorsk explicitly when the written form matters.",
      "Give a plain, conversational tone instruction for a short message reply.",
      "A dialect imitation is a separate request and should be reviewed carefully for accuracy.",
    ],
    promptExamples: [
      "Roast a group project with only one active member in conversational Norwegian Bokmål.",
      "Write a short Nynorsk roast of my phone's wildly optimistic battery estimate.",
      "Give my friend who never returns borrowed books a playful Norwegian comeback.",
    ],
    faq: [
      { question: "Can I request Bokmål or Nynorsk for a Norwegian roast?", answer: "Yes. Choose Norwegian and name the written form in the topic. There is one Norwegian selector entry, so the written form is a generation instruction. Check the output for consistency, especially if Nynorsk or a specific convention is required." },
      { question: "Can the Norwegian setting imitate a local dialect?", answer: "You can describe a dialect preference, but Jerkstore does not have dedicated dialect modes or a dialect accuracy guarantee. For a dependable chat roast, request the written form your audience uses and build the joke around a concrete situation." },
    ],
  },
  Greek: {
    name: "Greek",
    slug: "greek",
    category: "Living languages",
    description: "Generate AI insults in modern Greek with Jerkstore. Write playful roasts and sharp comebacks around a specific topic and your preferred intensity.",
    intro: "Choose Greek for a modern-language roast of your tangled cables, the friend who never decides where to eat, or an app that needs another app to function. Tell Jerkstore the scene and ask for everyday wording or an exaggerated complaint. This Greek page covers the modern option; Ancient Greek has its own separate supported setting.",
    styleNotes: [
      "Use Greek for a modern Greek request and Ancient Greek for the separate historical option.",
      "Ask for conversational wording when you want a reply that fits a current group chat.",
      "Request Greek script or explain any transliteration preference in the topic.",
    ],
    promptExamples: [
      "Roast my drawer of tangled cables in one conversational modern Greek sentence.",
      "Write a playful Greek comeback for a friend who can never choose a restaurant.",
      "Give an app that requires three other apps a dramatic modern Greek roast.",
    ],
    faq: [
      { question: "Is the Greek insult setting modern Greek or Ancient Greek?", answer: "Greek and Ancient Greek are separate supported options. Choose Greek for a modern Greek roast. If you want a historical-language experiment, use the Ancient Greek page and review its output with the limitations of AI-generated historical language in mind." },
      { question: "Can I request Greek insults in Greeklish?", answer: "Select Greek and describe your preferred Latin-script transliteration in the topic. Greeklish is not a separate mode, and spelling conventions can vary. Check the generated line for readability if your audience expects a particular convention." },
    ],
  },
  Hebrew: {
    name: "Hebrew",
    slug: "hebrew",
    category: "Living languages",
    description: "Create AI insults in Hebrew with Jerkstore. Generate topical roasts and guide the wording with conversational context, tone, and intensity.",
    intro: "Give your Hebrew roast the friend who hoards every charging cable, a navigation app that discovers traffic after you enter it, or your drawer of obsolete adapters. The more clearly you describe the nuisance, the more material Jerkstore has for the punchline. Add relevant recipient context when you want the wording to address someone directly.",
    styleNotes: [
      "Request modern conversational Hebrew if the roast is intended for everyday messaging.",
      "Provide relevant grammatical context about the recipient rather than relying on their name alone.",
      "Review the generated wording when gendered forms or local slang are central to the line.",
    ],
    promptExamples: [
      "Roast my friend who hoards every charging cable in conversational Hebrew.",
      "Write a short Hebrew comeback about a navigation app announcing traffic after I enter it.",
      "Give my drawer of obsolete adapters a playful modern Hebrew self-roast.",
    ],
    faq: [
      { question: "Can I ask for modern Hebrew rather than a biblical style?", answer: "Yes. Select Hebrew and request modern conversational wording in your topic. The selector does not provide a separate biblical mode. Give the AI the audience and situation so it has a reason to choose everyday phrasing." },
      { question: "Why might a Hebrew roast need recipient details?", answer: "Hebrew grammatical forms can depend on who is being addressed. Add relevant context if the line is for a particular recipient, then review the result. A name by itself may not give the generator enough information to choose the forms you expect." },
    ],
  },
  Thai: {
    name: "Thai",
    slug: "thai",
    category: "Living languages",
    description: "Generate AI insults in Thai with Jerkstore. Describe a specific annoyance or habit and shape the roast with context, conversational style, and heat.",
    intro: "An online cart that never reaches checkout, a friend who starts a new hobby every weekend, or your speaker's talent for disconnecting at the best part can become Thai roast material. Tell Jerkstore whether you want familiar banter or more polite wording. Relationship context helps the generated line fit the exchange you have in mind.",
    styleNotes: [
      "Describe the relationship and desired level of politeness in the topic.",
      "Request concise conversational Thai for a message rather than a long explanation.",
      "Check particles and pronouns before sharing if they affect the tone you want.",
    ],
    promptExamples: [
      "Roast my shopping cart that never makes it to checkout in friendly conversational Thai.",
      "Write a short Thai comeback for a friend who changes hobbies every weekend.",
      "Give my Bluetooth speaker that disconnects at every good chorus a politely sarcastic Thai roast.",
    ],
    faq: [
      { question: "How do I make a Thai roast sound like friendly banter?", answer: "Describe a close-friend context, request playful Thai wording, and start with Mild intensity. The generator uses those instructions to shape the line. Review pronouns, particles, and nuance because the language selector cannot know the full relationship." },
      { question: "Can Thai insults be generated in a short message format?", answer: "Yes. Ask for one short Thai reply and focus the topic on a single annoyance. A Bluetooth speaker disconnecting during every chorus gives the AI a compact premise that can work without a paragraph of setup." },
    ],
  },
  Bengali: {
    name: "Bengali",
    slug: "bengali",
    category: "Living languages",
    description: "Create AI insults in Bengali with Jerkstore. Generate playful Bengali roasts from a topic and guide the script, regional wording, and intensity.",
    intro: "Roast a to-do list that keeps reproducing, the friend who recommends shows they have not watched, or your habit of saving every box just in case. Select Bengali and describe the delivery you want. A script preference and regional context can help the AI aim for wording that fits the people who will read it.",
    styleNotes: [
      "Request Bengali script or Romanized Bengali when you have a reading preference.",
      "Mention Bangladesh, West Bengal, or another relevant context if regional wording matters.",
      "State how familiar the relationship is to guide forms of address and tone.",
    ],
    promptExamples: [
      "Roast my multiplying to-do list in conversational Bengali using Bengali script.",
      "Write a playful Romanized Bengali comeback for a friend who recommends shows they never watched.",
      "Give my collection of empty boxes a short Bengali self-roast with simple wording.",
    ],
    faq: [
      { question: "Can Bengali insults use Romanized text?", answer: "Yes. Choose Bengali and request Romanized wording in the topic, or explicitly ask for Bengali script. Transliteration conventions vary, and Jerkstore does not validate one particular system, so review the result for your audience's reading preference." },
      { question: "Can I guide Bengali regional wording?", answer: "Include the relevant region and desired conversational style in the topic. Bengali is one supported selector option rather than a set of regional modes. Treat the result as generated comedy and check local expressions when the distinction matters." },
    ],
  },
  "Sindarin Elvish": {
    name: "Sindarin Elvish",
    slug: "sindarin-elvish",
    category: "Fictional languages",
    description: "Generate AI insults in Sindarin Elvish with Jerkstore. Give your fantasy roast a topic and try an AI interpretation of Tolkien's fictional language.",
    intro: "Give your fantasy group's failed stealth roll, an overpacked adventurer, or a wizard with terrible time management a Sindarin Elvish roast. Jerkstore includes Sindarin as a fictional-language option and attempts the requested style through AI generation. Treat the result as a creative experiment: limited documented vocabulary and generated wording can make precise translation unreliable.",
    styleNotes: [
      "Choose Sindarin Elvish specifically; Quenya Elvish is a different supported option.",
      "Fantasy situations and simple ideas give the request a clearer target than dense modern terminology.",
      "AI output may invent or mix forms; check with specialist resources if language accuracy matters.",
    ],
    promptExamples: [
      "Roast our adventurer who failed a stealth roll while carrying twelve pots in Sindarin Elvish.",
      "Give a wizard who is late to every quest a short Sindarin-style fictional-language roast.",
      "Write a playful Sindarin Elvish insult about a ranger who gets lost beside their own camp.",
    ],
    faq: [
      { question: "Are Sindarin Elvish insults verified Tolkien translations?", answer: "No. The Sindarin option asks the AI to generate a fictional-language roast. It can produce invented, mixed, or inaccurate forms, especially for ideas with limited documented vocabulary. Use a specialist Sindarin reference if you need a defensible translation." },
      { question: "What is the difference between the Sindarin and Quenya roast options?", answer: "Sindarin and Quenya are distinct Elvish languages in Tolkien's fictional setting, and Jerkstore lists them separately. Choose the one you want rather than requesting only 'Elvish.' Both outputs are AI interpretations and need review when fidelity matters." },
    ],
  },
  "Quenya Elvish": {
    name: "Quenya Elvish",
    slug: "quenya-elvish",
    category: "Fictional languages",
    description: "Create AI insults in Quenya Elvish with Jerkstore. Turn fantasy mishaps into ceremonial roasts with an AI attempt at this fictional Elvish language.",
    intro: "A grand speech for a very small failure is excellent roast material. Choose Quenya Elvish for the hero who forgets their sword, the quest planner who forgot the map, or an elf whose dramatic entrance ends in a trip. Jerkstore attempts a Quenya-language roast, but the result is generated entertainment and can contain invented vocabulary or inaccurate grammar.",
    styleNotes: [
      "Quenya is its own selector option, separate from Sindarin Elvish.",
      "Ask for a ceremonial or concise delivery and keep the underlying idea simple.",
      "Modern objects and complex puns can push the AI toward invented expressions.",
    ],
    promptExamples: [
      "Give a hero who forgot their sword a ceremonious Quenya Elvish roast.",
      "Roast the quest planner who forgot the map in a short Quenya-style fictional-language line.",
      "Write a playful Quenya Elvish insult about an elf tripping during a dramatic entrance.",
    ],
    faq: [
      { question: "Can Jerkstore guarantee correct Quenya grammar?", answer: "No. Quenya is offered as a fictional-language generation option, and the AI may invent or combine forms. The output has not been checked by a Quenya specialist. Verify it independently if you want to use it in a language study or a carefully researched project." },
      { question: "What topics work well for a Quenya Elvish roast?", answer: "Simple fantasy mishaps provide a clear premise: a forgotten sword, a failed entrance, or a poorly planned quest. You can request ceremonial phrasing for comic contrast. Highly modern terminology may require vocabulary the AI cannot reproduce reliably." },
    ],
  },
  Klingon: {
    name: "Klingon",
    slug: "klingon",
    category: "Fictional languages",
    description: "Generate AI insults in Klingon with Jerkstore. Roast imaginary captains, failed missions, and game-night blunders with an AI fictional-language attempt.",
    intro: "Give your imaginary starship's terrible parking, a captain who cannot mute a microphone, or a game-night rival's empty boasting a Klingon roast. Select Klingon and describe the failure you want the line to notice. The AI attempts the requested fictional language, but recognizable vocabulary is not proof that the grammar or spelling is correct.",
    styleNotes: [
      "Ask for a short, direct roast when the topic is a single failure or boast.",
      "Klingon spelling conventions need care; review generated capitalization and wording.",
      "Treat the output as fan-oriented comedy rather than an authoritative Klingon translation.",
    ],
    promptExamples: [
      "Roast a starship captain who cannot park in a short Klingon fictional-language line.",
      "Give my game-night rival's empty victory speech a playful Klingon roast.",
      "Write a Klingon insult about a commander defeated by the mute button.",
    ],
    faq: [
      { question: "Are AI-generated Klingon insults linguistically checked?", answer: "No. Jerkstore requests Klingon from its AI model, but it does not run a Klingon grammar or spelling validator. Generated forms can be wrong even when they look familiar. Consult established Klingon language resources for a verified translation." },
      { question: "Can I use Klingon roast mode for science-fiction roleplay?", answer: "Yes. Describe your fictional character's mistake or failed mission and choose the tone. The result can serve as a creative roleplay prompt, provided everyone understands that the language output is an AI attempt rather than confirmed dialogue from an official work." },
    ],
  },
  Dothraki: {
    name: "Dothraki",
    slug: "dothraki",
    category: "Fictional languages",
    description: "Create AI insults in Dothraki with Jerkstore. Give a fantasy roast a clear topic and explore an AI attempt at the fictional language.",
    intro: "A warrior who brings the wrong supplies, a boastful rider with no sense of direction, or a fantasy rival who loses to their own equipment gives Dothraki mode a specific comic target. Jerkstore attempts the language named in the selector. The result is playful generated material, and its vocabulary or grammar may not match documented Dothraki.",
    styleNotes: [
      "Use a simple fantasy situation to reduce dependence on modern or technical vocabulary.",
      "Specify playful boasting or a brief comeback to guide the roast's delivery.",
      "Check against dedicated language resources before treating any output as correct Dothraki.",
    ],
    promptExamples: [
      "Roast a fantasy warrior who packed snacks but forgot all their equipment in Dothraki.",
      "Give a boastful rider with no sense of direction a short Dothraki-style roast.",
      "Write a playful Dothraki fictional-language insult about a rival tripping over their own gear.",
    ],
    faq: [
      { question: "Does the Dothraki insult generator use verified vocabulary?", answer: "The AI may draw on learned language patterns, but Jerkstore does not verify its output against a Dothraki dictionary or grammar. Invented and inaccurate wording is possible. Treat the result as a fictional-language experiment and check it if fidelity matters." },
      { question: "Can Dothraki mode roast a modern topic?", answer: "You can request any ordinary roast topic, but modern terminology may be difficult to express accurately in the fictional language. A simple description of the underlying behavior, such as boasting or forgetting supplies, gives the AI a clearer premise." },
    ],
  },
  "High Valyrian": {
    name: "High Valyrian",
    slug: "high-valyrian",
    category: "Fictional languages",
    description: "Generate AI insults in High Valyrian with Jerkstore. Create theatrical fantasy roasts with an AI interpretation of the fictional language.",
    intro: "Put a failed royal decree, a dragon keeper who misplaced the feed, or an adventurer's overblown title into a High Valyrian roast. A lofty delivery can make a tiny mistake feel comically important. Jerkstore generates an AI attempt at the fictional language; it does not certify the result's grammar, vocabulary, or relationship to official dialogue.",
    styleNotes: [
      "Request High Valyrian specifically instead of an unspecified Valyrian variety.",
      "Ask for grand, ceremonial phrasing when you want comic contrast with a trivial failure.",
      "Review the generated language with specialist materials before using it as a translation.",
    ],
    promptExamples: [
      "Give a royal decree about missing snacks a grand High Valyrian roast.",
      "Roast a dragon keeper who misplaced the feed in a short High Valyrian fictional-language line.",
      "Write a High Valyrian insult about an adventurer with six titles and zero completed quests.",
    ],
    faq: [
      { question: "Is High Valyrian roast output guaranteed to be grammatical?", answer: "No. The model attempts High Valyrian in response to the selector, but generated grammar and vocabulary can be inaccurate. Jerkstore does not validate the language or supply an official translation. Check specialist resources if correctness is part of your project." },
      { question: "Can a High Valyrian roast use a royal or ceremonial tone?", answer: "Yes. Describe that delivery in your topic and give it a concrete failure to mock. An elaborate declaration about a missing snack or a failed quest can create the intended comic contrast without depending on copied dialogue." },
    ],
  },
  "Ancient Greek": {
    name: "Ancient Greek",
    slug: "ancient-greek",
    category: "Historical languages",
    description: "Create AI insults in Ancient Greek with Jerkstore. Turn modern mishaps into historical-language roast experiments and guide the requested style.",
    intro: "Give a philosopher who never finishes an argument, a messenger who loses the message, or your phone's endless notifications an Ancient Greek roast. Historical-language mode is a creative way to make a small annoyance sound very old and very important. AI-generated Ancient Greek can contain inaccurate forms and improvised vocabulary, so treat it as entertainment rather than a scholarly translation.",
    styleNotes: [
      "Ancient Greek is separate from Jerkstore's modern Greek option.",
      "A period or dialect preference can be added to the topic, but consistency is not guaranteed.",
      "Simple ideas reduce the need for invented equivalents of modern technical terms.",
    ],
    promptExamples: [
      "Roast a philosopher who never finishes an argument in an Ancient Greek language attempt.",
      "Give a messenger who lost the message a short Ancient Greek roast.",
      "Write a theatrical Ancient Greek insult about my phone's endless notifications.",
    ],
    faq: [
      { question: "Can I use an Ancient Greek roast for a language assignment?", answer: "Jerkstore is a comedy generator, and its Ancient Greek output is not academically verified. Grammar, accents, dialect, and vocabulary can be inaccurate. Use reliable texts and language references for coursework, and treat the roast as a creative prompt requiring review." },
      { question: "Can I request Attic or another Ancient Greek variety?", answer: "You can name the variety in the topic. The app has one Ancient Greek selector and no dedicated historical dialect validation. A specific request may guide the model, but it does not guarantee that every form belongs to the same variety." },
    ],
  },
  Latin: {
    name: "Latin",
    slug: "latin",
    category: "Historical languages",
    description: "Generate AI insults in Latin with Jerkstore. Give everyday failures a mock-grand roast while treating the historical-language output as an AI experiment.",
    intro: "Your inbox can receive a mock decree, your broken printer can stand accused, and your procrastination can get the grand speech it never asked for. Choose Latin and describe the mundane failure you want to elevate into a roast. Jerkstore attempts Latin through AI generation, so declensions, phrasing, and invented terms for modern objects need independent review.",
    styleNotes: [
      "Ask for a compact maxim or an exaggerated proclamation to shape the joke.",
      "Describe a classical or later Latin preference if you have one, while expecting possible inconsistency.",
      "A Latin-looking line is not proof of correct grammar or a reliable translation.",
    ],
    promptExamples: [
      "Give my overflowing inbox a mock-grand Latin decree.",
      "Roast a printer that refuses to print in a short Latin-language attempt.",
      "Write a playful Latin maxim about my talent for postponing every task.",
    ],
    faq: [
      { question: "Are Latin AI insults accurate enough for a tattoo or inscription?", answer: "Do not rely on an unchecked generated roast for permanent wording. Jerkstore does not validate Latin grammar or meaning. Have a qualified Latin reader review the line and your intended sense before using it where corrections would be difficult." },
      { question: "Can I ask for a short Latin motto as a roast?", answer: "Yes. Request a compact motto or maxim and give the AI one clear habit to mock. The result may have the comic form you want, but its Latin still needs independent checking if linguistic accuracy matters." },
    ],
  },
  "Old English": {
    name: "Old English",
    slug: "old-english",
    category: "Historical languages",
    description: "Create AI insults in Old English with Jerkstore. Explore historical-language roasts of boastful heroes and everyday failures with clear output limitations.",
    intro: "Give a boastful hero who forgot the shield, a feast planner who forgot the food, or your unreliable alarm an Old English roast. This option aims at the historical language rather than modern English decorated with a few archaic words. The AI can still mix periods or invent forms, so the output needs specialist checking if authenticity matters.",
    styleNotes: [
      "Old English is different from Middle English, Shakespearean English, and the Ye Olde style.",
      "Request the historical language explicitly and keep the idea straightforward.",
      "Generated spellings and grammar are not checked against historical manuscripts or dictionaries.",
    ],
    promptExamples: [
      "Roast a boastful hero who forgot their shield in an Old English language attempt.",
      "Give a feast planner who forgot the food a short historical Old English roast.",
      "Write a mock-heroic Old English insult about my alarm failing to wake me.",
    ],
    faq: [
      { question: "Is Old English the same as Shakespearean English?", answer: "No. Old English is an earlier historical language stage. Shakespearean English is a separate style option in Jerkstore, and Ye Olde English is a playful archaic style. Choose Old English when you want the historical-language experiment rather than theatrical modern wording." },
      { question: "Can I trust an AI-generated Old English translation?", answer: "The output can mix historical forms with later English or invented wording. Jerkstore does not provide a philological check. Treat the line as generated comedy and consult qualified historical-language resources for an accurate translation." },
    ],
  },
  Minion: {
    name: "Minion Speak",
    slug: "minion-speak",
    category: "Fictional languages",
    description: "Generate AI insults in Minion Speak with Jerkstore. Turn everyday chaos into playful fictional gibberish and exaggerated cartoon-style roasts.",
    intro: "Roast a blender that shakes the whole kitchen, the friend who loses every matching sock, or your attempt to assemble a chair upside down. Minion Speak is an entertainment option for playful, cartoon-like sound and invented wording. It is not a standard natural-language translation, and the generated text may mix recognizable words with nonsense syllables.",
    styleNotes: [
      "Use a visual, silly situation that can survive loose or invented wording.",
      "Ask for playful sounds and a compact line if you want a cartoon-like delivery.",
      "Generated Minion Speak is an interpretation, not verified dialogue or an official language transcript.",
    ],
    promptExamples: [
      "Roast my blender that shakes the whole kitchen in playful Minion Speak.",
      "Give a friend who loses every matching sock a short Minion-style fictional gibberish roast.",
      "Write a silly Minion Speak insult about my upside-down chair assembly.",
    ],
    faq: [
      { question: "Is Minion Speak a real translation mode?", answer: "It is a fictional entertainment style in the selector. The AI generates a playful interpretation that can mix invented syllables and recognizable words. It does not provide a standardized translation with a guaranteed one-to-one meaning." },
      { question: "Can Minion Speak output include recognizable words?", answer: "Yes. This mode may combine sound-like nonsense with words the model associates with the style. If you want a shorter or more gibberish-heavy result, describe that in your topic. Exact formatting or exclusive invented vocabulary is not guaranteed." },
    ],
  },
  "Middle English": {
    name: "Middle English",
    slug: "middle-english",
    category: "Historical languages",
    description: "Create AI insults in Middle English with Jerkstore. Explore medieval-language roast attempts with a concrete topic and a clear distinction from other styles.",
    intro: "An innkeeper who forgot the rooms, a traveler who packed everything except a map, or a storyteller with no ending can become Middle English roast material. Choose the historical-language option and ask for a brief or mock-narrative delivery. Middle English had substantial variation, and Jerkstore's AI output may mix forms or drift into modern archaic-sounding English.",
    styleNotes: [
      "Middle English is separate from Old English and the playful Ye Olde English setting.",
      "Describe a literary inspiration or period preference as guidance rather than expecting exact fidelity.",
      "Check spellings and vocabulary with specialist sources if historical consistency matters.",
    ],
    promptExamples: [
      "Roast an innkeeper who forgot to reserve any rooms in a Middle English language attempt.",
      "Give a traveler who packed everything except the map a short Middle English roast.",
      "Write a mock-narrative Middle English insult about a storyteller who never reaches the ending.",
    ],
    faq: [
      { question: "Is Middle English mode different from Ye Olde English?", answer: "Yes. Middle English requests a historical language stage. Ye Olde English requests a playful archaic style. AI output may blur that distinction, but the options express different aims, and historical Middle English requires specialist review when accuracy matters." },
      { question: "Will Middle English roast output match a single medieval spelling system?", answer: "That is not guaranteed. Historical usage varied, and the generator does not validate a particular text tradition, period, or dialect. You can describe your preference in the topic, but review the result before presenting it as authentic historical language." },
    ],
  },
  "Shakespearean English": {
    name: "Shakespearean English",
    slug: "shakespearean-english",
    category: "Slang and styles",
    description: "Generate AI insults in Shakespearean English with Jerkstore. Give modern failures a dramatic, archaic-flavored roast without claiming authentic Shakespeare text.",
    intro: "Your Wi-Fi outage deserves a soliloquy, your forgotten password a tragic accusation, and your friend's weak excuse a full stage confrontation. Shakespearean English mode asks the AI for a theatrical style with archaic-flavored wording. It produces new generated comedy, so the result is neither a quotation from Shakespeare nor a checked recreation of Early Modern English.",
    styleNotes: [
      "Ask for a brief stage insult, a dramatic monologue, or a mock-tragic accusation.",
      "Put a small modern problem beside a grand dramatic tone for comic contrast.",
      "Archaic pronouns and wording may be inconsistent; treat the setting as a performance style.",
    ],
    promptExamples: [
      "Give my Wi-Fi outage a Shakespearean English accusation fit for a tiny tragedy.",
      "Roast my forgotten password in one theatrical Shakespearean-style line.",
      "Write a brief Shakespearean English stage insult about my friend's transparently weak excuse.",
    ],
    faq: [
      { question: "Are Shakespearean insults copied from Shakespeare's plays?", answer: "The setting requests newly generated comedy in a Shakespearean style. It is not a quotations collection, and a generated phrase should not be attributed to Shakespeare. If you want an actual quotation, consult a reliable edition of the relevant play." },
      { question: "Is Shakespearean English mode historically exact?", answer: "No. The AI may mix modern wording with archaic pronouns and theatrical expressions. It is useful for a playful performance style, but it does not validate Early Modern English grammar or reproduce a particular period's language consistently." },
    ],
  },
  "Victorian English": {
    name: "Victorian English",
    slug: "victorian-english",
    category: "Slang and styles",
    description: "Create AI insults in Victorian English with Jerkstore. Give modern annoyances a mock-formal roast full of elaborate disapproval and comic restraint.",
    intro: "A passive-aggressive note about a missing stapler can become an extravagant declaration of disappointment. Choose Victorian English for a friend who never returns an umbrella, a subscription that refuses to cancel, or your disgracefully messy desk. The mode aims at a playful period-inspired voice, with generated formality rather than historically certified nineteenth-century usage.",
    styleNotes: [
      "Request elaborate courtesy paired with unmistakable comic disapproval.",
      "A letter, formal notice, or short rebuke can give the roast a useful shape.",
      "Victorian English is a style setting; actual speakers and writers of the period varied widely.",
    ],
    promptExamples: [
      "Write a Victorian English rebuke to a friend who never returns my umbrella.",
      "Roast a subscription that refuses to cancel as a scandalously polite Victorian notice.",
      "Give my messy desk a short Victorian-style declaration of disappointment.",
    ],
    faq: [
      { question: "Can Victorian English insults be politely cutting?", answer: "Yes. Ask for elaborate courtesy and a pointed observation in your topic. A mock letter or formal notice is a useful comic format for an ordinary nuisance, such as an umbrella that was borrowed indefinitely." },
      { question: "Does Victorian mode reproduce authentic nineteenth-century speech?", answer: "The option requests a broad, period-inspired style. Victorian usage was diverse, and the AI does not check a particular decade, writer, or social register. Treat the result as original comic pastiche rather than historical evidence." },
    ],
  },
  "Gen Z Slang": {
    name: "Gen Z Slang",
    slug: "gen-z-slang",
    category: "Slang and styles",
    description: "Generate AI insults in Gen Z Slang with Jerkstore. Turn awkward posts, endless selfies, and questionable flexes into playful internet-style roasts.",
    intro: "Roast the post that announces a break from posting, the selfie with a forty-minute preparation process, or your friend's impressive collection of empty motivational captions. Gen Z Slang is an internet-flavored style option rather than a language spoken uniformly by an entire generation. Tell Jerkstore whether you want a readable comeback or a deliberately overloaded slang performance.",
    styleNotes: [
      "Specify light slang if you want the punchline readable without a glossary.",
      "Explain a particular meme or expression in the topic if it is essential to the joke.",
      "Slang shifts quickly, and AI-generated phrasing may feel dated or forced.",
    ],
    promptExamples: [
      "Roast a post announcing a break from posting in Gen Z Slang with a readable punchline.",
      "Give my forty-minute selfie routine a short Gen Z-style comeback.",
      "Write a playful Gen Z Slang roast of empty motivational captions and questionable flexes.",
    ],
    faq: [
      { question: "Will Gen Z Slang insults use the newest memes?", answer: "That is not guaranteed. Slang changes quickly, and the model may use expressions that sound dated or awkward. If a particular meme matters, explain it in your topic and review the output rather than assuming the setting tracks every new trend." },
      { question: "Can I keep a Gen Z roast understandable?", answer: "Yes. Request light slang, one clear punchline, and no pileup of unrelated memes. The Gen Z Slang option sets a style direction; your topic can tell the AI how much of that style should appear in the result." },
    ],
  },
  Pirate: {
    name: "Pirate Speak",
    slug: "pirate-speak",
    category: "Slang and styles",
    description: "Create AI insults in Pirate Speak with Jerkstore. Give everyday failures a theatrical sea-faring roast with playful boasting and nautical-flavored wording.",
    intro: "Your slow Wi-Fi can walk the comic plank, your leaking water bottle can fail its sea trial, and a friend who forgets their wallet can receive a captain's complaint. Pirate Speak is a theatrical speech style, not a distinct historical language. Tell Jerkstore the real annoyance and let a nautical framing give the roast its costume.",
    styleNotes: [
      "Use a nautical metaphor to frame an ordinary failure without losing the actual punchline.",
      "Ask for a short captain's rebuke or an exaggerated sea-story complaint.",
      "The familiar pirate voice is fictionalized performance rather than verified historical speech.",
    ],
    promptExamples: [
      "Roast my slow Wi-Fi in Pirate Speak as a captain's short complaint.",
      "Give my leaking water bottle a Pirate Speak roast about failing its sea trial.",
      "Write a playful pirate insult for a friend who forgets their wallet at every meal.",
    ],
    faq: [
      { question: "Is Pirate Speak an actual historical language?", answer: "In Jerkstore it is a theatrical style built around familiar nautical expressions and comic pirate delivery. It does not represent a single language historically used by all pirates. Treat it as a playful performance voice for your roast." },
      { question: "How do I avoid a Pirate Speak roast that is only catchphrases?", answer: "Give the AI a concrete failure and request one nautical metaphor with a clear punchline. A leaking bottle failing its sea trial is a more useful premise than asking for random pirate words without a target." },
    ],
  },
  "Emoji Only": {
    name: "Emoji Only",
    slug: "emoji-only",
    category: "Slang and styles",
    description: "Generate AI insults in Emoji Only mode with Jerkstore. Try visual roasts of everyday habits using an AI request for emoji instead of ordinary words.",
    intro: "Turn a broken alarm, an overloaded shopping cart, or a friend who photographs every meal into a visual roast. Emoji Only asks the AI to communicate through emoji rather than ordinary words. The fun is in the implied story, but symbols can be interpreted differently and the model may not follow an emoji-only instruction perfectly.",
    styleNotes: [
      "Choose a visual situation that can be represented by a few recognizable symbols.",
      "Request a short sequence if you want the audience to decipher one clear joke.",
      "Emoji meanings vary by context and rendering; the result is not a precise translation.",
    ],
    promptExamples: [
      "Roast my alarm clock losing every morning using only a short sequence of emoji.",
      "Give my overloaded online shopping cart an Emoji Only visual roast.",
      "Roast a friend who photographs every meal with emoji and no ordinary words.",
    ],
    faq: [
      { question: "Will Emoji Only output always contain no text?", answer: "The option instructs the AI to use emoji, but Jerkstore does not guarantee that every generated character will follow the restriction. Review the output and regenerate if you want a completely word-free visual roast." },
      { question: "Can an emoji roast have one definite meaning?", answer: "Usually it leaves room for interpretation. Emoji sequences rely on context, and appearance can differ between devices. Use a simple visual premise and share the relevant situation so the audience has a better chance of understanding the intended joke." },
    ],
  },
  "Brainrot Slang": {
    name: "Brainrot Slang",
    slug: "brainrot-slang",
    category: "Slang and styles",
    description: "Create AI insults in Brainrot Slang with Jerkstore. Try absurd meme-style roasts of online habits, chaotic chats, and spectacularly unnecessary behavior.",
    intro: "Your seventh reaction video to the same clip, a chat that communicates entirely in recycled memes, or a friend who narrates their own aura can become Brainrot Slang roast material. This style aims at deliberately absurd internet phrasing. Describe the behavior underneath the memes so the result has a joke as well as a pile of chaotic expressions.",
    styleNotes: [
      "Ask for a readable punchline or deliberately maximum chaos, depending on your audience.",
      "Explain a specific meme reference if it is necessary to understand the topic.",
      "Brainrot is a fluid style label; the output may use older or loosely related slang.",
    ],
    promptExamples: [
      "Roast my seventh reaction video to the same clip in Brainrot Slang with one readable punchline.",
      "Give a group chat made entirely of recycled memes an absurd Brainrot-style roast.",
      "Write a playful Brainrot Slang insult about my friend narrating their own aura score.",
    ],
    faq: [
      { question: "How is Brainrot Slang different from Gen Z Slang mode?", answer: "Brainrot Slang asks for a more absurd, meme-heavy style, while Gen Z Slang can be requested as lighter conversational internet slang. These are broad creative directions rather than fixed linguistic categories, and generated expressions may overlap." },
      { question: "Can I ask for a specific skibidi-style reference?", answer: "Yes. Put the reference in your topic and explain how it relates to the behavior being roasted. The model may not know every current use of the meme, so review the result for the meaning and level of absurdity you intended." },
    ],
  },
  "Valley Girl": {
    name: "Valley Girl",
    slug: "valley-girl",
    category: "Slang and styles",
    description: "Generate AI insults in Valley Girl style with Jerkstore. Add exaggerated conversational reactions to roasts of tiny dramas and everyday habits.",
    intro: "The plant you forgot to water, a friend who packs six outfits for one afternoon, or a missing charger treated as a personal crisis can become a Valley Girl-style roast. The selector asks for a familiar pop-culture speech performance with exaggerated reactions. Use it as a chosen comic voice rather than a claim about how a community or any particular person speaks.",
    styleNotes: [
      "Ask for expressive reactions while keeping the actual joke about the stated habit.",
      "Request light stylistic markers if repetition starts to drown out the punchline.",
      "This is a broad comic style, and individuals do not all use the same speech patterns.",
    ],
    promptExamples: [
      "Roast my forgotten houseplant in Valley Girl style with an exaggerated reaction.",
      "Give my friend's six outfits for one afternoon a playful Valley Girl-style comeback.",
      "Write a short Valley Girl roast about me treating a missing charger like a personal crisis.",
    ],
    faq: [
      { question: "Can a Valley Girl roast avoid endless filler words?", answer: "Yes. Request a short line with light stylistic markers and a clear observation about the topic. That helps the chosen voice support the joke rather than turning the entire result into repeated interjections." },
      { question: "What does Valley Girl mode represent?", answer: "It requests a broad pop-culture comic voice, not an accurate model of every speaker from a region or group. Use it for a fictional performance and keep the roast aimed at the described situation, such as packing too much for a short outing." },
    ],
  },
  "Cockney Rhyming Slang": {
    name: "Cockney Rhyming Slang",
    slug: "cockney-rhyming-slang",
    category: "Slang and styles",
    description: "Create AI insults in Cockney Rhyming Slang with Jerkstore. Try playful rhyming expressions in topic-based roasts and check the generated slang for sense.",
    intro: "Give a late train, a friend who talks through every film, or your permanently misplaced phone a Cockney Rhyming Slang roast. The joke can draw on rhyming expressions as well as the actual annoyance. Jerkstore asks the AI for the style, but it may invent phrases or confuse an accent imitation with rhyming slang, so review the result for meaning.",
    styleNotes: [
      "Request a small number of rhyming expressions so the punchline stays understandable.",
      "Explain any exact phrase you want to use instead of expecting a guessed meaning.",
      "Rhyming slang is not the same as adding eye-dialect spellings to ordinary English.",
    ],
    promptExamples: [
      "Roast a late train in Cockney Rhyming Slang with one clear rhyming expression.",
      "Give my friend who talks through films a short Cockney Rhyming Slang comeback.",
      "Write a playful Cockney Rhyming Slang roast of my permanently misplaced phone.",
    ],
    faq: [
      { question: "Will Cockney mode use genuine rhyming slang?", answer: "It attempts the requested style, but generated phrases can be invented or used incorrectly. Jerkstore does not validate them against a slang reference. If you want a particular established expression, include it and its intended meaning in the topic." },
      { question: "How can I keep a Cockney Rhyming Slang roast understandable?", answer: "Ask for one or two expressions in otherwise clear wording, and choose a recognizable situation. Too many unexplained substitutions can hide the punchline. A specific topic gives the audience context even if they do not know every expression." },
    ],
  },
  "Ye Olde English": {
    name: "Ye Olde English",
    slug: "ye-olde-english",
    category: "Slang and styles",
    description: "Generate AI insults in Ye Olde English with Jerkstore. Give modern annoyances a playful faux-medieval roast with theatrical archaic-flavored wording.",
    intro: "Summon a mock town-crier complaint about your loud keyboard, proclaim your laundry chair a kingdom of neglect, or accuse a friend of stealing the last biscuit. Ye Olde English is a playful faux-medieval style that dresses modern jokes in archaic-flavored wording. It is distinct from the Old English and Middle English historical-language options.",
    styleNotes: [
      "Use a proclamation, tavern complaint, or mock decree as a comic frame.",
      "Expect stylized modern English rather than a faithful historical language.",
      "Ask for a short line if you want the theatrical wording to remain easy to follow.",
    ],
    promptExamples: [
      "Roast my loud keyboard as a Ye Olde English town-crier complaint.",
      "Give my laundry chair a mock-medieval decree in Ye Olde English.",
      "Write a short Ye Olde English accusation against a friend who ate the last biscuit.",
    ],
    faq: [
      { question: "Is Ye Olde English historically authentic?", answer: "No. In this selector it is a playful faux-archaic style, suitable for mock decrees and theatrical complaints. Old English and Middle English are separate historical-language options. Choose Ye Olde English when readability and comic costume are the aim." },
      { question: "Can I roast a modern gadget in Ye Olde English?", answer: "Yes. Modern subjects create a useful comic mismatch with the mock-medieval delivery. Describe the gadget's actual failure and ask for a proclamation or accusation so the generated line has both a premise and a performance style." },
    ],
  },
  "Australian Slang": {
    name: "Australian Slang",
    slug: "australian-slang",
    category: "Slang and styles",
    description: "Create AI insults in Australian Slang with Jerkstore. Generate casual topic-based roasts and request light regional wording for playful banter.",
    intro: "Roast the friend who borrows tools indefinitely, your attempt to fix a chair with tape, or a phone that dies before the event begins. Australian Slang mode requests an English style with regional expressions. Tell Jerkstore how much slang you want, and keep the joke grounded in a specific behavior instead of assuming everyone in a country shares one voice.",
    styleNotes: [
      "Request light Australian slang when you want casual wording without a caricature.",
      "Explain a local expression if it is important to your intended punchline.",
      "Slang varies by speaker and place, and generated regional wording can be uneven.",
    ],
    promptExamples: [
      "Roast a friend who borrows tools forever with light Australian Slang.",
      "Give my taped-together chair a short Australian-style comeback with a clear punchline.",
      "Write a playful Australian Slang roast of my phone dying before an event starts.",
    ],
    faq: [
      { question: "Can I request Australian slang without an exaggerated accent?", answer: "Yes. Ask for light regional vocabulary and a natural written reply. You can explicitly request no phonetic accent spellings. Australian Slang is a broad style direction, and the strength of the performance can be guided by the topic." },
      { question: "Will every Australian expression in the roast be used correctly?", answer: "That is not guaranteed. AI-generated slang may be dated, forced, or unfamiliar to your audience. Add the expression and explain its role if you want something specific, then check the result with the people who will read it." },
    ],
  },
  "Texas Redneck": {
    name: "Texas Redneck",
    slug: "texas-redneck",
    category: "Slang and styles",
    description: "Generate AI insults in the Texas Redneck style with Jerkstore. Try a fictional folksy roast voice for overconfident repairs and everyday mishaps.",
    intro: "Give the repair that made everything worse, a lawn chair with more confidence than stability, or a friend who insists every problem needs a bigger tool a folksy comic roast. Texas Redneck is the app's name for a broad performance style. Use the voice for a fictional character and aim the joke at the mistake rather than treating a regional label as a description of real people.",
    styleNotes: [
      "Ask for folksy exaggeration or a tall-tale comparison to frame a specific mishap.",
      "Request readable standard spelling if an accent performance would obscure the joke.",
      "Regional speech varies; this selector is a fictional comic voice rather than a dialect guarantee.",
    ],
    promptExamples: [
      "Roast my repair that made everything worse in the Texas Redneck style with a folksy comparison.",
      "Give my unstable lawn chair a short fictional Texas-style roast using readable spelling.",
      "Write a playful tall-tale roast of a friend who thinks every problem needs a bigger tool.",
    ],
    faq: [
      { question: "What does the Texas Redneck option mean in Jerkstore?", answer: "It is the selector's label for a broad, folksy comic performance style. It does not represent all Texans or a verified regional dialect. A fictional character and a specific failed plan give the voice a useful context without making a community the target." },
      { question: "Can I keep this style readable without heavy accent spelling?", answer: "Yes. Request standard spelling, a folksy comparison, and one short punchline in your topic. The style can come from the chosen metaphor and cadence rather than difficult phonetic spellings. Review the result for the level of performance you wanted." },
    ],
  },
  "Pig Latin": {
    name: "Pig Latin",
    slug: "pig-latin",
    category: "Codes and constructed languages",
    description: "Create AI insults in Pig Latin with Jerkstore. Turn a playful English roast into a word-game language attempt and check the generated transformations.",
    intro: "Roast the friend who steals fries, your disappearing remote, or an alarm clock you negotiate with every morning in Pig Latin. The joke starts in an English-like word game rather than the historical Latin language. Jerkstore asks the AI to transform the wording, but rules can vary and individual words may be handled inconsistently.",
    styleNotes: [
      "Keep the underlying roast short so its transformed words remain decipherable.",
      "Specify your preferred vowel-start rule if your group uses a particular Pig Latin convention.",
      "Pig Latin is a language game, not a secure way to conceal a message.",
    ],
    promptExamples: [
      "Roast my friend who steals everyone's fries in a short Pig Latin word-game line.",
      "Give my disappearing remote a playful Pig Latin roast with simple vocabulary.",
      "Write a Pig Latin insult about me negotiating with my alarm clock every morning.",
    ],
    faq: [
      { question: "Is Pig Latin related to the Latin language option?", answer: "They are different supported options. Pig Latin is a word game based on transforming words, commonly from English. Latin requests the historical language. Choose Pig Latin for a decipherable playful transformation rather than a classical-language roast." },
      { question: "Will Jerkstore follow my exact Pig Latin rules?", answer: "You can state the convention in the topic, including how to handle words beginning with vowels. The AI may still transform words inconsistently. Review the line against your chosen rules if correct conversion is part of the game." },
    ],
  },
  "Morse Code": {
    name: "Morse Code",
    slug: "morse-code",
    category: "Codes and constructed languages",
    description: "Generate AI insults in Morse Code with Jerkstore. Try dot-and-dash roasts of everyday mishaps and verify the code before sharing or decoding it.",
    intro: "Make a late reply arrive as dots and dashes, turn a noisy keyboard into a coded complaint, or give an unreliable doorbell an oddly appropriate roast. Morse Code is an encoding option rather than a separate spoken language. Jerkstore requests coded output from the AI, so symbol choices and spacing need checking before you treat the text as decodable Morse.",
    styleNotes: [
      "Request a brief underlying insult to keep the dot-and-dash sequence manageable.",
      "Ask for clear letter and word separation; formatting is part of readability.",
      "The AI is not a dedicated Morse encoder, and generated symbols can contain errors.",
    ],
    promptExamples: [
      "Roast my friend's permanently late replies in Morse Code with clear letter and word spacing.",
      "Write a very short Morse Code insult about my noisy keyboard.",
      "Give my unreliable doorbell a playful dot-and-dash roast with a simple underlying message.",
    ],
    faq: [
      { question: "Are Morse Code insults guaranteed to decode correctly?", answer: "No. The selector asks the AI for Morse-style encoded output, but Jerkstore does not validate every symbol or separator. Decode and check the result with a dedicated Morse tool if you want to share a message that can be recovered reliably." },
      { question: "Is Morse Code output an audio signal?", answer: "This mode produces text in the roast generator. Dots and dashes on a screen are not a timed audio transmission. Use a dedicated Morse resource if you want correct sound timing, training material, or an accurately encoded signal." },
    ],
  },
  Binary: {
    name: "Binary",
    slug: "binary",
    category: "Codes and constructed languages",
    description: "Create AI insults in Binary with Jerkstore. Request zero-and-one encoded roasts of gadget failures and verify the generated bits with a decoder.",
    intro: "Your laptop that crashes during autosave, a password with more rules than a board game, or a calculator that outperforms your mental arithmetic can get a Binary roast. Binary is an encoding-style option, not a natural language. Specify a character encoding and byte grouping if you need recoverable text, then verify the result because the generator does not validate its bits.",
    styleNotes: [
      "Ask for a short ASCII-compatible message if you want straightforward 8-bit grouping.",
      "Name the character encoding and separator format instead of assuming every binary string decodes alike.",
      "Generated zeros and ones may be malformed or incomplete; use a dedicated encoder for exact conversion.",
    ],
    promptExamples: [
      "Roast my laptop crashing during autosave in binary; use a short ASCII-compatible message and 8-bit groups.",
      "Give my absurdly complicated password rules a Binary roast with space-separated bytes.",
      "Write a short binary-encoded insult about a calculator beating my mental arithmetic.",
    ],
    faq: [
      { question: "What encoding does a Binary roast use?", answer: "Binary by itself does not identify a character encoding. Include the encoding and grouping you want in the topic, such as a short ASCII-compatible message in 8-bit groups. Jerkstore does not validate that the generated bits follow your requested convention." },
      { question: "Can I decode the generated Binary insult?", answer: "You can try a decoder that matches the requested character encoding, but AI-generated bits may not recover a coherent message. Check the result before sharing. If exact conversion is essential, write the roast first and use a dedicated encoder." },
    ],
  },
  Base64: {
    name: "Base64",
    slug: "base64",
    category: "Codes and constructed languages",
    description: "Generate AI insults in Base64 with Jerkstore. Try encoded roasts of everyday tech frustrations and check the result with a dedicated Base64 decoder.",
    intro: "A file named final-final-for-real, a loading spinner that never stops, or your collection of obsolete adapters can receive a Base64 roast. This option requests an encoded text style rather than a spoken language. Base64 is reversible encoding, and Jerkstore's AI can produce strings that look right without decoding correctly, so verify the output before relying on it.",
    styleNotes: [
      "Ask for a short underlying message and specify standard Base64 if format matters.",
      "Base64 is encoding rather than encryption; a valid message is readily decodable.",
      "Use a dedicated encoder or decoder to check the AI-generated string and its recovered text.",
    ],
    promptExamples: [
      "Roast a file named final-final-for-real using standard Base64 encoding of a short message.",
      "Give an endless loading spinner a brief Base64-encoded insult.",
      "Write a playful Base64 roast about my collection of obsolete adapters; keep the underlying text short.",
    ],
    faq: [
      { question: "Does Base64 hide an insult securely?", answer: "No. Base64 is an encoding format, not encryption. Anyone with a suitable decoder can recover a valid encoded message. Use this option as a playful presentation style rather than a way to keep a roast confidential." },
      { question: "Why might an AI-generated Base64 roast fail to decode?", answer: "A language model can imitate the appearance of Base64 without performing a correct byte-for-byte conversion. Characters, padding, or the underlying text may be inconsistent. Jerkstore does not validate the output, so check it with a dedicated decoder." },
    ],
  },
  Lojban: {
    name: "Lojban",
    slug: "lojban",
    category: "Codes and constructed languages",
    description: "Create AI insults in Lojban with Jerkstore. Try constructed-language roasts of unclear instructions and contradictory habits with honest AI limitations.",
    intro: "The instructions that explain nothing, a schedule that contradicts itself, or your friend's habit of correcting everyone while being wrong gives a Lojban roast a clear premise. Lojban is a constructed language, and its dedicated selector asks the AI to generate a roast in it. The output can still misuse vocabulary or structure, so language accuracy needs independent checking.",
    styleNotes: [
      "Keep the premise clear and simple instead of making the entire joke depend on ambiguity.",
      "Request a short line if you want to inspect the generated language more easily.",
      "The Lojban option does not run a grammar validator or certify the meaning of the result.",
    ],
    promptExamples: [
      "Roast instructions that explain absolutely nothing in a short Lojban language attempt.",
      "Give my self-contradictory calendar a playful Lojban roast.",
      "Write a Lojban insult about a friend who corrects everyone while being wrong.",
    ],
    faq: [
      { question: "Is Lojban mode a grammar-checked translator?", answer: "No. The selector supplies a language instruction to the AI. Jerkstore does not parse or validate the resulting Lojban, and generated vocabulary or structure can be incorrect. Check the line with reliable Lojban resources if a precise meaning matters." },
      { question: "How should I write a topic for a Lojban roast?", answer: "Give the generator a simple behavior or contradiction and ask for a short line. Unclear instructions or a schedule that contradicts itself provide recognizable premises without making the joke depend entirely on a pun the model may not express accurately." },
    ],
  },
  Esperanto: {
    name: "Esperanto",
    slug: "esperanto",
    category: "Codes and constructed languages",
    description: "Generate AI insults in Esperanto with Jerkstore. Create playful constructed-language roasts around a specific habit, clear context, and your chosen intensity.",
    intro: "Roast an overambitious packing list, a friend who forgets every borrowed book, or your talent for starting three tasks and finishing none in Esperanto. Give Jerkstore the situation and ask for plain or playful wording. Esperanto is a constructed language used by real speakers, but AI-generated comedy still needs review for grammar, vocabulary, and whether the punchline works.",
    styleNotes: [
      "Ask for simple Esperanto if the audience includes learners.",
      "Request Esperanto diacritics or explain a preferred input convention when spelling format matters.",
      "Treat the result as generated comedy rather than a checked translation or teaching example.",
    ],
    promptExamples: [
      "Roast my overambitious packing list in simple Esperanto.",
      "Write a playful Esperanto comeback for a friend who forgets every borrowed book.",
      "Give my three unfinished tasks a short Esperanto self-roast using standard diacritics.",
    ],
    faq: [
      { question: "Is Esperanto mode fictional-language gibberish?", answer: "Esperanto is a constructed language used by real speakers. Jerkstore requests a roast in that language rather than random invented syllables. The generated line can still contain mistakes, so review it with a competent reader if language accuracy matters." },
      { question: "Can I request Esperanto with standard diacritics?", answer: "Yes. Include that preference in the topic, or explain the alternative convention you use when typing. Jerkstore does not validate spelling conventions, so check the result for consistency before using it as an example for learners." },
    ],
  },
};

function buildLanguagePages(): LanguagePage[] {
  const canonicalValues = new Set(PREMIUM_LANGUAGES.map(({ value }) => value));
  const extraValues = Object.keys(LANGUAGE_CONTENT).filter((value) => !canonicalValues.has(value));
  if (extraValues.length > 0) {
    throw new Error(`Jerkstore language pages contain unsupported options: ${extraValues.join(", ")}`);
  }

  const seenValues = new Set<string>();
  const seenSlugs = new Set<string>();

  return PREMIUM_LANGUAGES.map(({ value, label }) => {
    const content = LANGUAGE_CONTENT[value];
    if (!content) {
      throw new Error(`Missing Jerkstore SEO language content for supported option: ${value}`);
    }
    if (seenValues.has(value) || seenSlugs.has(content.slug)) {
      throw new Error(`Duplicate Jerkstore language option or SEO slug: ${value} (${content.slug})`);
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(content.slug)) {
      throw new Error(`Invalid Jerkstore SEO language slug: ${content.slug}`);
    }
    if (content.styleNotes.length < 2 || content.promptExamples.length < 3 || content.faq.length < 2) {
      throw new Error(`Incomplete Jerkstore SEO language content: ${value}`);
    }
    seenValues.add(value);
    seenSlugs.add(content.slug);
    return { value, label, ...content };
  });
}

export const LANGUAGE_PAGES = buildLanguagePages();

export const LANGUAGE_GROUPS = LANGUAGE_CATEGORIES.map((category) => ({
  category,
  pages: LANGUAGE_PAGES.filter((page) => page.category === category),
}));

export function getLanguagePage(slug: string): LanguagePage | undefined {
  return LANGUAGE_PAGES.find((page) => page.slug === slug);
}
