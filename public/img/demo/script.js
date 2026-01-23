const demoData = [
    // Intro Step
    {
        id: 'intro',
        type: 'intro',
        nextStep: 1
    },

    // Step 1: Click Extension Icon (Top Right)
    { id: 1, image: '1.png', hotspots: [{ x: 87.5, y: 6.5, text: "User makes sure they have the extension installed", nextStep: 2 }] },

    // Step 2: Click Text Input (Center-Left)
    { id: 2, image: '2.png', hotspots: [{ x: 34, y: 51, text: "User Types Their Prompt", nextStep: 3 }] },

    // Step 3: Click 'Send' Arrow (Right of Input)
    { id: 3, image: '3.png', hotspots: [{ x: 72, y: 67, text: "User Sends Prompt", nextStep: 4 }] },

    // Step 4: Click 'Insert Sanitized' Button (Popup Bottom Right)
    {
        id: 4,
        image: '4.png',
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
    { id: 5, image: '5.png', hotspots: [{ x: 60.5, y: 21.5, text: "Once the User Confirms the Replacement, the prompt is released and sent off.", nextStep: 'transition-1' }] },

    // Transition Step
    {
        id: 'transition-1',
        type: 'transition',
        title: "Risk Manager View",
        subtitle: "Reviewing anonymous risk events and insights.",
        nextStep: 6
    },

    // Step 6: Click 'Data Insights' (Left Sidebar)
    { id: 6, image: '6.png', hotspots: [{ x: 12, y: 29, text: "Risk Managers Can View Data Insights", nextStep: 7 }] },

    // Step 7: Final State
    { id: 7, image: '7.png', hotspots: [], isLast: true }
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
        this.template = document.getElementById('hotspot-template');

        // Transition Elements
        this.transitionScreen = document.getElementById('transition-screen');
        this.transitionTitle = document.getElementById('transition-title');
        this.transitionSubtitle = document.getElementById('transition-subtitle');
        this.transitionBtn = document.getElementById('transition-btn');

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

    renderStep(index) {
        this.currentStepIndex = index;
        const step = this.data[index];

        // Handle Intro Step
        if (step.type === 'intro') {
            this.image.parentElement.classList.add('hidden');
            this.layer.classList.add('hidden');
            this.introScreen.classList.remove('hidden');
            this.transitionScreen.classList.add('hidden');

            // Hide progress
            this.progressBar.style.width = '0%';
            return;
        } else {
            this.introScreen.classList.add('hidden');
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

            // Update Progress (Optional: keep same as previous or advance)
            // const progress = ((index + 1) / this.data.length) * 100;
            // this.progressBar.style.width = `${progress}%`;

            return; // Stop rendering image logic
        } else {
            // Ensure Transition is hidden
            this.transitionScreen.classList.add('hidden');
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

        // Handle Last Step
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
document.addEventListener('DOMContentLoaded', () => {
    new DemoPlayer(demoData);
});
