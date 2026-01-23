window.demoData = [
    // Intro Step
    {
        id: 'intro',
        type: 'intro',
        nextStep: 1
    },

    // Step 1: Click Extension Icon (Top Right)
    { id: 1, image: 'demo/1.png', hotspots: [{ x: 87.5, y: 6.5, text: "User makes sure they have the Sanitized Ai extension installed", nextStep: 2 }] },

    // Step 2: Click Text Input (Center-Left)
    { id: 2, image: 'demo/2.png', hotspots: [{ x: 34, y: 51, text: "User Types Their Prompt", nextStep: 3 }] },

    // Step 3: Click 'Send' Arrow (Right of Input)
    { id: 3, image: 'demo/3.png', hotspots: [{ x: 72, y: 67, text: "User Sends Prompt", nextStep: 4 }] },

    // Step 4: Click 'Insert Sanitized' Button (Popup Bottom Right)
    {
        id: 4,
        image: 'demo/4.png',
        hotspots: [{ x: 91.5, y: 71, text: "Insert Sanitized Prompt", nextStep: 5 }],
        annotations: [
            {
                x: 75,
                y: 40,
                text: "Once a prompt is flagged, users can choose how they want to move forward. Sanitized Ai lets the user choose the level of risk they want to take."
            }
        ]
    },

    // Step 5: Click 'OK' on Confirmation Dialog (Center)
    { id: 5, image: 'demo/5.png', hotspots: [{ x: 60.5, y: 21.5, text: "Once the User Confirms the Replacement, the prompt is released and sent off.", nextStep: 'transition-1' }] },

    // Transition Step
    {
        id: 'transition-1',
        type: 'transition',
        title: "Risk Manager View",
        subtitle: "Reviewing anonymous risk events and insights.",
        nextStep: 6
    },

    // Step 6: Click 'Data Insights' (Left Sidebar)
    { id: 6, image: 'demo/6.png', hotspots: [{ x: 12, y: 29, text: "Risk Managers Can View Data Insights", nextStep: 7 }] },

    // Step 7: Final State
    { id: 7, image: 'demo/7.png', hotspots: [{ x: 47, y: 60, text: "Finish Demo", nextStep: 'end' }] },

    // End Step
    {
        id: 'end',
        type: 'end'
    }
];

class DemoPlayer {
    constructor(data) {
        this.data = data;
        this.currentStepIndex = 0;

        // Elements
        this.player = document.getElementById('demo-player');
        this.content = document.getElementById('demo-content');
        this.loading = document.getElementById('loading');
        this.image = document.getElementById('current-image');
        this.layer = document.getElementById('hotspaces-layer');
        this.progressBar = document.getElementById('progress-bar');
        this.stepCount = document.getElementById('step-count');
        this.totalSteps = document.getElementById('total-steps');
        this.restartBtn = document.getElementById('restart-btn');
        this.backBtn = document.getElementById('demo-back-btn');
        this.template = document.getElementById('hotspot-template');

        // Transition Elements
        this.transitionScreen = document.getElementById('transition-screen');
        this.transitionTitle = document.getElementById('transition-title');
        this.transitionSubtitle = document.getElementById('transition-subtitle');
        this.transitionBtn = document.getElementById('transition-btn');

        // End Screen Elements
        this.endScreen = document.getElementById('demo-end-screen');
        this.endRestartBtn = document.getElementById('end-restart-btn');

        // Intro Elements
        this.introScreen = document.getElementById('intro-screen');
        this.startBtn = document.getElementById('start-btn');

        // Init
        // Count actual steps (excluding intro/transitions) for the counter?
        // For simplicity let's stick to array length or minus special steps.
        // Let's just create a getter for "real steps"
        this.realSteps = this.data.filter(s => !s.type).length;
        this.totalSteps.textContent = this.realSteps;

        this.init();
    }

    init() {
        // Simulate loading assets (can use Image preloader in production)
        setTimeout(() => {
            this.loading.classList.add('hidden');
            this.content.classList.remove('hidden');
            this.renderStep(0);
        }, 500);

        this.restartBtn.addEventListener('click', () => {
            this.restartBtn.classList.add('hidden');
            this.renderStep(0);
        });

        this.endRestartBtn.addEventListener('click', () => {
            this.renderStep(0);
        });

        this.backBtn.addEventListener('click', () => {
            this.goToPreviousStep();
        });

        this.transitionBtn.addEventListener('click', () => {
            const step = this.data[this.currentStepIndex];
            if (step.nextStep) {
                // Find index
                const nextIndex = this.data.findIndex(s => s.id === step.nextStep);
                if (nextIndex !== -1) {
                    this.renderStep(nextIndex);
                }
            }
        });

        this.startBtn.addEventListener('click', () => {
            // Find index of Step 1
            const nextIndex = this.data.findIndex(s => s.id === 1);
            if (nextIndex !== -1) {
                this.renderStep(nextIndex);
            }
        });
    }

    goToPreviousStep() {
        if (this.currentStepIndex > 0) {
            this.renderStep(this.currentStepIndex - 1);
        }
    }

