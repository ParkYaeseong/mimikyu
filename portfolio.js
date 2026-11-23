"use strict";

const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

function isPlainClick(event) {
  return event.button === 0 && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;
}

function setupGallery() {
  const dialog = document.querySelector("#project-gallery-dialog");
  const thumbnails = [...document.querySelectorAll("#projectCarousel a")];
  const preview = dialog.querySelector("img");
  const caption = dialog.querySelector("figcaption");
  const original = dialog.querySelector("a");
  let current = 0;

  function showImage(index) {
    current = (index + thumbnails.length) % thumbnails.length;
    const link = thumbnails[current];
    const thumbnail = link.querySelector("img");
    preview.alt = thumbnail.alt;
    preview.src = motion.matches && link.pathname.endsWith(".gif") ? thumbnail.src : link.href;
    caption.textContent = `${link.querySelector("span").textContent} (${current + 1} of ${thumbnails.length})`;
    original.href = link.href;
  }

  thumbnails.forEach((link, index) => {
    link.addEventListener("click", (event) => {
      if (!isPlainClick(event)) return;
      event.preventDefault();
      showImage(index);
      dialog.showModal();
    });
  });

  for (const control of dialog.querySelectorAll("button[data-step]")) {
    control.addEventListener("click", () => showImage(current + Number(control.dataset.step)));
  }

  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    showImage(current + (event.key === "ArrowRight" ? 1 : -1));
  });
  dialog.addEventListener("close", () => {
    if (!dialog.open) preview.removeAttribute("src");
  });
}

function setupVideo() {
  const demo = document.querySelector("#cdss-demo");
  const dialog = document.querySelector("#cdss-video-dialog");
  const player = dialog.querySelector(".video-frame");

  demo.addEventListener("click", (event) => {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    const iframe = document.createElement("iframe");
    iframe.src = demo.href;
    iframe.title = "MEORING Clinical Decision Support System demo";
    iframe.allowFullscreen = true;
    player.replaceChildren(iframe);
    dialog.showModal();
  });

  dialog.addEventListener("close", () => {
    if (!dialog.open) player.replaceChildren();
  });
}

function setupAppDemos() {
  const dialog = document.querySelector("#app-demo-dialog");
  const player = dialog.querySelector("video");
  const title = dialog.querySelector("h2");
  const description = dialog.querySelector("p");
  const source = dialog.querySelector("a");

  for (const demo of document.querySelectorAll(".demo-tile")) {
    demo.addEventListener("click", (event) => {
      if (!isPlainClick(event)) return;
      event.preventDefault();
      title.textContent = demo.querySelector("h4").textContent;
      description.textContent = demo.querySelector("p").textContent;
      source.href = demo.dataset.source;
      player.poster = demo.querySelector("img").src;
      player.src = demo.href;
      dialog.showModal();
      player.play().catch(() => { /* The player remains available for manual playback. */ });
    });
  }

  dialog.addEventListener("close", () => {
    if (dialog.open) return;
    player.pause();
    player.removeAttribute("src");
    player.removeAttribute("poster");
    player.load();
  });
}

if (typeof HTMLDialogElement !== "undefined") {
  setupGallery();
  setupVideo();
  setupAppDemos();
}

if (!motion.matches && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("reveal-project");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.15 });

  for (const project of document.querySelectorAll(".project")) observer.observe(project);
}
