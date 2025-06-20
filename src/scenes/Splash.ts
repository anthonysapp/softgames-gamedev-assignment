import { Scene } from '@/scenes/Scene';
import { SpriteButton } from '@/ui/SpriteButton';
import { Colors, SceneID } from '@/utils/constants';
import { Size } from '@/utils/types';
import { BitmapText, Container } from 'pixi.js';

/**
 * The splash screen
 */
export class Splash extends Scene {
  private title: BitmapText | null = null;
  private buttons: Container = new Container();

  constructor() {
    super({ name: 'Splash' });
  }

  initialize(): void {
    this.addColoredBackground(Colors.BLUE);

    // add the title to the scene
    this.addTitle();

    // add the buttons to the scene
    this.addChild(this.buttons);

    this.addButton('Ace of Shadows', 'aceOfShadows');
    this.addButton('Magic Words', 'magicWords');
    this.addButton('Phoenix Flame', 'phoenixFlame');

    this.buttons.children.forEach((child, i) => {
      child.y = i * 150;
    });
  }

  addTitle() {
    this.title = new BitmapText('Anthony Sapp', {
      fontName: 'Bangers',
      fontSize: 100,
    });
    this.title.tint = 0x0;
    this.title.anchor.set(0.5);
    this.addChild(this.title);
  }

  addButton(label: string, sceneId: SceneID, y: number = 0): SpriteButton {
    const button = new SpriteButton({
      text: label,
      disabled: false,
      action: () => this.app.setScene(sceneId),
    });

    button.view.y = y;

    this.buttons.addChild(button.view);

    return button;
  }

  resizeInternal(size: Size): void {
    if (this.__background) {
      this.__background.width = size.width;
      this.__background.height = size.height;
    }
  }

  resize(): void {
    this.buttons.y = this.buttons.height * -0.5 + 100;
    if (this.title) {
      this.title.y = this.buttons.y - this.title.textHeight - 60;
    }
  }
}
