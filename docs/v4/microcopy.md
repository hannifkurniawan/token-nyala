# Microcopy & State v4 (ID / EN)

Copy v3 yang **dipakai ulang tanpa perubahan** (rujuk `docs/microcopy-and-states.md`): checkout (field, metode bayar, QRIS/VA/e-wallet, sukses, gagal, timeout), katalog model, panduan pasang API key, form konsultasi tim, alur Nala v3 (paket AI, tim online/offline, serah ke Sari), validasi email/HP.

Angka di sini adalah contoh; nilai sebenarnya dirender dari `data.js` (`services-and-pricing.md`). `{…}` = variabel.

---

## 1. Prinsip Bahasa

- Default Bahasa Indonesia, sapaan **kamu**. EN setara, bukan terjemahan kata per kata.
- **Tujuan dulu, layanan kemudian, istilah teknis terakhir.** Istilah teknis hanya muncul sebagai label kecil atau di dalam “Detail teknis”.
- Satu istilah untuk satu hal (glosarium di bawah). Jangan bergantian “kredit/saldo/token”.
- Angka uang selalu Rupiah; ID `Rp15.000`, EN `Rp15,000`; ringkas `Rp34 rb` / `Rp34K`.
- Estimasi selalu diberi kata **“perkiraan”/“±”**, bukan janji.
- Aksi destruktif menyebut akibatnya dalam uang dan waktu (“Rp10.000 kembali ke saldo”).
- Semua data, pembayaran, deploy, dan URL berlabel **contoh/simulasi**.

### Glosarium
| Pakai (ID) | EN | Hindari |
|---|---|---|
| saldo | balance | kredit (kecuali “1 kredit = Rp1”), wallet, deposit |
| isi saldo | top up | deposit, recharge |
| proyek | project | app, workspace, pod |
| paket (kumpulan layanan untuk satu tujuan, isinya bisa diubah) | bundle | resep, recipe (dipakai sampai 21 Nov 2026), template (itu untuk aplikasi siap pakai) |
| nyalakan / nyala | switch on / on | deploy, provision, launch (boleh di Detail teknis) |
| dijeda | paused | suspended, terminated |
| berhenti | stop | delete, cancel subscription |
| ukuran | size | plan, tier, spec |
| Coba-coba / Rutin / Ramai | Starter / Steady / Busy | Nano, 0.5C0.5G |
| alamat web | web address | domain (boleh sebagai label kecil) |
| biaya tetap | fixed cost | subscription, recurring |
| biaya pakai | usage cost | metered, per token |
| sesi kecil / pesan chatbot / tugas otomasi | small session / chatbot message / automation task | token (kecuali detail) |

---

## 2. Global

| Kunci | ID | EN |
|---|---|---|
| nav.services | Layanan | Services |
| nav.pricing | Harga | Pricing |
| nav.templates | Template | Templates |
| nav.learn | Belajar | Learn |
| nav.faq | FAQ | FAQ |
| nav.signin | Masuk | Sign in |
| cta.start | Mulai bangun | Start building |
| cta.pricing | Lihat harga | See pricing |
| cta.topup | Isi saldo | Top up |
| label.example | Contoh | Example |
| label.estimate | Perkiraan | Estimate |
| label.perMonth | /bulan | /month |
| label.per30 | / 30 hari | / 30 days |
| label.firstYear | tahun pertama | first year |
| label.from | Mulai dari | From |
| label.usage | Sesuai pakai | Pay as you go |
| label.techDetails | Detail teknis | Technical details |
| footer.tagline | Idemu nyala, dari prompt sampai online. | Your idea, switched on — from prompt to online. |
| footer.prototype | Prototype interaktif — tidak ada transaksi, layanan, atau data nyata. | Interactive prototype — no real transactions, services, or data. |

---

## 3. Landing

> **21 Nov 2026:** copy statis landing kini ditulis langsung di `v4/index.html` sebagai pasangan `data-l="id|en"` (cara showcase v2); tabel di bawah tetap acuan isi. Kunci `hero.*`, `story.*`, `how.*`, dll. sudah dihapus dari kamus. Teks dinamis baru: `board.pick` (Pilih tujuan di bawah ↓), `board.standby` (Menunggu), `board.estimate` (≈ {rp}/bln · cukup ±{n} bln), `safe.pause.body`, `ex.task`, `ex.sessionsCol`. Pesan pita cerita: “Prompt demi prompt, kodenya jadi.” → “Belum online. Cuma jalan di laptopmu.” → “Nyala. Siapa saja bisa membukanya.” Loader: “Menyalakan idemu”.

### Hero
| Kunci | ID | EN |
|---|---|---|
| hero.kicker | Untuk ide, prototype, dan proyekmu | For your ideas, prototypes, and projects |
| hero.t1a · hero.t1b (baris 1, saklar di tengah) | Idemu ⏻ nyala, | Your idea ⏻ on, |
| hero.t2 · hero.t3 (baris 2–3, biru) | dari prompt / sampai online. | from prompt / to online. |
| hero.lead | AI untuk membangun, cloud untuk menjalankan. Pilih tujuanmu, kami rangkai layanannya — dibayar dari satu saldo Rupiah. | AI to build it, cloud to run it. Pick your goal and we'll put the services together — all paid from one Rupiah balance. |
| hero.trust1 | Bayar Rupiah | Pay in Rupiah |
| hero.trust2 | Tanpa kartu kredit | No credit card |
| hero.trust3 | Mulai Rp15 rb | From Rp15K |
| board.prompt | Buat landing page event yang hangat dan simpel | Make a warm, simple event landing page |
| board.building | Membangun komponen… | Building components… |
| board.prompt2 · board.prompt3 (diketik bergantian) | Tambah form pendaftaran peserta · Rapikan tampilan mobile | Add an attendee sign-up form · Polish the mobile view |
| board.preview | Pratinjau | Preview |
| board.spent | Terpakai Rp42.680 | Spent Rp42,680 |
| hero.sticker (cincin berputar, dekor) | PROMPT · BANGUN · ONLINE · NYALA · | PROMPT · BUILD · ONLINE · SWITCH ON · |
| hero.scroll | Gulir ↓ | Scroll ↓ |

