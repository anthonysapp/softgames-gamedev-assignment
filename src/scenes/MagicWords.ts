import { Avatar } from '@/gameObjects/Avatar';
import { Scene } from '@/scenes/Scene';
import { Colors } from '@/utils/constants';
import { DialogueData, MagicWordsData, Size } from '@/utils/types';
import gsap from 'gsap';
import { Assets, Container, Sprite } from 'pixi.js';

export class MagicWords extends Scene {
  data: MagicWordsData | null = null;
  leftContainer: Container = new Container();
  rightContainer: Container = new Container();

  currentDialogue: DialogueData | null = null;
  currentDialogueIndex: number = 0;

  avatars: Map<string, Avatar> = new Map();

  constructor() {
    super({ name: 'MagicWords' });
  }

  get dialogue(): DialogueData[] {
    return this.data!.dialogue;
  }

  private parseText(text: string) {
    // replace text that the font doens't support
    // replace '’' with '
    text = text.replace(/’/g, "'");
    // replace '“' with '
    text = text.replace(/“/g, '"');
    // replace '”' with '
    text = text.replace(/”/g, '"');
    // replace '—' with '
    return text;
  }

  async loadData() {
    const json = (await fetch('https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords').then((res) =>
      res.json(),
    )) as MagicWordsData;

    const queue: { alias: string; src: string }[] = [];
    json.dialogue.forEach((dialogue) => {
      dialogue.text = this.parseText(dialogue.text);
    });
    json.avatars.forEach((avatar) => {
      queue.push({ alias: avatar.name, src: avatar.url });
    });
    json.emojies.forEach((emoji) => {
      queue.push({ alias: emoji.name, src: emoji.url });
    });

    await Assets.load(queue);

    return json as MagicWordsData;
  }

  async initialize() {
    this.addColoredBackground(Colors.TEAL);
    this.data = await this.loadData();

    this.leftContainer = this.addChild(new Container());
    this.leftContainer.x = -200;
    this.rightContainer = this.addChild(new Container());
    this.rightContainer.x = 200;

    this.data.avatars.forEach((avatarData) => {
      const avatar = new Avatar(avatarData);
      avatar.pivot.y = -20;
      avatar.alpha = 0;

      if (avatarData.position === 'left') {
        this.leftContainer.addChild(avatar);
      } else {
        this.rightContainer.addChild(avatar);
      }
      this.avatars.set(avatarData.name, avatar);
    });

    this.resize(this.app.size);
    this.startDialogue();
  }

  async startDialogue() {
    const avatars = this.avatars.values();
    const tl = gsap.timeline({ paused: true });
    for (const avatar of avatars) {
      tl.to(avatar, {
        alpha: 1,
        duration: 0.4,
        ease: 'power2.out',
      });
      tl.to(
        avatar.pivot,
        {
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
        },
        '<',
      );
    }
    await tl.play();
    this.nextDialogue();
  }

  async nextDialogue() {
    if (this.dialogue.length === 0) {
      this.complete();
      return;
    }
    this.currentDialogue = this.dialogue.shift() as DialogueData;
    const avatar = this.avatars.get(this.currentDialogue.name);
    if (!avatar) {
      this.nextDialogue();
      return;
    }
    await avatar.say(this.currentDialogue.text.split(' '));
    this.nextDialogue();
  }

  sortPositions(container: Container) {
    const children = container.children as Sprite[];
    let y = 0;
    children.forEach((child) => {
      child.y = y;
      y += child.height + 20;
    });
  }

  complete() {
    console.log('Complete!');
  }

  resize(size: Size) {
    super.resize(size);
    this.sortPositions(this.leftContainer);
    this.sortPositions(this.rightContainer);

    if (this.leftContainer && this.rightContainer) {
      this.leftContainer.x = -size.width * 0.5 + 10;
      this.rightContainer.x = size.width * 0.5 - 140;
      this.leftContainer.y = -this.leftContainer.height / 2;
      this.rightContainer.y = -this.rightContainer.height / 2;
    }
  }
}
