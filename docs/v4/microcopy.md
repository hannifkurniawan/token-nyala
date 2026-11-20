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
| footer.prototype | Prototype interaktif — tidak ada transaksi, deploy, atau data nyata. | Interactive prototype — no real transactions, deployments, or data. |

---

## 3. Landing

### Hero
| Kunci | ID | EN |
|---|---|---|
| hero.kicker | Untuk ide, prototype, dan proyekmu | For your ideas, prototypes, and projects |
| hero.title | Idemu **nyala**, dari prompt sampai online. | Your idea, switched **on** — from prompt to online. |
| hero.lead | AI untuk membangun, cloud untuk menjalankan. Pilih tujuanmu, kami rangkai layanannya — dibayar dari satu saldo Rupiah. | AI to build it, cloud to run it. Pick your goal and we'll put the services together — all paid from one Rupiah balance. |
| hero.trust1 | Bayar Rupiah | Pay in Rupiah |
| hero.trust2 | Tanpa kartu kredit | No credit card |
| hero.trust3 | Mulai Rp15 rb | From Rp15K |
| board.prompt | Buat landing page event yang hangat dan simpel | Make a warm, simple event landing page |
| board.building | Membangun komponen… | Building components… |
| board.online | Online | Online |
| board.balance | Saldo Rp55.000 → sisa Rp12.320 | Balance Rp55,000 → Rp12,320 left |

### Cerita macet
| ID | EN |
|---|---|
| **Kode sudah jadi.** Tapi belum bisa dibuka orang lain. | **The code is done.** But nobody else can open it yet. |
| Di TokenNyala, proyekmu online dalam beberapa ketukan — lengkap dengan alamat sendiri. | On TokenNyala, your project goes online in a few taps — with its own address. |

### Mau bikin apa?
| Kunci | ID | EN |
|---|---|---|
| recipe.kicker | Mau bikin apa? | What are you building? |
| recipe.title | Mulai dari tujuanmu, bukan dari menu. | Start from your goal, not a menu. |
| recipe.lead | Pilih tujuan. Kami tunjukkan layanan yang dibutuhkan dan total per bulannya. | Pick a goal. We'll show the services you need and the monthly total. |
| recipe.firstMonth | Bulan pertama {Rp} — termasuk alamat web 1 tahun | First month {Rp} — includes 1 year of web address |
| recipe.suggest | Isi {Rp} → cukup ±{n} bulan | Top up {Rp} → lasts ±{n} months |
| recipe.cta | Nyalakan resep ini | Switch on this recipe |
| recipe.edit | Ubah di kalkulator | Adjust in the calculator |
| recipe.note | Perkiraan. Pemakaian AI bergantung pada model, panjang prompt, dan jumlah pesan. | Estimate. AI usage depends on the model, prompt length, and message volume. |

| Resep | Nama ID | Nama EN | Kalimat ID | Kalimat EN |
|---|---|---|---|---|
| portofolio | Landing page / portofolio | Landing page / portfolio | Online dengan alamat sendiri, plus AI untuk terus memperbaikinya. | Online with your own address, plus AI to keep improving it. |
| chatbot-wa | Chatbot WhatsApp | WhatsApp chatbot | Balas pesan pelanggan otomatis, 24 jam. | Reply to customers automatically, 24/7. |
| web-klien | Website klien dengan form | Client website with a form | Website, data pendaftar, email, dan alamat .com untuk satu klien. | Website, sign-up data, email, and a .com address for one client. |
| otomasi-tim | Otomasi untuk tim | Team automation | Workflow n8n dengan AI, data, dan email untuk tim kecil. | n8n workflows with AI, data, and email for a small team. |
| ai-coding | AI untuk tool coding saja | AI for coding tools only | Saldo AI untuk Cursor, Lovable, Cline, dan tool lain. | AI balance for Cursor, Lovable, Cline, and other tools. |

### Cara kerja
| # | ID judul / isi | EN |
|---|---|---|
| 1 | **Pilih tujuanmu** — Landing page, chatbot, atau otomasi. Kami siapkan resepnya. | **Pick your goal** — A landing page, chatbot, or automation. We prepare the recipe. |
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
| domain | Nama proyekmu di internet, mulai Rp5.000. | Your project's name on the internet, from Rp5,000. |
| email | Kirim notifikasi dan struk dari alamatmu sendiri. | Send notifications and receipts from your own address. |
| payments | Terima pembayaran QRIS di aplikasimu. | Accept QRIS payments in your app. |

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
| calc.recipe | Resep | Recipe |
| calc.add | Tambah layanan | Add a service |
| calc.fixed | Biaya tetap | Fixed cost |
| calc.usage | Perkiraan pakai | Estimated usage |
| calc.yearly | Tahunan | Yearly |
| calc.monthly | Per bulan | Per month |
| calc.first | Bulan pertama | First month |
| calc.cta | Nyalakan | Switch on |
| calc.empty | Belum ada layanan. Pilih resep atau tambah layanan. | No services yet. Pick a recipe or add a service. |
| size.disabled | Belum cukup untuk {template} — pilih {size} | Not enough for {template} — choose {size} |

