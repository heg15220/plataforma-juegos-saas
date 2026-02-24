export default class AssetLoader {
  constructor() {
    this.images = new Map();
  }

  loadImage(id, src) {
    if (!id || !src) {
      return Promise.reject(new Error("loadImage requires id and src."));
    }

    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        this.images.set(id, image);
        resolve(image);
      };
      image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      image.src = src;
    });
  }

  preload(definitions = []) {
    return Promise.all(definitions.map((entry) => this.loadImage(entry.id, entry.src)));
  }

  get(id) {
    return this.images.get(id) ?? null;
  }
}
