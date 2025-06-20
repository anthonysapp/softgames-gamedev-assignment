import { Card } from "@/gameObjects/Card";
import { Scene } from "@/scenes/Scene";
import { generateDeck } from "@/utils/cards";
import { Colors } from "@/utils/constants";
import { delay } from "@/utils/delay";
import { Size } from "@/utils/types";
import gsap from "gsap";
import { Container } from "pixi.js";

/**
 * The Ace of Shadows scene
 * Flip one card from stack to stack
 */
export class AceOfShadows extends Scene {
  private readonly ANIMATION_DURATION = 2; // 2 seconds as per the instructions
  private static readonly STACK_POSITIONS = [50, 300]; // the positions of the stacks
  private readonly STACK_OFFSET = { x: 0.25, y: 1 }; // the offset of the cards

  private stack1: Card[] = []; // the first stack
  private stack2: Card[] = []; // the second stack
  private mainContainer: Container = new Container(); // the main container
  private cardContainer: Container = new Container(); // the first card container
  private cardContainer2: Container = new Container(); // the second card container

  private nextPosition: { x: number; y: number } = { x: 0, y: 0 }; // the next position of the card

  private currentStack: Card[] = [];

  constructor() {
    super({ name: "AceOfShadows" });
  }

  destroy() {
    this._destroyed = true;
    super.destroy();
  }

  async initialize() {
    // card table
    this.addColoredBackground(Colors.DARK_GREEN);

    // main containe to house the stacks
    this.addChild(this.mainContainer);

    // make the cards sortable
    this.cardContainer.sortableChildren = true;
    this.cardContainer2.sortableChildren = true;

    // add the stacks to the main container
    this.mainContainer.addChild(this.cardContainer);
    this.mainContainer.addChild(this.cardContainer2);

    // generate a stack of 144 cards
    this.stack1 = generateDeck().concat(generateDeck());
    // place the cards in the first stack
    this.placeCards(this.stack1);
    // set the current stack to the first stack
    this.currentStack = this.stack1;

    // initialize the next position
    this.initNextPosition();

    await this.initAnimationTimer();
  }

  /**
   * The position where the animating card will go
   * @param x - The x position
   */
  private initNextPosition(x: number = AceOfShadows.STACK_POSITIONS[1]) {
    this.nextPosition.x = x;
    this.nextPosition.y = 0;
  }

  /**
   * Initialize the animation timer
   * This is used to animate the next card
   */
  async initAnimationTimer() {
    await delay(this.ANIMATION_DURATION);
    this.animateNext();
  }

  /**
   * Animate the next card
   * @param delayInSeconds - The delay in seconds
   */
  async animateNext(delayInSeconds: number = 0): Promise<void> {
    if (this._destroyed) return;
    if (delayInSeconds > 0) {
      await delay(delayInSeconds);
    }

    const stack = this.currentStack;
    const otherStack = stack === this.stack1 ? this.stack2 : this.stack1;

    const container =
      stack === this.stack1 ? this.cardContainer2 : this.cardContainer;

    const card = stack.pop();

    container.addChild(card!);
    this.mainContainer.setChildIndex(container, 1);
    otherStack.push(card!);

    await gsap.to(card!, {
      x: this.nextPosition.x,
      y: this.nextPosition.y,
      duration: this.ANIMATION_DURATION,
      ease: "power2.inOut",
      onStart: () => {
        card!.flip(
          this.ANIMATION_DURATION * 0.25,
          this.ANIMATION_DURATION * 0.25
        );
      },
    });

    this.nextPosition.x += this.STACK_OFFSET.x;
    this.nextPosition.y -= this.STACK_OFFSET.y;

    if (stack.length === 0) {
      this.initNextPosition(
        stack === this.stack1 ?
          AceOfShadows.STACK_POSITIONS[0]
        : AceOfShadows.STACK_POSITIONS[1]
      );
      this.currentStack = stack === this.stack1 ? this.stack2 : this.stack1;
    }

    this.animateNext(stack.length === 0 ? this.ANIMATION_DURATION * 0.5 : 0);
  }

  /**
   * Place the cards in the stack
   * @param cards - The cards to place
   */
  placeCards(cards: Card[]): void {
    const pos = { x: 0, y: 0 };

    cards.forEach((card) => {
      this.cardContainer.addChild(card);
      card.position.set(pos.x, pos.y);
      pos.x += this.STACK_OFFSET.x;
      pos.y -= this.STACK_OFFSET.y;
    });
  }

  resize(size: Size) {
    super.resize(size);
    this.mainContainer.position.set(-150, 0);
  }
}
