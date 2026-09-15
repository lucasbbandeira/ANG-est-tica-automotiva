'use strict';

// Catálogo central: altere os valores e os itens inclusos aqui.
const ANG_SERVICES = Object.freeze([
  {id:'lavagem-1',name:'Lavagem Nível 1',category:'lavagens',stars:3,icon:'drop',prices:{P:100,G:120},description:'O cuidado essencial para manter o seu carro limpo e bem apresentado.',includes:['Lavagem externa','Limpeza interna','Limpeza nos vidros','Restauração nas entradas de portas','Aplicação de pneu pretinho']},
  {id:'lavagem-2',name:'Lavagem Nível 2',category:'lavagens',stars:3,icon:'drop',prices:{P:130,G:150},description:'Limpeza com um toque a mais de brilho e cuidado nos acabamentos.',includes:['Lavagem externa','Limpeza interna','Limpeza nos vidros','Restauração dos plásticos externos','Aplicação de cera líquida','Aplicação de pneu pretinho','Condicionamento das caixas de rodas']},
  {id:'lavagem-3',name:'Lavagem Nível 3',category:'lavagens',stars:5,icon:'sparkles',prices:{P:450,G:490},badge:'MAIS VENDIDO',description:'Uma lavagem completa, do brilho da pintura ao cuidado artesanal do motor.',includes:['Limpeza externa','Limpeza interna','Restauração dos plásticos externos','Descontaminação de pintura','Limpeza artesanal de motor','Aplicação de verniz de proteção no motor e caixas de rodas','Aplicação de cera para proteger e intensificar o brilho','Cristalização nos vidros','Restauração dos plásticos internos','Aplicação de pneu pretinho']},
  {id:'lavagem-0km',name:'Lavagem Carro 0KM',category:'lavagens',stars:3,icon:'car',prices:{P:150,G:170},description:'O começo de uma boa rotina de cuidado para o seu carro novo.',includes:['Lavagem externa','Limpeza interna','Limpeza nos vidros','Protetor solar para plásticos externos','Aplicação de cera líquida','Aplicação de pneu pretinho','Condicionamento das caixas de rodas','Aromatizante interno']},
  {id:'tratamento-ang',name:'Tratamento ANG',category:'tratamentos',stars:4,icon:'sparkles',price:550,description:'Revitalização dos acabamentos e brilho intenso, com atenção especial aos carros pretos.',includes:['Limpeza nos vidros','Restauração dos plásticos externos','Descontaminação de pintura','Tratamento no chassis com aplicação de proteção','Aplicação de revitalizador específico para carros pretos, que intensifica o brilho','Restauração dos plásticos internos','Condicionamento das caixas de rodas','Aplicação de pneu pretinho']},
  {id:'higienizacao',name:'Pacote Higienização',category:'tratamentos',stars:5,icon:'sparkles',price:690,description:'Conforto por dentro, cuidado por fora. Um tratamento completo para o interior.',includes:['Tratamento completo de toda a parte interna do carro','Proteção de todas as superfícies com durabilidade de até 5 anos','Lavagem detalhada com aplicação de cera líquida']},
  {id:'elite',name:'Pacote Elite',category:'tratamentos',stars:5,icon:'shield',price:3500,badge:'EXPERIÊNCIA ELITE',description:'Nosso cuidado mais completo: polimento, higienização e vitrificação de longa duração.',includes:['Polimento detalhado','Higienização interna e aplicação de vitrificador para couro','Limpeza de motor e caixas de rodas','Aplicação de verniz no motor e caixas de rodas','Aplicação de vitrificador com duração de 5 anos','Uma lavagem de brinde após 10 dias']},
  {id:'protecao-6',name:'Proteção 6 Meses',fullName:'Pacote 06 Meses de Proteção',category:'protecao',stars:5,icon:'shield',prices:{P:1299,G:1499},description:'Polimento e selante para realçar o brilho e proteger a pintura por 6 meses.',includes:['Limpeza interna','Limpeza externa','Polimento detalhado','Aplicação de selante com proteção de 6 meses']},
  {id:'protecao-12',name:'Proteção 12 Meses',fullName:'Pacote 12 Meses de Proteção',category:'protecao',stars:5,icon:'shield',prices:{P:1799,G:1999},description:'Acabamento refinado e vitrificação para 12 meses de proteção na pintura.',includes:['Limpeza interna','Limpeza externa','Polimento detalhado','Aplicação de vitrificador com proteção de 12 meses']}
]);