### Cerita macet (pita gelap, digerakkan scroll: 0→80% → macet → nyala 100%)
| Fase | ID | EN |
|---|---|---|
| Membangun (story.msgBuild) | Prompt demi prompt, kodenya mulai jadi. | Prompt by prompt, the code takes shape. |
| Macet di 80% · localhost:5173 · Belum online | **Kode sudah jadi.** Tapi belum bisa dibuka orang lain. | **The code is done.** But nobody else can open it yet. |
| Nyala 100% · eventku.my.id | Di TokenNyala, proyekmu online dalam beberapa ketukan — lengkap dengan alamat sendiri. | On TokenNyala, your project goes online in a few taps — with its own address. |
| Tugas (centang) | Buat layout awal halaman · Rapikan tampilan mobile · Tambah form pendaftaran · Online dengan alamat sendiri (story.taskOnline) | First layout · Mobile view · Sign-up form · Online at its own address |

### Mau bikin apa?
| Kunci | ID | EN |
|---|---|---|
| recipe.kicker | Mau bikin apa? | What are you building? |
| recipe.title | Mulai dari tujuanmu, bukan dari menu. | Start from your goal, not a menu. |
| recipe.lead | Pilih tujuan. Kami tunjukkan layanan yang dibutuhkan dan total per bulannya. | Pick a goal. We'll show the services you need and the monthly total. |
| recipe.firstMonth | Bulan pertama {Rp} — termasuk biaya tahunan (alamat web) | First month {Rp} — includes the yearly cost (web address) |
| recipe.aiOnlyTitle | Isi saldo, pakai di tool coding-mu | Top up, use it in your coding tools |
| recipe.aiOnlyRow | Isi {Rp} → {range} sesi kecil | Top up {Rp} → {range} small sessions |
| recipe.aiOnlyCta | Ambil API key | Get an API key |
| recipe.suggest | Isi {Rp} → cukup ±{n} bulan | Top up {Rp} → lasts ±{n} months |
| recipe.cta | Nyalakan paket ini | Switch on this bundle |
| recipe.edit | Ubah di kalkulator | Adjust in the calculator |
| recipe.note | Perkiraan. Pemakaian AI bergantung pada model, panjang prompt, dan jumlah pesan. | Estimate. AI usage depends on the model, prompt length, and message volume. |

Nama pendek (chip, Nala Q1): portofolio **Landing page** / *Landing page* · chatbot-wa **Chatbot WA** / *WhatsApp bot* · web-klien **Web klien** / *Client site* · otomasi-tim **Otomasi tim** / *Team automation* · ai-coding **AI coding saja** / *AI for coding*.

| Paket | Nama ID | Nama EN | Kalimat ID | Kalimat EN |
|---|---|---|---|---|
| portofolio | Landing page / portofolio | Landing page / portfolio | Online dengan alamat sendiri, plus AI untuk terus memperbaikinya. | Online with your own address, plus AI to keep improving it. |
| chatbot-wa | Chatbot WhatsApp | WhatsApp chatbot | Balas pesan pelanggan otomatis, 24 jam. | Reply to customers automatically, 24/7. |
| web-klien | Website klien dengan form | Client website with a form | Website, data pendaftar, email, dan alamat .com untuk satu klien. | Website, sign-up data, email, and a .com address for one client. |
| otomasi-tim | Otomasi untuk tim | Team automation | Workflow n8n dengan AI, data, dan email untuk tim kecil. | n8n workflows with AI, data, and email for a small team. |
| ai-coding | AI untuk tool coding saja | AI for coding tools only | Pakai saldomu untuk AI di Cursor, Lovable, Cline, dan tool lain. | Use your balance for AI in Cursor, Lovable, Cline, and other tools. |

### Cara kerja
| # | ID judul / isi | EN |
|---|---|---|
| 1 | **Pilih tujuanmu** — Landing page, chatbot, atau otomasi. Kami siapkan paketnya. | **Pick your goal** — A landing page, chatbot, or automation. We prepare the recipe. |
| 2 | **Isi saldo Rupiah** — QRIS, e-wallet, atau virtual account. Total terlihat sebelum bayar. | **Top up in Rupiah** — QRIS, e-wallet, or virtual account. See the total before you pay. |
| 3 | **Nyala & online** — Proyekmu jalan dengan alamat sendiri. Pantau saldo kapan saja. | **Switch on & go online** — Your project runs at its own address. Check your balance anytime. |

### Semua layanan
| Kunci | ID | EN |
|---|---|---|
| svc.kicker | Semua layanan | All services |
| svc.title | Semua yang dibutuhkan proyekmu, di satu tempat. | Everything your project needs, in one place. |
| svc.group.build | Bangun dengan AI | Build with AI |
| svc.group.run | Jalankan | Run |
| svc.group.store | Simpan | Store |
| svc.group.connect | Hubungkan | Connect |

Nama & label layanan: tabel bagian 5 `services-and-pricing.md`. Satu kalimat per layanan:

| id | ID | EN |
|---|---|---|
| ai | Pakai Claude, GPT, Gemini, dan lainnya di tool coding favoritmu. | Use Claude, GPT, Gemini, and more in your favorite coding tools. |
| chat | Coba dan bandingkan model sebelum dipakai. | Try and compare models before you commit. |
| hosting | Hasil Lovable, Bolt, atau GitHub jadi link yang bisa dibuka siapa saja. | Turn Lovable, Bolt, or GitHub projects into a link anyone can open. |
| apps | Chatbot, otomasi, dan agent AI — tinggal pilih, langsung jalan. | Chatbots, automations, and AI agents — pick one and it runs. |
| server | Kontrol penuh untuk yang butuh lebih. | Full control when you need more. |
| database | Simpan data pendaftar, pesanan, atau pelanggan. | Keep sign-ups, orders, or customer data. |
| storage | Simpan foto, dokumen, dan file upload. | Store photos, documents, and uploads. |
| domain | Nama proyekmu di internet, mulai Rp5.000 tahun pertama. | Your project's name on the internet, from Rp5,000 for the first year. |
| email | Kirim notifikasi dan struk dari alamatmu sendiri. | Send notifications and receipts from your own address. |
| payments | Terima pembayaran QRIS di proyekmu. | Accept QRIS payments in your project. |

### Satu saldo Rupiah
| Kunci | ID | EN |
|---|---|---|
| wallet.kicker | Satu saldo | One balance |
| wallet.title | Satu saldo Rupiah untuk semuanya. | One Rupiah balance for everything. |
| wallet.lead | Isi sekali, pakai untuk hosting, otomasi, data, alamat web, dan AI. Tanpa kartu kredit, tanpa dolar, tanpa saldo kedua. | Top up once and use it for hosting, automations, data, web addresses, and AI. No credit card, no dollars, no second balance. |
| wallet.fixed | **Biaya tetap** dipotong per 30 hari — hosting, otomasi, data. | **Fixed costs** are charged every 30 days — hosting, automations, data. |
| wallet.usage | **Biaya pakai** sesuai pemakaian — AI. | **Usage costs** follow what you use — AI. |
| wallet.until | Kami beri tahu saldo cukup sampai kapan. | We tell you how long your balance will last. |
| wallet.chips | 1 kredit = Rp1 · Termasuk PPN · Tidak kedaluwarsa · Tanpa USD | 1 credit = Rp1 · Tax included · Never expires · No USD |