FAQ Harga (ID/EN): *Kapan biaya tetap dipotong?* — Di muka per 30 hari sejak layanan nyala. / *When are fixed costs charged?* — Upfront every 30 days from when the service switches on. · *Bagaimana kalau saldo habis?* — Layanan dijeda, data aman 7 hari, isi saldo untuk menyalakan lagi. · *Bisa berhenti di tengah bulan?* — Bisa, sisa hari kembali ke saldo. · *Kenapa biaya AI perkiraan?* — Bergantung pada model, panjang prompt, dan jumlah pesan. · *Apakah ada biaya tersembunyi?* — Tidak. Semua harga termasuk PPN, biaya tambahan Rp0.

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
Beranda / Home · Proyek / Projects · Buat / Create · Saldo / Balance · Lainnya / More · AI · Layanan / Services · Belajar / Learn · Bantuan / Help · Mulai ulang demo / Restart demo · Keluar / Sign out

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
| wiz.domainAvail | Tersedia · {Rp} tahun pertama | Available · {Rp} first year |
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
| wiz.p1 | Menyiapkan ruang | Preparing space |
| wiz.p2 | Memasang alamat {domain} | Setting up {domain} |
| wiz.p3 | Mengaktifkan HTTPS | Turning on HTTPS |
| wiz.p4 | Menyambungkan AI ke saldo | Connecting AI to your balance |
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
| act.stopConfirm | Hentikan {service}? {Rp} sisa {n} hari kembali ke saldo. Data dihapus setelah 7 hari. | Stop {service}? {Rp} for the {n} unused days goes back to your balance. Data is deleted after 7 days. |
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
| email | Belum mengirim email. Paket Gratis cukup untuk 50 email per hari. | No email yet. The Free plan covers 50 emails a day. |
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

## 6. FAQ Landing (12)
Dipertahankan dari v3 (disesuaikan kata “saldo untuk semua layanan”): kapan saldo aktif · apakah saldo kedaluwarsa · termasuk PPN · request gagal · metode bayar · refund · data prompt · API key bocor · untuk tim.
Baru:
| ID | EN |
|---|---|
| **Layanan apa saja yang ada?** AI untuk tool coding, hosting, chatbot & otomasi siap pakai, server, tempat simpan data & file, alamat web, email, dan terima pembayaran — semua dari satu saldo. | **What services are there?** AI for coding tools, hosting, ready-made chatbots & automations, servers, data & file storage, web addresses, email, and payments — all from one balance. |
| **Saya tidak paham server. Bisa pakai?** Bisa. Mulai dari tujuan, kami pilihkan ukurannya. Detail teknis hanya muncul kalau kamu buka. | **I don't understand servers. Can I still use it?** Yes. Start from your goal and we pick the size. Technical details only show up if you open them. |
| **Bagaimana kalau saldo habis?** Layanan dijeda, bukan dihapus. Datamu aman 7 hari. Kami ingatkan 3 hari sebelumnya. | **What if my balance runs out?** Services pause, they aren't deleted. Your data is safe for 7 days, and we remind you 3 days before. |

---

## 7. Nala — Alur “Bantu pilih resep”
| Langkah | ID | EN |
|---|---|---|
| Pembuka (chip baru) | Bantu pilih resep | Help me pick a recipe |
| Q1 | Mau bikin apa? (Landing page · Chatbot WhatsApp · Website klien · Otomasi tim · Cuma AI untuk coding) | What are you building? |
| Q2 | Kodenya sudah ada? (Sudah, dari Lovable/Bolt/GitHub · Belum, mau dibuat dengan AI) | Do you have the code already? |
| Q3 | Kira-kira seramai apa? (Baru coba · Rutin dipakai · Ramai) | How busy will it be? |
| Hasil | Ini resep yang pas: {recipe} — ≈ {Rp}/bulan. | Here's the right recipe: {recipe} — ≈ {Rp}/month. |
| Aksi | Nyalakan resep ini · Ubah di kalkulator | Switch on this recipe · Adjust in the calculator |

Q2 “Belum” menambah AI +10 sesi kecil ke resep; Q3 memilih ukuran (Baru coba → minimum resep, Rutin → Rutin, Ramai → Ramai).
