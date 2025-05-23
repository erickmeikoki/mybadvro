// Typing Animation Controller
class TypingAnimation {
    constructor(element, text, options = {}) {
        this.element = element;
        this.text = text;
        this.options = {
            typeSpeed: 100,
            deleteSpeed: 50,
            delay: 1000,
            loop: false,
            showCursor: true,
            cursorChar: '|',
            ...options
        };
        
        this.currentIndex = 0;
        this.isDeleting = false;
        this.isPaused = false;
        this.timeoutId = null;
        
        this.init();
    }
    
    init() {
        // Clear any existing content except cursor
        const cursor = this.element.querySelector('#cursor');
        this.element.innerHTML = '';
        if (cursor && this.options.showCursor) {
            this.element.appendChild(cursor);
        }
        
        // Start typing after a brief delay
        setTimeout(() => {
            this.type();
        }, this.options.delay);
    }
    
    type() {
        if (this.isPaused) return;
        
        const currentText = this.text.slice(0, this.currentIndex + 1);
        const cursor = this.element.querySelector('#cursor');
        
        // Update text content while preserving cursor
        if (cursor) {
            this.element.innerHTML = currentText;
            this.element.appendChild(cursor);
        } else {
            this.element.textContent = currentText;
        }
        
        this.currentIndex++;
        
        // Check if we've typed the full text
        if (this.currentIndex < this.text.length) {
            // Continue typing
            const randomVariation = Math.random() * 50; // Add natural variation
            this.timeoutId = setTimeout(() => {
                this.type();
            }, this.options.typeSpeed + randomVariation);
        } else {
            // Finished typing
            this.onComplete();
        }
    }
    
    onComplete() {
        // Add a subtle completion effect
        this.element.style.animation = 'none';
        this.element.offsetHeight; // Trigger reflow
        this.element.style.animation = 'fadeInUp 0.3s ease-out';
        
        // Dispatch custom event for completion
        const completionEvent = new CustomEvent('typingComplete', {
            detail: { text: this.text }
        });
        document.dispatchEvent(completionEvent);
    }
    
    pause() {
        this.isPaused = true;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }
    
    resume() {
        this.isPaused = false;
        this.type();
    }
    
    reset() {
        this.currentIndex = 0;
        this.isPaused = false;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.init();
    }
}

// Enhanced cursor controller
class CursorController {
    constructor(cursorElement) {
        this.cursor = cursorElement;
        this.isVisible = true;
        this.blinkInterval = null;
        
        this.init();
    }
    
    init() {
        if (!this.cursor) return;
        
        // Start blinking animation
        this.startBlinking();
        
        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopBlinking();
            } else {
                this.startBlinking();
            }
        });
    }
    
    startBlinking() {
        if (this.blinkInterval) {
            clearInterval(this.blinkInterval);
        }
        
        this.blinkInterval = setInterval(() => {
            this.isVisible = !this.isVisible;
            this.cursor.style.opacity = this.isVisible ? '1' : '0';
        }, 530); // Slightly different from CSS animation for natural feel
    }
    
    stopBlinking() {
        if (this.blinkInterval) {
            clearInterval(this.blinkInterval);
            this.blinkInterval = null;
        }
        this.cursor.style.opacity = '1';
    }
    
    hide() {
        this.cursor.style.display = 'none';
    }
    
    show() {
        this.cursor.style.display = 'inline-block';
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.startTime = performance.now();
        this.metrics = {
            domContentLoaded: null,
            firstPaint: null,
            typingStarted: null,
            typingCompleted: null
        };
        
        this.init();
    }
    
    init() {
        // Monitor DOM content loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.metrics.domContentLoaded = performance.now() - this.startTime;
            });
        } else {
            this.metrics.domContentLoaded = 0;
        }
        
        // Monitor paint timing
        if ('PerformanceObserver' in window) {
            const paintObserver = new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach((entry) => {
                    if (entry.name === 'first-paint') {
                        this.metrics.firstPaint = entry.startTime;
                    }
                });
            });
            
            try {
                paintObserver.observe({ entryTypes: ['paint'] });
            } catch (e) {
                // PerformanceObserver not supported for paint
                console.log('Paint timing not available');
            }
        }
        
        // Monitor typing events
        document.addEventListener('typingComplete', () => {
            this.metrics.typingCompleted = performance.now() - this.startTime;
            this.logMetrics();
        });
    }
    
    markTypingStart() {
        this.metrics.typingStarted = performance.now() - this.startTime;
    }
    
    logMetrics() {
        if (console.table) {
            console.table(this.metrics);
        } else {
            console.log('Performance Metrics:', this.metrics);
        }
    }
}

