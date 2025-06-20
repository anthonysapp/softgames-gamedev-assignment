import { Container } from '@/display/Container';
import { SpeechBubble } from '@/gameObjects/SpeechBubble';
import { delay } from '@/utils/delay';
import { AvatarData } from '@/utils/types';
import gsap from 'gsap';
import { BitmapText, Graphics, Sprite, Texture } from 'pixi.js';

/**
 * A talking head
 *
 */
export class Avatar extends Container {
  sprite: Sprite;
  bubble: SpeechBubble | null = null;
  nameField: BitmapText | null = null;
  emoji: Sprite = new Sprite();

  emote: Container = new Container();

  constructor(public data: AvatarData) {
    super();

    this.sprite = this.addChild(new Sprite(Texture.from(data.name)));
    this.createEmote();
    this.addChild(this.emote);
    this.emote.addChild(this.emoji);
    this.emoji.width = 110;
    this.emoji.height = 110;
    this.emoji.position.set(5, 5);
    this.addChild(this.emote);

    this.emote.y = -100;
    this.emote.alpha = 0;

    this.bubble = this.addChild(new SpeechBubble(data.position));
    this.bubble.y = -20;

    if (this.data.position === 'left') {
      this.bubble.x = 140;
    } else {
      this.bubble.x = -120 - 300;
    }

    this.bubble.pivot.y = -10;
    this.bubble.alpha = 0;
  }

  createEmote() {
    const gfx = this.emote.addChild(new Graphics());
    gfx.beginFill(0xffffff);
    gfx.drawRoundedRect(0, 0, 120, 120, 10);

    // draw a triangle in the center bottom of the rectangle
    gfx.drawPolygon([
      { x: 50, y: 120 },
      { x: 60, y: 130 },
      { x: 70, y: 120 },
      { x: 50, y: 120 },
    ]);
    gfx.endFill();
    this.emote.addChild(this.emoji);
  }

  changeExpression(expression: string) {
    this.emoji.texture = Texture.from(expression);

    this.showEmote();
  }

  async showEmote() {
    gsap.to(this.emote, {
      alpha: 1,
      duration: 0.5,
      ease: 'power2.out',
    });
    gsap.to(this.emote.pivot, {
      y: 10,
      duration: 0.5,
      ease: 'power2.out',
    });
  }

  async hideEmote() {
    gsap.to(this.emote, {
      alpha: 0,
      duration: 0.25,
      ease: 'power2.in',
    });
    gsap.to(this.emote.pivot, {
      y: 0,
      duration: 0.25,
      ease: 'power2.in',
    });
  }

  async stop() {
    this.hideEmote();
    const tl = gsap.timeline({
      onComplete: () => {
        this.bubble!.reset();
      },
    });
    tl.to(this.bubble, {
      alpha: 0,
      duration: 0.25,
      ease: 'power2.in',
    });
    tl.to(
      this.bubble!.pivot,
      {
        y: 10,
        duration: 0.25,
        ease: 'power2.in',
      },
      '<',
    );
  }

  async show() {
    this.bubble!.pivot.y = -10;
    const tl = gsap.timeline({
      paused: true,
    });
    tl.to(this.bubble, {
      alpha: 1,
      duration: 0.4,
      ease: 'power2.in',
    });
    tl.to(
      this.bubble!.pivot,
      {
        y: 0,
        duration: 0.4,
        ease: 'power2.in',
      },
      '<',
    );
    return tl.play();
  }

  async say(words: string[]) {
    await this.show();
    for (let i = 0; i < words.length; i++) {
      await delay(0.25);
      if (words[i].charAt(0) === '{') {
        this.changeExpression(words[i].slice(1, -1));
        continue;
      }
      await this.bubble?.animate(words[i]);
    }
    await delay(1.5);
    this.stop();
  }
}