### Template
| Kunci | ID | EN |
|---|---|---|
| tpl.title | Tinggal pilih, langsung jalan. | Pick one and it runs. |
| tpl.min | Minimal ukuran {size} | Needs at least {size} |
| tpl.cta | Pakai template | Use template |

Template: Chatbot WhatsApp — “Balas pesan pelanggan pakai AI.” / “Answer customer messages with AI.” · Otomasi n8n — “Sambungkan aplikasi, jalankan alur kerja otomatis.” / “Connect apps and run automated workflows.” · Agent AI 24 jam — “Asisten yang terus bekerja: posting konten, merangkum email.” / “An assistant that keeps working: posting content, summarizing email.” · Aplikasi AI tanpa kode — “Bikin aplikasi AI dengan drag & drop.” / “Build AI apps with drag and drop.” · Website WordPress — “Website dan toko online klasik.” / “The classic website and online store.”

### Aman untuk pemula (4 kartu)
| ID | EN |
|---|---|
| **Berhenti kapan saja.** Sisa hari kembali ke saldo. | **Stop anytime.** Unused days go back to your balance. |
| **Ganti ukuran naik atau turun.** Selisihnya dihitung otomatis. | **Size up or down.** We work out the difference for you. |
| **Saldo habis? Dijeda, bukan dihapus.** Datamu aman 7 hari. | **Out of balance? Paused, not deleted.** Your data is safe for 7 days. |
| **Diingatkan sebelum habis.** 3 hari sebelum jatuh tempo. | **Reminded before it runs out.** 3 days before renewal. |

### Contoh proyek — sebelum/sesudah (toggle)
| Sebelum (dicoret) | Sesudah | EN |
|---|---|---|
| Macet di localhost | Online dengan alamat sendiri | Stuck on localhost → Online at its own address |
| Tagihan dalam dolar | Satu saldo Rupiah | Billed in dollars → One Rupiah balance |
| Tebak-tebak biaya | Total terlihat di depan | Guessing the cost → Total shown up front |

Cara kerja (kartu geser): `how.hint` Geser atau drag kartu → · rel Tujuan / Saldo / Nyala · struk Online-kan Rp15.000 + Alamat web Rp5.000 + Biaya tambahan Rp0 = Rp20.000 · `how.status` Status: nyala.
Aman kartu 1: `safe.1.q` Kalau berhenti di hari ke-10? · kartu 4: `safe.4.remind` Ingatkan sebelum saldo kurang.

### CTA akhir
| ID | EN |
|---|---|
| **Idemu nyala.** Mulai dari tujuan, online dalam beberapa menit. | **Your idea, on.** Start from a goal, go online in minutes. |

---

## 4. Harga

| Kunci | ID | EN |
|---|---|---|
| price.title | Satu saldo Rupiah. Bayar yang kamu pakai. | One Rupiah balance. Pay for what you use. |
| price.trust | Termasuk PPN · Tanpa kartu kredit · Biaya tambahan Rp0 | Tax included · No credit card · No extra fees |
| calc.title | Kalkulator | Calculator |
| calc.recipe | Paket | Bundle |
| calc.add | Tambah layanan | Add a service |
| calc.fixed | Biaya tetap | Fixed cost |
| calc.usage | Perkiraan pakai | Estimated usage |
| calc.yearly | Tahunan | Yearly |
| calc.monthly | Per bulan | Per month |
| calc.first | Bulan pertama | First month |
| calc.cta | Nyalakan | Switch on |
| calc.empty | Belum ada layanan. Pilih paket atau tambah layanan. | No services yet. Pick a bundle or add a service. |
| size.disabled | Belum cukup untuk {template} — pilih {size} | Not enough for {template} — choose {size} |

| calc.details | Rincian | Details |
| calc.managed | Kenapa Online-kan lebih mahal dari server dengan spesifikasi mirip? Karena sudah dikelola: alamat, HTTPS, restart, dan update kami urus. Server sendiri kamu kelola sendiri. | Why does Put online cost more than a server with similar specs? It's managed: we handle the address, HTTPS, restarts, and updates. A server is yours to manage. |
| price.withdrawFee | Penarikan dana ke rekening Rp2.500 per penarikan. | Withdrawals to your bank account cost Rp2,500 each. |

### FAQ Harga (5)
| ID | EN |
|---|---|
| **Kapan biaya tetap dipotong?** Di muka per 30 hari sejak layanan nyala, diperpanjang otomatis jika saldo cukup. | **When are fixed costs charged?** Upfront every 30 days from when the service switches on, renewed automatically if your balance covers it. |
| **Bagaimana kalau saldo habis?** Layanan dijeda, bukan dihapus. Datamu aman 7 hari; isi saldo dan layanan menyala lagi. | **What if my balance runs out?** Services pause, they aren't deleted. Your data is safe for 7 days; top up and they switch back on. |
| **Bisa berhenti di tengah bulan?** Bisa. Sisa hari kembali ke saldo. Alamat web tidak bisa dikembalikan, tapi tetap aktif sampai masa berlakunya habis. | **Can I stop mid-month?** Yes. Unused days go back to your balance. Web address fees can't be refunded, but the address stays active until it expires. |
| **Kenapa biaya AI hanya perkiraan?** Bergantung pada model, panjang prompt, dan jumlah pesan. Kamu bisa memasang batas belanja per proyek. | **Why is AI cost only an estimate?** It depends on the model, prompt length, and message volume. You can set a spending limit per project. |
| **Ada biaya tersembunyi?** Tidak. Semua harga termasuk PPN dan isi saldo tanpa biaya tambahan. Satu-satunya biaya lain: penarikan dana Terima pembayaran Rp2.500. | **Any hidden fees?** No. All prices include tax and topping up has no extra fee. The only other fee: Rp2,500 per withdrawal from Accept payments. |

---

## 5. Console

