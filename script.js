const packages = {
  learn:{name:'Mulai',amount:50000,bonus:5000,estimate:'20–30 sesi kecil'},
  prototype:{name:'Bangun',amount:100000,bonus:15000,estimate:'40–60 sesi kecil'},
  work:{name:'Scale',amount:250000,bonus:50000,estimate:'100+ sesi kecil'}
};

const translations = {
  id:{
    navHow:'Cara kerja',navPackages:'Paket',navFaq:'FAQ',navCta:'Isi saldo',
    heroEyebrow:'Untuk ide, prototype, dan proyekmu',heroTitle:'Mulai vibecoding. <span>Jangan berhenti di tengah jalan.</span>',heroLead:'Isi saldo AI dengan mudah, pilih nominal sesuai proyek, dan lanjutkan membangun—tanpa harus memahami istilah teknis dulu.',heroCta:'Isi saldo',heroSecondary:'Lihat cara kerjanya',
    trustLocal:'Bayar lokal',trustClear:'Rincian jelas',trustHelp:'Dukungan mudah',projectStatus:'Sedang membangun',promptText:'Bikin halaman portofolio yang hangat',balanceLabel:'Saldo aktif',readyText:'Nyala',estimateLabel:'Estimasi',estimateValue:'40–60 sesi kecil',packageLabel:'Paket terpilih',packageValue:'Bangun',ecosystemLabel:'Sebuah layanan dalam ekosistem',
    howKicker:'Simpel dari awal',howTitle:'Dari ide ke proyek,<br><span>tanpa langkah membingungkan.</span>',step1Title:'Pilih tujuanmu',step1Body:'Belajar, bikin prototype, atau kerjakan proyek.',step2Title:'Bayar dengan mudah',step2Body:'Gunakan QRIS, e-wallet, atau virtual account.',step3Title:'Lanjutkan membangun',step3Body:'Saldo siap dipakai dan momentum proyek tetap jalan.',
    packageKicker:'Pilih sesuai kebutuhan',packageTitle:'Berapa yang ingin<br><span>kamu nyalakan?</span>',intentLearn:'Belajar',intentPrototype:'Prototype',intentWork:'Kerja',packageStartBadge:'Entry point',packageBuildBadge:'Untuk prototype',packageScaleBadge:'Untuk kerja',learnName:'Mulai',buildName:'Bangun',scaleName:'Scale',learnPurpose:'Belajar & coba AI',buildPurpose:'Prototype yang aktif',scalePurpose:'Proyek berkelanjutan',bonusText:'bonus saldo',estimateText:'Estimasi',learnEstimate:'20–30 sesi kecil',buildEstimate:'40–60 sesi kecil',scaleEstimate:'100+ sesi kecil',choosePackage:'Pilih paket',recommendedRibbon:'Paling pas',estimateDisclaimer:'Estimasi bergantung pada model, panjang prompt, tipe tugas, dan format output.',
    whyKicker:'Kenapa Token Nyala',whyTitle:'Bukan sekadar saldo.<br><span>Ini ruang untuk menyelesaikan.</span>',whyLead:'Kami membantu mengubah nominal top up menjadi keputusan proyek yang lebih pasti—tanpa membuatmu belajar billing dan model dahulu.',whyCta:'Temukan paketmu',benefit1Title:'Pilihan yang mudah dipahami',benefit1Body:'Disarankan berdasarkan tujuan proyek, bukan kumpulan nama model.',benefit2Title:'Rincian sebelum membayar',benefit2Body:'Lihat nominal, bonus, dan total. Tidak ada biaya tersembunyi dalam simulasi.',benefit3Title:'Momentum tetap jalan',benefit3Body:'Status saldo dan langkah berikutnya terlihat jelas setelah top up.',
    faqKicker:'Pertanyaan seputar top up',faqTitle:'Masih ada yang<br><span>mau ditanyakan?</span>',faqLead:'Jawaban singkat untuk membantu kamu memutuskan.',faq1Q:'Kapan saldo aktif?',faq1A:'Pada produk nyata, saldo aktif setelah pembayaran dikonfirmasi. Pada prototype ini, konfirmasi hanya menampilkan status sukses simulasi.',faq2Q:'Berapa banyak sesi yang bisa digunakan?',faq2A:'Tidak ada angka pasti karena panjang prompt, model, dan format output memengaruhi penggunaan.',faq3Q:'Metode pembayaran apa yang tersedia?',faq3A:'Konsep checkout mencakup QRIS, e-wallet, dan virtual account.',faq4Q:'Bisakah membeli untuk tim?',faq4A:'Paket individu cocok untuk pemula dan freelancer. Paket tim dapat ditambahkan dengan kontrol saldo dan invoice.',
    finalKicker:'Saatnya lanjut membangun',finalTitle:'Ide-mu sudah cukup lama menunggu.',finalCta:'Isi saldo sekarang',footerTagline:'Saldo AI untuk ide yang siap menjadi proyek.',
    checkoutTitle:'Ringkas top up',selectedPackage:'Paket terpilih',packageAmount:'Nominal paket',bonusAmount:'Bonus saldo',feeAmount:'Biaya tambahan',freeText:'Gratis',totalAmount:'Total bayar',checkoutNotice:'Prototype ini hanya simulasi. Tidak ada transaksi atau penarikan dana nyata.',emailLabel:'Email untuk bukti pembelian',paymentLabel:'Pilih metode pembayaran',ewalletText:'E-Wallet',vaText:'Virtual Account',confirmPayment:'Konfirmasi pembayaran',successKicker:'Top up tercatat',successTitle:'Saldo nyala!',successBody:'Paketmu sudah tercatat dalam simulasi ini. Kamu bisa kembali lanjut membangun.',successCta:'Kembali ke proyek'
  },
  en:{
    navHow:'How it works',navPackages:'Packages',navFaq:'FAQ',navCta:'Top up',
    heroEyebrow:'For ideas, prototypes, and projects',heroTitle:'Start vibe-coding. <span>Keep building without interruptions.</span>',heroLead:'Top up AI credit simply, choose an amount that fits your project, and keep moving—without learning technical terms first.',heroCta:'Top up balance',heroSecondary:'How it works',
    trustLocal:'Local payment',trustClear:'Clear breakdown',trustHelp:'Helpful support',projectStatus:'Building now',promptText:'Create a warm portfolio page',balanceLabel:'Active balance',readyText:'Ready',estimateLabel:'Estimate',estimateValue:'40–60 small sessions',packageLabel:'Selected package',packageValue:'Build',ecosystemLabel:'Part of the ecosystem',
    howKicker:'Simple from the start',howTitle:'From idea to project,<br><span>without confusing steps.</span>',step1Title:'Choose your goal',step1Body:'Learn, build a prototype, or work on a project.',step2Title:'Pay with ease',step2Body:'Use QRIS, e-wallet, or virtual account.',step3Title:'Keep building',step3Body:'Your balance is ready and your momentum continues.',
    packageKicker:'Choose what fits',packageTitle:'How much do you want<br><span>to switch on?</span>',intentLearn:'Learn',intentPrototype:'Prototype',intentWork:'Work',packageStartBadge:'Entry point',packageBuildBadge:'For prototypes',packageScaleBadge:'For work',learnName:'Start',buildName:'Build',scaleName:'Scale',learnPurpose:'Learn & try AI',buildPurpose:'Active prototype',scalePurpose:'Long-running projects',bonusText:'balance bonus',estimateText:'Estimate',learnEstimate:'20–30 small sessions',buildEstimate:'40–60 small sessions',scaleEstimate:'100+ small sessions',choosePackage:'Choose package',recommendedRibbon:'Best fit',estimateDisclaimer:'Estimates vary by model, prompt length, task type, and output format.',
    whyKicker:'Why Token Nyala',whyTitle:'More than a balance.<br><span>Room to finish.</span>',whyLead:'We turn top-up amounts into clearer project decisions—without making you learn billing and models first.',whyCta:'Find my package',benefit1Title:'Easy-to-understand choices',benefit1Body:'Recommended for your project goal, not a list of model names.',benefit2Title:'Review before payment',benefit2Body:'See the amount, bonus, and total. No hidden fee in this prototype.',benefit3Title:'Keep momentum',benefit3Body:'Balance and next steps remain clear after top-up.',
    faqKicker:'Top-up questions',faqTitle:'Still have<br><span>something to ask?</span>',faqLead:'Short answers to help you decide.',faq1Q:'When does the balance become active?',faq1A:'In the real product, balance activates after payment confirmation. This prototype only shows a successful simulation.',faq2Q:'How many sessions can I use?',faq2A:'There is no fixed number; prompt length, model, and output format affect usage.',faq3Q:'Which payment methods are available?',faq3A:'The concept includes QRIS, e-wallet, and virtual account.',faq4Q:'Can I purchase for a team?',faq4A:'Individual packages suit beginners and freelancers. Team packages may add balance control and invoices.',
    finalKicker:'Time to keep building',finalTitle:'Your idea has waited long enough.',finalCta:'Top up now',footerTagline:'AI balance for ideas ready to become projects.',
    checkoutTitle:'Top-up summary',selectedPackage:'Selected package',packageAmount:'Package amount',bonusAmount:'Balance bonus',feeAmount:'Additional fee',freeText:'Free',totalAmount:'Total',checkoutNotice:'This is a prototype. No real transaction or fund withdrawal occurs.',emailLabel:'Email for purchase receipt',paymentLabel:'Choose payment method',ewalletText:'E-Wallet',vaText:'Virtual Account',confirmPayment:'Confirm payment',successKicker:'Top-up recorded',successTitle:'Balance is ready!',successBody:'Your package is recorded in this simulation. You can continue building.',successCta:'Back to project'
  }
};

