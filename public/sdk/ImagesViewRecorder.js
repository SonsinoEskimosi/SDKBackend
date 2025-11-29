"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesViewRecorder = void 0;
class ImagesViewRecorder {
    constructor() {
        this.name = 'imagesView';
        this.isActive = false;
        this.viewedImages = new Set();
        this.observer = null;
    }
    start() {
        if (this.isActive)
            return;
        this.isActive = true;
        this.recordCurrentImages();
        this.observeNewImages();
    }
    recordCurrentImages() {
        document.querySelectorAll('img').forEach(img => {
            const src = img.src;
            if (src) {
                this.viewedImages.add(src);
                console.log('[ImagesView]', src);
            }
        });
    }
    observeNewImages() {
        this.observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node;
                        if (element.tagName === 'IMG') {
                            const src = element.src;
                            if (src && !this.viewedImages.has(src)) {
                                this.viewedImages.add(src);
                                console.log('[ImagesView]', src);
                            }
                        }
                        element.querySelectorAll('img').forEach(img => {
                            const src = img.src;
                            if (src && !this.viewedImages.has(src)) {
                                this.viewedImages.add(src);
                                console.log('[ImagesView]', src);
                            }
                        });
                    }
                });
            });
        });
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    stop() {
        var _a;
        if (!this.isActive)
            return;
        this.isActive = false;
        (_a = this.observer) === null || _a === void 0 ? void 0 : _a.disconnect();
        this.observer = null;
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
}
exports.ImagesViewRecorder = ImagesViewRecorder;
