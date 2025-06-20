import gsap from "gsap";
import { Sprite, Texture } from "pixi.js";

/**
 * A card game object
 * needs to be a Sprite as per the instructions
 */
export class Card extends Sprite {
  private back: Texture;
  private front: Texture;

  public isFlipped: boolean = false;
  public isFlipping: boolean = false;

  constructor(suit: string, rank: string) {
    super();
    this.name = `${suit}${rank}`;
    this.back = Texture.from("cardBack_red5.png");
    this.front = Texture.from(`card${suit}${rank}.png`);
    this.texture = this.front;
    this.anchor.set(0.5);
  }

  /**
   * Flip the card
   * @param delay - The delay in seconds
   * @param duration - The duration of the flip
   */
  flip(delay: number = 0, duration: number = 0.5) {
    if (this.isFlipping) return;
    this.isFlipping = true;

    const tl = gsap.timeline({ delay });
    const scale = this.scale.x > 0 ? 1 : -1;

    tl.to(this.scale, {
      x: 0,
      duration: duration * 0.5,
      ease: "power2.in",
    });

    tl.add(() => {
      this.isFlipped = !this.isFlipped;
      this.isFlipping = false;
      this.texture = this.isFlipped ? this.back : this.front;
    });

    tl.to(this.scale, {
      x: -scale,
      duration: duration * 0.5,
      ease: "power2.out",
    });
  }
}
