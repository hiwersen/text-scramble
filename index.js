class TextScramble {
  constructor(el) {
    this.el = el;
    this.targetText =
      el.textContent.trim() || el.dataset.targetText || "Hello, world!";
    this.speed = parseInt(el.dataset.speed) || 5;
    this.chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  }

  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }

  update(frame, frames) {
    let complete = 0;
    let textContent = "";

    for (let i = 0; i < this.targetText.length; i++) {
      const finalChar = this.targetText[i];
      const charProgress = (frame / frames) * this.targetText.length;

      if (i < charProgress) {
        // Character has settled
        complete++;
        textContent += `${finalChar}`;
      } else {
        // Character is still scrambling
        textContent += `${this.randomChar()}`;
      }
    }

    this.el.textContent = textContent;
    return complete === this.targetText.length;
  }

  start() {
    const frames = this.targetText.length * this.speed;
    let frame = 0;

    const animate = () => {
      const complete = this.update(frame, frames);

      if (complete || frame >= frames) {
        // Ensure final state
        this.el.textContent = this.targetText;
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
