
const ADJECTIVES = [
  "Mediocre", "Disappointing", "Average", "Forgettable", "Bland", "Basic", "Vanilla", "Beige",
  "Subpar", "Lackluster", "Meh", "Underwhelming", "Generic", "Invisible", "Hollow", "Empty",
  "Vapid", "Shallow", "Tepid", "Lukewarm", "Stale", "Rusty", "Dusty", "Moldy", "Soggy",
  "Limp", "Withered", "Grim", "Sad", "Pathetic", "Desperate", "Thirsty", "Salty", "Bitter",
  "Sour", "Toxic", "Cringe", "Awkward", "Clumsy", "Inept", "Useless", "Pointless", "Absurd",
  "Ridiculous", "Laughable", "Pitiful", "Tragic", "Doomed", "Cursed", "Broken", "Damaged",
  "Flawed", "Defective", "Glitchy", "Laggy", "Buggy", "Trash", "Garbage", "Wasteful", "Toxic",
  "Noxious", "Vile", "Gross", "Nasty", "Filthy", "Dirty", "Greasy", "Slimy", "Sticky", "Moist",
  "Dank", "Musty", "Foul", "Rank", "Putrid", "Rotten", "Spoiled", "Ruined", "Wrecked", "Destroyed",
  "Obliterated", "Annihilated", "Crushed", "Smashed", "Broken", "Failed", "Hyped", "Overrated",
  "Pretentious", "Arrogant", "Smug", "Snobby", "Elitist", "Entitled", "Spoiled", "Rude", "Mean",
  "Cruel", "Savage", "Brutal", "Vicious", "Wild", "Feral", "Rabid", "Unhinged", "Deranged",
  "Psychotic", "Manic", "Panic", "Chaos", "Doom", "Gloom", "Dark", "Shadow", "Night", "Void",
  "Abyss", "Null", "Zero", "Negative", "Minus", "Laggard", "Sluggish", "Slow", "Dim", "Dull"
];

const NOUNS = [
  "Gary", "Dave", "Karen", "Kevin", "Chad", "Kyle", "Becky", "Susan", "Linda", "Bob",
  "Steve", "Mike", "John", "Todd", "Brad", "Greg", "Paul", "Mark", "Tim", "Dan",
  "Potato", "Turnip", "Cabbage", "Lettuce", "Onion", "Garlic", "Bean", "Pea", "Corn",
  "Bread", "Toast", "Crumb", "Dust", "Dirt", "Mud", "Sludge", "Slime", "Goo", "Muck",
  "Trash", "Junk", "Scrap", "Waste", "Debris", "Rubble", "Ash", "Soot", "Smoke", "Fume",
  "Gas", "Vapor", "Mist", "Fog", "Haze", "Cloud", "Storm", "Rain", "Snow", "Hail",
  "Wind", "Breeze", "Gust", "Gale", "Blast", "Chill", "Frost", "Ice", "Cold", "Heat",
  "Fire", "Flame", "Spark", "Ember", "Coal", "Rock", "Stone", "Pebble", "Sand", "Gravel",
  "Brick", "Block", "Wall", "Fence", "Gate", "Door", "Window", "Glass", "Mirror", "Shard",
  "Fragment", "Piece", "Bit", "Byte", "Pixel", "Glitch", "Bug", "Error", "Fail", "Loss",
  "Defeat", "Shame", "Guilt", "Regret", "Fear", "Dread", "Panic", "Anxiety", "Stress",
  "Tension", "Pressure", "Strain", "Pain", "Agony", "Misery", "Grief", "Sorrow", "Woe",
  "Doom", "Fate", "Destiny", "Karma", "Luck", "Chance", "Risk", "Bet", "Gamble", "Roll",
  "Flip", "Coin", "Card", "Dice", "Token", "Chip", "Bot", "NPC", "User", "Guest", "Human",
  "Person", "Being", "Entity", "Object", "Thing", "Item", "Tool", "Toy", "Prop", "Asset"
];

export function generateJerkName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 1000);

  return `${adj}_${noun}_${num}`;
}
