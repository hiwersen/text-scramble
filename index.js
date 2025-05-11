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

    // Get configuration settings
    this.speed = parseFloat(el.dataset.speed) || 1;
    this.direction = el.dataset.direction || "fromLeft";
    this.maxChar =
      parseInt(el.dataset.maxChar) || this.normalizedTargetText.length;

    // Define random characters sets
    this.chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    this.lowerCase = "abcdefghijklmnopqrstuvwxyz";
    this.specialChars = "!@#$%^&*()_+=-[]{}|;:,./<>?~⧞§¶¤←↑→↓≈≠≤≥±÷×";
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

  fromLeft(frame, frames) {
    const text = this.normalizedTargetText;
    const progress = (frame / frames) * text.length;
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
    const progress = (frame / frames) * maxChar;
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