### Masuk
| Kunci | ID | EN |
|---|---|---|
| auth.title | Masuk ke TokenNyala | Sign in to TokenNyala |
| auth.contact | Email atau nomor HP | Email or phone number |
| auth.send | Kirim kode | Send code |
| auth.code | Masukkan 6 digit kode | Enter the 6-digit code |
| auth.codeHint | Simulasi: kode apa pun 6 digit diterima, contoh {code}. | Simulation: any 6-digit code works, e.g. {code}. |
| auth.name | Mau dipanggil siapa? | What should we call you? |

### Navigasi console
| Kunci | ID | EN |
|---|---|---|
| nav.home | Beranda | Home |
| nav.projects | Proyek | Projects |
| nav.create | Buat | Create |
| nav.createLong | Buat baru | Create new |
| nav.balance | Saldo | Balance |
| nav.more | Lainnya | More |
| nav.ai | AI | AI |
| nav.servicesGroup | Layanan lain | Other services |
| nav.svc.server | Server | Servers |
| nav.svc.database | Data | Data |
| nav.svc.storage | File | Files |
| nav.svc.domain | Alamat web | Web addresses |
| nav.svc.email | Email | Email |
| nav.svc.payments | Pembayaran | Payments |
| nav.learn | Belajar | Learn |
| nav.help | Bantuan | Help |
| nav.account | Akun | Account |

### Menu Akun (mobile: sheet Lainnya · desktop: menu avatar)
| Kunci | ID | EN |
|---|---|---|
| acct.language | Bahasa | Language |
| acct.reset | Mulai ulang demo | Restart demo |
| acct.resetConfirm | Hapus semua data demo dan mulai dari akun baru? | Clear all demo data and start with a new account? |
| acct.advance | Simulasi: majukan 30 hari | Simulate: skip ahead 30 days |
| acct.advanced | Waktu demo sekarang {date}. {n} layanan diperpanjang, {m} dijeda. | Demo time is now {date}. {n} services renewed, {m} paused. |
| acct.signout | Keluar | Sign out |
| acct.demoBadge | Mode demo | Demo mode |

### Beranda
| Kunci | ID | EN |
|---|---|---|
| home.hello | Hai, {name} | Hi, {name} |
| home.empty | Mau bikin apa hari ini? | What are you building today? |
| home.balance | Saldo | Balance |
| home.until | Cukup sampai ±{date} | Lasts until ±{date} |
| home.untilNone | Belum ada layanan yang memakai saldo. | No services are using your balance yet. |
| home.next | Langkah berikutnya | Next step |
| home.projects | Proyek ({n}) | Projects ({n}) |
| home.month | Bulan ini: tetap {Rp} · pakai {Rp} | This month: fixed {Rp} · usage {Rp} |
| home.renewIn | Diperpanjang {n} hari lagi | Renews in {n} days |
| banner.low | Saldo kurang untuk memperpanjang {project} pada {date}. Isi minimal {Rp}. | Not enough balance to renew {project} on {date}. Top up at least {Rp}. |

`{Rp}` di banner = `max(kekurangan, Rp20.000)` (`services-and-pricing.md` §1).
| banner.paused | {project} dijeda karena saldo habis. Datamu aman sampai {date}. | {project} is paused because your balance ran out. Your data is safe until {date}. |

Langkah berikutnya (kontekstual): *Isi saldo untuk mulai* · *Upload hasil Lovable/Bolt* · *Pakai AI di tool coding — salin API key proyek* · *Pasang alamat web sendiri* · *Pindai QR WhatsApp untuk chatbot*.

### Wizard
| Kunci | ID | EN |
|---|---|---|
| wiz.step | Langkah {n} dari 4 | Step {n} of 4 |
| wiz.s1 | Mau bikin apa? | What are you building? |
| wiz.blank | Mulai kosong — pilih layanan sendiri | Start blank — choose services yourself |
| wiz.s2 | Atur proyekmu | Set up your project |
| wiz.name | Nama proyek | Project name |
| wiz.nameHint | Huruf kecil, angka, dan tanda hubung. Dipakai di alamat gratis. | Lowercase letters, numbers, and hyphens. Used in your free address. |
| wiz.source | Dari mana proyekmu? | Where is your project from? |
| wiz.upload | Upload folder / ZIP | Upload a folder / ZIP |
| wiz.github | Sambungkan GitHub | Connect GitHub |
| wiz.domainAvail | Tersedia · {Rp} tahun pertama, lalu {Rp2}/tahun | Available · {Rp} first year, then {Rp2}/year |
| wiz.domainTaken | Sudah dipakai. Coba {suggest}. | Taken. Try {suggest}. |
| wiz.freeAddr | Atau pakai gratis: {name}.tokennyala.app | Or use it free: {name}.tokennyala.app |
| wiz.aiKey | API key proyek dibuat otomatis. Batas belanja: | A project API key is created automatically. Spending limit: |
| wiz.s3 | Ringkasan biaya | Cost summary |
| wiz.now | Dipotong sekarang | Charged now |
| wiz.later | Nanti, sesuai pakai | Later, as you use it |
| wiz.after | Saldo setelah nyala: {Rp} | Balance after switching on: {Rp} |
| wiz.short | Saldo kurang {Rp}. | You're {Rp} short. |
| wiz.topup | Isi saldo {Rp} | Top up {Rp} |
| wiz.go | Nyalakan sekarang | Switch on now |
| wiz.s4 | Menyalakan… | Switching on… |
| wiz.p.space | Menyiapkan ruang | Preparing space |
| wiz.p.template | Memasang {template} | Installing {template} |
| wiz.p.database | Membuat tempat simpan data | Creating data storage |
| wiz.p.domain | Memasang alamat {domain} | Setting up {domain} |
| wiz.p.free | Menyiapkan alamat gratis {name}.tokennyala.app | Setting up the free address {name}.tokennyala.app |
| wiz.p.https | Mengaktifkan HTTPS | Turning on HTTPS |
| wiz.p.email | Menyiapkan email | Setting up email |
| wiz.p.ai | Menyambungkan AI ke saldo | Connecting AI to your balance |

Daftar progres dibuat dari layanan proyek, berurutan: space → template (jika ada) → database → domain **atau** free → https → email → ai.
| wiz.done | Nyala! | It's on! |
| wiz.doneLead | {project} sudah online. Saldo terpotong {Rp}. | {project} is online. {Rp} was deducted from your balance. |
| wiz.copyLink | Salin link | Copy link |
| wiz.toHome | Ke beranda | Go to home |

