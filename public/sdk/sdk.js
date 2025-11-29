"use strict";
(() => {
  // js_sdk/RecorderManager.ts
  var RecorderManager = class {
    constructor() {
      this.recorders = /* @__PURE__ */ new Map();
    }
    register(recorder) {
      this.recorders.set(recorder.name, recorder);
    }
    get(name) {
      return this.recorders.get(name);
    }
    startAll() {
      this.recorders.forEach((recorder) => recorder.start());
    }
    stopAll() {
      this.recorders.forEach((recorder) => recorder.stop());
    }
    getAllData() {
      const data = {};
      this.recorders.forEach((recorder, name) => {
        data[name] = recorder.getData();
      });
      return data;
    }
  };

  // js_sdk/ImagesViewRecorder.ts
  var ImagesViewRecorder = class {
    constructor() {
      this.name = "imagesView";
      this.isActive = false;
      this.viewedImages = /* @__PURE__ */ new Set();
      this.mutationObserver = null;
      this.intersectionObserver = null;
    }
    start() {
      if (this.isActive)
        return;
      this.isActive = true;
      this.setupIntersectionObserver();
      this.observeCurrentImages();
      this.observeNewImages();
    }
    setupIntersectionObserver() {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (this.isVisible(img)) {
              const src = img.src;
              if (src && !this.viewedImages.has(src)) {
                this.viewedImages.add(src);
                console.log("[ImagesView]", src);
              }
            }
          }
        });
      }, {
        threshold: 0.1
      });
    }
    isVisible(img) {
      const rect = img.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0)
        return false;
      const style = window.getComputedStyle(img);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
        return false;
      }
      return true;
    }
    observeCurrentImages() {
      document.querySelectorAll("img").forEach((img) => {
        this.intersectionObserver?.observe(img);
      });
    }
    observeNewImages() {
      this.mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node;
              if (element.tagName === "IMG") {
                this.intersectionObserver?.observe(element);
              }
              element.querySelectorAll("img").forEach((img) => {
                this.intersectionObserver?.observe(img);
              });
            }
          });
        });
      });
      this.mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
    stop() {
      if (!this.isActive)
        return;
      this.isActive = false;
      this.mutationObserver?.disconnect();
      this.mutationObserver = null;
      this.intersectionObserver?.disconnect();
      this.intersectionObserver = null;
    }
    getData() {
      return {
        totalImages: this.viewedImages.size,
        images: Array.from(this.viewedImages)
      };
    }
    reset() {
      this.viewedImages.clear();
    }
  };

  // js_sdk/sdk.ts
  (function() {
    "use strict";
    console.log("[JSSDK] Loaded");
    const recorderManager = new RecorderManager();
    recorderManager.register(new ImagesViewRecorder());
    window.JSSDK = {
      version: "1.0.0",
      recorderManager
    };
    recorderManager.startAll();
  })();
})();
