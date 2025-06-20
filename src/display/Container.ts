import { type Size } from '@/utils/types';
import { Container as PixiContainer } from 'pixi.js';
import { GameApplication } from '../GameApplication';

export type IContainerOptions = {
  name?: string;
  autoResize?: boolean;
  autoUpdate?: boolean;
};

const defaultOptions: IContainerOptions = {
  name: 'Container',
  autoResize: true,
  autoUpdate: true,
};

/**
 * Extend the pixi container to add some extra functionality
 * - auto resize
 * - auto update
 */

export class Container extends PixiContainer {
  protected options: IContainerOptions;

  // store the game size
  public size: Size = { width: 0, height: 0 };

  // access to the application singleton
  get app(): GameApplication {
    return GameApplication.getInstance();
  }

  constructor(options?: IContainerOptions) {
    super();

    this.options = { ...defaultOptions, ...options };

    if (this.options.name) {
      this.name = this.options.name;
    }

    if (this.options.autoResize) {
      this.app.onResize.connect(this.handleResize.bind(this));
    }

    if (this.options.autoUpdate) {
      this.app.ticker.add(this.update.bind(this));
    }
  }

  private handleResize(size: Size): void {
    this.size = size;
    this.resizeInternal(size);
    this.resize(size);
  }

  // override this to add custom resize logic
  public resizeInternal(size: Size): void {
    void size;
  }

  // this is the method that will be called by the application
  public resize(size: Size): void {
    this.resizeInternal(size);
    void size;
  }

  // override this to add custom update logic
  public update(delta: number): void {
    void delta;
  }
}