let selectedPackage='prototype';
let currentLanguage='id';
let lastFocus=null;

const formatRupiah=(amount)=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(amount).replace('Rp','Rp').replace(',00','');

function setLanguage(lang){
  currentLanguage=lang;
  document.documentElement.lang=lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key=el.dataset.i18n;
    if(translations[lang][key]) el.innerHTML=translations[lang][key];
  });
  document.querySelectorAll('[data-language]').forEach(button=>{
    const active=button.dataset.language===lang;
    button.classList.toggle('is-active',active);
    button.setAttribute('aria-pressed',active?'true':'false');
  });
  updateCheckout();
}

function setIntent(intent){
  updateIntentTabs(intent);

  const packageByIntent={learn:'learn',prototype:'prototype',work:'work'};
  const packageId=packageByIntent[intent];

  selectPackage(packageId,false,false);
}

function updateIntentTabs(intent){
  document.querySelectorAll('[data-intent]').forEach(tab=>{
    const active=tab.dataset.intent===intent;
    tab.classList.toggle('is-active',active);
    tab.setAttribute('aria-selected',active?'true':'false');
  });
}

function selectPackage(packageId,openModal=false,syncIntent=true){
  selectedPackage=packageId;

  if(syncIntent){
    const intentByPackage={learn:'learn',prototype:'prototype',work:'work'};
    updateIntentTabs(intentByPackage[packageId]);
  }

  document.querySelectorAll('.package-card').forEach(card=>{
    const selected=card.dataset.package===packageId;
    card.classList.toggle('is-selected',selected);
    card.setAttribute('aria-checked',selected?'true':'false');
  });
  updateCheckout();
  if(openModal) openCheckout();
}

