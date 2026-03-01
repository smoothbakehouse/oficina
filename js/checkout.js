// ======================
// ALERTA SMOOTH COM OK (SEM ABRIR TECLADO)
// ======================
function smoothAlert(message, focusAfterOkEl = null){

  const alertEl = document.getElementById("smooth-alert");
  const textEl  = document.getElementById("smooth-alert-text");
  const okBtn   = document.getElementById("smooth-alert-ok");

  if(!alertEl || !textEl || !okBtn) return;

  // ✅ fecha teclado se algum input já estiver focado
  if (document.activeElement && typeof document.activeElement.blur === "function") {
    document.activeElement.blur();
  }

  textEl.textContent = message;
  alertEl.classList.add("show");

  // evita acumular múltiplos handlers
  okBtn.onclick = () => {
    alertEl.classList.remove("show");

    // ✅ só foca o campo DEPOIS do OK (aí sim abre teclado)
    if (focusAfterOkEl) {
      setTimeout(() => {
        focusAfterOkEl.focus();
      }, 50);
    }
  };

  // fechar clicando fora da caixa (opcional)
  alertEl.onclick = (e) => {
    if(e.target === alertEl){
      alertEl.classList.remove("show");

      if (focusAfterOkEl) {
        setTimeout(() => {
          focusAfterOkEl.focus();
        }, 50);
      }
    }
  };

  // ❌ NÃO usar okBtn.focus() (não precisa e pode causar efeitos estranhos em alguns webviews)
}
// ======================
// CONSOLE VISUAL MOBILE (TEMPORÁRIO)
// ======================
function log(msg){
  const el = document.createElement("div");
  el.style.position = "fixed";
  el.style.bottom = "0";
  el.style.left = "0";
  el.style.right = "0";
  el.style.background = "black";
  el.style.color = "lime";
  el.style.padding = "8px";
  el.style.zIndex = "99999";
  el.style.fontSize = "12px";
  el.textContent = msg;
  document.body.appendChild(el);
}







let miniCart, miniTotal, miniCount, mobileBtn;

// ======================
// ESTADO CENTRAL
// ======================
const cart = {};
const DELIVERY_FEE = 9.99;
let delivery = 0;
let freeShipping = false;      // cupom frete
let productCouponActive = false; // preparado (futuro)

// ======================
// ELEMENTOS
// ======================


const mobileTotal= document.getElementById('mobileTotal');

const cartList   = document.getElementById('cartList');
const subtotalEl = document.getElementById('subtotal');
const deliveryEl = document.getElementById('delivery');
const totalEl    = document.getElementById('total');

const nameEl     = document.getElementById('clientName');
const phoneEl    = document.getElementById('clientPhone');
const notesEl    = document.getElementById('notes');
const addressEl  = document.getElementById('address');

const addressBlock = document.getElementById('addressBlock');
const pickupBlock  = document.getElementById('pickupBlock');

const changeBlock  = document.getElementById('changeBlock');
const changeValue  = document.getElementById('changeValue');
const clearBtn = document.getElementById("clearCart");


// ======================
// SCROLL PARA CHECKOUT — FIX REAL MOBILE
// ======================
document.addEventListener("DOMContentLoaded", () => {

  miniCart   = document.getElementById('miniCart');
  miniTotal  = document.getElementById('miniTotal');
  miniCount  = document.getElementById('miniCount');
  mobileBtn  = document.getElementById('mobileBtn');


 // ✅ estado inicial: começa escondido até ter itens
  if (miniCart)  miniCart.style.display = "none";
  if (mobileBtn) mobileBtn.style.display = "none";


  const checkoutEl = document.getElementById('checkout');
  const miniScroll = document.getElementById('miniScroll');

 function scrollToCheckout(){
  if(!checkoutEl) return;

  const offset = 45;

  // 1) jeito mais compatível
  checkoutEl.scrollIntoView({ behavior: "smooth", block: "start" });

  // 2) corrige o topo depois (pra não ficar colado no header/ticker)
  setTimeout(() => {
    window.scrollBy({ top: -offset, left: 0, behavior: "smooth" });
  }, 250);
}

 // ======================
// FIX — PREVINE CLIQUE FANTASMA
// ======================

miniScroll?.addEventListener('click', (e) => {
  e.preventDefault();      // impede evento invisível
  scrollToCheckout();
});

mobileBtn?.addEventListener('click', (e) => {
  e.preventDefault();      // impede clique “fantasma”
  scrollToCheckout();
});

});

