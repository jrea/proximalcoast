// Backlinks Magic Agent - Content Script

console.log("🪄 Magic Agent Active");

// The ONLY origins allowed to drive this agent. Previously any page (or
// any frame in any page) could post AUTOFILL_FORM and have forms filled
// AND auto-submitted with an attacker-chosen payload — this script runs
// on <all_urls>.
const TRUSTED_PARENT_ORIGINS = [
  "https://backlinks.proximalcoast.com",
  "http://lvh.me:3000",
  "http://backlinks.lvh.me:3000",
  "http://localhost:3000",
];

// Listen for messages from the parent window (the Backlinks app)
window.addEventListener("message", (event) => {
  if (!TRUSTED_PARENT_ORIGINS.includes(event.origin)) return;
  if (event.data?.type === "AUTOFILL_FORM") {
    console.log("🪄 Received Data:", event.data.payload);
    fillForm(event.data.payload);
  }
});

function fillForm(data) {
  const inputs = document.querySelectorAll("input, textarea, select");
  let filledCount = 0;

  inputs.forEach((input) => {
    // Skip hidden types
    if (input.type === "hidden" || input.type === "submit" || input.type === "button") return;
    
    // Heuristics: Check ID, Name, Label, Placeholder
    const label = findLabelForInput(input);
    const identifier = (input.id + " " + input.name + " " + (input.placeholder || "") + " " + (label || "")).toLowerCase();

    // Mapping Logic
    if (match(identifier, ["name", "product", "title"]) && !match(identifier, ["user", "first", "last"])) {
      setValue(input, data.productName);
      filledCount++;
    } else if (match(identifier, ["url", "website", "link"])) {
      setValue(input, data.productUrl);
      filledCount++;
    } else if (match(identifier, ["description", "about", "pitch"])) {
       // Prefer long description for textareas, short for inputs
       if (input.tagName === "TEXTAREA") {
         setValue(input, data.longDescription || data.description);
       } else {
         setValue(input, data.shortDescription || data.description);
       }
       filledCount++;
    } else if (match(identifier, ["twitter", "x.com"])) {
      setValue(input, data.twitter);
      filledCount++;
    } else if (match(identifier, ["message", "comment"])) {
       // Only fill if we have nothing else?
    }
  });

  if (filledCount > 0) {
    console.log(`🪄 Filled ${filledCount} fields.`);
    // NO auto-submit. Submitting a form is the consequential step, and
    // it stays with the user: highlight the submit button so it is one
    // obvious click away, and tell the parent app the form is ready.
    const submitBtn = findSubmitButton();
    if (submitBtn) {
      submitBtn.style.outline = "3px solid #38b2ac";
      submitBtn.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    notifyParentReady();
  }
}

function findSubmitButton() {
    // Try standard selector
    let btn = document.querySelector('button[type="submit"], input[type="submit"]');
    if (btn) return btn;
    
    // Try identifying by text
    const buttons = document.querySelectorAll('button, a.btn, div.btn');
    for (let b of buttons) {
        if (b.innerText.toLowerCase().includes("submit") || b.innerText.toLowerCase().includes("post")) {
            return b;
        }
    }
    return null;
}

function match(text, keywords) {
  return keywords.some(k => text.includes(k));
}

function setValue(input, value) {
  if (!value) return;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  input.style.backgroundColor = "#e6fffa"; // Highlight match
  input.style.border = "2px solid #38b2ac";
}

function findLabelForInput(input) {
    if (input.labels && input.labels.length > 0) return input.labels[0].innerText;
    // Try finding a preceding label tag?
    return ""; 
}

function notifyParentReady() {
    // Tell the parent app the form is filled and ready for the USER to
    // submit. Targeted at trusted origins only — never '*'.
    for (const origin of TRUSTED_PARENT_ORIGINS) {
      window.parent.postMessage({ type: 'MAGIC_FORM_READY', url: window.location.href }, origin);
    }
}
