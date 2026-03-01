window.addEventListener("load", () => {
  const track = document.querySelector(".ticker-track");
  const first = track?.querySelector(".ticker-content");
  if (!track || !first) return;

  const width = first.offsetWidth;

  track.style.setProperty("--ticker-width", `${width}px`);
  track.style.animationDuration = `${width / 12}s`;
});