// ======================
// ESTADO INICIAL FORÇADO (ANTI-BUG)
// ======================
if (changeBlock) {
  changeBlock.classList.add('sc-hidden');
}

if (changeValue) {
  changeValue.classList.add('sc-hidden');
  changeValue.value = '';
}




const couponBlock  = document.getElementById('couponBlock');

const finishBtn = document.getElementById('finishBtn');



// ======================
// OBSERVER — ESCONDE MINI CARTS AO CHEGAR NO CHECKOUT
// ======================

const sentinel = document.getElementById('checkout-sentinel');

if (sentinel) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      const hide = entry.isIntersecting;

if (miniCart) {
  miniCart.style.opacity = hide ? '0' : '1';
  miniCart.style.pointerEvents = hide ? 'none' : 'auto';
  miniCart.style.visibility = hide ? 'hidden' : 'visible';
}

if (mobileBtn) {
  mobileBtn.style.opacity = hide ? '0' : '1';
  mobileBtn.style.pointerEvents = hide ? 'none' : 'auto';
  mobileBtn.style.visibility = hide ? 'hidden' : 'visible';
}
    },
    {
      root: null,
      threshold: 0,
      rootMargin: '0px'
    }
  );

  observer.observe(sentinel);
}




// ======================
// HELPERS
// ======================
const money = v => `R$ ${v.toFixed(2).replace('.',',')}`;
const hasItems = () => Object.values(cart).reduce((a,i)=>a+i.qty,0) > 0;

// ======================
// UI UPDATE
// ======================
function updateUI(){
  let subtotal = 0;
  let items = 0;

  


  cartList.innerHTML = '';

  for(const name in cart){
    subtotal += cart[name].price * cart[name].qty;
    items += cart[name].qty;
  const li = document.createElement('li');

li.textContent = `${cart[name].qty}x ${name} — ${money(cart[name].price)} (un)`;

cartList.appendChild(li);

  }

  const deliveryValue = freeShipping ? 0 : delivery;

subtotalEl.textContent = money(subtotal);
totalEl.textContent = money(subtotal + deliveryValue);

const deliveryLine = document.getElementById('deliveryLine');

if (delivery > 0) {
  deliveryEl.textContent = money(deliveryValue);
  deliveryLine.classList.remove('sc-hidden');
} else {
  deliveryLine.classList.add('sc-hidden');
}


if (miniTotal)  miniTotal.textContent = totalEl.textContent;
if (miniCount)  miniCount.textContent = `${items} selecionado(s)`;
if (mobileTotal) mobileTotal.textContent = totalEl.textContent;

const show = items > 0;
if (miniCart)  miniCart.style.display = show ? 'block' : 'none';

/* mobileBtn precisa ser flex pra manter alinhamento */
if (mobileBtn) mobileBtn.style.display = show ? 'flex' : 'none';


// mostrar / esconder botão "Limpar itens" (via classe)
if (clearBtn) {
  clearBtn.classList.toggle("is-hidden", !hasItems());
}



  validate();
}



// ======================
// PRODUTOS (+ / -) — UNIFICADO
// ======================
document.querySelectorAll('.cookie-card').forEach(card => {

  const plusBtn = card.querySelector('.plus');
  const minusBtn = card.querySelector('.minus');
  const qtyEl = card.querySelector('.qty');

  const baseName = card.dataset.baseName;
  const simpleName = card.dataset.name;
  const simplePrice = +card.dataset.price;

  function getItemData(){

    // card com variação
    if(baseName){
      const selected = card.querySelector('input[type="radio"]:checked');
      if(!selected) return null;

      const weight = selected.value;
      const price = +selected.dataset.price;

      return {
        name: `${baseName} — ${weight}g`,
        price
      };
    }

    // card simples
    return {
      name: simpleName,
      price: simplePrice
    };
  }

  function updateCardQty(){

    // apenas cards com variação precisam sincronizar
    if(!baseName) return;

    const selected = card.querySelector('input[type="radio"]:checked');
    if(!selected) return;

    const weight = selected.value;
    const key = `${baseName} — ${weight}g`;

    qtyEl.textContent = cart[key]?.qty || 0;
  }

  plusBtn.onclick = () => {
    const item = getItemData();
    if(!item) return;

    cart[item.name] = cart[item.name] || { price: item.price, qty: 0 };
    cart[item.name].qty++;

    if(baseName){
      updateCardQty();
    } else {
      qtyEl.textContent = cart[item.name].qty;
    }

    updateUI();
  };

  minusBtn.onclick = () => {
    const item = getItemData();
    if(!item || !cart[item.name]) return;

    cart[item.name].qty--;

    if(cart[item.name].qty <= 0){
      delete cart[item.name];
    }

    if(baseName){
      updateCardQty();
    } else {
      qtyEl.textContent = cart[item.name]?.qty || 0;
    }

    updateUI();
  };

  // atualizar contador ao trocar peso
  if(baseName){
    card.querySelectorAll('input[type="radio"]').forEach(r => {
      r.addEventListener('change', updateCardQty);
    });

    updateCardQty();
  }

});


