import { Container } from "@/display/Container";
import gsap from "gsap";
import { BitmapText, Graphics, Container as PIXIContainer } from "pixi.js";

export class SpeechBubble extends Container {
  background: PIXIContainer = new PIXIContainer();
  texts: BitmapText[] = [];
  textContainer: PIXIContainer = new PIXIContainer();

  currentPosition: { x: number; y: number } = { x: 5, y: 5 };
  onScreenTexts: BitmapText[] = [];

  constructor(public direction: "left" | "right") {
    super();
    this.direction = direction;
    this.background = this.addChild(new PIXIContainer());
    this.setupBubble();
    this.textContainer = this.addChild(new PIXIContainer());

    for (let i = 0; i < 40; i++) {
      const text = new BitmapText("HI", {
        fontName: "Bangers",
        fontSize: 32,
        align: "left",
      });
      text.tint = 0x0;
      this.texts.push(text);
    }

    this.textContainer.x = 10;
    this.textContainer.y = 10;
  }

  setupBubble() {
    const gfx = new Graphics();

    gfx.beginFill(0xffffff);
    gfx.drawRoundedRect(0, 0, 400, 200, 20);
    gfx.endFill();

    this.background.addChild(gfx);
  }

  reset() {
    this.currentPosition.x = 5;
    this.currentPosition.y = 5;
    while (this.onScreenTexts.length > 0) {
      // remove the text from the container
      const text = this.onScreenTexts.pop();
      if (!text) continue;
      this.textContainer.removeChild(text);
      this.texts.push(text);
      text.alpha = 0;
      // return the text to the pool
    }
    this.onScreenTexts = [];
  }

  async animate(word: string) {
    // get the text from the pool and set the text
    const text = this.texts.shift();
    if (!text) return;
    text.text = word;
    text.x = this.currentPosition.x;
    text.y = this.currentPosition.y;
    this.currentPosition.x += text.textWidth + 7;

    if (text.x + text.textWidth > this.background.width - 10) {
      text.x = 5;
      text.y += 40;
      this.currentPosition.x = text.x + text.textWidth + 7;
      this.currentPosition.y += 40;
    }

    // add the text to the container and keep track of it
    this.textContainer.addChild(text);
    this.onScreenTexts.push(text);

    // animate the text in
    const pos = { x: text.x, y: text.y };
    gsap.fromTo(
      text,
      { alpha: 0, y: pos.y + 5, x: pos.x },
      { alpha: 1, y: pos.y, x: pos.x, duration: 0.3, ease: "power2.out" }
    );
  }
}
