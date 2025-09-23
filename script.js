document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    const navbar = document.querySelector('.navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }

        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }

        lastScrollY = currentScrollY;
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .about-text, .contact-info').forEach(el => {
        observer.observe(el);
    });

    const form = document.querySelector('.contact-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(form);
        const name = formData.get('name');
        const email = formData.get('email');
        const company = formData.get('company');
        const message = formData.get('message');

        if (!name || !email || !message) {
            alert('Please fill in all required fields.');
            return;
        }

        const submitBtn = form.querySelector('.btn-primary');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        setTimeout(() => {
            alert('Thank you for your message! We\'ll get back to you soon.');
            form.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 1500);
    });

    const heroButtons = document.querySelectorAll('.hero-buttons .btn-primary, .hero-buttons .btn-secondary');
    heroButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.textContent.includes('Get Started')) {
                e.preventDefault();
                const contactSection = document.querySelector('#contact');
                contactSection.scrollIntoView({ behavior: 'smooth' });
            } else if (this.textContent.includes('Watch Demo')) {
                e.preventDefault();

                // Update button state
                const originalText = this.textContent;
                this.textContent = 'Loading Demo...';
                this.disabled = true;

                // Make GET request to the webhook
                fetch('https://ethandu.app.n8n.cloud/webhook-test/5177bccb-7de7-4510-b3c0-a4d2522e9a18')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.text();
                    })
                    .then(data => {
                        console.log('Webhook response:', data);
                        alert('Demo initialized successfully! Check the console for response details.');
                    })
                    .catch(error => {
                        console.error('Error calling webhook:', error);
                        alert('Failed to load demo. Please try again later.');
                    })
                    .finally(() => {
                        // Restore button state
                        this.textContent = originalText;
                        this.disabled = false;
                    });
            }
        });
    });

    function animateNumbers() {
        const stats = document.querySelectorAll('.stat-number');
        stats.forEach(stat => {
            const target = stat.textContent;
            const isPercentage = target.includes('%');
            const isTime = target.includes('/');
            const isPlusNumber = target.includes('+');

            let finalNumber;
            if (isPercentage) {
                finalNumber = parseFloat(target);
            } else if (isTime) {
                return;
            } else if (isPlusNumber) {
                finalNumber = parseInt(target.replace(/[K+]/g, ''));
                if (target.includes('K')) finalNumber *= 1000;
            } else {
                finalNumber = parseInt(target);
            }

            if (isNaN(finalNumber)) return;

            let current = 0;
            const increment = finalNumber / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= finalNumber) {
                    current = finalNumber;
                    clearInterval(timer);
                }

                if (isPlusNumber && target.includes('K')) {
                    stat.textContent = Math.floor(current / 1000) + 'K+';
                } else if (isPercentage) {
                    stat.textContent = current.toFixed(1) + '%';
                } else {
                    stat.textContent = Math.floor(current);
                }
            }, 30);
        });
    }

    const heroSection = document.querySelector('.hero');
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumbers();
                heroObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    heroObserver.observe(heroSection);

    const chatMessages = document.querySelector('.chat-messages');
    const typingIndicator = document.querySelector('.typing-indicator');

    function simulateTyping() {
        const messages = [
            { type: 'user', text: 'Can you help me analyze my sales data?' },
            { type: 'ai', text: 'Of course! I\'d be happy to help analyze your sales data. Please share the data with me.' },
            { type: 'user', text: 'Here\'s my Q3 sales report' },
            { type: 'ai', text: '✅ I\'ve analyzed your Q3 data. Revenue is up 23% compared to Q2, with software sales leading growth.' }
        ];

        let currentMessage = 0;

        function showNextMessage() {
            if (currentMessage >= messages.length) {
                currentMessage = 0;
                chatMessages.innerHTML = '';
            }

            const message = messages[currentMessage];
            typingIndicator.style.display = 'block';

            setTimeout(() => {
                typingIndicator.style.display = 'none';

                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${message.type}-message`;
                messageDiv.innerHTML = `<p>${message.text}</p>`;

                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;

                currentMessage++;

                setTimeout(showNextMessage, 3000);
            }, 1500);
        }

        setTimeout(showNextMessage, 2000);
    }

    simulateTyping();
});

const style = document.createElement('style');
style.textContent = `
    .navbar {
        transition: transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
    }

    .animate-in {
        animation: slideInUp 0.6s ease forwards;
    }

    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .feature-card,
    .about-text,
    .contact-info {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .hamburger.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }

    .hamburger.active span:nth-child(2) {
        opacity: 0;
    }

    .hamburger.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
`;
document.head.appendChild(style);