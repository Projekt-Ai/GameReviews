// Home page GOTY slider interactions (buttons, dots, and scroll syncing).
(function initGotySlider() {
	const sliderWrap = document.querySelector('[data-goty-slider-wrap]');
	// Exit early on pages that do not include the home GOTY slider markup.
	if (!sliderWrap) return;

	// Prefer the semantic carousel wrapper; fall back to the immediate parent if structure changes.
	const carouselWrap = sliderWrap.closest('.goty-carousel-wrap') ?? sliderWrap.parentElement;
	const slider = sliderWrap.querySelector('[data-goty-slider]');
	const prevButton = carouselWrap?.querySelector('[data-goty-prev]');
	const nextButton = carouselWrap?.querySelector('[data-goty-next]');
	// Missing dots should degrade gracefully to an empty array.
	const dots = Array.from(carouselWrap?.querySelectorAll('[data-goty-dot]') ?? []);

	// Abort if required slider controls are missing.
	if (!slider || !prevButton || !nextButton) return;

	const slides = Array.from(slider.children);
	// Default to slide 0 when the data attribute is missing or invalid.
	let activeIndex = Number(sliderWrap.dataset.defaultIndex ?? '0') || 0;

	function syncControls() {
		// Keep nav state in sync with the currently active slide.
		prevButton.disabled = activeIndex === 0;
		nextButton.disabled = activeIndex === slides.length - 1;
		dots.forEach((dot, i) => dot.classList.toggle('is-active', i === activeIndex));
	}

	function scrollToIndex(index, behavior = 'smooth') {
		// Clamp requested index to valid slide bounds before scrolling.
		const clamped = Math.max(0, Math.min(index, slides.length - 1));
		const slide = slides[clamped];
		// Guard against invalid indexes or incomplete slide DOM.
		if (!slide) return;

		activeIndex = clamped;
		slider.scrollTo({ left: slide.offsetLeft, behavior });
		syncControls();
	}

	function onScroll() {
		// Infer the active slide by whichever card is closest to the viewport center.
		const center = slider.scrollLeft + slider.clientWidth / 2;
		let bestIdx = 0;
		let bestDist = Number.POSITIVE_INFINITY;

		// Scan all slides to find the one visually centered in the viewport.
		slides.forEach((el, i) => {
			const elCenter = el.offsetLeft + el.clientWidth / 2;
			const dist = Math.abs(elCenter - center);
			// Keep the closest slide seen so far.
			if (dist < bestDist) {
				bestDist = dist;
				bestIdx = i;
			}
		});

		activeIndex = bestIdx;
		syncControls();
	}

	// Wire controls.
	prevButton.addEventListener('click', function () {
		scrollToIndex(activeIndex - 1);
	});
	nextButton.addEventListener('click', function () {
		scrollToIndex(activeIndex + 1);
	});
	dots.forEach((dot) => {
		dot.addEventListener('click', function () {
			// Dot buttons carry their target slide index in a data attribute.
			scrollToIndex(Number(dot.dataset.gotyIndex ?? '0'));
		});
	});
	slider.addEventListener('scroll', onScroll, { passive: true });

	// Initialize from server-provided default index and align UI state.
	onScroll();
	scrollToIndex(activeIndex, 'auto');
})();
