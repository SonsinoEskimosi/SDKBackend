import { BaseRecorder } from './types';

export class ImagesViewRecorder implements BaseRecorder {
  name = 'imagesView';
  isActive = false;
  private viewedImages: Set<string> = new Set();
  private mutationObserver: MutationObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private viewTimers: Map<string, number> = new Map();
  private readonly VIEW_DURATION_MS = 3000;

  start(): void {
    if (this.isActive) return;
    this.isActive = true;
    
    this.setupIntersectionObserver();
    this.observeCurrentImages();
    this.observeNewImages();
  }

  private setupIntersectionObserver(): void {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const img = entry.target as HTMLImageElement;
        const src = img.src;
        
        if (!src) return;

        if (entry.isIntersecting && this.isVisible(img)) {
          if (!this.viewedImages.has(src) && !this.viewTimers.has(src)) {
            const timerId = window.setTimeout(() => {
              this.viewedImages.add(src);
              this.viewTimers.delete(src);
              console.log('[ImagesView] Viewed 3s:', src);
            }, this.VIEW_DURATION_MS);
            
            this.viewTimers.set(src, timerId);
          }
        } else {
          const timerId = this.viewTimers.get(src);
          if (timerId) {
            window.clearTimeout(timerId);
            this.viewTimers.delete(src);
          }
        }
      });
    }, {
      threshold: 0.1
    });
  }

  private isVisible(img: HTMLImageElement): boolean {
    const rect = img.getBoundingClientRect();
    
    if (rect.width === 0 || rect.height === 0) return false;
    
    const style = window.getComputedStyle(img);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }
    
    return true;
  }

  private observeCurrentImages(): void {
    document.querySelectorAll('img').forEach(img => {
      this.intersectionObserver?.observe(img);
    });
  }

  private observeNewImages(): void {
    this.mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            if (element.tagName === 'IMG') {
              this.intersectionObserver?.observe(element as HTMLImageElement);
            }
            
            element.querySelectorAll('img').forEach(img => {
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

  stop(): void {
    if (!this.isActive) return;
    this.isActive = false;
    
    this.viewTimers.forEach(timerId => window.clearTimeout(timerId));
    this.viewTimers.clear();
    
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

  reset(): void {
    this.viewedImages.clear();
    this.viewTimers.forEach(timerId => window.clearTimeout(timerId));
    this.viewTimers.clear();
  }
}

