import { Container, type IContainerOptions } from '@/display/Container';
import { type Size } from '@/utils/types';
import { Sprite, Texture, type IDestroyOptions } from 'pixi.js';

/**
 * A base scene to build from
 */
export class Scene extends Container {
  protected __background: Sprite | null = null;

  constructor(options: IContainerOptions = { name: 'Scene' }) {
    super(options);
  }

  /**
   * Add a colored background to the scene
   * @param color - The color to use for the background
   * @returns The background sprite
   */
  addColoredBackground(color: number): Sprite {
    const spr = new Sprite(Texture.WHITE);
    spr.tint = color;
    this.__background = spr;
    this.addChild(spr);

    this.__background.anchor.set(0.5, 0.5);
    this.__background.name = 'background';
    return spr;
  }

  /**
   * Resize the background to the size of the scene
   * This is called by the Application when the scene is resized
   * @param size - The size of the scene
   */
  resizeInternal(size: Size): void {
    if (this.__background) {
      this.__background.width = size.width;
      this.__background.height = size.height;
    }
  }

  /**
   * Initialize the scene
   * This is called by the Application when the scene is initialized
   */
  initialize(): void {
    void this;
  }

  /**
   * Update the scene
   * @param delta - The delta time
   */
  update(delta: number): void {
    void delta;
  }

  /**
   * Resize the scene
   * This is called by the Application when the window is resized
   * @param size - The size of the scene
   */
  resize(size: Size): void {
    void size;
  }

  /**
   * Destroy the scene
   * @param options - The destroy options
   */
  destroy(options?: IDestroyOptions): void {
    super.destroy(options);
  }
}
