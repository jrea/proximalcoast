export interface DrawCardProps {
  input: string;
  displayText: string;
  isSavage: boolean;
  isElite: boolean;
  isTrial: boolean;
  isEmail?: boolean;
}

const FLAME_PATH = "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.3-2.35.9-3.5 1 2.15 2.6 3.5 4.6 3.5z";

export async function drawCardToCanvas(
  canvas: HTMLCanvasElement,
  props: DrawCardProps
) {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  const width = 800;
  const height = 1000;
  canvas.width = width;
  canvas.height = height;

  const { isSavage, isElite, isTrial, isEmail, input, displayText } = props;

  // Ensure fonts are loaded (best effort)
  await document.fonts.ready;

  // 1. Background
  if (isSavage) {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#9333ea");
    grad.addColorStop(0.5, "#db2777");
    grad.addColorStop(1, "#2563eb");
    ctx.fillStyle = grad;
  } else if (isElite) {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#fde047");
    grad.addColorStop(0.5, "#fef08a");
    grad.addColorStop(1, "#facc15");
    ctx.fillStyle = grad;
  } else if (isTrial) {
    ctx.fillStyle = "#4b3621";
  } else {
    ctx.fillStyle = "#ffffff";
  }
  ctx.fillRect(0, 0, width, height);

  // 2. Patterns/Effects
  if (isTrial) {
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.font = "900 12px sans-serif";
    ctx.rotate(-12 * (Math.PI / 180));
    const trialText = "I'M ONLY ON THE TRIAL • I'M ONLY ON THE TRIAL • I'M ONLY ON THE TRIAL • ";
    for (let i = -20; i < 40; i++) {
      ctx.fillText(trialText.repeat(5), -400, i * 40);
    }
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.font = "120px serif";
    for (let i = 0; i < 12; i++) {
      const x = ((i * 23) % 100) / 100 * width;
      const y = ((i * 17) % 100) / 100 * height;
      const rotation = ((i * 45) % 360) * (Math.PI / 180);
      const scale = 0.8 + (i % 3) * 0.2;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);
      ctx.textAlign = "center";
      ctx.fillStyle = "#000";
      ctx.filter = "grayscale(100%)";
      ctx.fillText(i % 2 === 0 ? "💩" : "😭", 0, 0);
      ctx.restore();
    }
    ctx.restore();
  }

  if (isElite || isSavage) {
    // Subtle shimmer lines
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.rotate(-15 * (Math.PI / 180));
    ctx.fillStyle = "#fff";
    for (let i = 0; i < width * 2; i += 100) {
      ctx.fillRect(i, -height, 20, height * 3);
    }
    ctx.restore();
  }

  // 3. Border (Black outline)
  ctx.strokeStyle = isTrial ? "#2a1d15" : "#000000";
  ctx.lineWidth = 24;
  ctx.strokeRect(12, 12, width - 24, height - 24);

  // 4. Input Zone (North)
  ctx.save();
  const inputContainerY = 32;
  const inputContainerX = 24; // Reduced
  const maxInputWidth = width - 48; // Full width usage

  ctx.translate(inputContainerX, inputContainerY);
  ctx.rotate(-1 * (Math.PI / 180));

  // Measure input text
  ctx.font = "bold 24px monospace";
  const fullInputText = `Targeting: ${input || "Unnamed Victim"}`;
  const inputLines = wrapText(ctx, fullInputText, maxInputWidth - 32);
  const inputLineHeight = 36;
  const inputBoxHeight = Math.max(60, inputLines.length * inputLineHeight + 24);

  let longestLineWidth = 0;
  inputLines.forEach(l => {
    const w = ctx.measureText(l).width;
    if (w > longestLineWidth) longestLineWidth = w;
  });
  const inputBoxWidth = Math.min(maxInputWidth, longestLineWidth + 48);

  // Shadow
  ctx.fillStyle = "#000000";
  ctx.fillRect(8, 8, inputBoxWidth, inputBoxHeight);

  // Box
  ctx.fillStyle = isSavage ? "rgba(255,255,255,0.15)" : isTrial ? "#3d2b1f" : "#ffffff";
  ctx.fillRect(0, 0, inputBoxWidth, inputBoxHeight);
  ctx.strokeStyle = isSavage ? "rgba(255,255,255,0.3)" : isTrial ? "#2a1d15" : "#000000";
  ctx.lineWidth = 6;
  ctx.strokeRect(0, 0, inputBoxWidth, inputBoxHeight);

  // Text
  ctx.fillStyle = (isSavage || isTrial) ? "#ffffff" : "#000000";
  ctx.textBaseline = "top";

  inputLines.forEach((line, i) => {
    ctx.fillText(line, 24, 18 + i * inputLineHeight);
  });
  ctx.restore();

  // 5. Roast Zone (Middle)
  ctx.save();
  const padding = 24; // Minimal padding to use full width
  const maxWidth = width - padding * 2;

  // Calculate vertical space available for the roast
  const inputBottom = inputContainerY + inputBoxHeight + 24;
  const footerAreaY = height - 120;
  const maxRoastHeight = footerAreaY - inputBottom;

  let fontSize = 160; // MASSIVE MAX SIZE
  if (displayText.length > 500) fontSize = 48;
  else if (displayText.length > 300) fontSize = 58;
  else if (displayText.length > 200) fontSize = 68;
  else if (displayText.length > 100) fontSize = 84;
  else if (displayText.length > 50) fontSize = 110;

  // Progressive shrinking to fit height
  ctx.textBaseline = "top";
  let lines: string[] = [];
  let totalHeight = 0;

  while (fontSize > 24) {
    ctx.font = `italic 900 ${fontSize}px "Fraunces", serif`;
    if (isTrial) ctx.font = `900 ${fontSize}px "Comic Sans MS", cursive`;

    lines = wrapText(ctx, displayText || "Calculating damage...", maxWidth);
    totalHeight = lines.length * fontSize * 0.95; // tightest leading

    if (totalHeight <= maxRoastHeight) break;
    fontSize -= 4;
  }

  // Set style and color
  if (isTrial) {
    ctx.fillStyle = "#a98467";
  } else {
    ctx.fillStyle = (isSavage || isEmail) ? "#ffffff" : "#000000";
  }

  // Vertical Centering in the available space
  let startY = inputBottom + (maxRoastHeight - totalHeight) / 2;

  lines.forEach((line, i) => {
    ctx.fillText(line, padding, startY + i * (fontSize * 0.95));
  });
  ctx.restore();

  // 6. Minimal Watermark (South)
  ctx.save();
  // Move translation point slightly left to handle italic visual weight shift
  ctx.translate(width / 2 - 8, height - 80);
  ctx.globalAlpha = 0.7;
  const watermarkTextColor = (isSavage || isTrial) ? "#ffffff" : "#000000";

  // Measure text with tracking adjustment
  ctx.font = 'italic 900 24px "Bebas Neue", sans-serif';
  // Use letterSpacing if supported, else fallback to manual measurement adjustment
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = "2.4px";
  }

  const textMetric = ctx.measureText("JERKSTORE");
  let textWidth = textMetric.width;
  // If letterSpacing isn't supported, measureText is too narrow.
  // Add 0.1em * 8 spaces roughly = 2.4 * 8 = 19.2px
  if (!('letterSpacing' in ctx)) {
    textWidth += 20; // 0.1em * length
  }

  const gap = 16;
  const circleRadius = 20;
  const totalWidth = (circleRadius * 2) + gap + textWidth;

  // Calculate center of group
  const circleCX = -totalWidth / 2 + circleRadius;
  const textX = circleCX + circleRadius + gap;

  // Circle around flame
  ctx.beginPath();
  ctx.arc(circleCX, 0, circleRadius, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = watermarkTextColor;
  ctx.stroke();

  // Flame Icon (No Fill) - RED
  ctx.save();
  const fScale = 1.25;
  // Move 1px extra left for perfect visual balance in circle
  ctx.translate(circleCX - 8.5 * fScale - 1, -12.25 * fScale);
  ctx.scale(fScale, fScale);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "#dc2626"; // red-600
  ctx.stroke(new Path2D(FLAME_PATH));
  ctx.restore();

  // Text
  ctx.fillStyle = watermarkTextColor;
  ctx.textAlign = "left";
  ctx.fillText("JERKSTORE", textX, 11);

  ctx.restore();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? currentLine + " " + word : word;
    const info = ctx.measureText(testLine);

    if (info.width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }

      // If the word itself is too long, we might need to break it (optional, usually not needed for prompts)
      // but let's at least push it as its own line
      currentLine = word;

      // If the single word is still too long, it will overflow this line, but the next loop will handle the rest
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
