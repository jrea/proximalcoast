// Backlinks Magic Agent - Content Script

console.log("🪄 Magic Agent Active");

// Listen for messages from the parent window (the Backlinks app)
window.addEventListener("message", (event) => {
  // Security check: In production, verify event.origin
  // For now, we assume local development or trusted self-hosted env
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
    
    // Attempt Auto-Submit after a short delay to let things settle
    setTimeout(() => {
        const submitBtn = findSubmitButton();
        if (submitBtn) {
            console.log("🪄 Found submit button, clicking...", submitBtn);
            submitBtn.click();
            // We assume success? Ideally we check for success message, but for MVP we signal parent
            // We might want to wait for navigation or a "Thank you" text
            notifyParentSuccess();
        } else {
            console.log("🪄 No submit button found. Manual submission required.");
        }
    }, 1000);
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

function notifyParentSuccess() {
    // Send message back to parent
    window.parent.postMessage({ type: 'MAGIC_SUBMISSION_COMPLETE', url: window.location.href }, '*');
}
