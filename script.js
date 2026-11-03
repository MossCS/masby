/**
 * 
 * Sets the default values for the construction page and updates the page content
 * based on the user's location and language.
 * 
 * @constant {string} defaultCountry - The default country code.
 * @constant {string} defaultLanguage - The default language code.
 * @constant {string} defaultTitle - The default title for the page.
 * @constant {string} defaultMessage - The default message for the page.
 * @constant {string} defaultCopyright - The default copyright message.
 * @constant {number} currentYear - The current year.
 * @constant {number} numStars - The number of stars to display in the background.
 * 
 * @event DOMContentLoaded - Event triggered when the DOM is fully loaded.
 */

/**
 * Fetches the user's location and language, and updates the page content accordingly.
 * If the user's country matches the default country, the default values are used.
 * Otherwise, the content is translated to the user's language throw Google Translate API.
 * 
 * @async
 * @function getLocationAndSetTexts
 * @returns {Promise<void>} - A promise that resolves when the content is updated.
 */

const defaultCountry = "US"; // US
const defaultLanguage = "id"; // en
const defaultTitle = "Under Construction"; 
const defaultMessage = "Something big is coming"; 
const defaultCopyright = "All right reserved."; 
const currentYear = new Date().getFullYear();
const numStars = window.matchMedia("(max-width: 600px)").matches ? 180 : 500;

document.addEventListener("DOMContentLoaded", function () {
	createStars();
	initializeCursorParticles();
	getLocationAndSetTexts();
});

async function getLocationAndSetTexts() {
	document.querySelector(".title").textContent = window.location.hostname;
	const subTitle = document.querySelector(".sub-title");
	const copyright = document.querySelector('.copyright');
	try {
		const response = await fetch("https://ipapi.co/json/");
		const data = await response.json();
		const country = data.country;
		const language = data.languages?.split(",")[0] || "en";
		if (country === defaultCountry) {
			document.title = defaultTitle;
			subTitle.textContent = defaultMessage;
			copyright.textContent = `© ${currentYear} ${window.location.hostname}. ${defaultCopyright}.`;
		} else {
			const textsToTranslate = `${defaultMessage}\n${defaultTitle}\n${defaultCopyright}`;
			const translateResponse = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${defaultLanguage}&tl=${language}&dt=t&q=${encodeURIComponent(textsToTranslate)}`);
			const translation = await translateResponse.json();
			subTitle.textContent = translation[0][0][0];
			document.title = translation[0][1][0];
			copyright.textContent = `© ${currentYear} ${window.location.hostname}. ${translation[0][2][0]}.`;
		}
	} catch (error) {
		console.error("Error:", error);
		subTitle.textContent = defaultMessage;
		document.title = defaultTitle;
		copyright.textContent = `© ${currentYear} ${window.location.hostname}. ${defaultCopyright}`;
	}
}

function createStars(){
	const starsContainer = document.getElementById('stars');

	for (let i = 0; i < numStars; i++) {
		const star = document.createElement('div');
		star.classList.add('star');
		star.style.top = `${Math.random() * 150}%`;
		star.style.left = `${Math.random() * 100}%`;
		const size = Math.random() * 1.5 + 1;
		star.style.width = `${size}px`;
		star.style.height = `${size}px`;
		star.style.background = '#fff';
		star.style.animation = `moveUp ${Math.random() * 30 + 10}s linear infinite`;
		starsContainer.appendChild(star);

		// Reset the position of the star when it reaches the top of the page
		star.addEventListener('animationiteration', () => {
			star.style.top = '100%';
			star.style.left = `${Math.random() * 100}%`;
		});
	}
}

function initializeCursorParticles() {
	const canvas = document.getElementById("cursor-particles");
	const context = canvas.getContext("2d");
	const particles = [];
	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	let animationFrame = null;
	let pixelRatio = 1;
	let lastParticlePosition = null;

	function resizeCanvas() {
		pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.round(window.innerWidth * pixelRatio);
		canvas.height = Math.round(window.innerHeight * pixelRatio);
		canvas.style.width = `${window.innerWidth}px`;
		canvas.style.height = `${window.innerHeight}px`;
		context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
	}

	function animateParticles() {
		context.clearRect(0, 0, window.innerWidth, window.innerHeight);
		for (let i = particles.length - 1; i >= 0; i--) {
			const particle = particles[i];
			particle.x += particle.velocityX;
			particle.y += particle.velocityY;
			particle.life -= 1;
			particle.velocityX *= 0.98;
			particle.velocityY *= 0.98;

			if (particle.life <= 0) {
				particles.splice(i, 1);
				continue;
			}

			const opacity = (particle.life / particle.maxLife) * 0.65;
			context.beginPath();
			context.fillStyle = `rgba(255, ${Math.floor(150 + opacity * 105)}, ${Math.floor(170 + opacity * 85)}, ${opacity})`;
			context.shadowBlur = 4 * opacity;
			context.shadowColor = "#fff";
			context.arc(particle.x, particle.y, Math.max(0.5, particle.size * opacity), 0, Math.PI * 2);
			context.fill();
		}
		context.shadowBlur = 0;
		animationFrame = particles.length ? window.requestAnimationFrame(animateParticles) : null;
	}

	function addParticles(event) {
		if (reducedMotion) return;
		if (lastParticlePosition) {
			const deltaX = event.clientX - lastParticlePosition.x;
			const deltaY = event.clientY - lastParticlePosition.y;
			if (deltaX * deltaX + deltaY * deltaY < 100) return;
		}
		lastParticlePosition = { x: event.clientX, y: event.clientY };
		const amount = event.pointerType === "touch" ? 2 : 1;
		for (let i = 0; i < amount; i++) {
			const life = 16 + Math.random() * 10;
			particles.push({
				x: event.clientX + (Math.random() - 0.5) * 4,
				y: event.clientY + (Math.random() - 0.5) * 4,
				velocityX: (Math.random() - 0.5) * 1.2,
				velocityY: (Math.random() - 0.5) * 1.2,
				size: 0.8 + Math.random() * 1.2,
				life,
				maxLife: life
			});
		}

		if (particles.length > 48) particles.splice(0, particles.length - 48);
		if (animationFrame === null) animationFrame = window.requestAnimationFrame(animateParticles);
	}

	resizeCanvas();
	window.addEventListener("resize", resizeCanvas, { passive: true });
	window.addEventListener("pointermove", addParticles, { passive: true });
	window.addEventListener("pointerdown", addParticles, { passive: true });
}
