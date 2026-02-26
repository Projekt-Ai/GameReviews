(function initGotySlider() {
	const sliderWrap = document.querySelector('[data-goty-slider-wrap]');
	if (!sliderWrap) return;

	const carouselWrap = sliderWrap.closest('.goty-carousel-wrap') ?? sliderWrap.parentElement;
	const slider = sliderWrap.querySelector('[data-goty-slider]');
	const prevButton = carouselWrap?.querySelector('[data-goty-prev]');
	const nextButton = carouselWrap?.querySelector('[data-goty-next]');
	const dots = Array.from(carouselWrap?.querySelectorAll('[data-goty-dot]') ?? []);

	if (!slider || !prevButton || !nextButton) return;

	const slides = Array.from(slider.children);
	let activeIndex = Number(sliderWrap.dataset.defaultIndex ?? '0') || 0;

	function syncControls() {
		prevButton.disabled = activeIndex === 0;
		nextButton.disabled = activeIndex === slides.length - 1;
		dots.forEach((dot, i) => dot.classList.toggle('is-active', i === activeIndex));
	}

	function scrollToIndex(index, behavior = 'smooth') {
		const clamped = Math.max(0, Math.min(index, slides.length - 1));
		const slide = slides[clamped];
		if (!slide) return;

		activeIndex = clamped;
		slider.scrollTo({ left: slide.offsetLeft, behavior });
		syncControls();
	}

	function onScroll() {
		const center = slider.scrollLeft + slider.clientWidth / 2;
		let bestIdx = 0;
		let bestDist = Number.POSITIVE_INFINITY;

		slides.forEach((el, i) => {
			const elCenter = el.offsetLeft + el.clientWidth / 2;
			const dist = Math.abs(elCenter - center);
			if (dist < bestDist) {
				bestDist = dist;
				bestIdx = i;
			}
		});

		activeIndex = bestIdx;
		syncControls();
	}

	prevButton.addEventListener('click', function () {
		scrollToIndex(activeIndex - 1);
	});
	nextButton.addEventListener('click', function () {
		scrollToIndex(activeIndex + 1);
	});
	dots.forEach((dot) => {
		dot.addEventListener('click', function () {
			scrollToIndex(Number(dot.dataset.gotyIndex ?? '0'));
		});
	});
	slider.addEventListener('scroll', onScroll, { passive: true });

	onScroll();
	scrollToIndex(activeIndex, 'auto');
})();