### Status
| Kunci | ID | EN |
|---|---|---|
| st.starting | Menyalakan | Switching on |
| st.on | Nyala | On |
| st.paused | Dijeda | Paused |
| st.stopped | Berhenti | Stopped |

### Aksi layanan
| Kunci | ID | EN |
|---|---|---|
| act.resize | Ganti ukuran | Change size |
| act.resizeUp | Naik ke {size}: dipotong {Rp} untuk {n} hari tersisa. | Move up to {size}: {Rp} charged for the {n} days left. |
| act.resizeDown | Turun ke {size}: {Rp} kembali ke saldo. | Move down to {size}: {Rp} goes back to your balance. |
| act.stop | Hentikan layanan | Stop service |
| act.stopConfirm | Hentikan {service}? {Rp} untuk sisa {n} hari kembali ke saldo. Datanya disimpan 7 hari, lalu dihapus. | Stop {service}? {Rp} for the {n} unused days goes back to your balance. Its data is kept for 7 days, then deleted. |
| act.stopDomain | Matikan perpanjangan {domain}? Alamat tetap aktif sampai {date}. Biaya alamat web tidak bisa dikembalikan. | Turn off renewal for {domain}? It stays active until {date}. Web address fees can't be refunded. |
| act.stopProject | Hentikan proyek | Stop project |
| act.stopProjectConfirm | Hentikan semua layanan di {project}? {Rp} kembali ke saldo. Alamat web tetap aktif sampai masa berlakunya habis. | Stop every service in {project}? {Rp} goes back to your balance. Web addresses stay active until they expire. |
| act.resume | Nyalakan lagi | Switch on again |
| st.stoppedUntil | Data dihapus {date} | Data deleted on {date} |
| act.restart | Mulai ulang | Restart |
| act.copied | Disalin | Copied |

### Saldo
| Kunci | ID | EN |
|---|---|---|
| bal.history | Riwayat | History |
| bal.filterAll | Semua layanan / Semua proyek | All services / All projects |
| bal.reminder | Ingatkan saat saldo di bawah {Rp} | Remind me when my balance drops below {Rp} |
| bal.invoice | Unduh invoice (contoh) | Download invoice (example) |
| bal.emptyHistory | Belum ada transaksi. | No transactions yet. |
Baris riwayat: `+ Isi saldo · QRIS` / `+ Top up · QRIS` · `− {layanan} · {proyek} · 30 hari` / `− {service} · {project} · 30 days` · `− AI · {n} sesi` / `− AI · {n} sessions` · `+ Sisa {n} hari dikembalikan` / `+ {n} unused days refunded`.

### Empty state layanan (mengarahkan ke pilihan lebih mudah)
| Layanan | ID | EN |
|---|---|---|
| server | Belum ada server. Cocok kalau kamu butuh kontrol penuh. Kalau cuma mau online-kan proyek, pakai **Online-kan proyekmu** saja. | No servers yet. Good when you need full control. If you just want your project online, use **Put your project online** instead. |
| database | Belum ada tempat simpan data. Biasanya dibutuhkan untuk form pendaftaran atau login. | No data storage yet. You usually need it for sign-up forms or logins. |
| storage | Belum ada tempat simpan file. Cocok untuk foto produk dan file upload. | No file storage yet. Good for product photos and uploads. |
| domain | Belum ada alamat web. Proyekmu tetap bisa dibuka di alamat gratis .tokennyala.app. | No web address yet. Your project still works at its free .tokennyala.app address. |
| email | Belum mengirim email. Ukuran Gratis cukup untuk 50 email per hari — tanpa alamat web sendiri pun bisa. | No email yet. The Free size covers 50 emails a day — even without your own web address. |
| payments | Belum menerima pembayaran. Mulai di mode uji — tidak ada uang sungguhan. | Not accepting payments yet. Start in test mode — no real money. |

### Server — sukses
| ID | EN |
|---|---|
| Simpan password ini sekarang. Kami hanya menampilkannya sekali. | Save this password now. We only show it once. |
| Lokasi Jakarta — paling dekat dengan pengguna Indonesia. | Jakarta — closest to users in Indonesia. |

### Error & loading umum
| ID | EN |
|---|---|
| Memuat… | Loading… |
| Ada yang belum pas. Coba lagi, atau tanya Nala. | Something isn't right. Try again, or ask Nala. |
| Nama proyek sudah dipakai. | That project name is taken. |
| Nama proyek hanya boleh huruf kecil, angka, dan tanda hubung (3–30 karakter). | Project names can only use lowercase letters, numbers, and hyphens (3–30 characters). |

---

## 6. FAQ Landing (13)
Dipertahankan dari v3 (kata “saldo” dibaca sebagai saldo untuk semua layanan): kapan saldo aktif · apakah saldo kedaluwarsa · termasuk PPN · request AI gagal · metode bayar · data prompt dikirim ke mana · API key bocor. (Refund v3 digantikan FAQ “berhenti” di bawah; “untuk tim” cukup di section Tim.)

Baru (6):
| ID | EN |
|---|---|
| **Layanan apa saja yang ada?** AI untuk tool coding, hosting, chatbot & otomasi siap pakai, server, tempat simpan data & file, alamat web, email, dan terima pembayaran — semua dari satu saldo. | **What services are there?** AI for coding tools, hosting, ready-made chatbots & automations, servers, data & file storage, web addresses, email, and payments — all from one balance. |
| **Saya tidak paham server. Bisa pakai?** Bisa. Mulai dari tujuan, kami pilihkan ukurannya. Detail teknis hanya muncul kalau kamu buka. | **I don't understand servers. Can I still use it?** Yes. Start from your goal and we pick the size. Technical details only show up if you open them. |
| **Kapan biaya bulanan dipotong?** Di muka per 30 hari sejak layanan nyala. AI dipotong sesuai pemakaian. | **When are monthly costs charged?** Upfront every 30 days from when a service switches on. AI is charged as you use it. |
| **Bagaimana kalau saldo habis?** Layanan dijeda, bukan dihapus. Datamu aman 7 hari, dan kami ingatkan 3 hari sebelumnya. | **What if my balance runs out?** Services pause, they aren't deleted. Your data is safe for 7 days, and we remind you 3 days before. |
| **Bisa berhenti atau batal?** Bisa kapan saja. Sisa hari kembali ke saldo. Pembayaran isi saldo yang belum selesai bisa dibatalkan; saldo yang sudah masuk tidak bisa diuangkan. | **Can I stop or cancel?** Anytime. Unused days go back to your balance. Unfinished top-up payments can be cancelled; balance already added can't be cashed out. |
| **Berapa biaya alamat web setelah tahun pertama?** `.my.id`, `.biz.id`, dan `.web.id` Rp5.000 tahun pertama, lalu Rp25.000 per tahun. Harga lain ada di halaman Harga. | **How much is a web address after the first year?** `.my.id`, `.biz.id`, and `.web.id` are Rp5,000 for the first year, then Rp25,000 a year. Other prices are on the Pricing page. |

