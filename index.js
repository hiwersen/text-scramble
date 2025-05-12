class TextScramble {
  constructor(el) {
    this.el = el;

    // Get raw text content (may contain \n \r \t and extra white spaces)
    const rawContent = el.innerHTML || el.innerText;

    // Use data-target-text if present,
    // otherwise use rawContent
    this.targetText = el.dataset.targetText || rawContent;

    // Normalize target text
    this.normalizedTargetText = this.normalizeText(this.targetText);

    console.log(this.normalizedTargetText.match(/[\n\r\t]+/g));

    // Get configuration settings
    this.speed = parseFloat(el.dataset.speed) || 1;
    this.direction = el.dataset.direction || "fromLeft";
    this.maxChar = Math.max(
      parseInt(el.dataset.maxChar) || 0,
      this.normalizedTargetText.length
    );

    // Get bezier curve points from data attribute or use defaults
    // Format: "x1,y1,x2,y2" like CSS cubic-bezier
    // Slow at the end:
    // "0.0, 1.0, 0.0, 1.0", "0.0, 0.95, 0.02, 0.98", "0.5, 00, 0.3, 0.98"
    // Slow at the start:
    // "1.0, 0.0, 1.0, 0.0"
    const bezierPoints = el.dataset.bezier || "0.0, 1.0, 0.0, 1.0";
    this.bezierPoints = bezierPoints.split(",").map(parseFloat);

    // Define random characters sets
    this.chars = "░░░░░░░░░░░░░░░░ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    this.lowerCase = "abcdefghijklmnopqrstuvwxyz";
    this.specialChars = "!@#$%^&*()_+=-[]{}|;:,./<>?~⧞§¶¤←↑→↓≈≠≤≥±÷×";
    this.blockChars = "█░▒▓";
  }

  // Handle newlines, returns, tabs and extra white spaces
  normalizeText(text) {
    return text
      .replace(/[\n\r\t]+/g, " ") // Replace newlines, returns and tabs with space
      .replace(/\s+/g, " ") // Collapse multiple spaces into one
      .trim(); // Remove leading/trailing whitespace
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }

  // Cubic Bezier function implementation
  cubicBezier(t, p0, p1, p2, p3) {
    const cX = 3 * (p1 - p0);
    const bX = 3 * (p2 - p1) - cX;
    const aX = p3 - p0 - cX - bX;

    return aX * Math.pow(t, 3) + bX * Math.pow(t, 2) + cX * t + p0;
  }

  // Apply bezier timing to a linear progress value
  applyBezierTiming(linearProgress) {
    // Ensure linearProgress is between 0 and 1
    linearProgress = Math.max(0, Math.min(1, linearProgress));

    // Extract bezier points
    const [x1, y1, x2, y2] = this.bezierPoints;

    // For simplicity in this implementation, we'll approximate the bezier curve
    // This is a simplified approach - a full implementation would use Newton-Raphson method
    // to find the exact t value for the given x (linearProgress)

    // Since we're using cubic-bezier with p0=(0,0) and p3=(1,1), we can simplify
    return this.cubicBezier(linearProgress, 0, y1, y2, 1);
  }

  fromLeft(frame, frames) {
    const text = this.normalizedTargetText;

    // Apply bezier timing to the linear progress
    const linearProgress = frame / frames;
    const bezierProgress = this.applyBezierTiming(linearProgress);

    // Calculate how many characters should be completed
    const progress = bezierProgress * text.length;

    let complete = 0;
    let textContent = "";

    for (let i = 0; i < text.length; i++) {
      const targetChar = text[i];

      if (i < progress) {
        // Character has settled
        complete++;
        textContent += `${targetChar}`;
      } else {
        // Character is still scrambling
        textContent += `${this.randomChar()}`;
      }
    }

    this.el.textContent = textContent;
    return complete === text.length;
  }

  fromRight(frame, frames) {
    const text = this.normalizedTargetText;
    const maxChar = this.maxChar;

    // Apply bezier timing to the linear progress
    const linearProgress = frame / frames;
    const bezierProgress = this.applyBezierTiming(linearProgress);

    // Calculate how many characters should be completed
    const progress = bezierProgress * maxChar;

    let complete = 0;
    let textContent = "";

    for (let i = 0; i < maxChar; i++) {
      if (i < progress) {
        // Character has settled
        const targetChar = text.at(maxChar - 1 - i) || "";

        textContent = `${targetChar}` + textContent;
        complete++;
      } else {
        // Character is still scrambling
        textContent = `${this.randomChar()}` + textContent;
      }
    }

    this.el.textContent = textContent;
    return complete === maxChar;
  }

  start() {
    let frames;
    let frame = 0;
    const text = this.normalizedTargetText;

    const animate = () => {
      let complete;

      if (this.direction === "fromLeft") {
        frames = text.length * this.speed;
        complete = this.fromLeft(frame, frames);
      }

      if (this.direction === "fromRight") {
        frames = this.maxChar * this.speed;
        complete = this.fromRight(frame, frames);
      }

      if (complete || frame >= frames) {
        // Ensure final state
        this.el.textContent = text;
      } else {
        frame++;
        requestAnimationFrame(animate);
      }
    };

    animate();
  }
}

// Initialize all scramble texts
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".scramble-text").forEach((el) => {
    const scrambler = new TextScramble(el);
    scrambler.start();
  });
});
