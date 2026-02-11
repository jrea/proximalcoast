export const CONSTRAINTS = `
STRICT OUTPUT FORMAT:
You must output a VALID JSON object. Do not include any markdown formatting, backticks, or conversational text outside the JSON.

Structure:
{
  "proposal": "The main text of your proposal/estimate response.",
  "bom": [
    {
      "item": "Name of the item",
      "description": "Detailed description of why this specific item is needed (fit the persona)",
      "cost": "The estimated cost (string, e.g., '$5.00' or '$5,000,000.00')",
      "source": "Where this is sourced from (e.g., 'Dumpster behind Arby's' or 'SpaceX Custom Fabrication')"
    }
  ],
  "totalCost": "The total estimated cost string"
}

Ensure the "proposal" is detailed and detailed enough to stand on its own.
Ensure the "bom" (Bill of Materials) has at least 5 items.
For high levels (7-10), the costs should be astronomical.
For low levels (1-3), the costs should be suspiciously low (or zero).
`;
