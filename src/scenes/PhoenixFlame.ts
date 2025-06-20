import { Fire } from '@/gameObjects/Fire';
import { Scene } from '@/scenes/Scene';

export class PhoenixFlame extends Scene {
  private fire: Fire | null = null;

  constructor() {
    super({ name: 'PhoenixFlame' });
  }

  initialize() {
    this.fire = this.addChild(new Fire());
  }

  update() {
    if (this.fire) this.fire.update();
  }
}