// Accessibility enhancements
class AccessibilityEnhancer {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupReducedMotion();
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
    }
    
    setupReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (prefersReducedMotion.matches) {
            // Disable animations for users who prefer reduced motion
            document.body.classList.add('reduced-motion');
        }
        
        prefersReducedMotion.addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('reduced-motion');
            } else {
                document.body.classList.remove('reduced-motion');
            }
        });
    }
    
    setupKeyboardNavigation() {
        // Add skip link for keyboard users
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: hsl(var(--accent));
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add main landmark
        const main = document.querySelector('.main');
        if (main) {
            main.id = 'main';
            main.setAttribute('role', 'main');
        }
    }
    
    setupScreenReaderSupport() {
        // Add live region for typing animation
        const typedText = document.getElementById('typedText');
        if (typedText) {
            typedText.setAttribute('aria-live', 'polite');
            typedText.setAttribute('aria-label', 'Typing animation in progress');
        }
        
        // Update aria-label when typing completes
        document.addEventListener('typingComplete', (e) => {
            if (typedText) {
                typedText.setAttribute('aria-label', `Completed text: ${e.detail.text}`);
            }
        });
    }
}

// Main application initialization
class TakehomeFatigueApp {
    constructor() {
        this.typingText = "i aint doing all that 😭🙏";
        this.typingElement = null;
        this.cursorElement = null;
        this.typingAnimation = null;
        this.cursorController = null;
        this.performanceMonitor = null;
        this.accessibilityEnhancer = null;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setup();
            });
        } else {
            this.setup();
        }
    }
    
    setup() {
        // Initialize performance monitoring
        this.performanceMonitor = new PerformanceMonitor();
        
        // Initialize accessibility enhancements
        this.accessibilityEnhancer = new AccessibilityEnhancer();
        
        // Get DOM elements
        this.typingElement = document.getElementById('typedText');
        this.cursorElement = document.getElementById('cursor');
        
        if (!this.typingElement) {
            console.error('Typing element not found');
            return;
        }
        
        // Initialize cursor controller
        this.cursorController = new CursorController(this.cursorElement);
        
        // Initialize typing animation with custom options
        this.typingAnimation = new TypingAnimation(this.typingElement, this.typingText, {
            typeSpeed: 120, // Slightly slower for better readability
            delay: 1500,    // Longer initial delay for dramatic effect
            showCursor: true
        });
        
        // Mark typing start for performance monitoring
        this.performanceMonitor.markTypingStart();
        
        // Set up error handling
        this.setupErrorHandling();
        
        // Add interaction handlers
        this.setupInteractions();
    }
    
    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Application error:', e.error);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
        });
    }
    
    setupInteractions() {
        // Add click to restart functionality
        const typingContainer = document.querySelector('.typing-container');
        if (typingContainer) {
            typingContainer.addEventListener('click', () => {
                if (this.typingAnimation) {
                    this.typingAnimation.reset();
                    this.performanceMonitor.markTypingStart();
                }
            });
            
            // Add visual feedback for interaction
            typingContainer.style.cursor = 'pointer';
            typingContainer.title = 'Click to restart typing animation';
        }
        
        // Add keyboard support for restart
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (this.typingAnimation) {
                    this.typingAnimation.reset();
                    this.performanceMonitor.markTypingStart();
                }
            }
        });
    }
}

// Initialize the application
const app = new TakehomeFatigueApp();

// Export for potential testing or external access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TypingAnimation,
        CursorController,
        PerformanceMonitor,
        AccessibilityEnhancer,
        TakehomeFatigueApp
    };
}
