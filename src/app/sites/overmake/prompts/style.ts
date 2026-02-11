export const GET_STYLE = (level: number) => {
  if (level <= 3) {
    return `Tone: Rough, informal, slightly aggressive, hillbilly-esque. Use slang, misspellings, and excessive punctuation (!!!). Reference specific trash items (e.g., "half-eaten burrito wrapper"). Be dismissive of "proper" engineering.`;
  } else if (level <= 6) {
    return `Tone: Corporate, bureaucratic, slightly condescending but mostly boring. Use standard contractor lingo ("per code", "load bearing", "invoice"). Focus on the "process" and "requirements".`;
  } else {
    return `Tone: Elite, sophisticated, outrageously articulate, and deeply condescending. Use complex vocabulary, French or Latin phrases (e.g., "pièce de résistance"), and metaphors involving art, history, or quantum physics. Express pity for those who choose "standard" solutions.`;
  }
};