// ======================
// PREÇO DINÂMICO — VARIANT CARD
// ======================

document.querySelectorAll('.variant-card').forEach(card => {

  const radios = card.querySelectorAll('input[type="radio"]');
  const priceEl = card.querySelector('.price-line .value');
  const infoEl = card.querySelector('.dynamic-price .info-produto');

  function updatePrice(){
    const selected = card.querySelector('input[type="radio"]:checked');
    if(!selected) return;

    const price = +selected.dataset.price;
    const weight = selected.value;

    const [int, cents] = price.toFixed(2).split('.');

    priceEl.innerHTML = `${int},<span class="cents">${cents}</span>`;
    infoEl.textContent = `unidade • ${weight}g`;
  }

  radios.forEach(r => r.addEventListener('change', updatePrice));

  updatePrice(); // inicializa
});


// ======================
// PREÇO DINÂMICO — CARDS COM VARIAÇÃO
// ======================
document.querySelectorAll('.cookie-card[data-base-name]').forEach(card => {

  const radios = card.querySelectorAll('input[type="radio"]');
  const priceEl = card.querySelector('.price-line .value');
  const infoEl = card.querySelector('.price-block .info-produto');

  function updatePrice(){
    const selected = card.querySelector('input[type="radio"]:checked');
    if(!selected) return;

    const price = +selected.dataset.price;
    const weight = selected.value;

    const [int, cents] = price.toFixed(2).split('.');

    priceEl.innerHTML = `${int},<span class="cents">${cents}</span>`;
    infoEl.textContent = `unidade • ${weight}g`;
  }

  radios.forEach(r => r.addEventListener('change', updatePrice));

  updatePrice(); // inicia já correto
});


// ======================
// RECEBIMENTO
// ======================
document.querySelectorAll('input[name="receive"]').forEach(r=>{
  r.onchange = ()=>{
    deliveryClicks = 0;               // 🔁 reset gesto secreto
    couponBlock.classList.add('sc-hidden');

    if(r.value === 'entrega'){
      delivery = DELIVERY_FEE;
      addressBlock.classList.remove('sc-hidden');
      pickupBlock.classList.add('sc-hidden');
    }else{
      delivery = 0;
      addressBlock.classList.add('sc-hidden');
      pickupBlock.classList.remove('sc-hidden');
      freeShipping = false;

      // 🔁 reset UI do cupom ao sair de Entrega
      const couponInput = document.getElementById('coupon');
const couponBtn   = document.getElementById('applyCoupon');

if (couponInput) {
  couponInput.disabled = false;
  couponInput.value = '';
}
if (couponBtn) {
  couponBtn.disabled = false;
  couponBtn.textContent = 'Aplicar';
  couponBtn.classList.remove('is-applied');
}
    }

    updateUI();
  };
});

// ======================
// CUPOM FRETE — GESTO SECRETO
// 5 cliques em "Entrega (+R$9,99)"
// ======================

let deliveryClicks = 0;

document.querySelectorAll('input[name="receive"]').forEach(r=>{
  r.addEventListener('click', ()=>{
    // só conta clique se for entrega
    if(r.value !== 'entrega') return;

    // só conta se entrega estiver selecionada
    if(!r.checked) return;

    deliveryClicks++;

    if(deliveryClicks === 5){
      couponBlock.classList.remove('sc-hidden');
    }
  });
});

