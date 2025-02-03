// Dark Mode Implementation
class DarkModeManager {
    constructor() {
        this.darkModeKey = 'darkMode';
        this.darkModeToggle = document.getElementById('darkModeToggle');
        this.initDarkMode();
        this.addEventListeners();
    }

    initDarkMode() {
        // Check for saved dark mode preference
        const savedDarkMode = localStorage.getItem(this.darkModeKey);
        
        // Check for system preference if no saved preference
        if (savedDarkMode === null) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setDarkMode(prefersDark);
        } else {
            this.setDarkMode(savedDarkMode === 'true');
        }
    }

    setDarkMode(isDark) {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
        localStorage.setItem(this.darkModeKey, isDark);
        
        // Add smooth transition class
        document.body.classList.add('theme-transition');
        setTimeout(() => {
            document.body.classList.remove('theme-transition');
        }, 300);
    }

    toggleDarkMode() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        this.setDarkMode(!isDark);
    }

    addEventListeners() {
        // Toggle button click
        this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());

        // System theme change
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (localStorage.getItem(this.darkModeKey) === null) {
                this.setDarkMode(e.matches);
            }
        });
    }
}

// Initialize Dark Mode
document.addEventListener('DOMContentLoaded', () => {
    new DarkModeManager();
});

// Add this to handle transitions
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.display = 'block';
});