    renderStep(index) {
        this.currentStepIndex = index;
        const step = this.data[index];

        // Handle Intro Step
        if (step.type === 'intro') {
            this.image.parentElement.classList.add('hidden');
            this.layer.classList.add('hidden');
            this.introScreen.classList.remove('hidden');
            this.transitionScreen.classList.add('hidden');
            this.endScreen.classList.add('hidden');
            this.backBtn.classList.add('hidden');

            // Hide progress
            this.progressBar.style.width = '0%';
            return;
        } else {
            this.introScreen.classList.add('hidden');
            this.backBtn.classList.remove('hidden');
        }

        // Handle Transition Step
        if (step.type === 'transition') {
            // Hide Image Layer
            // this.image.parentElement.classList.add('hidden'); // Removed to prevent flash
            this.layer.classList.add('hidden'); // Ensure hotspots are gone

            // Show Transition
            this.transitionScreen.classList.remove('hidden');
            this.transitionTitle.textContent = step.title;
            this.transitionSubtitle.textContent = step.subtitle;
            this.endScreen.classList.add('hidden');
            this.backBtn.classList.add('hidden');

            // Update Progress (Optional: keep same as previous or advance)
            // const progress = ((index + 1) / this.data.length) * 100;
            // this.progressBar.style.width = `${progress}%`;

            return; // Stop rendering image logic
        } else if (step.type === 'end') {
            // Handle End Step
            this.layer.classList.add('hidden');
            this.transitionScreen.classList.add('hidden');
            this.endScreen.classList.remove('hidden');
            this.backBtn.classList.add('hidden');
            // Hide controls?
            return;
        } else {
            // Ensure Transition and End are hidden
            this.transitionScreen.classList.add('hidden');
            this.endScreen.classList.add('hidden');
            this.image.parentElement.classList.remove('hidden');
            this.layer.classList.remove('hidden');
        }

        // Update Image
        this.image.style.opacity = '0';

        setTimeout(() => {
            this.image.src = step.image;
            this.image.onload = () => {
                this.image.style.opacity = '1';
            };
        }, 150); // Small delay for fade effect

        // Update Progress
        // Calculate progress based on real steps?
        // For simplicity, just use (id / 7) since ids are 1-7
        let currentStepNum = typeof step.id === 'number' ? step.id : this.currentStepIndex;
        // Or better logic:
        const progress = (currentStepNum / this.realSteps) * 100;
        this.progressBar.style.width = `${progress}%`;

        // Only update text defaults if it's a real step
        if (typeof step.id === 'number') {
            this.stepCount.textContent = step.id;
        }

        // Clear existing hotspots and annotations
        this.layer.innerHTML = '';

        // Add Hotspots
        if (step.hotspots) {
            step.hotspots.forEach(hotspotData => {
                this.createHotspot(hotspotData);
            });
        }

        // Add Annotations
        if (step.annotations) {
            step.annotations.forEach(note => {
                this.createAnnotation(note);
            });
        }

        // Handle Last Step (Legacy check, kept just in case but likely handled by end step now)
        if (step.isLast) {
            this.restartBtn.classList.remove('hidden');
        } else {
            this.restartBtn.classList.add('hidden');
        }
    }

    createHotspot(data) {
        const clone = this.template.content.cloneNode(true);
        const hotspot = clone.querySelector('.hotspot');
        const tooltip = clone.querySelector('.hotspot-tooltip');

        hotspot.style.left = `${data.x}%`;
        hotspot.style.top = `${data.y}%`;
        tooltip.textContent = data.text;

        hotspot.addEventListener('click', () => {
            // Animate out?
            if (data.nextStep) {
                // Find index of next step (assuming linear for now, but could be ID based)
                const nextIndex = this.data.findIndex(s => s.id === data.nextStep);
                if (nextIndex !== -1) {
                    this.renderStep(nextIndex);
                }
            }
        });

        this.layer.appendChild(hotspot);
    }

    createAnnotation(data) {
        const note = document.createElement('div');
        note.className = 'annotation';
        note.textContent = data.text;
        note.style.left = `${data.x}%`;
        note.style.top = `${data.y}%`;

        this.layer.appendChild(note);
    }
}

// Start
// Start
document.addEventListener('DOMContentLoaded', () => {
    new DemoPlayer(window.demoData);

    // Expand Logic
    const expandBtn = document.getElementById('demo-expand-btn');
    const container = document.getElementById('demo-video-container');
    const maximizeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize-2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`;
    const minimizeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minimize-2"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`;

    // Placeholder to prevent layout shift
    const placeholder = document.createElement('div');
    placeholder.style.display = 'none'; // Initially hidden

    function toggleFullscreen(isFullscreen) {
        if (isFullscreen) {
            // Determine current height to keep placeholder sized correctly
            placeholder.style.height = container.offsetHeight + 'px';
            placeholder.style.width = '100%';
            placeholder.style.display = 'block';
            placeholder.className = container.className.replace('reveal-on-scroll', '').replace('delay-300', '');

            // Swap
            container.parentNode.insertBefore(placeholder, container);
            document.body.appendChild(container);

            // Add class after move
            setTimeout(() => container.classList.add('demo-fullscreen'), 10);

            expandBtn.innerHTML = minimizeIcon;
            expandBtn.setAttribute('aria-label', 'Minimize Demo');
            document.body.style.overflow = 'hidden';
        } else {
            container.classList.remove('demo-fullscreen');

            // Move back
            if (placeholder.parentNode) {
                placeholder.parentNode.insertBefore(container, placeholder);
                placeholder.remove();
            }

            expandBtn.innerHTML = maximizeIcon;
            expandBtn.setAttribute('aria-label', 'Expand Demo');
            document.body.style.overflow = '';
        }
    }

    if (expandBtn) {
        expandBtn.addEventListener('click', () => {
            const isFullscreen = !container.classList.contains('demo-fullscreen');
            toggleFullscreen(isFullscreen);
        });
    }

    // Close fullscreen on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && container.classList.contains('demo-fullscreen')) {
            toggleFullscreen(false);
        }
    });
});