## 7. Nala — Alur “Bantu pilih paket”
| Langkah | ID | EN |
|---|---|---|
| Pembuka (chip baru) | Bantu pilih paket | Help me pick a bundle |
| Q1 | Mau bikin apa? — pilihan = nama pendek paket (§3) | What are you building? — options = short bundle names |
| Q2 | Kodenya sudah ada? — *Sudah, dari Lovable/Bolt/GitHub* · *Belum, mau dibuat dengan AI* | Do you have the code already? — *Yes, from Lovable/Bolt/GitHub* · *Not yet, I'll build it with AI* |
| Q3 | Kira-kira seramai apa? — *Baru coba* · *Rutin dipakai* · *Ramai* | How busy will it be? — *Just trying* · *Used regularly* · *Busy* |
| Hasil | Ini paket yang pas: {bundle} — ≈ {Rp}/bulan. | Here's the right bundle: {bundle} — ≈ {Rp}/month. |
| Aksi | Nyalakan paket ini · Ubah di kalkulator | Switch on this bundle · Adjust in the calculator |

Aturan Q2/Q3: `services-and-pricing.md` §6 “Aturan Nala”.

---

## 8. Copy Tambahan

### Landing — Contoh proyek
| Kunci | ID | EN |
|---|---|---|
| ex.kicker | Contoh proyek | Example project |
| ex.title | Satu landing page event, dari prompt sampai online. | One event landing page, from prompt to online. |
| ex.build | Bangun dengan AI · 11–18 sesi kecil | Build with AI · 11–18 small sessions |
| ex.online | Online-kan · Coba-coba, 30 hari | Put online · Starter, 30 days |
| ex.domain | Alamat web eventku.my.id · tahun pertama | Web address eventku.my.id · first year |
| ex.total | Total {Rp}–{Rp2} | Total {Rp}–{Rp2} |
| ex.verdict | Isi Rp50.000 sudah cukup sampai online. | A Rp50,000 top-up gets you all the way online. |
| ex.cta | Nyalakan contoh ini | Switch on this example |

### Landing — Belajar (3 panduan, juga di console)
| id | ID | EN |
|---|---|---|
| g-portofolio | Portofolio online dalam 5 menit · 3 menit baca | Your portfolio online in 5 minutes · 3-min read |
| g-chatbot | Chatbot WhatsApp pertamamu · 4 menit baca | Your first WhatsApp chatbot · 4-min read |
| g-ai-tool | Pakai saldo di Cursor & Lovable · 2 menit baca | Use your balance in Cursor & Lovable · 2-min read |
| learn.cta | Buka panduan | Open guide |

### Console — Detail proyek
| Kunci | ID | EN |
|---|---|---|
| prj.tab.overview | Ringkasan | Overview |
| prj.tab.services | Layanan | Services |
| prj.tab.ai | AI | AI |
| prj.tab.log | Log | Log |
| prj.tab.settings | Pengaturan | Settings |
| prj.visit | Buka {domain} | Open {domain} |
| prj.cost | {Rp}/bulan · diperpanjang {date} | {Rp}/month · renews {date} |
| prj.log.empty | Belum ada catatan. | Nothing logged yet. |
| prj.log.row | {time} · {message} | {time} · {message} |
| prj.addService | Tambah layanan ke proyek ini | Add a service to this project |
Contoh baris log (mock): “Proyek dinyalakan” / “Project switched on” · “Alamat ayu.my.id aktif” / “ayu.my.id is live” · “Dimulai ulang otomatis” / “Restarted automatically”.

### Console — menu (22 Nov 2026)
| Kunci | ID | EN |
|---|---|---|
| nav.chat | Chat AI | AI chat |
| nav.api | API AI | AI API |
| nav.apps | Aplikasi | Apps |
| nav.group.storeConnect | Simpan & hubungkan | Store & connect |
| svc.nat.name | Server hemat | Budget server |
| svcp.kind.server / svcp.kind.nat | IP sendiri / Hemat · IP bersama | Own IP / Budget · shared IP |
| chatp.privacy | Percakapan hanya tersimpan selama tab ini terbuka. Ekspor untuk menyimpannya. | Conversations are kept only while this tab is open. Export to keep them. |
| apps.aiLinked | AI tersambung ke saldo lewat API key proyek {project} — tidak perlu API key lain. | AI is connected to your balance through the {project} project API key — no other API key needed. |
| svcp.port.note | Port luar dipilih otomatis. Layanan di servermu harus sedang berjalan dan diizinkan firewall. | The public port is picked for you. The service on your server must be running and allowed by its firewall. |

### Console — AI
| Kunci | ID | EN |
|---|---|---|
| ai.tab.start | Mulai cepat | Quick start |
| ai.tab.models | Model | Models |
| ai.tab.usage | Pemakaian | Usage |
| ai.tab.keys | API key | API keys |
| ai.limit | Batas belanja per bulan | Monthly spending limit |
| ai.noLimit | Tanpa batas | No limit |
| ai.tryCost | Pesan ini ±{Rp} | This message ±{Rp} |
| ai.keyNew | Buat API key | Create API key |
| ai.keyOnce | Salin sekarang. Key lengkap hanya ditampilkan sekali. | Copy it now. The full key is only shown once. |

### Console — Form layanan (pola bersama)
| Kunci | ID | EN |
|---|---|---|
| svcf.add | Tambah | Add |
| svcf.name | Nama | Name |
| svcf.size | Ukuran | Size |
| svcf.location | Lokasi | Location |
| svcf.jakarta | Jakarta — paling dekat dengan pengguna Indonesia | Jakarta — closest to users in Indonesia |
| svcf.singapore | Singapura | Singapore |
| svcf.system | Sistem | System |
| svcf.engine | Jenis database | Database type |
| svcf.engineHint | PostgreSQL — pilihan aman untuk kebanyakan proyek | PostgreSQL — a safe choice for most projects |
| svcf.summary | Ringkasan | Summary |
| svcf.go | Nyalakan | Switch on |
| svcf.sandbox | Mode uji — tidak ada uang sungguhan | Test mode — no real money |


