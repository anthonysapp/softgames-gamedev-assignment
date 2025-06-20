import { extensions, ExtensionType, Texture } from "pixi.js";

import { GameApplication } from "./GameApplication";
import { AceOfShadows } from "./scenes/AceOfShadows";
import { MagicWords } from "./scenes/MagicWords";
import { PhoenixFlame } from "./scenes/PhoenixFlame";
import { Splash } from "./scenes/Splash";

/**
 * Custom loader for the api images so the Asset Loader understands them
 */
const imageDelivery = {
  extension: ExtensionType.LoadParser,
  test: (url: string) => url.startsWith("https://api.dicebear.com"),
  async load(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(Texture.from(img));
      img.onerror = reject;
      img.src = src;
    });
  },
};

extensions.add(imageDelivery);

/**
 * Initialize the game
 */
(async () => {
  const app = await GameApplication.init({
    background: "#1E1E1E",
    resizeTo: document.getElementById("game-container")!,
    resizeOptions: { minWidth: 768, minHeight: 1024, letterbox: false },
    sharedTicker: true,
    scenes: {
      splash: Splash,
      aceOfShadows: AceOfShadows,
      magicWords: MagicWords,
      phoenixFlame: PhoenixFlame,
    },
  });

  if (app) {
    app.setScene("splash");
  }

  document
    .getElementById("game-container")!
    .appendChild(app.renderer.view as HTMLCanvasElement);
})();
