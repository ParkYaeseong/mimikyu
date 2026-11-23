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

if (typeof HTMLDialogElement !== "undefined") {
  setupGallery();
  setupVideo();
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