// ======================
// PAGAMENTO / TROCO — VISIBILIDADE FINAL
// ======================
document.querySelectorAll('input[name="payment"]').forEach(r=>{
  r.onchange = ()=>{
    if (r.value === 'Dinheiro') {

      // mostra a pergunta
      changeBlock.classList.remove('sc-hidden');

      // campo começa SEMPRE escondido
      changeValue.classList.add('sc-hidden');
      changeValue.value = '';

      // limpa Sim / Não
      document
        .querySelectorAll('input[name="change"]')
        .forEach(c => c.checked = false);

    } else {
      // se não for dinheiro, some tudo
      changeBlock.classList.add('sc-hidden');
      changeValue.classList.add('sc-hidden');
      changeValue.value = '';

      document
        .querySelectorAll('input[name="change"]')
        .forEach(c => c.checked = false);
    }

    validate();
  };
});




// ======================
// SIM / NÃO — TROCO
// ======================
document.querySelectorAll('input[name="change"]').forEach(r=>{
  r.onchange = ()=>{
    if (r.value === 'sim') {
      changeValue.classList.remove('sc-hidden');
    } else {
      changeValue.classList.add('sc-hidden');
      changeValue.value = '';
    }

    validate();
  };
});





// ======================
// CUPONS DE FRETE VÁLIDOS
// ======================
const FREE_SHIPPING_COUPONS = [
  'GRATIS',
  'MAITE',
  'SOFIA',
  'DRY',
  'CAROL',
  'GUI',
  'DEYG',
];




// ======================
// CUPOM FRETE (OCULTO)
// ======================
document.getElementById('applyCoupon')?.addEventListener('click', () => {
  const input = document.getElementById('coupon');
  const btn = document.getElementById('applyCoupon');
  const code = input.value.trim().toUpperCase();

  // se já está aplicado
  if (freeShipping) {
    smoothAlert('Frete grátis já está aplicado.');
    return;
  }

  if (!code) {
    smoothAlert('Digite um cupom antes de aplicar.');
    return;
  }

  if (FREE_SHIPPING_COUPONS.includes(code)) {
    freeShipping = true;
    updateUI();

    // UI do botão
    if (btn) {
      btn.textContent = 'Aplicado ✓';
      btn.disabled = true;
      btn.classList.add('is-applied');
    }

    // opcional: trava o input também
    input.disabled = true;

    smoothAlert('Frete grátis aplicado.');
  } else {
    freeShipping = false;
    updateUI();
    smoothAlert('Cupom inválido.');
  }
});


document.getElementById('coupon')?.addEventListener('input', () => {
  const input = document.getElementById('coupon');
  const btn = document.getElementById('applyCoupon');

  // se o usuário começar a editar, libera pra aplicar outro
  if (input.disabled) {
    input.disabled = false;
  }

  if (btn && btn.disabled) {
    btn.disabled = false;
    btn.textContent = 'Aplicar';
    btn.classList.remove('is-applied');
  }

  // ao editar, remove o frete grátis (pra não ficar “preso”)
  if (freeShipping) {
    freeShipping = false;
    updateUI();
  }
});

// ======================
// VALIDAÇÃO + BOTÃO MUTE
// ======================
function validate(){
  let ok = true;

  if(!hasItems()) ok=false;
  if(!nameEl.value.trim()) ok=false;
  if(!phoneEl.value.trim()) ok=false;

  const receive = document.querySelector('input[name="receive"]:checked');
  if(!receive) ok=false;

  if(receive?.value==='entrega' && !addressEl.value.trim()) ok=false;

  const pay = document.querySelector('input[name="payment"]:checked');
if(!pay) ok = false;

/* REGRA DINHEIRO + TROCO — CORRETA */
if (pay && pay.value === 'Dinheiro') {

  // se o bloco de troco ainda está escondido → inválido
  if (changeBlock.classList.contains('sc-hidden')) {
    ok = false;
  } else {
    const ch = document.querySelector('input[name="change"]:checked');

    // não escolheu Sim ou Não
    if (!ch) ok = false;

    // escolheu Sim, mas não informou valor
    if (ch && ch.value === 'sim' && !changeValue.value.trim()) {
      ok = false;
    }
  }
}


  finishBtn.classList.toggle('sc-muted', !ok);
  return ok;
}

[nameEl,phoneEl,notesEl,addressEl,changeValue].forEach(el=>{
  el?.addEventListener('input',validate);
});



// ======================
// Alertas novo
// ======================


