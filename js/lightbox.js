// ==================================================
// LIGHTBOX (ZOOM) + GALERIA + SETAS + DOTS
// ==================================================
// O que este arquivo faz:
// 1) Abre zoom (lightbox) ao clicar na imagem simples do card (.cookie-card > img)
// 2) Abre zoom ao clicar na área do carrossel ([data-carousel]) — pega todas as imagens do carrossel
// 3) Permite trocar imagens no zoom (setas + teclado + dots)
// 4) Fecha ao clicar no fundo, no X, ou apertando ESC
// 5) Faz animação de "press" nas setas (garantida) com classe .is-press
// 6) Estrutura preparada para transição futura (atualmente sem animação)
// ==================================================

document.addEventListener("DOMContentLoaded", () => {

  // ----------------------
  // ELEMENTOS DO LIGHTBOX
  // ----------------------
  const lightbox     = document.getElementById("lightbox");
  const lightboxImg  = document.getElementById("lightboxImg");
  const btnPrev      = document.querySelector(".lightbox-prev");
  const btnNext      = document.querySelector(".lightbox-next");
  const closeBtn     = document.querySelector(".lightbox-close");
  const dotsWrap     = document.querySelector(".lightbox-dots"); // precisa existir no HTML

  // Se não existir lightbox no HTML, para aqui
  if(!lightbox || !lightboxImg) return;

  // ----------------------
  // ESTADO DA GALERIA
  // ----------------------
  let gallery = [];  // lista de src
  let idx = 0;       // índice atual

  // ----------------------
  // FX: Press forte (classe .is-press)
  // ----------------------
  function press(btn){
    if(!btn) return;
    btn.classList.add("is-press");
    setTimeout(() => btn.classList.remove("is-press"), 120);
  }

  // ----------------------
  // Transição (placeholder)
  // ----------------------
  function updateTransition(dir){
    // sem efeito (mantida para compatibilidade futura)
  }

  // ----------------------
  // DOTS: monta/atualiza bolinhas
  // ----------------------
  function renderDots(){
    if(!dotsWrap) return;

    dotsWrap.innerHTML = "";

    const many = gallery.length > 1;
    dotsWrap.style.display = many ? "flex" : "none";
    if(!many) return;

    gallery.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "lightbox-dot" + (i === idx ? " is-active" : "");

      b.addEventListener("click", (e) => {
        e.stopPropagation();
        if(i === idx) return;

        const dir = i > idx ? 1 : -1;
        idx = i;
        updateTransition(dir);
        paint();
      });

      dotsWrap.appendChild(b);
    });
  }

  // ----------------------
  // Atualiza a imagem no zoom + setas + dots
  // ----------------------
  function paint(){
    if(!gallery.length) return;

    lightboxImg.src = gallery[idx];

    const many = gallery.length > 1;
    if(btnPrev) btnPrev.style.display = many ? "flex" : "none";
    if(btnNext) btnNext.style.display = many ? "flex" : "none";

    renderDots();
  }

  // ----------------------
  // Abre o lightbox com um array de imagens e um índice inicial
  // ----------------------
  function openWithImages(images, startIndex=0){
    gallery = Array.isArray(images) ? images : [];
    idx = Math.max(0, Math.min(startIndex, gallery.length - 1));

    paint();
    lightbox.classList.add("active");
  }

  // ----------------------
  // Fecha o lightbox
  // ----------------------
  function close(){
    lightbox.classList.remove("active");
  }

  // ----------------------
  // Vai para um índice (com loop)
  // ----------------------
  function goTo(newIndex, dir=1){
    if(gallery.length <= 1) return;

    idx = (newIndex + gallery.length) % gallery.length;
    updateTransition(dir);
    paint();
  }

  // ----------------------
  // FECHAR: clique no fundo
  // ----------------------
  lightbox.addEventListener("click", (e) => {
    // fecha só se clicou no "fundo", não na imagem/controles
    if(e.target === lightbox) close();
  });

  // ----------------------
  // FECHAR: botão X
  // ----------------------
  if(closeBtn){
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      close();
    });
  }

  // ----------------------
  // SETAS: anterior / próxima
  // ----------------------
  if(btnPrev){
    btnPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      press(btnPrev);
      goTo(idx - 1, -1);
    });
  }

  if(btnNext){
    btnNext.addEventListener("click", (e) => {
      e.stopPropagation();
      press(btnNext);
      goTo(idx + 1, +1);
    });
  }

  // ----------------------
  // TECLADO (DESKTOP)
  // ----------------------
  document.addEventListener("keydown", (e) => {
    if(!lightbox.classList.contains("active")) return;

    if(e.key === "Escape") close();

    if(gallery.length <= 1) return;

    if(e.key === "ArrowLeft")  goTo(idx - 1, -1);
    if(e.key === "ArrowRight") goTo(idx + 1, +1);
  });

  // ==================================================
  // ABRIR LIGHTBOX — IMAGEM SIMPLES (1 imagem)
  // ==================================================
  // Pega só imagem filha direta do card (não pega imagens do carrossel)
  document.querySelectorAll(".cookie-card > img").forEach(img => {
    img.addEventListener("click", (e) => {
      e.stopPropagation();
      openWithImages([img.src], 0);
    });
  });

  // ==================================================
  // ABRIR LIGHTBOX — CARROSSEL DO CARD (2+ imagens)
  // ==================================================
  document.querySelectorAll("[data-carousel]").forEach(media => {

    // Monta array com todas as imagens do carrossel daquele card
    const imgs = Array.from(media.querySelectorAll(".carousel-img")).map(i => i.src);

    media.addEventListener("click", (e) => {

      // Se clicou em botão de seta ou nos dots do carrossel, não abre o zoom
      if(e.target.closest(".carousel-btn") || e.target.closest(".carousel-dot")) return;

      // Tenta descobrir qual slide está ativo pelo transform do track
      const track = media.querySelector(".carousel-track");
      let startIndex = 0;

      if(track && track.style.transform){
        const m = track.style.transform.match(/-([0-9.]+)%/);
        if(m) startIndex = Math.round((+m[1]) / 100);
      }

      openWithImages(imgs, startIndex);
    });
  });

});