function updateCheckout(){
  const item=packages[selectedPackage];
  const names={id:{learn:'Mulai',prototype:'Bangun',work:'Scale'},en:{learn:'Start',prototype:'Build',work:'Scale'}};
  document.getElementById('summary-name').textContent=names[currentLanguage][selectedPackage];
  document.getElementById('summary-amount').textContent=formatRupiah(item.amount);
  document.getElementById('summary-bonus').textContent=`+${formatRupiah(item.bonus)}`;
  document.getElementById('summary-total').textContent=formatRupiah(item.amount);
}

const dialog=document.getElementById('checkout-dialog');
const form=document.getElementById('checkout-form');
const success=document.getElementById('checkout-success');

function openCheckout(){
  lastFocus=document.activeElement;
  success.hidden=true;
  form.hidden=false;
  if(typeof dialog.showModal==='function') dialog.showModal();
  else dialog.setAttribute('open','');
  document.body.style.overflow='hidden';
  setTimeout(()=>document.querySelector('.dialog-close').focus(),50);
}

function closeCheckout(){
  if(typeof dialog.close==='function') dialog.close();
  else dialog.removeAttribute('open');
  document.body.style.overflow='';
  lastFocus?.focus();
}

function validateCheckout(){
  const email=document.getElementById('checkout-email');
  const payment=form.querySelector('input[name="payment"]:checked');
  const emailValid=email.checkValidity()&&email.value.trim();
  const paymentValid=Boolean(payment);
  document.getElementById('email-error').textContent=emailValid?'':(currentLanguage==='id'?'Masukkan email yang formatnya benar.':'Enter a valid email address.');
  document.getElementById('payment-error').textContent=paymentValid?'':(currentLanguage==='id'?'Pilih satu metode pembayaran.':'Choose a payment method.');
  document.getElementById('checkout-submit').disabled=!(emailValid&&paymentValid);
  return emailValid&&paymentValid;
}

