import { BaseRecorder } from './types';

export class ImagesViewRecorder implements BaseRecorder {
  name = 'imagesView';
  isActive = false;
  private viewedImages: Set<string> = new Set();
  private mutationObserver: MutationObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;

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
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (this.isVisible(img)) {
            const src = img.src;
            if (src && !this.viewedImages.has(src)) {
              this.viewedImages.add(src);
              console.log('[ImagesView]', src);
            }
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
  }
}

