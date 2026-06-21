/**
 * SAVE THE DATE - INTERACTIVE SCRIPT
 * Handles countdown, animations, modals, and user interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Background Music Toggle ---
    const musicToggleBtn = document.getElementById('music-toggle');
    const bgMusic = document.getElementById('bg-music');
    let isMusicPlaying = false;

    musicToggleBtn.addEventListener('click', () => {
        if (isMusicPlaying) {
            bgMusic.pause();
            musicToggleBtn.querySelector('.icon').textContent = '🎵';
            musicToggleBtn.classList.remove('playing');
        } else {
            // Error handling in case music file is missing
            bgMusic.play().catch(error => {
                console.log("Audio play failed, likely placeholder missing.", error);
            });
            musicToggleBtn.querySelector('.icon').textContent = '⏸';
            musicToggleBtn.classList.add('playing');
        }
        isMusicPlaying = !isMusicPlaying;
    });

    // --- 2. Scroll Reveal Animations ---
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            // Optional: stop observing once revealed
            // observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // --- 3. Countdown Timer ---
    // Target Date: 30 June 2026, 18:00:00 (Adjust as needed)
    const targetDate = new Date("Jun 30, 2026 18:00:00").getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            document.getElementById("countdown").innerHTML = "<h3>The Celebration Has Begun!</h3>";
            return;
        }

        // Time calculations
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Update DOM
        document.getElementById("days").textContent = days.toString().padStart(2, '0');
        document.getElementById("hours").textContent = hours.toString().padStart(2, '0');
        document.getElementById("minutes").textContent = minutes.toString().padStart(2, '0');
        document.getElementById("seconds").textContent = seconds.toString().padStart(2, '0');
    };

    // Initial call and interval setup
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // --- 4. RSVP Modal Logic ---
    const modal = document.getElementById('rsvp-modal');
    const openRsvpBtn = document.getElementById('open-rsvp');
    const closeBtn = document.querySelector('.close-btn');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    const rsvpForm = document.getElementById('rsvp-form');
    const rsvpSuccess = document.getElementById('rsvp-success');

    const openModal = () => {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const closeModal = () => {
        modal.classList.remove('open');
        document.body.style.overflow = 'auto';
        // Reset form after short delay to allow transition
        setTimeout(() => {
            rsvpForm.reset();
            rsvpForm.classList.remove('hidden');
            rsvpSuccess.classList.add('hidden');
        }, 300);
    };

    openRsvpBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);

    // Replace this URL with your Google Apps Script Web App URL
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz3EqqaYWIsadwuzxr7e1I0fNYouliEgDdwK12GWKiSQLEN8KTjWNHBZDd2zQP2XNji/exec';

    // Handle RSVP Submit
    rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = rsvpForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="btn-text">Sending...</span><span class="btn-hover-effect"></span>';
        submitBtn.disabled = true;

        const formData = new FormData();
        formData.append('name', document.getElementById('guest-name').value);
        formData.append('guests', document.getElementById('guest-count').value);
        formData.append('message', document.getElementById('guest-message').value);
        formData.append('timestamp', new Date().toLocaleString());

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            });

            // Hide form, show success
            rsvpForm.classList.add('hidden');
            rsvpSuccess.classList.remove('hidden');
            
            // Trigger Confetti / Petal Animation
            triggerConfetti();
        } catch (error) {
            console.error('Error submitting RSVP:', error);
            alert('There was an error sending your RSVP. Please try again or reach out directly.');
        } finally {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });

    // --- 5. Add to Calendar Functionality ---
    const addCalendarBtn = document.getElementById('add-calendar');

    addCalendarBtn.addEventListener('click', () => {
        // Construct standard ICS file content
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Preeti and Pradeep 25th Anniversary//EN
BEGIN:VEVENT
UID:${new Date().getTime()}@anniversary.com
DTSTAMP:${formatDateICS(new Date())}
DTSTART:20260630T123000Z
DTEND:20260630T183000Z
SUMMARY:Preeti & Pradeep's 25th Anniversary
DESCRIPTION:Join us to celebrate 25 years of love and togetherness! Dress Code: Traditional/Formal Evening Wear.
LOCATION:The Grand Taj Palace\\, New Delhi
END:VEVENT
END:VCALENDAR`;

        // Create Blob and Download
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', 'Preeti_Pradeep_25th_Anniversary.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Helper to format date for ICS
    function formatDateICS(date) {
        return date.toISOString().replace(/-|:/g, '').split('.')[0] + 'Z';
    }

    // --- 6. Floating Particles (Petals/Sparkles) Generator ---
    const particlesContainer = document.getElementById('particles-container');
    const particleCount = 20;

    function createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Randomize size, position, and animation duration
        const size = Math.random() * 8 + 4; // 4px to 12px
        const left = Math.random() * 100; // 0% to 100%
        const duration = Math.random() * 10 + 10; // 10s to 20s
        const delay = Math.random() * 10; // 0s to 10s
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${left}vw`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        particlesContainer.appendChild(particle);
    }

    // Initialize background particles
    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }

    // --- 7. Confetti Burst Function (Called on RSVP) ---
    function triggerConfetti() {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('particle');
            
            // Temporary styling for burst effect
            const size = Math.random() * 10 + 5;
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;
            
            // Start from center of screen
            confetti.style.left = '50vw';
            confetti.style.top = '50vh';
            
            // Custom burst animation logic
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 50 + 20;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity - 20; // Bias upwards slightly
            
            confetti.style.transition = 'all 1.5s cubic-bezier(0.1, 0.8, 0.3, 1)';
            document.body.appendChild(confetti);
            
            // Force reflow
            confetti.getBoundingClientRect();
            
            // Animate outwards and fade
            confetti.style.transform = `translate(${tx}vw, ${ty}vh) scale(0)`;
            confetti.style.opacity = '0';
            
            // Cleanup
            setTimeout(() => {
                confetti.remove();
            }, 1500);
        }
    }
});
