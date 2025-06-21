import { Container } from '@/display/Container';
import { Colors, SceneID } from '@/utils/constants';
import gsap from 'gsap';
import { BitmapText, Graphics, Sprite, Texture } from 'pixi.js';
import { SpriteButton } from './SpriteButton';

export class GameUI extends Container {
  settingsButton: Sprite = new Sprite(Texture.from('gear.png'));
  menuText: BitmapText | null = null;
  menu: Container = new Container();
  menuOpen: boolean = false;

  constructor() {
    super({ name: 'GameUI', autoResize: true, autoUpdate: false });
    this.addSettingsButton();
    this.addMenu();
  }

  addSettingsButton() {
    this.menuText = new BitmapText('Menu', {
      fontName: 'Bangers',
      fontSize: 40,
      align: 'left',
    });
    this.menuText.tint = 0xffffff;
    this.menuText.x = 10;
    this.addChild(this.menuText);
    this.addChild(this.settingsButton);
    this.settingsButton.eventMode = 'static';
    this.settingsButton.cursor = 'pointer';
    this.settingsButton.on('pointerdown', () => {});

    this.settingsButton.on('pointerover', () => {
      this.settingsButton.tint = Colors.YELLOW;
    });
    this.settingsButton.on('pointerout', () => {
      this.settingsButton.tint = 0xffffff;
    });
    this.settingsButton.on('pointerup', () => {
      this.toggleMenu();
    });
    this.settingsButton.on('pointerupoutside', () => {
      this.settingsButton.tint = 0xffffff;
    });
  }

  toggleMenu() {
    if (this.menuOpen) {
      this.hideMenu();
    } else {
      this.showMenu();
    }
  }

  addMenu() {
    this.addChild(this.menu);
    const gfx = this.menu.addChild(new Graphics());
    gfx.beginFill(Colors.YELLOW);
    gfx.drawRoundedRect(0, 0, 360, 400, 10);
    gfx.endFill();

    this.addButton('Ace of Shadows', 'aceOfShadows', 80);
    this.addButton('Magic Words', 'magicWords', 200);
    this.addButton('Phoenix Flame', 'phoenixFlame', 320);

    this.menu.pivot.x = -600;
  }

  addButton(label: string, sceneId: SceneID, y: number = 0): SpriteButton {
    const button = new SpriteButton({
      text: label,
      disabled: false,
      action: () => {
        if (!this.menuOpen) {
          return;
        }
        this.app.setScene(sceneId);
        this.hideMenu();
        button.up();
      },
    });

    const buttonView = this.menu.addChild(button.view);
    buttonView.scale.set(0.75);
    buttonView.y = y;
    buttonView.x = 182;

    return button;
  }

  showMenu() {
    this.menuOpen = true;
    gsap.to(this.menu.pivot, {
      x: 0,
      duration: 0.4,
      ease: 'back.out(0.5)',
    });
  }

  hideMenu() {
    this.menuOpen = false;
    gsap.to(this.menu.pivot, {
      x: -600,
      duration: 0.3,
      ease: 'back.in(0.5)',
    });
  }

  resize() {
    this.x = this.size.width * 0.5;
    this.y = this.size.height * 0.5;

    this.menu.x = this.size.width * 0.5 - 380;
    this.menu.y = this.size.height * 0.5 - 500;

    this.settingsButton.x = this.size.width * 0.5 - 100;
    this.settingsButton.y = this.size.height * 0.5 - 100;

    if (this.menuText) {
      this.menuText.x = this.settingsButton.x - 80;
      this.menuText.y = this.settingsButton.y + 35;
    }
  }
}
