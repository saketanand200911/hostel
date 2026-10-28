/* ================================================
   CampusHaven – 3D Neon Tubes Cursor FX
   Interactive 3D background that traces cursor in real time
   Powered by threejs-components TubesCursor
   ================================================ */

(function () {
    'use strict';

    // --- State ---
    let tubesApp = null;
    let tubesEnabled = localStorage.getItem('campushaven_tubes') !== 'false'; // Enabled by default!

    // --- 3D Neon Palettes (Unified Across All Wings) ---
    const WING_PALETTES = {
        boys: {
            tubes: ["#f59e0b", "#ef4444", "#3b82f6"],
            lights: ["#fbbf24", "#f97316", "#a855f7", "#06b6d4"],
            intensity: 220
        },
        girls: {
            tubes: ["#f59e0b", "#ef4444", "#3b82f6"],
            lights: ["#fbbf24", "#f97316", "#a855f7", "#06b6d4"],
            intensity: 220
        }
    };

    // Helper to get random neon hex colors
    function randomColors(count) {
        return new Array(count).fill(0).map(() =>
            "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
        );
    }

    function getCurrentWingPalette() {
        const wing = (typeof currentGender !== 'undefined' ? currentGender : (localStorage.getItem('campushaven_gender') || 'boys'));
        return WING_PALETTES[wing] || WING_PALETTES.boys;
    }

    function updateTubesColors(customTubes, customLights) {
        if (!tubesApp || !tubesApp.tubes) return;
        const pal = getCurrentWingPalette();
        try {
            tubesApp.tubes.setColors(customTubes || pal.tubes);
            tubesApp.tubes.setLightsColors(customLights || pal.lights);
            if (typeof tubesApp.tubes.setLightsIntensity === 'function') {
                tubesApp.tubes.setLightsIntensity(pal.intensity || 220);
            }
        } catch (err) {
            console.warn('Failed to update tube colors:', err);
        }
    }

    async function initTubes() {
        const canvas = document.getElementById('tubes-bg-canvas');
        if (!canvas || tubesApp) return;

        try {
            // Import threejs-components TubesCursor build
            const module = await import('https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js');
            const TubesCursor = module.default;

            const palette = getCurrentWingPalette();

            tubesApp = TubesCursor(canvas, {
                tubes: {
                    colors: palette.tubes,
                    lights: {
                        intensity: palette.intensity || 220,
                        colors: palette.lights
                    }
                }
            });

            canvas.classList.add('loaded');
            document.body.classList.add('tubes-active');

            const toggleBtn = document.getElementById('tubes-toggle');
            if (toggleBtn) {
                toggleBtn.classList.add('active');
                toggleBtn.title = "3D Neon Tubes Cursor: ACTIVE (Click to pause)";
            }

            console.log('3D Neon Tubes cursor background initialized successfully');
        } catch (error) {
            console.warn('Could not load 3D neon tubes background:', error);
            tubesEnabled = false;
            document.body.classList.remove('tubes-active');
            const toggleBtn = document.getElementById('tubes-toggle');
            if (toggleBtn) toggleBtn.classList.remove('active');
        }
    }

    function destroyTubes() {
        if (tubesApp && typeof tubesApp.dispose === 'function') {
            try {
                tubesApp.dispose();
            } catch (e) { /* ignore */ }
        }
        tubesApp = null;

        const canvas = document.getElementById('tubes-bg-canvas');
        if (canvas) {
            canvas.classList.remove('loaded');
        }

        document.body.classList.remove('tubes-active');
        const toggleBtn = document.getElementById('tubes-toggle');
        if (toggleBtn) {
            toggleBtn.classList.remove('active');
            toggleBtn.title = "3D Neon Tubes Cursor: PAUSED (Click to activate)";
        }
    }

    // Toggle 3D background on/off
    window.toggleTubes = function () {
        tubesEnabled = !tubesEnabled;
        localStorage.setItem('campushaven_tubes', tubesEnabled ? 'true' : 'false');

        if (tubesEnabled) {
            initTubes();
            if (typeof showAlert === 'function') {
                showAlert('✨ 3D Neon Tubes cursor animation enabled! Move cursor or tap anywhere to interact.', 'success');
            }
        } else {
            destroyTubes();
            if (typeof showAlert === 'function') {
                showAlert('3D Neon Tubes background paused.', 'info');
            }
        }
    };

    // Public method to trigger color randomization
    window.randomizeTubeColors = function () {
        if (!tubesApp) return;
        const tubesCols = randomColors(3);
        const lightsCols = randomColors(4);
        updateTubesColors(tubesCols, lightsCols);
    };

    // Global click handler to randomize colors on non-interactive clicks
    document.addEventListener('click', function (e) {
        // Do not randomize if user clicked on a form element, link, or button
        const isInteractive = e.target.closest('button, input, select, textarea, a, label, .sketch-btn, [role="button"]');
        if (isInteractive) return;

        if (tubesApp) {
            window.randomizeTubeColors();
        }
    });

    // Hook into window.updateGender to transition tube colors seamlessly
    const origUpdateGender = window.updateGender;
    window.updateGender = function (newGender) {
        if (typeof origUpdateGender === 'function') {
            origUpdateGender(newGender);
        }
        if (tubesApp) {
            setTimeout(() => {
                updateTubesColors();
            }, 100);
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onReady);
    } else {
        onReady();
    }

    function onReady() {
        // Always enforce dark theme
        document.body.setAttribute('data-theme', 'dark');

        if (tubesEnabled) {
            // Give DOM a tick to layout before initializing WebGL
            setTimeout(initTubes, 150);
        }
    }
})();