### Landing — tambahan Fase 1 (20 Nov 2026)
Kunci di `v4/assets/js/i18n.js` (format `[ID, EN]`). Hanya yang belum tertulis di atas:

| Kunci | ID | EN |
|---|---|---|
| hero.title | Idemu {saklar} **nyala**, dari prompt sampai online. | Your idea, {saklar} switched **on** — from prompt to online. |
| story.before / story.beforeNote | Sebelum · Hanya bisa dibuka di laptopmu. | Before · Only opens on your laptop. |
| story.after / story.afterNote | Sesudah · Bisa dibuka siapa saja, dari HP mana saja. | After · Anyone can open it, from any phone. |
| status.off | Belum online | Not online |
| recipe.approx | Perkiraan per bulan | Estimated per month |
| recipe.suggestNote | Saldo masuk {Rp} termasuk bonus. | You get {Rp} including the bonus. |
| item.ai.pesan / item.ai.tugas | AI untuk balasan chatbot · AI untuk langkah otomasi | AI for chatbot replies · AI for automation steps |
| item.domainFirst | {Rp} tahun pertama, lalu {renew}/tahun | {Rp} first year, then {renew}/year |
| how.title | Tiga langkah, dari tujuan sampai online. | Three steps, from goal to online. |
| svc.lead | Nama yang mudah dipahami lebih dulu. Istilah teknisnya tetap ada, kecil di bawahnya. | Plain names first. The technical term is still there, in small print below. |
| svc.domain.desc | Nama proyekmu di internet. (harga “mulai dari” tampil di baris harga kartu) | Your project's name on the internet. |
| wallet.card | Contoh: satu landing page event | Example: one event landing page |
| wallet.left / wallet.leftNote | Sisa saldo · Sisa saldo tetap bisa dipakai untuk AI atau bulan berikutnya. | Balance left · What is left stays available for AI or next month. |

Kartu “Satu saldo” **tidak** menampilkan tanggal “cukup sampai” (aturan `services-and-pricing.md` §2: tanggal hanya di console); wireframe A6 disesuaikan.

### Landing — tambahan Fase 2 (20 Nov 2026)
| Kunci | ID | EN |
|---|---|---|
| tpl.lead | Asisten dan otomasi populer, sudah dirakit. Kamu cukup pilih ukuran — AI tersambung ke saldo yang sama. | Popular assistants and automations, already put together. Just pick a size — AI connects to the same balance. |
| tpl.costAi | ≈ {Rp}/bulan, termasuk {jumlah} | ≈ {Rp}/month, including {qty} |
| ai.title | Satu saldo untuk **semua** model. | One balance for **every** model. |
| ai.lead | Pakai Claude, GPT, Gemini, DeepSeek, dan Qwen di Cursor, Lovable, atau Cline. Model hemat untuk tugas ringan, model premium untuk pekerjaan rumit. | Use Claude, GPT, Gemini, DeepSeek, and Qwen in Cursor, Lovable, or Cline. Budget models for light tasks, premium ones for hard problems. |
| guide.1 | **Ambil API key proyek** — Ada di console → AI setelah isi saldo. (v3: “halaman saldo”) | **Get your project API key** — It's in the console → AI after you top up. |
| ex.lead | Perkiraan biaya membangun dengan AI (model Seimbang), lalu online dengan alamat sendiri. | An estimate for building it with AI (a Balanced model), then putting it online at its own address. |
| ex.left | Saldo {Rp} dengan bonus, sisa {a}–{b} untuk iterasi berikutnya. | With the bonus you get {Rp}, leaving {a}–{b} for more iterations. |
| safe.title | Tidak ada kejutan di **tagihan**. | No surprises on your **bill**. |
| safe.1.art | Berhenti di hari ke-10 → {Rp} kembali ke saldo | Stop on day 10 → {Rp} back to your balance |
| safe.2.art | {ukuran} → {ukuran} di hari ke-10 → {Rp} kembali ke saldo | {size} → {size} on day 10 → {Rp} back to your balance |
| safe.3.art | Data aman {n} hari · isi saldo, langsung nyala lagi | Data safe for {n} days · top up and it switches back on |
| safe.4.art | Saldo kurang untuk perpanjangan dalam {n} hari. Isi minimal {Rp}. | Not enough balance to renew in {n} days. Top up at least {Rp}. |
| learn.title / learn.lead | Panduan singkat, per tujuan. · Langkah demi langkah dengan bahasa sehari-hari. Bisa dibuka lagi kapan saja di console. | Short guides, by goal. · Step by step, in everyday words. Open them again anytime in the console. |
| team.pt5 | Batas belanja per proyek | Spending limits per project |
| faq.lead | Belum menemukan jawabannya? Tanya Nala, atau bicara dengan tim. | Still looking for an answer? Ask Nala, or talk to the team. |
| faq.a13 (v3 diperbarui) | Nonaktifkan API key itu di console (AI → API key), lalu buat yang baru. Pasang batas belanja per proyek supaya pemakaian tidak melebihi rencana. | Disable that key in the console (AI → API key) and create a new one. Set a spending limit per project so usage never goes past your plan. |
| final.trust | Bayar Rupiah · Tanpa kartu kredit · Saldo tidak kedaluwarsa | Pay in Rupiah · No credit card · Balance never expires |
| chat.greeting | Hai, aku Nala! Mau dibantu pilih paket untuk proyekmu, atau ada pertanyaan lain? | Hi, I'm Nala! Want help picking a bundle for your project, or got another question? |
| nala.resultAi | Untuk AI di tool coding: isi {Rp} → {range} sesi kecil. Ambil API key-mu di console. | For AI in your coding tools: top up {Rp} → {range} small sessions. Get your API key in the console. |
| agent.greeting | Halo, aku Sari dari tim TokenNyala. Ada yang bisa kubantu? (v3: “…soal top up?”) | Hi, I'm Sari from the TokenNyala team. How can I help? |

Chip utama Nala: Bantu pilih paket · Cara pakai saldo di tool · Model apa saja? · Metode pembayaran · Bicara dengan tim. Alur v3 “Bantu pilih paket” **digantikan** “Bantu pilih paket”; kebutuhan AI-saja dijawab lewat pilihan “AI coding saja” (tabel nominal → sesi kecil v3).

### Harga — tambahan Fase 3 (20 Nov 2026)
Semua kunci ada di `v4/assets/js/i18n.js` (awalan `price.`, `pnav.`, `calc.`, `from.`, `det.`, `aip.`, `bal.`, `rule.`, `pfaq.`). Yang penting untuk review copy:

| Kunci | ID | EN |
|---|---|---|
| price.title | Satu saldo Rupiah. Bayar yang kamu **pakai**. | One Rupiah balance. Pay for what you **use**. |
| calc.title | Rakit sendiri, lihat **totalnya**. | Build your own, see the **total**. |
| calc.offNote | Tidak dihitung. Nyalakan untuk menambahkannya ke total. | Not counted. Switch it on to add it to the total. |
| calc.for.{coba,rutin,ramai} | Cocok untuk … · ±{n} pengunjung/hari (isi dari `services-and-pricing` §4) | Good for … · ±{n} visitors/day |
| calc.bumped | {template} naik ke {ukuran} karena AI dinyalakan. | {template} moved up to {size} because AI is on. |
| calc.recipeEmpty | Mulai dari kosong | Start from scratch |
| calc.payments | {pct}% per transaksi, dipotong dari dana yang masuk — bukan dari saldo. | {pct}% per transaction, taken from the money you receive — not from your balance. |
| det.server.* / det.database.* / det.storage.* | “Cukup untuk” per ukuran (baru, tidak ada di dokumen sebelumnya) — mis. Kecil: Belajar Linux, bot, atau beberapa aplikasi kecil | Good for … |
| aip.title | Satu saldo, dua belas model. | One balance, twelve models. |
| bal.title | Isi saldo sekali, dipotong dengan aturan yang **jelas**. | Top up once, charged by **clear** rules. |
| rule.* | 10 aturan tagihan dari `services-and-pricing` §1–2 dengan angka dari `data.js` | — |

### Console — tambahan Fase 4 (20 Nov 2026)
Kunci di `v4/assets/js/i18n.js` (awalan `con.`, `acct.`, `auth.`, `home.`, `next.`, `banner.`, `bal.`, `h.`, `co.`, `method.`).

| Kunci | ID | EN |
|---|---|---|
| auth.lead | Satu akun untuk semua layanan. Tanpa kartu kredit. | One account for every service. No credit card. |
| auth.contactHelp | Kami kirim kode 6 digit ke sini. Di prototype ini tidak ada yang dikirim atau disimpan. | We send a 6-digit code here. In this prototype nothing is sent or stored. |
| auth.demoTitle | Atau langsung coba akun contoh (Ayu · Raka · Dimas → `?demo=`) | Or jump into a sample account |
| home.untilPaused | Ada layanan yang dijeda. Isi saldo untuk menyalakannya lagi. (tanggal “cukup sampai” tidak ditampilkan saat ada yang dijeda) | A service is paused. Top up to switch it back on. |
| banner.paused | …Isi minimal {Rp} — langsung menyala lagi. (ditambah ajakan) | …Top up at least {Rp} and it switches back on. |
| next.* | 5 langkah berikutnya (isi saldo · paket pertama · QR WhatsApp · alamat web · API key) | — |
| co.afterResume | Saldo setelahnya {Rp} — sudah termasuk {proyek} menyala lagi untuk 30 hari. | Balance afterwards {Rp} — after {project} switches back on for 30 days. |
| co.resumed | {proyek} menyala lagi — 30 hari baru sudah dipotong. | {project} is back on — a new 30 days has been charged. |
| con.soonBody | Bagian ini dibangun di tahap berikutnya prototype. (rute Fase 5–6, sementara) | This part is built in the next stage of the prototype. |

Isi saldo console = checkout v3 tanpa field kontak (pengguna sudah masuk): 4 nominal + bonus, “Nominal lain” (min. Rp20.000, kelipatan Rp1.000), metode, bayar (QRIS/VA/e-wallet), sukses/gagal.

### Console — tambahan Fase 5 (20 Nov 2026)
Wizard (`wiz.*`), proyek (`proj.*`, `tab.*`), aksi layanan (`act.*`), log proyek (`log.*`), jam simulasi (`acct.advance*`, `banner.reminder`), riwayat (`h.renew*`, `h.refund`, `h.resize`). Contoh yang perlu dicek:

| Kunci | ID | EN |
|---|---|---|
| wiz.renews | Diperpanjang otomatis {tanggal} jika saldo cukup. Bisa berhenti kapan saja — sisa hari kembali ke saldo. | Renews automatically on {date} if your balance covers it. Stop anytime — unused days go back to your balance. |
| wiz.balance | Saldo: {sekarang} → {setelah} setelah nyala | Balance: {now} → {after} after switching on |
| wiz.domainTaken | {domain} sudah dipakai orang lain. Coba nama lain. (mock: google, tokennyala, toko, admin, shop) | {domain} is already taken. Try another name. |
| banner.reminder | Saldo tinggal {saldo}, di bawah pengingatmu. {proyek} diperpanjang {tanggal} sebesar {Rp}. | Your balance is down to {balance}, below your reminder. {project} renews on {date} for {price}. |
| act.resizeDown / act.resizeUp / act.stopConfirm / act.stopDomain / act.stopProjectConfirm | sesuai §5 “Aksi layanan” di atas, angka dari `refund()` / `prorata()` | — |
| next.resume | Isi saldo supaya tetap nyala · Layanan yang dijeda langsung menyala lagi setelah saldo cukup. | Top up to stay on · Paused services switch back on as soon as your balance covers them. |

### Console — tambahan Fase 6 (20 Nov 2026)
AI (`ai.*`), layanan lain (`svcp.*`, `empty.*` sesuai §5), belajar (`learn.*` — 11 langkah panduan), bantuan (`help.*`), rute tidak dikenal (`con.nf*`). Contoh:

| Kunci | ID | EN |
|---|---|---|
| ai.try.reply | (Simulasi) Ini contoh jawaban dari {model}. Di produk nyata, jawaban asli muncul di sini dan biayanya dihitung dari token yang dipakai. | (Simulation) This is a sample answer from {model}… |
| ai.try.cost | {model} · ±{in} token masuk, ±{out} keluar · {Rp} | {model} · ~{in} tokens in, ~{out} out · {Rp} |
| ai.usage.keys | Pakai panah kiri/kanan untuk melihat tiap hari. | Use the left/right arrows to read each day. |
| svcp.once | Simpan password ini sekarang. Kami hanya menampilkannya sekali. | Save this password now. We only show it once. |
| learn.g-portofolio.1–4 · g-chatbot.1–4 · g-ai-tool.1–3 | langkah panduan (lihat `i18n.js`) | — |
| con.nfTitle | Halaman tidak ditemukan | Page not found |