(() => {
  const $ = (selector) => document.querySelector(selector);
  const money = (value) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
  const selected = new Map();
  const sizes = new Map(ANG_SERVICES.filter(s => s.prices).map(s => [s.id,'P']));
  const grid = $('#service-grid');
  const modal = $('#cart-dialog');
  const panel = $('#cart-panel');
  const mobile = window.matchMedia('(max-width: 900px)');
  let activeFilter = 'todos';
  let lastCartTrigger = null;
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const getService = (id) => ANG_SERVICES.find(s => s.id === id);
  const getPrice = (service, size) => service.prices ? service.prices[size] : service.price;
  const getItems = () => Array.from(selected, ([id,size]) => {
    const service = getService(id);
    return {id,name:service.fullName || service.name,size,price:getPrice(service,size)};
  });
  const getQuote = () => {
    const items = getItems();
    return {items,count:items.length,total:items.reduce((sum,item) => sum + item.price,0),currency:'BRL',estimate:true};
  };
  const priceMarkup = (price) => {
    const [whole,cents] = price.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}).split(',');
    return `<span class="price-currency">R$</span><strong class="price-amount">${whole}<span class="price-decimals">,${cents}</span></strong>`;
  };

  function renderCatalog() {
    grid.innerHTML = ANG_SERVICES.map((service,index) => {
      const size = sizes.get(service.id);
      const isSelected = selected.has(service.id);
      const hidden = activeFilter !== 'todos' && service.category !== activeFilter;
      return `<article class="service-card${service.badge ? ' featured' : ''}${service.id==='elite' ? ' elite' : ''}${isSelected ? ' is-selected' : ''}" data-service="${service.id}"${hidden ? ' hidden' : ''} aria-labelledby="title-${service.id}">
        <div class="card-top"><span class="service-icon">${icon(service.icon)}</span>${service.badge ? `<span class="card-badge">${service.badge}</span>` : `<span class="card-number" aria-hidden="true">${String(index+1).padStart(2,'0')}</span>`}</div>
        <div class="stars" aria-label="Nível de cuidado: ${service.stars} estrelas">${'★'.repeat(service.stars)}</div>
        <h3 id="title-${service.id}">${service.name}</h3><p class="card-description">${service.description}</p>
        <details class="service-includes"><summary>Veja o que está incluso</summary><ul>${service.includes.map(item=>`<li>${item}</li>`).join('')}</ul></details>
        <div class="card-purchase">${service.prices ? `<div class="vehicle-options" role="group" aria-label="Porte do veículo para ${service.name}">${['P','G'].map(option => `<button type="button" data-size="${option}" aria-pressed="${size===option}" class="size-option${size===option?' active':''}">Carro ${option}<span>${money(service.prices[option])}</span></button>`).join('')}</div>` : '<span class="price-caption">Valor do pacote</span>'}
          <div class="price-line" aria-label="Preço ${money(getPrice(service,size))}">${priceMarkup(getPrice(service,size))}</div>
          <button type="button" class="service-add" data-add="${service.id}" aria-pressed="${isSelected}" aria-label="${isSelected ? 'Remover':'Adicionar'} ${service.name} ${size ? 'Carro '+size : ''} ${isSelected ? 'do':'ao'} orçamento">${icon(isSelected?'check':'plus')}<span>${isSelected?'Adicionado':'Adicionar ao orçamento'}</span></button>
        </div></article>`;
    }).join('');
  }

  function updateCard(id) {
    const service = getService(id);
    const card = grid.querySelector(`[data-service="${id}"]`);
    const size = sizes.get(id);
    const isSelected = selected.has(id);
    card.classList.toggle('is-selected',isSelected);
    card.querySelectorAll('[data-size]').forEach(button => {
      const active = button.dataset.size === size;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
    });
    const price = getPrice(service,size);
    const priceLine = card.querySelector('.price-line');
    priceLine.innerHTML = priceMarkup(price);
    priceLine.setAttribute('aria-label',`Preço ${money(price)}`);
    const add = card.querySelector('[data-add]');
    add.innerHTML = `${icon(isSelected?'check':'plus')}<span>${isSelected?'Adicionado':'Adicionar ao orçamento'}</span>`;
    add.setAttribute('aria-pressed',String(isSelected));
    add.setAttribute('aria-label',`${isSelected?'Remover':'Adicionar'} ${service.name}${size?' Carro '+size:''} ${isSelected?'do':'ao'} orçamento`);
  }

  function renderCart(announcement) {
    const {items,count,total} = getQuote();
    const list = $('#cart-items');
    list.replaceChildren();
    items.forEach(item => {
      const li = document.createElement('li');
      const copy = document.createElement('div');
      copy.className = 'cart-item-copy';
      const title = document.createElement('strong');
      title.textContent = item.name;
      const variant = document.createElement('small');
      variant.textContent = item.size ? `Carro ${item.size}` : 'Pacote';
      const value = document.createElement('span');
      value.textContent = money(item.price);
      copy.append(title,variant,value);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'remove-item';
      remove.dataset.remove = item.id;
      remove.setAttribute('aria-label',`Remover ${item.name} do orçamento`);
      remove.innerHTML = icon('close');
      li.append(copy,remove);list.append(li);
    });
    $('#cart-empty').hidden = count > 0;
    $('#clear-cart').hidden = count === 0;
    $('#cart-count').textContent = count;
    $('#mobile-count').textContent = count;
    $('#cart-total').textContent = money(total);
    $('#mobile-total').textContent = money(total);
    $('#mobile-cart-open').setAttribute('aria-label',`Ver orçamento: ${count} ${count===1?'serviço':'serviços'}, total estimado ${money(total)}`);
    if (count) $('#form-alert').hidden = true;
    if (announcement) $('#cart-announcement').textContent = `${announcement} ${count} ${count===1?'serviço selecionado':'serviços selecionados'}. Total estimado ${money(total)}.`;
  }

  grid.addEventListener('click', event => {
    const sizeButton = event.target.closest('[data-size]');
    if (sizeButton) {
      const id = sizeButton.closest('[data-service]').dataset.service;
      sizes.set(id,sizeButton.dataset.size);
      if (selected.has(id)) selected.set(id,sizeButton.dataset.size);
      updateCard(id);
      renderCart(`Porte atualizado para Carro ${sizeButton.dataset.size}.`);
      return;
    }
    const add = event.target.closest('[data-add]');
    if (!add) return;
    const id = add.dataset.add;
    const exists = selected.has(id);
    if (exists) selected.delete(id); else selected.set(id,sizes.get(id)||null);
    updateCard(id);
    renderCart(`${getService(id).name} ${exists?'removido':'adicionado'}.`);
  });

  $('.category-tabs').addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    activeFilter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(tab => {
      const active = tab === button;
      tab.classList.toggle('active',active);tab.setAttribute('aria-pressed',String(active));
    });
    grid.querySelectorAll('[data-service]').forEach(card => {card.hidden = activeFilter!=='todos' && getService(card.dataset.service).category!==activeFilter;});
    const visible = ANG_SERVICES.filter(s=>activeFilter==='todos'||s.category===activeFilter).length;
    $('#cart-announcement').textContent = `${visible} serviços disponíveis nesta categoria.`;
  });

  $('#cart-items').addEventListener('click', event => {
    const button = event.target.closest('[data-remove]');
    if (!button) return;
    const id = button.dataset.remove;
    const nextId = button.closest('li').nextElementSibling?.querySelector('[data-remove]')?.dataset.remove;
    selected.delete(id);updateCard(id);renderCart(`${getService(id).name} removido.`);
    const nextButton = nextId ? $('#cart-items').querySelector(`[data-remove="${nextId}"]`) : $('#cart-items').querySelector('[data-remove]');
    (nextButton || $('#vehicle')).focus({preventScroll:true});
  });
  $('#clear-cart').addEventListener('click',() => {
    const previous = Array.from(selected.keys());selected.clear();previous.forEach(updateCard);renderCart('Seleção limpa.');$('#vehicle').focus({preventScroll:true});
  });

  function buildWhatsAppMessage() {
    const {items,total} = getQuote();
    const vehicle = $('#vehicle').value.trim() || 'A informar';
    const day = $('#desired-day').value.trim() || 'A combinar';
    return [
      'Olá, ANG Estética Automotiva! 🚗✨',
      'Gostaria de agendar os seguintes serviços:',
      '',`Veículo: ${vehicle}`,'','Serviços selecionados:',
      ...items.map(item => `- ${item.name}${item.size?' (Carro '+item.size+')':''} - ${money(item.price)}`),
      '',`Valor total estimado: ${money(total)}`,
      'Entendo que os valores e a combinação de serviços serão confirmados após avaliação.',
      '',`Dia desejado: ${day}`,'',
      'Podem confirmar a disponibilidade? Aguardo retorno!'
    ].join('\n');
  }

  $('#quote-form').addEventListener('submit',event => {
    event.preventDefault();
    if (!selected.size) {
      const alert = $('#form-alert');alert.textContent='Escolha pelo menos um serviço para continuar. Seu orçamento aparece aqui assim que você adicionar.';alert.hidden=false;alert.scrollIntoView({block:'nearest',behavior:'smooth'});return;
    }
    const url = `https://wa.me/5541988377961?text=${encodeURIComponent(buildWhatsAppMessage())}`;
    // Navegação direta evita bloqueadores de popup; a mensagem continua dependendo do envio no WhatsApp.
    window.location.assign(url);
  });

  function openCart() {
    if (!mobile.matches) {panel.scrollIntoView({block:'start',behavior:'smooth'});return;}
    lastCartTrigger = document.activeElement;
    modal.showModal();
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {if(modal.open) modal.close();}
  function placeCart() {
    const target = mobile.matches ? $('#cart-mobile') : $('#cart-desktop');
    if (!mobile.matches) closeCart();
    if (panel.parentElement!==target) target.append(panel);
  }
  $('#mobile-cart-open').addEventListener('click',openCart);
  $('#cart-close').addEventListener('click',closeCart);
  modal.addEventListener('click',event=> {if(event.target===modal) closeCart();});
  modal.addEventListener('close',()=>{document.body.style.overflow='';if(lastCartTrigger && mobile.matches) lastCartTrigger.focus({preventScroll:true});});
  mobile.addEventListener('change',placeCart);

  const menuToggle = $('#menu-toggle');
  const mobileNav = $('#mobile-nav');
  function closeMenu() {menuToggle.setAttribute('aria-expanded','false');mobileNav.hidden=true;menuToggle.setAttribute('aria-label','Abrir menu');menuToggle.innerHTML=icon('menu');}
  menuToggle.addEventListener('click',()=>{
    const isOpen = menuToggle.getAttribute('aria-expanded')==='true';
    menuToggle.setAttribute('aria-expanded',String(!isOpen));mobileNav.hidden=isOpen;
    menuToggle.setAttribute('aria-label',isOpen?'Abrir menu':'Fechar menu');menuToggle.innerHTML=icon(isOpen?'menu':'close');
  });
  mobileNav.addEventListener('click',event=>{if(event.target.closest('a')) closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape') closeMenu();});
  window.matchMedia('(min-width: 1051px)').addEventListener('change',event=>{if(event.matches) closeMenu();});
  $('#year').textContent = new Date().getFullYear();
  renderCatalog();renderCart();placeCart();

  // Interface opcional de navegador: a seleção usa exatamente o mesmo estado da tela.
  const modelContext = document.modelContext;
  if (modelContext?.registerTool) {
    const lifecycle = new AbortController();
    const register = tool => {
      try {Promise.resolve(modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});} catch (_) { /* Navegador sem suporte completo: interface normal permanece disponível. */ }
    };
    register({name:'ang_list_services',title:'Consultar serviços ANG',description:'Retorna os serviços, inclusões, portes e preços do catálogo ANG.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:()=>ANG_SERVICES.map(s=>({...s}))});
    register({name:'ang_read_quote',title:'Consultar orçamento ANG',description:'Lê os serviços atualmente selecionados e o total estimado. Não agenda nem envia mensagens.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:getQuote});
    register({name:'ang_set_quote_selection',title:'Selecionar serviços ANG',description:'Substitui a seleção visível de serviços por uma lista completa. Não agenda, não confirma nem envia mensagens.',inputSchema:{type:'object',properties:{items:{type:'array',maxItems:9,items:{type:'object',properties:{id:{type:'string'},size:{type:'string',enum:['P','G']}},required:['id'],additionalProperties:false}}},required:['items'],additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{
      if(!input || typeof input!=='object' || !Array.isArray(input.items) || input.items.length>9 || Object.keys(input).some(key=>key!=='items')) throw new Error('Informe uma lista válida de serviços.');
      const next = new Map();
      for(const item of input.items) {
        if(!item || typeof item!=='object' || Object.keys(item).some(key=>!['id','size'].includes(key))) throw new Error('Serviço inválido.');
        const service = getService(item.id);
        if(!service || next.has(item.id)) throw new Error('Serviço inexistente ou duplicado.');
        if(service.prices && !['P','G'].includes(item.size)) throw new Error('Informe o porte P ou G para este serviço.');
        if(!service.prices && item.size!==undefined) throw new Error('Este pacote possui preço único.');
        next.set(item.id,item.size||null);
      }
      selected.clear();next.forEach((size,id)=>{selected.set(id,size);if(size) sizes.set(id,size);});ANG_SERVICES.forEach(s=>updateCard(s.id));renderCart('Seleção atualizada.');return getQuote();
    }});
    window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  }
})();