function showToast(message){
  const toast=document.getElementById('toast');
  toast.textContent=message;
  toast.classList.add('is-visible');
  setTimeout(()=>toast.classList.remove('is-visible'),2600);
}

// Language
setLanguage(localStorage.getItem('tokenNyalaLanguage')||'id');
document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>{
  setLanguage(button.dataset.language);
  localStorage.setItem('tokenNyalaLanguage',button.dataset.language);
}));

// Intent tabs
setIntent('prototype');

// Intent tabs: selecting an intent chooses its matching package
const intentPicker=document.querySelector('.intent-picker');
intentPicker?.addEventListener('click',(event)=>{
  const tab=event.target.closest('[data-intent]');
  if(!tab) return;
  setIntent(tab.dataset.intent);
});

// Package grid: card and CTA both select the same package and sync the intent tab
const packageGrid=document.getElementById('package-grid');
packageGrid?.addEventListener('click',(event)=>{
  const card=event.target.closest('[data-package]');
  if(!card) return;

  const openCheckoutFromCta=Boolean(event.target.closest('[data-select-package]'));
  selectPackage(card.dataset.package,openCheckoutFromCta,true);
});

packageGrid?.addEventListener('keydown',(event)=>{
  const card=event.target.closest('[data-package]');
  if(!card || (event.key!=='Enter'&&event.key!==' ')) return;
  event.preventDefault();
  selectPackage(card.dataset.package,false,true);
});

// Open checkout from primary page CTAs only; package CTAs are handled by packageGrid.
document.querySelectorAll('[data-open-checkout]').forEach(button=>button.addEventListener('click',openCheckout));
document.querySelectorAll('[data-close-checkout]').forEach(button=>button.addEventListener('click',closeCheckout));

// Mobile menu
const menuButton=document.querySelector('.menu-button');
const mobileMenu=document.querySelector('.mobile-menu');
menuButton.addEventListener('click',()=>{
  const open=menuButton.classList.toggle('is-open');
  mobileMenu.classList.toggle('is-open',open);
  menuButton.setAttribute('aria-expanded',open?'true':'false');
  menuButton.setAttribute('aria-label',open?'Tutup menu':'Buka menu');
});
mobileMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  menuButton.classList.remove('is-open');
  mobileMenu.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded','false');
}));

// Checkout validation and success
form.addEventListener('input',validateCheckout);
form.addEventListener('change',validateCheckout);
form.addEventListener('submit',(event)=>{
  event.preventDefault();
  if(!validateCheckout()) return;
  form.hidden=true;
  success.hidden=false;
  success.querySelector('button').focus();
});

dialog.addEventListener('cancel',(event)=>{event.preventDefault();closeCheckout();});
dialog.addEventListener('click',(event)=>{if(event.target===dialog) closeCheckout();});

document.addEventListener('keydown',(event)=>{
  if(event.key==='Escape'&&dialog.open) closeCheckout();
});

// Make package cards clickable and keep the CTA behavior for opening checkout.
// Package cards expose keyboard semantics through the package grid listener.
document.querySelectorAll('.package-card').forEach(card=>{
  card.setAttribute('tabindex','0');
  card.setAttribute('role','radio');
  card.setAttribute('aria-checked',card.classList.contains('is-selected')?'true':'false');
});
