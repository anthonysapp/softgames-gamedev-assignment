import assetManifest from '@/assets.json';
import { Container } from '@/display/Container';
import { type Scene } from '@/scenes/Scene';
import { SceneID } from '@/utils/constants';
import { type Size } from '@/utils/types';
import { initDevtools } from '@pixi/devtools';
import gsap from 'gsap';
import type { IApplicationOptions } from 'pixi.js';
import { Application, Assets, Ticker, UPDATE_PRIORITY } from 'pixi.js';
// @ts-expect-error - no types for stats.js
import Stats from 'stats.js';
import { Signal } from 'typed-signals';
import { GameUI } from './ui/GameUI';
import { resize } from './utils/resize';

export interface IResizeOptions {
  minWidth?: number;
  minHeight?: number;
  letterbox?: boolean;
}

export interface IGameOptions extends IApplicationOptions {
  scenes: { [key: string]: typeof Scene };
  resizeOptions: IResizeOptions;
}

export class GameApplication extends Application {
  private static SCENE_TRANSITION_DURATION = 1;
  private static instance: GameApplication | null = null;

  public onResize: Signal<(detail: Size) => void> = new Signal();

  public scenes: Map<string, typeof Scene> = new Map();

  public currentScene: Scene | null = null;
  public currentSceneId: SceneID | null = null;
  public sceneContainer: Container | null = null;
  public ui: GameUI | null = null;

  public size: Size = { width: 0, height: 0 };

  private static _resizeTo: Window | HTMLElement | null;
  private _resizeId: number | null = null;

  private _options: IGameOptions | null = null;

  get resizeOptions(): IResizeOptions {
    return (
      this._options?.resizeOptions || {
        minWidth: 768,
        minHeight: 1024,
        letterbox: false,
      }
    );
  }

  get view(): HTMLCanvasElement {
    return this.renderer.view as HTMLCanvasElement;
  }

  private constructor(options: Partial<IGameOptions>) {
    super(options);

    if (options.scenes) {
      this.scenes = new Map(Object.entries(options.scenes).map(([key, value]) => [key, value]));
    }

    this._options = options as IGameOptions;
    if (!this._options.resizeTo) {
      this._options.resizeTo = globalThis.window;
    }
    GameApplication._resizeTo = this._options.resizeTo;
  }

  public static async init(options?: Partial<IGameOptions>): Promise<GameApplication> {
    if (!GameApplication.instance) {
      if (!options) {
        throw new Error('GameApplication options are required for the first initialization');
      }
      if (!options.scenes) {
        throw new Error('scenes are required');
      }
      GameApplication.instance = new GameApplication(options);
    }

    await GameApplication.instance.setup();

    return GameApplication.instance;
  }

  public static getInstance(): GameApplication {
    if (!GameApplication.instance) {
      throw new Error('GameApplication options are required for the first initialization');
    }
    return GameApplication.instance;
  }

  public static resetInstance(): void {
    if (GameApplication.instance) {
      GameApplication.instance.destroy();
      GameApplication.instance = null;
    }
  }

  public async setScene(sceneId: SceneID): Promise<void> {
    if (sceneId === this.currentSceneId) {
      return;
    }
    const scene = await this.scenes.get(sceneId);
    if (!scene) {
      throw new Error(`Scene ${sceneId} not found`);
    }
    this.currentSceneId = sceneId;
    const Klass = new scene();

    if (!this.sceneContainer) {
      throw new Error('Scene container not found');
    }
    let oldScene;
    if (this.currentScene) {
      oldScene = this.currentScene;
    }

    this.currentScene = Klass as Scene;
    this.center(this.currentScene);
    this.currentScene.initialize();
    this.currentScene.resizeInternal(this.size);
    this.currentScene.resize(this.size);

    this.sceneContainer.addChild(this.currentScene);

    if (oldScene) {
      this.currentScene.pivot.x = this.size.width * 1.25;
      this.currentScene.scale.set(2.5);

      gsap.to(oldScene, {
        alpha: 0,
        duration: GameApplication.SCENE_TRANSITION_DURATION,
        ease: 'power2.out',
      });

      gsap.to(oldScene.pivot, {
        x: this.size.width * -0.75,
        duration: GameApplication.SCENE_TRANSITION_DURATION,
        ease: 'power2.out',
      });

      gsap.to(oldScene.scale, {
        x: 0.5,
        y: 0.5,
        duration: GameApplication.SCENE_TRANSITION_DURATION,
        ease: 'power2.out',
      });

      gsap.to(this.currentScene.pivot, {
        x: 0,
        duration: GameApplication.SCENE_TRANSITION_DURATION,
        ease: 'power2.out',
      });
      gsap.to(this.currentScene.scale, {
        x: 1,
        y: 1,
        duration: GameApplication.SCENE_TRANSITION_DURATION,
        ease: 'power2.out',
        onComplete: () => {
          oldScene.parent?.removeChild(oldScene);
        },
      });
    }

    // show the ui after splash
    if (sceneId === 'splash') {
      gsap.to(this.ui, {
        alpha: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          this.ui!.visible = false;
        },
      });
    } else {
      this.ui!.visible = true;
      gsap.to(this.ui, {
        alpha: 1,
        duration: 0.4,
        ease: 'power2.out',
      });
    }
  }

  // private methods
  private async setup(): Promise<void> {
    initDevtools({ app: this as unknown as Application });
    this.addStats();
    window.addEventListener('resize', this.handleResize.bind(this));

    await this.initAssets();
    this.initContainers();

    this.handleResize();
  }

  private addStats() {
    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    stats.dom.id = 'stats';
    document.body.appendChild(stats.dom);
    Ticker.shared.add(stats.update, stats, UPDATE_PRIORITY.UTILITY);
  }

  private async initAssets(): Promise<void> {
    // init pixi assets
    await Assets.init({ manifest: assetManifest, basePath: 'assets' });
    await Assets.loadBundle('preload');
    await Assets.loadBundle('game');
  }

  private initContainers(): void {
    this.sceneContainer = new Container({
      name: 'scenes',
      autoResize: true,
      autoUpdate: false,
    });

    this.ui = new GameUI();
    this.ui.alpha = 0;
    this.ui.visible = false;

    this.stage.addChild(this.sceneContainer);
    this.stage.addChild(this.ui);
  }

  private center(child: Container): void {
    child.x = this.size.width * 0.5;
    child.y = this.size.height * 0.5;
  }

  private _cancelResize() {
    if (this._resizeId) {
      cancelAnimationFrame(this._resizeId);
      this._resizeId = null;
    }
  }
  // resizing
  private handleResize(): void {
    this._cancelResize!();

    let canvasWidth: number;
    let canvasHeight: number;

    if (GameApplication._resizeTo === globalThis.window) {
      canvasWidth = globalThis.innerWidth;
      canvasHeight = globalThis.innerHeight;
    } else {
      const { clientWidth, clientHeight } = GameApplication._resizeTo as HTMLElement;

      canvasWidth = clientWidth;
      canvasHeight = clientHeight;
    }
    const { width, height } = resize(
      canvasWidth,
      canvasHeight,
      this.resizeOptions.minWidth ?? 768,
      this.resizeOptions.minHeight ?? 1024,
      this.resizeOptions.letterbox ?? false,
    );
    this.view.style.width = `${canvasWidth}px`;
    this.view.style.height = `${canvasHeight}px`;

    window.scrollTo(0, 0);

    this.renderer.resize(width, height);
    this.size = { width, height };

    this.onResize.emit({ width, height });

    this.sceneContainer?.children.forEach((child) => {
      this.center(child as Container);
    });
  }
}
