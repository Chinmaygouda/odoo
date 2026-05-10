/* ========================================
   TRAVELOOP — CINEMATIC LANDING PAGE JS
   ======================================== */

(function () {
  "use strict";

  // ── CUSTOM CURSOR ──
  const cursorFollower = document.getElementById("cursorFollower");
  const cursorDot = document.getElementById("cursorDot");
  let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    cursorDot.style.left = mouseX + "px";
    cursorDot.style.top = mouseY + "px";
  });

  function animateCursor() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    cursorFollower.style.left = followerX + "px";
    cursorFollower.style.top = followerY + "px";
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // ── VIDEO FALLBACK → LEAFLET MAP ──
  const heroVideo = document.getElementById("heroVideo");
  const heroMapFallback = document.getElementById("heroMapFallback");
  let mapInstance = null;

  heroVideo.addEventListener("error", activateMapFallback, true);
  // also check if source fails
  const videoSource = heroVideo.querySelector("source");
  if (videoSource) videoSource.addEventListener("error", activateMapFallback, true);

  // Check after a short delay if video loaded
  setTimeout(() => {
    if (heroVideo.readyState === 0) activateMapFallback();
  }, 2000);

  function activateMapFallback() {
    if (mapInstance) return;
    heroVideo.classList.add("hidden");
    heroMapFallback.classList.add("active");
    mapInstance = L.map(heroMapFallback, {
      center: [30, 10], zoom: 3, zoomControl: false,
      attributionControl: false, dragging: false,
      scrollWheelZoom: false, doubleClickZoom: false,
      keyboard: false, touchZoom: false
    });
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 18
    }).addTo(mapInstance);
    // Slow pan animation
    let panLng = 10;
    setInterval(() => {
      panLng += 0.15;
      if (mapInstance) mapInstance.panTo([30, panLng], { animate: true, duration: 2 });
    }, 2000);
  }

  // ── HERO SCROLL ZOOM EFFECT ──
  const heroBg = document.getElementById("heroBg");
  let currentScale = 1;

  function handleHeroScroll() {
    const scrollY = window.scrollY;
    const target = 1 + Math.min(scrollY / 300, 0.4) * 1;
    currentScale += (target - currentScale) * 0.1;
    heroBg.style.transform = "scale(" + currentScale + ")";

    // Parallax fog layers
    const fogs = document.querySelectorAll(".fog-layer");
    const speeds = [0.3, 0.5, 0.2];
    fogs.forEach((fog, i) => {
      fog.style.transform = "translateY(" + (-scrollY * speeds[i]) + "px)";
    });

    requestAnimationFrame(handleHeroScroll);
  }
  requestAnimationFrame(handleHeroScroll);

  // ── RIPPLE EFFECT ──
  const rippleContainer = document.getElementById("rippleContainer");
  document.getElementById("hero").addEventListener("click", (e) => {
    const ripple = document.createElement("div");
    ripple.className = "ripple";
    ripple.style.left = e.clientX + "px";
    ripple.style.top = e.clientY + "px";
    rippleContainer.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });

  // ── HERO TEXT ANIMATION (GSAP) ──
  const heroTl = gsap.timeline({ delay: 0.5 });

  heroTl
    .to("#heroWelcome", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
    .to(".hero-title .letter", {
      opacity: 1, y: 0, duration: 0.6, ease: "power3.out",
      stagger: 0.08
    }, "-=0.3")
    .to("#heroSubtitle", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.2")
    .to("#heroButtons", { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.4")
    .to("#scrollIndicator", { opacity: 1, duration: 1, ease: "power2.out" }, "-=0.3");

  // ── NAV SCROLL STATE ──
  const nav = document.getElementById("mainNav");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 80);
  });

  // ── GSAP SCROLL TRIGGER ANIMATIONS ──
  gsap.registerPlugin(ScrollTrigger);

  // Generic reveal for section tags and headings
  gsap.utils.toArray(".section-tag, .section-heading, .story-text, .premium-text, .cta-text").forEach((el) => {
    gsap.to(el, {
      scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
      opacity: 1, y: 0, duration: 0.9, ease: "power3.out"
    });
  });

  // Story cards stagger
  gsap.to(".story-card", {
    scrollTrigger: { trigger: ".story-right", start: "top 80%" },
    opacity: 1, x: 0, duration: 0.8, ease: "power3.out", stagger: 0.15
  });

  // Feature cards stagger
  gsap.to(".feature-card", {
    scrollTrigger: { trigger: ".features-grid", start: "top 80%" },
    opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1
  });

  // Timeline items
  gsap.utils.toArray(".timeline-item").forEach((item) => {
    const isLeft = item.classList.contains("timeline-left");
    gsap.fromTo(item,
      { opacity: 0, x: isLeft ? -40 : 40 },
      {
        scrollTrigger: { trigger: item, start: "top 85%" },
        opacity: 1, x: 0, duration: 0.8, ease: "power3.out"
      }
    );
  });

  // Globe cities
  gsap.to(".globe-city", {
    scrollTrigger: { trigger: ".globe-cities", start: "top 85%" },
    opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.1
  });

  // Testimonial cards
  gsap.to(".testimonial-card", {
    scrollTrigger: { trigger: ".testimonials-grid", start: "top 80%" },
    opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.15
  });

  // CTA heading
  gsap.to(".cta-heading", {
    scrollTrigger: { trigger: ".cta-heading", start: "top 85%" },
    opacity: 1, y: 0, duration: 1, ease: "power3.out"
  });

  // ── ANIMATED COUNTERS ──
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const dur = 2000;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  document.querySelectorAll(".stat-number, .premium-number").forEach((el) => {
    ScrollTrigger.create({
      trigger: el, start: "top 85%",
      onEnter: () => animateCounter(el), once: true
    });
  });

  // ── INTERACTIVE GLOBE (Three.js) ──
  (function initGlobe() {
    const container = document.getElementById("globeContainer");
    if (!container) return;
    const w = container.offsetWidth, h = container.offsetHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Globe
    const geo = new THREE.SphereGeometry(1, 64, 64);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x1a1a24, wireframe: true, transparent: true, opacity: 0.15
    });
    const globe = new THREE.Mesh(geo, mat);
    scene.add(globe);

    // Glow ring
    const ringGeo = new THREE.RingGeometry(1.02, 1.06, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc9a84c, transparent: true, opacity: 0.2, side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    scene.add(ring);

    // City dots on globe
    const cities = [
      { lat: 48.86, lng: 2.35 }, { lat: 35.68, lng: 139.65 },
      { lat: 40.71, lng: -74.01 }, { lat: -33.87, lng: 151.21 }, { lat: 41.90, lng: 12.50 }
    ];

    cities.forEach((c) => {
      const phi = (90 - c.lat) * (Math.PI / 180);
      const theta = (c.lng + 180) * (Math.PI / 180);
      const x = -(1.02) * Math.sin(phi) * Math.cos(theta);
      const y = (1.02) * Math.cos(phi);
      const z = (1.02) * Math.sin(phi) * Math.sin(theta);
      const dotGeo = new THREE.SphereGeometry(0.02, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xc9a84c });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(x, y, z);
      globe.add(dot);
    });

    // Ambient particles
    const pGeo = new THREE.BufferGeometry();
    const pCount = 200;
    const positions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) positions[i] = (Math.random() - 0.5) * 6;
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xc9a84c, size: 0.015, transparent: true, opacity: 0.4 });
    scene.add(new THREE.Points(pGeo, pMat));

    function animateGlobe() {
      globe.rotation.y += 0.002;
      ring.rotation.x += 0.001;
      renderer.render(scene, camera);
      requestAnimationFrame(animateGlobe);
    }
    animateGlobe();

    window.addEventListener("resize", () => {
      const nw = container.offsetWidth, nh = container.offsetHeight || 500;
      camera.aspect = nw / nh; camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
  })();

  // ── GOLD PARTICLE SYSTEM (background canvas) ──
  (function initParticles() {
    const canvas = document.getElementById("particleCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H;
    const particles = [];
    const PARTICLE_COUNT = 60;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.5 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.2,
        opacity: Math.random() * 0.3 + 0.05
      });
    }

    function drawParticles() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(201,168,76," + p.opacity + ")";
        ctx.fill();
      });
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  })();

  // ── AMBIENT SOUND ──
  const soundToggle = document.getElementById("soundToggle");
  let audioCtx = null, gainNode = null, isMuted = true;

  soundToggle.addEventListener("click", () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      gainNode = audioCtx.createGain();
      gainNode.gain.value = 0;
      gainNode.connect(audioCtx.destination);

      // Wind-like oscillators
      [80, 160].forEach((freq) => {
        const osc = audioCtx.createOscillator();
        osc.type = "sine"; osc.frequency.value = freq;
        osc.connect(gainNode); osc.start();
      });
    }
    isMuted = !isMuted;
    gainNode.gain.linearRampToValueAtTime(isMuted ? 0 : 0.03, audioCtx.currentTime + 0.3);
    soundToggle.textContent = isMuted ? "🔇" : "🔊";
  });

  // ── TRANSITION INTO APP ──
  document.getElementById("btnBegin").addEventListener("click", () => {
    const hero = document.getElementById("hero");
    gsap.to(heroBg, { scale: 1.5, opacity: 0, duration: 0.6, ease: "power2.in" });
    gsap.to("#heroContent", { opacity: 0, duration: 0.4 });
    gsap.to(hero, {
      opacity: 0, duration: 0.6, delay: 0.3,
      onComplete: () => {
        hero.style.display = "none";
        window.scrollTo({ top: 0 });
        // Here you would redirect to the dashboard
        alert("Redirecting to Traveloop Dashboard...");
      }
    });
  });

  document.getElementById("btnGuest").addEventListener("click", () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  });

  // Final CTA
  document.getElementById("btnFinalCta").addEventListener("click", () => {
    alert("Redirecting to Traveloop Dashboard...");
  });

})();
