import { BlurFilter, ParticleContainer, Sprite, Texture } from 'pixi.js';

/**
 * Our fire particle
 */
class Ember extends Sprite {
  public static ASSETS = ['circle_05.png'];

  private static getTexture() {
    return Texture.from(Ember.ASSETS[Math.floor(Math.random() * Ember.ASSETS.length)]);
  }

  public trajectory: { x: number; y: number } = { x: 0, y: 0 };
  public life: number = 0;
  public maxLife: number = 1;
  public baseSize: number = 0.25;

  constructor(trajectory: { x: number; y: number }) {
    super(Ember.getTexture());
    this.init(trajectory);
  }

  getTexture() {
    return Texture.from(Ember.ASSETS[Math.floor(Math.random() * Ember.ASSETS.length)]);
  }

  init(trajectory: { x: number; y: number }) {
    this.trajectory = trajectory;
    this.life = 0;
    this.maxLife = Math.random() * 0.5 + 0.75; // Random life between 0.5 and 1
    this.baseSize = Math.random() * 0.1 + 0.35; // Random base size
    this.scale.set(this.baseSize);
  }

  reset() {
    this.texture = Ember.getTexture();
    this.x = (Math.random() - 0.5) * this.width; // Small random horizontal spread at base
    this.y = 0;
    this.life = 0;
  }

  updateVisuals(radius: number) {
    // Calculate life progress (0 = just born, 1 = about to die)
    const lifeProgress = this.life / this.maxLife;
    const heightProgress = Math.abs(this.y) / radius;

    // Fire color transition: White -> Yellow -> Orange -> Red -> Dark Red
    let r, g, b;
    if (lifeProgress < 0.2) {
      // White to yellow
      const t = lifeProgress / 0.2;
      r = 1;
      g = 1;
      b = 1 - t * 0.5; // White to light yellow
    } else if (lifeProgress < 0.4) {
      // Yellow to orange
      const t = (lifeProgress - 0.2) / 0.2;
      r = 1;
      g = 1 - t * 0.3; // Yellow to orange
      b = 0.5 - t * 0.5; // Remove remaining blue
    } else if (lifeProgress < 0.7) {
      // Orange to red
      const t = (lifeProgress - 0.4) / 0.3;
      r = 1;
      g = 0.7 - t * 0.7; // Orange to red
      b = 0;
    } else {
      // Red to dark red
      const t = (lifeProgress - 0.7) / 0.3;
      r = 1 - t * 0.5; // Red to dark red
      g = 0;
      b = 0;
    }

    this.tint = (Math.floor(r * 255) << 16) + (Math.floor(g * 255) << 8) + Math.floor(b * 255);

    // Alpha fades out as particle rises and ages
    this.alpha = (1 - lifeProgress) * (1 - heightProgress * 0.5);

    // Scale gets smaller as it rises (fire tapering effect)
    const scaleMultiplier = 1 - heightProgress * 0.5;
    this.scale.set(this.baseSize * scaleMultiplier);
  }
}

/**
 * A rather shoddy attempt at a fire particle system
 * Use a particle container to make it fast
 *
 */
export class Fire extends ParticleContainer {
  private embers: Ember[] = [];
  private blurFilter: BlurFilter;

  constructor(private radius: number = 200) {
    super(10, {
      position: true,
      rotation: true,
      alpha: true,
      scale: true,
      tint: true,
    });

    // Add blur filter for fire effect
    this.blurFilter = new BlurFilter();
    this.blurFilter.blur = 10;

    for (let i = 0; i < 10; ++i) {
      const ember = new Ember({
        x: (Math.random() - 0.5) * 0.5, // Small horizontal drift
        y: -(Math.random() * 2 + 1), // Upward movement with variation
      });
      ember.scale.set(0.25);
      ember.anchor.set(0.5);

      // Start with random positions in the fire base
      ember.x = (Math.random() - 0.5) * 20;
      ember.y = Math.random() * 10; // Stagger initial positions

      this.embers.push(ember);
      this.addChild(ember);
    }
  }

  update() {
    this.embers.forEach((ember) => {
      // Update position
      ember.x += ember.trajectory.x;
      ember.y += ember.trajectory.y;

      // Update life
      ember.life += 0.016; // Assuming 60fps, adjust as needed

      // Apply slight horizontal drift and upward acceleration
      ember.trajectory.y -= Math.random() * 0.01; // Slight acceleration upward
      ember.trajectory.x += (Math.random() - 0.75) * 0.02; // Random horizontal drift

      // Clamp horizontal drift to prevent particles from spreading too much
      ember.trajectory.x = Math.max(-1, Math.min(1, ember.trajectory.x));

      // Update visual properties
      ember.updateVisuals(this.radius);

      // Reset particle when it goes too high or lives too long
      if (ember.y < -this.radius || ember.life >= ember.maxLife) {
        ember.reset();
        ember.init({
          x: (Math.random() - 0.5) * 0.5,
          y: -(Math.random() * 2 + 1),
        });
      }
    });
  }
}