finishBtn.onclick = ()=>{

  if(!hasItems()){
    smoothAlert('Adicione pelo menos um cookie ao pedido.');
    return;
  }

  if(!nameEl.value.trim()){
    smoothAlert('Informe seu nome.', nameEl);
return;
  }

  if(!phoneEl.value.trim()){
    smoothAlert('Informe seu WhatsApp.', phoneEl);
return;
  }

  const receive = document.querySelector('input[name="receive"]:checked');
  if(!receive){
    smoothAlert('Escolha entrega ou retirada.');
    return;
  }

  if(receive.value === 'entrega' && !addressEl.value.trim()){
    smoothAlert('Informe o endereço para entrega.', addressEl);
return;
  }

  const pay = document.querySelector('input[name="payment"]:checked');
  if(!pay){
    smoothAlert('Escolha a forma de pagamento.');
    return;
  }

  if(pay.value === 'Dinheiro'){
    const ch = document.querySelector('input[name="change"]:checked');
    if(!ch){
      smoothAlert('Informe se precisa de troco.');
      return;
    }
    if(ch.value === 'sim' && !changeValue.value.trim()){
      smoothAlert('Informe o valor para o troco.', changeValue);
return;
    }
  }

// ======================
// MONTA MENSAGEM WHATSAPP — FINAL
// ======================

let msg = '*Pedido Smooth*\n\n';

msg += `Cliente: ${nameEl.value}\n`;
msg += `WhatsApp: ${phoneEl.value}\n\n`;

msg += 'Cookies selecionados:\n';

let subtotal = 0;

for (const n in cart) {
  const qty = cart[n].qty;
  const price = cart[n].price;
  subtotal += qty * price;

  msg += `${qty}x ${n} — ${money(price)} (un)\n`;
}

const deliveryValue = freeShipping ? 0 : delivery;

msg += `Subtotal dos produtos: ${money(subtotal)}\n`;

if (receive.value === 'entrega') {
  msg += `Entrega: ${money(deliveryValue)}\n`;
}

msg += '---------------------------------------\n';
msg += `Total do pedido: ${totalEl.textContent}\n`;

msg += 'Valor sujeito à confirmação.\n\n';


msg += `Forma de pagamento: ${pay.value}\n\n`;

if (pay.value === 'Dinheiro') {
  const ch = document.querySelector('input[name="change"]:checked');

  if (ch && ch.value === 'sim') {
    msg += `Troco para: R$ ${changeValue.value}\n\n`;
  } else {
    msg += 'Sem necessidade de troco\n\n';
  }
}


msg += 'Forma de recebimento:\n';

if (receive.value === 'entrega') {
  msg += 'Entrega —\n';
  msg += `${addressEl.value}\n`;
} else {
  msg += 'Retirada no local —\n';
  msg += 'Rua Emidio Alves Feitosa, nº 1680\n';
  msg += 'Bairro Agenor de Carvalho.\n';
}

if (notesEl.value.trim()) {
  msg += `\nObservações:\n${notesEl.value}\n`;
}

msg += '\nObrigado!';

const url = `https://wa.me/556932156921?text=${encodeURIComponent(msg)}`;
window.open(url, '_blank');

}

console.log('JS carregou');


// ======================
// MINI CART — DRAG (DESKTOP)
// ======================

(function enableMiniCartDrag() {
  if (window.innerWidth <= 768) return; // ❌ mobile não

  const cart = document.getElementById('miniCart');
  if (!cart) return;

  let isDragging = false;
  let startX, startY, startRight, startBottom;

  cart.addEventListener('mousedown', (e) => {
    // evita arrastar ao clicar em botões
    if (e.target.closest('button')) return;

    isDragging = true;
    cart.style.transition = 'none';

    startX = e.clientX;
    startY = e.clientY;

    const rect = cart.getBoundingClientRect();
    startRight = window.innerWidth - rect.right;
    startBottom = window.innerHeight - rect.bottom;

    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    cart.style.right = `${startRight - dx}px`;
    cart.style.bottom = `${startBottom - dy}px`;
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;

    isDragging = false;
    cart.style.transition = '';
    document.body.style.userSelect = '';
  });
})();



//=========================
// Limpar Itens
//=========================

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    // 1. limpa estado lógico
    Object.keys(cart).forEach(key => delete cart[key]);

    // 2. zera contadores visuais
    document.querySelectorAll('.cookie-card .qty').forEach(qty => {
      qty.textContent = '0';
    });

    // 3. atualiza UI inteira
    updateUI();
  });
}
