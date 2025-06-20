import { Container } from "@/display/Container";
import { Button } from "@pixi/ui";
import { BitmapText, Sprite, Texture } from "pixi.js";

export type SpriteButtonProps = {
  text: string;
  disabled: boolean;
  textures: {
    default: string;
    down: string;
  };
  action: () => void;
};

const defaultProps = {
  text: "",
  disabled: false,
  textures: {
    default: "button_rectangle_depth_gloss.png",
    down: "button_rectangle_gloss.png",
  },
};

export class SpriteButton extends Button {
  private buttonView = new Container();
  private textView: BitmapText;
  private buttonBg = new Sprite();
  private action: () => void;

  private props: SpriteButtonProps;

  constructor(props: Partial<SpriteButtonProps>) {
    super();

    this.props = {
      ...defaultProps,
      ...props,
    } as SpriteButtonProps;

    this.view = this.buttonView;

    this.buttonBg.texture = Texture.from(this.props.textures.default);

    this.buttonBg.anchor.set(0.5);

    this.textView = new BitmapText(props.text ?? "", {
      fontName: "Bangers",
      fontSize: 40,
      fill: 0xffffff,
    });
    this.textView.y = -5;
    this.textView.anchor.set(0.5);

    this.buttonView.addChild(this.buttonBg, this.textView);

    this.enabled = !this.props.disabled;

    this.action = this.props.action;
  }
  override hover() {}

  override down() {
    this.buttonBg.texture = Texture.from(this.props.textures.down);
    this.textView.y = 2;
  }

  override press() {
    this.buttonBg.texture = Texture.from(this.props.textures.down);
    this.textView.y = -5;
    this.action();
  }

  override up(): void {
    this.buttonBg.texture = Texture.from(this.props.textures.default);
    this.textView.y = -5;
  }

  override upOut(): void {
    this.buttonBg.texture = Texture.from(this.props.textures.default);
    this.textView.y = -5;
  }

  override out(): void {
    this.buttonBg.texture = Texture.from(this.props.textures.default);
    this.textView.y = -5;
  }
}
