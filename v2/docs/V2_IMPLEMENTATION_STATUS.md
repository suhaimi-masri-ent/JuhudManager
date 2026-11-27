
# JUHUDMANAGER V2 — IMPLEMENTATION STATUS AND ROADMAP

Document ID: JMV2-IMP-001  
Roadmap ID: JMV2-ROADMAP-001  
Version: 3.0  
Date: 28 November 2026  
Status: WORKING BASELINE — Implementation Tracking  
Repository Path: `v2/docs/V2_IMPLEMENTATION_STATUS.md`

---

## 1. Purpose and Authority

Dokumen ini ialah rujukan utama bagi status pelaksanaan dan roadmap pembangunan JuhudManager V2.

Dokumen ini merekodkan:

- keadaan repository dan seni bina;
- status Worker, database dan migration;
- status authentication dan account management;
- status authorization dan UAC;
- status setiap modul perniagaan;
- ujian dan deployment yang telah dilaporkan atau disahkan;
- blockers dan risiko;
- fasa pembangunan seterusnya;
- release gates dan syarat pengesahan.

Dokumen ini menggabungkan fungsi terdahulu `V2_IMPLEMENTATION_STATUS.md` dan `IMPLEMENTATION_STATUS_AND_ROADMAP.md`.

Mulai versi ini:

1. `V2_IMPLEMENTATION_STATUS.md` ialah sumber utama status pelaksanaan dan roadmap.
2. `IMPLEMENTATION_STATUS_AND_ROADMAP.md` dianggap dokumen terdahulu yang telah digantikan dari segi fungsi dokumentasi.
3. Dokumen lama tidak perlu dipadam sehingga semakan dan pengarkiban repository dilaksanakan.
4. Spesifikasi modul kekal sebagai rujukan keperluan dan tingkah laku sistem.
5. Master Decision Register kekal sebagai rujukan keputusan reka bentuk.
6. Dokumen ini tidak memberikan kuasa untuk mengubah keputusan reka bentuk atau melaksanakan migration dan deployment production.

Keputusan reka bentuk yang telah diluluskan tidak boleh dianggap sebagai fungsi yang telah tersedia sehingga pelaksanaannya disahkan.

---

## 2. Status Definitions

| Status | Meaning |
|---|---|
| IMPLEMENTED | Pelaksanaan telah disahkan pada skop yang dinyatakan |
| PARTIALLY IMPLEMENTED | Sebahagian fungsi tersedia tetapi belum lengkap |
| IN PROGRESS | Pelaksanaan sedang berjalan |
| NOT IMPLEMENTED | Belum dilaksanakan |
| NEEDS VERIFICATION | Memerlukan pemeriksaan kod, ujian atau persekitaran |
| ON HOLD | Kerja ditangguhkan sementara |
| DEPRECATED | Pelaksanaan atau pendekatan lama tidak lagi digunakan |
| NOT APPLICABLE | Tidak berkaitan dengan skop berkenaan |
| REPORTED PASS | Keputusan lulus telah dilaporkan tetapi belum disahkan semula |
| DEPLOYED | Telah disahkan dalam environment yang dinyatakan |
| BLOCKED | Kerja tidak boleh diteruskan dengan selamat sehingga blocker diselesaikan |
| PENDING DECISION | Memerlukan keputusan reka bentuk sebelum pelaksanaan |

### 2.1 Status Scope

Status mesti menyatakan skop sebenar.

Contoh:

- `IMPLEMENTED — SCHEMA FOUNDATION` tidak bermaksud keseluruhan workflow modul telah lengkap.
- `PARTIALLY IMPLEMENTED — AUTHENTICATION` tidak bermaksud semua authentication flow telah diuji.
- `REPORTED PASS` tidak sama dengan pengesahan terkini.
- `DEPLOYED` mesti menyatakan environment yang telah disahkan.

Status tidak boleh dinaik taraf berdasarkan kewujudan jadual database, UI atau API semata-mata.

---

# PART A — CURRENT IMPLEMENTATION STATUS

## 3. Repository and Architecture

### 3.1 V1/V2 Separation

**Status: PARTIALLY IMPLEMENTED — NEEDS FINAL VERIFICATION**

Kerja pemisahan V1 dan V2 telah disediakan pada branch:

`integration/v1-v2-separation-develop`

Struktur repository yang disediakan:

```text
JuhudManager/
├── v1/
│   ├── public/
│   ├── src/
│   ├── worker/
│   └── wrangler.jsonc
├── v2/
│   ├── src/
│   ├── web/
│   ├── migrations/
│   ├── docs/
│   └── wrangler.jsonc
├── docs/
├── .github/
│   └── workflows/
└── README.md
```

Perkara yang telah disediakan:

- direktori V1 dan V2;
- konfigurasi Worker V1 dan V2 yang berasingan;
- workflow deployment Worker V1 dan V2 yang berasingan;
- struktur Pages yang menggabungkan output V1 dan V2;
- workflow migration V2 yang berasingan;
- dokumentasi asas pemisahan;
- `.gitignore` untuk mengabaikan direktori `node_modules`.

Pengesahan akhir masih diperlukan bagi:

- V1 Worker deployment;
- V1 Pages deployment;
- V2 Worker deployment;
- V2 Pages deployment;
- laluan aplikasi dan aset;
- workflow GitHub Actions;
- konfigurasi production;
- kesinambungan fungsi V1 selepas pemindahan.

Pemisahan pada integration branch tidak bermaksud perubahan telah digabungkan ke branch production.

### 3.2 V1 Preservation

**Status: NEEDS VERIFICATION**

V1 telah dipindahkan ke struktur `v1/`.

Backup branch dan tag pemeliharaan V1 telah disediakan sebelum kerja pemisahan.

Pengesahan perlu memastikan:

- source V1 lengkap;
- konfigurasi Worker dan Pages betul;
- database V1 tidak berubah;
- fungsi V1 masih boleh dibina dan digunakan;
- deployment V1 tidak bergantung kepada laluan lama;
- workflow V1 tidak menggunakan konfigurasi V2.

V1 tidak boleh dianggap selamat untuk diarkibkan sepenuhnya sehingga pengesahan ini selesai.

### 3.3 V2 Isolation

**Status: IMPLEMENTED — FOUNDATION**

V2 mempunyai:

- direktori aplikasi tersendiri;
- konfigurasi Wrangler tersendiri;
- direktori migration tersendiri;
- database D1 khusus V2;
- Worker berasingan daripada V1.

V2 tidak boleh menggunakan database production V1.

### 3.4 Branch and Repository Controls

**Status: NEEDS VERIFICATION**

Branch integrasi semasa:

`integration/v1-v2-separation-develop`

Sebelum merge, semak:

- tiada unresolved merge conflict;
- perubahan staged dan unstaged telah disemak;
- workflow deployment menggunakan path yang betul;
- tiada fail V1 atau V2 tertinggal;
- tiada konfigurasi sensitif dimasukkan ke repository;
- backup dan tag V1 masih tersedia;
- semua dokumen mempunyai lokasi dan nama yang konsisten.

---

## 4. Cloudflare Worker and Database Foundation

### 4.1 V2 Worker

**Status: IMPLEMENTED — FOUNDATION**

Maklumat konfigurasi:

| Item | Value |
|---|---|
| Worker | `juhudmanager-v2-api` |
| Main entry | `src/index.js` |
| Configuration | `v2/wrangler.jsonc` |
| D1 binding | `DB` |
| Compatibility date | `2026-11-20` |
| Environment | Production |

Health endpoint pernah memberikan keputusan:

- status `ok`;
- service `juhudmanager-v2-api`;
- environment production;
- database connected.

Keputusan tersebut ialah pengesahan pada masa pemeriksaan terdahulu. Ia bukan jaminan bahawa semua API, authorization dan modul perniagaan telah berfungsi.

### 4.2 V2 D1 Database

**Status: IMPLEMENTED — FOUNDATION**

| Item | Value |
|---|---|
| Database | `juhudmanager-v2-db` |
| Database ID | `4a4e736b-83ee-4889-bfbb-7fe189f92b5f` |

Migration yang dilaporkan telah digunakan sehingga:

`0021_super_admin_owner_verification.sql`

Migration 0021 dilaporkan berjaya digunakan pada 26 November 2026.

Jumlah jadual yang dilaporkan selepas migration tersebut ialah 33.

Pengesahan akhir masih perlu memastikan:

- migration history sepadan dengan fail migration dalam repository;
- struktur remote sepadan dengan struktur yang dijangka;
- foreign key dan constraint berfungsi;
- tiada migration tertinggal;
- data dan trigger berada dalam keadaan konsisten;
- migration V2 tidak pernah diarahkan kepada database V1.

### 4.3 Migration Safety

**Status: IMPLEMENTED — PROCESS FOUNDATION**

Migration V2 mesti:

- menggunakan database V2 sahaja;
- dikendalikan melalui workflow yang mempunyai kawalan pengesahan;
- mengekalkan migration history;
- diuji sebelum digunakan pada production;
- mempunyai prosedur pemulihan yang sesuai;
- tidak dilaksanakan secara automatik semasa deployment Worker.

Workflow migration yang tersedia tidak bermaksud setiap migration telah melalui pengesahan penuh semua kes penggunaan.

### 4.4 V1 Infrastructure

**Status: NEEDS VERIFICATION**

Maklumat konfigurasi V1:

| Item | Value |
|---|---|
| Worker | `juhudmanager-api-test` |
| Configuration | `v1/wrangler.jsonc` |
| Main entry | `worker/src/index.js` |
| D1 database | `juhudmanager-db` |
| D1 ID | `7846a32c-60b4-41a3-9c85-41fbabe544d9` |

Pengesahan diperlukan untuk memastikan Worker, Pages dan database V1 kekal berasingan daripada V2.

---

## 5. Database Schema Foundation

**Status: PARTIALLY IMPLEMENTED**

Asas schema yang telah dikenal pasti termasuk:

- users;
- roles;
- user-role relationships;
- identity and authentication records;
- Jemaah;
- Jemaah Membership;
- Takaza;
- Takaza Participation;
- Amer Appointment;
- audit records;
- authentication OTP and verification records;
- Super Admin owner verification records.

Constraint dan domain validation berkaitan pelantikan Amer turut disediakan pada skop asas yang dilaporkan.

Kewujudan schema tidak bermaksud semua fungsi pengurusan dan workflow modul telah lengkap.

Pengesahan diperlukan bagi setiap jadual, foreign key, index, trigger dan domain constraint sebelum status dinaik taraf.

---

## 6. Authentication and Account Management

### 6.1 Registration

**Status: PARTIALLY IMPLEMENTED**

Asas pendaftaran melalui e-mel dan pengesahan OTP telah dilaksanakan pada skop yang dilaporkan.

Polisi reka bentuk:

- OTP enam digit;
- tempoh sah lima minit;
- maksimum lima percubaan;
- resend cooldown 60 saat;
- identity reservation 15 minit;
- kata laluan minimum 12 aksara.

Pengesahan keseluruhan aliran pendaftaran, termasuk kes khas dan bootstrap owner, masih diperlukan.

### 6.2 Email OTP and Activation

**Status: PARTIALLY IMPLEMENTED — NEEDS PRODUCTION VERIFICATION**

Asas penghantaran OTP dan pengaktifan akaun melalui e-mel telah disediakan.

Sender:

`noreply@m.juhud.run.place`

Penghantaran dan pengesahan OTP perlu diuji semula dalam keadaan production, termasuk:

- kegagalan penghantaran;
- OTP tamat tempoh;
- percubaan berulang;
- resend cooldown;
- OTP digunakan lebih daripada sekali;
- OTP untuk tujuan transaksi berbeza;
- identity reservation tamat tempoh.

### 6.3 Login and Sessions

**Status: PARTIALLY IMPLEMENTED**

Backend asas login dan session telah dilaksanakan.

Polisi reka bentuk:

- idle timeout 30 minit;
- maksimum hayat sesi 12 jam;
- tindakan DISABLE menamatkan sesi dan token berkaitan;
- perubahan kata laluan perlu membatalkan sesi yang terjejas;
- sesi mesti diperiksa terhadap account status dan authorization.

Pengesahan penuh perlu merangkumi:

- login berjaya dan gagal;
- session expiry;
- session revocation;
- token revocation;
- perubahan status akaun;
- authorization selepas perubahan role atau appointment;
- logout;
- logout semua sesi.

### 6.4 Email Change

**Status: NEEDS VERIFICATION**

Reka bentuk membenarkan proses pertukaran e-mel bagi akaun `FULL`, `LIMITED` dan `DISABLED`, tertakluk kepada pengesahan identiti dan OTP.

Kebenaran menukar e-mel tidak mengaktifkan semula akaun atau memberikan akses tambahan.

Password reset atau email change tidak boleh mengaktifkan semula akaun DISABLED atau SUSPENDED.

Pelaksanaan keseluruhan perlu disahkan.

### 6.5 Password Reset / Forgot Password

**Status: NOT IMPLEMENTED — REQUIRED**

Fungsi Password Reset / Forgot Password belum dilaksanakan.

Keperluan yang telah dipersetujui:

- menggunakan e-mel berdaftar dan telah disahkan;
- OTP enam digit;
- tempoh sah lima minit;
- maksimum lima percubaan;
- resend cooldown 60 saat;
- OTP sekali guna dan terasing mengikut tujuan;
- OTP mesti terikat kepada transaksi Password Reset yang khusus; OTP pendaftaran atau tujuan lain tidak boleh diterima untuk Password Reset;
- kata laluan baharu minimum 12 aksara;
- membatalkan semua sesi dan token berkaitan selepas reset berjaya;
- merekodkan audit event;
- menghantar security notification.

Admin-Assisted Account Recovery ialah workflow berasingan apabila pengguna tidak lagi mempunyai akses kepada e-mel yang disahkan.

Password Reset tidak boleh mengaktifkan semula akaun DISABLED atau SUSPENDED.

Fungsi ini tidak boleh dipaparkan atau didokumenkan sebagai tersedia sehingga dilaksanakan dan diuji.

### 6.6 Admin-Assisted Account Recovery

**Status: PENDING IMPLEMENTATION / POLICY DETAIL**

Proses ini berasingan daripada Password Reset biasa.


Ia diperlukan apabila pengguna tidak lagi mempunyai akses kepada e-mel yang telah disahkan.

Prosedur dan kuasa Admin mesti ditentukan melalui spesifikasi dan keputusan yang diluluskan.

Jangan mereka proses pemulihan atau memintas pengesahan identiti secara manual.

### 6.7 Bootstrap Super Admin

**Status: NEEDS VERIFICATION — BLOCKING FOR INITIAL ADMIN SETUP**

Proses bootstrap Super Admin masih belum disahkan berjaya.

Keadaan yang dilaporkan sebelum ini:

Rekod `JUHUD MANAGER`:

- e-mel `al.masri.ent@gmail.com`;
- account status `DISABLED`;
- bootstrap status `PENDING`;
- tiada active password;
- tiada `user_roles`;
- kiraan owner role, super_admin role, password dan email identity aktif ialah sifar.

Rekod berasingan `SUPER ADMIN JUHUD MANAGER`:

- e-mel kosong;
- account status `DISABLED`;
- global email identity berstatus `PENDING`;
- terdapat identity terdahulu berstatus `EXPIRED`;
- registration status `AWAITING_EMAIL_VERIFICATION`.

Ralat aplikasi yang pernah dilaporkan:

- Login atau registration: `Network error interceptor`.
- Owner verification: `The designated bootstrap owner is not eligible for email verification.`

Keadaan ini perlu diperiksa semula kerana ia menggambarkan keadaan pada pemeriksaan terdahulu, bukan pengesahan keadaan terkini.

**Required Resolution**

1. Periksa rekod bootstrap user dan identity semasa.
2. Sahkan designated owner identity.
3. Selesaikan eligibility checks.
4. Sahkan owner email identity.
5. Wujudkan credentials yang sah.
6. Sahkan SUPER_ADMIN role assignment.
7. Sahkan account status dan bootstrap status.
8. Uji SUPER_ADMIN login.
9. Uji global authorization.
10. Rekodkan keadaan akhir dan audit evidence.

Jangan cipta duplicate bootstrap owner atau memintas authorization checks tanpa recovery procedure yang diluluskan.

Bootstrap ialah release blocker.

Country ADMIN creation dan ujian profile update hanya boleh diteruskan selepas bootstrap SUPER_ADMIN berjaya dan disahkan.

Urutan ujian:

1. Bootstrap Super Admin.
2. Pengesahan akses Super Admin.
3. Pembentukan Admin negara.
4. Pengesahan skop Admin negara.
5. Ujian kemas kini profil Ahbab.

---

## 7. Authorization and UAC

**Status: PARTIALLY IMPLEMENTED — NEEDS VERIFICATION**

Asas role dan authorization telah disediakan.

Model core role yang dipersetujui:

- `SUPER_ADMIN`
- `ADMIN`
- `AHBAB`

Amer, Supervisor, Admin Syukbah, Admin Takaza, Deputy, Moderator dan TAFAKUT Assessor ialah functional appointments atau delegation, bukan core role global.

Pengesahan penuh perlu memastikan:

- account status;
- access level;
- core role;
- functional appointment;
- appointment effective dates;
- skop negara dan organisasi;
- hubungan pengguna dengan rekod;
- akses peserta terhadap Takaza;
- akses Amer terhadap Takaza berkaitan;
- skop tindakan Admin;
- kawalan Admin lebih tinggi atau lebih luas;
- kawalan rayuan dan penggantian;
- akses kepada sejarah dan arkib;
- pemisahan visibility dan permission.

Account status, access level, core role, appointment dan resource permission ialah dimensi yang berbeza.

`UAC_MATRIX.md` ialah rujukan reka bentuk. Ia tidak membuktikan setiap permission telah dilaksanakan.

Frontend visibility tidak boleh menggantikan server-side authorization.

---

## 8. Profile and Account Management

**Status: NEEDS VERIFICATION**

Keperluan:

- memisahkan profile data daripada credentials dan account status;
- melindungi National ID dan Passport identity fields;
- menghalang ordinary profile editing daripada mengubah protected identity information;
- merekodkan perubahan profil dan verification history;
- mengekalkan previous dan new values jika berkaitan;
- merekodkan verifier dan timestamp;
- memastikan email change tidak mengaktifkan semula akaun;
- memastikan perubahan profil tidak memberikan access tambahan.

Profile-update workflow penuh perlu diuji selepas bootstrap recovery.

---

## 9. Organization Structure

**Status: DESIGN BASELINE — IMPLEMENTATION NEEDS VERIFICATION**

Keperluan:

- struktur organisasi khusus mengikut negara;
- hubungan penyeliaan Markaz Negara;
- rekod negara kekal berasingan;
- struktur Chief Admin dan Deputy;
- gelaran Faisalah bagi Chief Admin Markaz Negeri;
- administrative scope;
- cross-organization support dengan consent dan skop yang jelas.

Keputusan berikut masih terbuka:

- governance Markaz Negara;
- hierarchy akhir organisasi negara;
- proses pelantikan Chief Admin dan Deputy;
- beberapa perincian delegation.

Cross-organization support memerlukan persetujuan kedua-dua Chief Admin, task, scope, tempoh dan audit.

---

## 10. Syukbah Management

**Status: DESIGN BASELINE — IMPLEMENTATION NEEDS VERIFICATION**

Keperluan:

- Global Baseline Syukbah;
- konfigurasi Syukbah negara;
- Admin Syukbah;
- Deputy appointment dan assigned duties dalam skop yang dibenarkan;
- acting delegation hanya selepas ODR-011 dimuktamadkan dan diluluskan;
- moderator management;
- discussion permissions;
- soft deletion dan audit;
- pemisahan Syukbah daripada CMS.

Peraturan reka bentuk:

- Global Baseline Syukbah diurus oleh SUPER_ADMIN;
- baseline yang sama digunakan oleh negara;
- pengaktifan Syukbah negara tidak semestinya wajib untuk semua negara;
- Admin Syukbah dan Deputy ialah appointment khusus;
- Admin Syukbah secara automatik menjadi Moderator dalam ruang perbincangan Syukbah sendiri;
- Admin Syukbah boleh menambah atau membuang Moderator;
- Moderator tidak mempunyai kuasa mengedit komen orang lain;
- soft deletion perlu mengekalkan audit history.

Keputusan tambahan Country Syukbah approval, Deputy/acting delegation dan eligibility Admin Syukbah masih memerlukan penyelesaian.

---

## 11. Jemaah and Membership

**Status: PARTIALLY IMPLEMENTED — SCHEMA FOUNDATION**

Asas schema Jemaah dan Jemaah Membership telah dilaporkan tersedia.

Belum disahkan sebagai lengkap:

- API pengurusan Jemaah;
- penempatan dan perubahan keahlian;
- pengurusan Mohallah;
- aliran keahlian;
- sejarah keahlian;
- integrasi penuh dengan struktur organisasi;
- skop akses Admin;
- kawalan akses Ahbab terhadap rekod Jemaah.

Jemaah Membership mesti kekal berasingan daripada Takaza Participation.

V2 tidak boleh mewujudkan entiti `Project Member` yang berasingan.

---

## 12. Takaza and Participation

**Status: PARTIALLY IMPLEMENTED — SCHEMA FOUNDATION**

Asas schema Takaza dan Takaza Participation telah disediakan.

Perkara yang belum boleh dianggap lengkap:

- penciptaan Takaza;
- Main/Sub Takaza management;
- had dua peringkat;
- konfigurasi kaedah penyertaan;
- Automatic Inclusion dan pengesahan Admin;
- permohonan sukarela;
- pencalonan Admin;
- Direct Assignment;
- keputusan penyertaan;
- withdrawal;
- removal;
- appeal;
- rejoining;
- capacity management;
- transfer;
- lifecycle dan status transition;
- end-date completion rules;
- cancellation dan Requires Attention integration;
- Main/Sub independent lifecycle.

Status Takaza yang dipersetujui:

- `DRAFT`
- `RELEASED`
- `ACTIVE`
- `ON_HOLD`
- `COMPLETED`
- `CANCELLED`

Kaedah penyertaan:

- `AUTOMATIC_INCLUSION`
- `VOLUNTARY_APPLICATION`
- `ADMIN_NOMINATION`
- `DIRECT_ASSIGNMENT`

Prinsip penting:

- Main dan Sub Takaza maksimum dua peringkat;
- Sub Takaza tidak mempunyai child;
- Main dan Sub mesti berada dalam negara yang sama;
- lifecycle Main dan Sub adalah bebas;
- Jemaah Membership dan Takaza Participation berasingan;
- Automatic Inclusion menghasilkan calon untuk pengesahan Admin;
- penyertaan tidak dianggap sah sebelum pengesahan yang diperlukan;
- perubahan konfigurasi selepas RELEASED atau ACTIVE tidak boleh mengubah penyertaan sedia ada secara retroaktif;
- kapasiti yang diturunkan tidak membuang peserta sedia ada secara automatik;
- WITHDRAWN dan REMOVED kekal sebagai status berbeza;
- transfer dan rejoining mesti mengekalkan sejarah.

Spesifikasi penuh terdapat dalam `JMV2004-Takaza-Management.md`.

Pelaksanaan masih perlu dibuat dan diuji.

---

## 13. Amer Appointment

**Status: PARTIALLY IMPLEMENTED — FOUNDATION**

Asas pelantikan Amer telah disediakan.

Pelaksanaan yang dilaporkan termasuk:

- pelantikan khusus bagi Takaza;
- hubungan appointment dengan peserta, pengguna dan Takaza yang sama;
- composite database constraint;
- domain validation bagi pelantikan dan penggantian;
- rekod pelantikan terdahulu;
- kawalan akses bekas Amer melalui Admin.

Peraturan reka bentuk:

- Amer mesti peserta yang telah disahkan dalam Takaza berkenaan;
- pelantikan boleh dibuat sebelum tarikh rasmi Takaza bermula;
- Takaza tidak perlu menunggu status ACTIVE untuk pelantikan;
- pelantikan memerlukan persetujuan Admin dan individu yang dipilih;
- penggantian memerlukan sebab dan justifikasi Admin kedua;
- Admin yang mengurus Takaza membuat keputusan akhir;
- appointment mempunyai tempoh dan sejarah;
- tamat appointment tidak mengubah lifecycle Takaza;
- tamat appointment ketika Takaza masih ACTIVE tidak menamatkan Takaza.

Asas teknikal pelantikan tidak membuktikan keseluruhan proses persetujuan, justifikasi, notifikasi dan audit telah lengkap.

---

## 14. Supervisor Appointment

**Status: NOT IMPLEMENTED / NEEDS VERIFICATION**

Reka bentuk sementara menetapkan:

- pelantikan oleh Admin;
- persetujuan Admin dan individu yang dipilih;
- rekod appointment;
- pengurusan tempoh;
- audit history.

Tempoh pelantikan buat masa ini mengikuti prinsip Amer.

Skop kuasa, tanggungjawab khusus dan sama ada Supervisor wajib menjadi peserta masih belum diputuskan.

Tiada fungsi tambahan atau permission khas boleh dianggap tersedia tanpa keputusan dan pemeriksaan kod.

---

## 15. KAWAIF

**Status: NOT IMPLEMENTED / NEEDS VERIFICATION**

KAWAIF telah ditetapkan sebagai rekod kelayakan dan pengalaman Ahbab.

Fungsi yang diperlukan:

- pengurusan kategori;
- pengurusan kriteria;
- input Ahbab;
- pengesahan Admin;
- kemas kini oleh Admin;
- sumber dan asas maklumat;
- sejarah perubahan;
- versioning;
- rujukan dalam penilaian kesesuaian Takaza.

Admin boleh mengemas kini maklumat yang hilang atau lapuk dengan merekodkan sumber dan asas perubahan.

KAWAIF ialah rujukan kelayakan dan pengalaman. Ia tidak secara automatik menentukan keputusan TAFAKUT.

Jangan menganggap pengiraan kelayakan telah tersedia hanya kerana maklumat KAWAIF boleh disimpan.

---

## 16. TAFAKUT

**Status: NOT IMPLEMENTED / NEEDS VERIFICATION**

Enjin penilaian TAFAKUT penuh belum disahkan tersedia.

Fungsi reka bentuk yang diperlukan:

- jenis borang;
- templat mengikut jenis dan pusingan;
- versi borang;
- kriteria penilaian;
- dua penilai bebas;
- penyelesaian percanggahan oleh Admin ketiga;
- pusingan tambahan tanpa had tetap;
- dua penilai baharu bagi setiap pusingan tambahan;
- penggantian penilai tanpa memulakan semula kerja yang telah disiapkan;
- penilaian semula;
- pembetulan data;
- keputusan akhir Admin;
- paparan keputusan kepada Ahbab;
- notifikasi;
- sejarah penilaian.

Prinsip reka bentuk:

- setiap pusingan memerlukan dua penilai bebas;
- PASS + PASS menghasilkan keputusan lulus;
- FAIL + FAIL menghasilkan keputusan gagal;
- percanggahan memerlukan Admin ketiga;
- setiap pusingan tambahan menggunakan dua penilai baharu;
- submission yang telah dihantar tidak boleh diubah;
- penilaian semula menghasilkan rekod baharu;
- keputusan akhir Admin boleh berbeza daripada majoriti dengan justifikasi;
- KAWAIF tidak menggantikan keputusan TAFAKUT;
- SUSPEND dan ON_HOLD mempunyai maksud berbeza dan tidak mengubah login atau account status.

Kriteria, pemarkahan dan formula kelayakan tidak boleh direka secara automatik tanpa keputusan yang telah dipersetujui.

---

## 17. Rekod Amal

**Status: NOT IMPLEMENTED / NEEDS VERIFICATION**

Rekod Amal telah ditetapkan sebagai sumber rasmi rekod aktiviti dan pengalaman Ahbab.

Pelaksanaan penuh belum disahkan.

Keperluan:

- pengurusan rekod;
- pengesahan dan pembetulan;
- sejarah;
- hubungan dengan TAFAKUT;
- hubungan dengan laporan;

- kawalan pemilikan dan akses;
- pengiraan kemajuan jika ditetapkan.

Rekod asal dan sejarah pembetulan mesti dikekalkan.

---

## 18. Takaza Events and Attendance

**Status: NOT IMPLEMENTED / NEEDS VERIFICATION**

Reka bentuk membenarkan acara Takaza diwujudkan oleh Admin atau dirujuk daripada rekod Aktiviti Khidmat sedia ada.

Pelaksanaan penuh belum disahkan, termasuk:

- pengurusan acara;
- rujukan kepada rekod sumber;
- jadual acara;
- kehadiran;
- catatan kehadiran;
- perubahan dan pembatalan;
- templat acara;
- sejarah perubahan.

Acara boleh disusun mengikut keperluan Takaza dan tidak terhad kepada bilangan tetap.

Kehadiran tidak boleh digunakan sebagai pengganti status lifecycle Takaza.

Event templates masih memerlukan keputusan.

---

## 19. Percha, Kharguzari and Reports

**Status: NOT IMPLEMENTED / NEEDS VERIFICATION**

Fungsi berikut belum disahkan lengkap:

- penjanaan Percha selepas Bayan Hidayat;
- maklumat Percha;
- pindaan dan versioning Percha;
- cadangan pindaan oleh Admin;
- kelulusan pindaan oleh Admin yang berlainan;
- Kharguzari individu;
- komen susulan;
- laporan penuh Amer;
- status laporan `OVERDUE`;
- lanjutan masa laporan;
- syarat penyelesaian Takaza.

Prinsip reka bentuk:

- Percha dijana selepas Bayan Hidayat;
- pindaan Percha memerlukan cadangan Admin dan kelulusan Admin berlainan;
- versi asal dan sejarah pindaan dikekalkan;
- Kharguzari perlu disediakan sehari sebelum Bayan Wapsi;
- rekod asal Kharguzari tidak boleh diubah melalui komen susulan;
- laporan penuh Amer ialah syarat penyelesaian Takaza;
- laporan yang belum dihantar tidak membenarkan Takaza menjadi COMPLETED;
- lanjutan masa tidak memadamkan due date asal;
- tiada auto-completion hanya kerana tarikh tamat telah tiba.

Laporan operasi Takaza mesti kekal berasingan daripada Juhud Reports CMS dan Annual Archive.

---

## 20. Comments and Discussion

**Status: NOT IMPLEMENTED / NEEDS VERIFICATION**

Keperluan reka bentuk:

- komen disimpan berasingan daripada rekod asal;
- penulis boleh mengemas kini komen sendiri mengikut kebenaran;
- sejarah perubahan dikekalkan;
- akses dikawal melalui UAC;
- Moderator mempunyai kuasa yang ditetapkan untuk ruang perbincangan Syukbah;
- Moderator tidak secara automatik mempunyai kuasa mengubah komen orang lain;
- CMS dan perbincangan bukan modul yang sama;
- soft deletion mengekalkan rekod audit.

Pelaksanaan penuh belum disahkan.

---

## 21. Notifications

**Status: PARTIALLY IMPLEMENTED — NEEDS VERIFICATION**

Penghantaran e-mel untuk proses pengesahan akaun telah disediakan pada skop yang dilaporkan.

Notifikasi modul perniagaan masih perlu disahkan, termasuk:

- pelantikan dan penggantian;
- permohonan penyertaan;
- TAFAKUT;
- keputusan akhir;
- withdrawal dan removal;
- appeal;
- laporan dan aktiviti;
- perubahan penting Takaza;
- perubahan status akaun;
- security notification.

Notifikasi perlu menggunakan bahasa pilihan pengguna.

Peringatan automatik dan deadline tambahan tidak boleh dianggap tersedia tanpa keputusan dan pelaksanaan khusus.

---

## 22. Case Management

**Status: ON HOLD**

Reka bentuk menetapkan bahawa pembatalan Takaza menghasilkan rekod `Requires Attention` secara automatik.

Perkara yang telah dipersetujui:

- kes mengenal pasti Takaza dan Ahbab terjejas;
- penyertaan peserta tidak dibatalkan secara automatik;
- Admin mengurus tindakan terhadap peserta secara berasingan;
- sejarah dan rekod berkaitan dikekalkan.

Aliran kerja penuh Case Management masih ON HOLD, termasuk:

- assignment;
- tindakan;
- status;
- resolusi;
- penutupan;
- audit;
- notifikasi;
- escalation.

Jangan menganggap keseluruhan Case Management tersedia hanya kerana rekod Requires Attention boleh diwujudkan.

---

## 23. Annual Archive and Reporting

**Status: NOT IMPLEMENTED / NEEDS VERIFICATION**

Keperluan reka bentuk:

- arkib Takaza mengikut tahun;
- akses mengikut skop Admin;
- akses Ahbab berdasarkan penyertaan terdahulu;
- statistik Main/Sub Takaza;
- statistik peserta dan status;
- penapis negara, tahun dan status;
- ringkasan negara;
- ringkasan Main Takaza;
- ringkasan Sub Takaza;
- status ringkasan `DRAFT`, `INTERIM`, `FINAL`;
- catatan Admin;
- sejarah pindaan.

Perkara yang masih pending:

- polisi pembetulan Annual Archive;
- penapis Main Takaza;
- prosedur pembetulan data sejarah.

Tiada PDF atau Excel export dalam baseline semasa.

Annual Summary ialah rekod ringkasan berasingan daripada transaksi operasi Takaza.

---

## 24. Juhud Reports CMS

**Status: NOT IMPLEMENTED / NEEDS VERIFICATION**

Juhud Reports ialah modul penerbitan berasingan daripada laporan operasi Takaza dan Annual Archive.

Keperluan reka bentuk:

- penciptaan laporan;
- penyimpanan DRAFT;
- pengeditan mengikut kebenaran;
- penerbitan;
- pengarkiban;
- pengurusan audience visibility;
- attachment handling;
- audit penerbitan dan perubahan.

ADMIN yang mempunyai publishing permission boleh menerbitkan laporan tanpa kelulusan SUPER_ADMIN.

Pelaksanaan penuh belum disahkan.

---

## 25. Audit and History

**Status: PARTIALLY IMPLEMENTED — NEEDS COMPLETENESS VERIFICATION**

Asas audit telah disediakan.

Pelaksanaan audit penuh perlu meliputi semua tindakan penting, termasuk:

- perubahan profil;
- perubahan akaun;
- perubahan role dan skop;
- perubahan Jemaah;
- penyertaan Takaza;
- pelantikan Amer dan Supervisor;
- TAFAKUT;
- KAWAIF;
- withdrawal, removal dan appeal;
- capacity dan transfer;
- laporan dan lanjutan masa;
- Percha;
- arkib dan ringkasan tahunan;
- penerbitan Juhud Reports;
- perubahan konfigurasi;
- tindakan bootstrap dan security recovery.

Kewujudan jadual audit tidak membuktikan setiap tindakan telah menghasilkan rekod audit yang betul.

Audit mesti mengekalkan actor, timestamp, old/new values dan reason apabila diwajibkan.

---

## 26. Frontend and Integration

**Status: NEEDS VERIFICATION**

Direktori `v2/web/` telah disediakan.

Pengesahan diperlukan bagi:

- halaman pendaftaran dan login;
- pengesahan OTP;
- dashboard mengikut access level dan role;
- profil Ahbab;
- fungsi Admin;
- pengurusan Jemaah;
- pengurusan Takaza;
- penyertaan;
- TAFAKUT;
- KAWAIF;
- laporan;
- notifikasi;
- integrasi API;
- authorization pada frontend dan backend;
- responsive layout;
- navigation berdasarkan appointment dan scope.

Paparan frontend tidak boleh menjadi satu-satunya kawalan keselamatan.

Backend mesti mengesahkan setiap tindakan.

---

## 27. Automated Tests and Build

**Status: REPORTED PASS — SCOPE LIMITED**

Keputusan ujian yang dilaporkan sebelum ini:

- `npm test`: 94/94 tests passed;
- GitHub Actions build and test: success;
- Worker dry-run/build: pernah dilaporkan berjaya;
- Worker health: success;
- D1 connection: success.

Keputusan tersebut ialah hasil yang dilaporkan pada pemeriksaan terdahulu. Ia bukan pengesahan semula pada tarikh dokumen ini.

Ujian ini mengesahkan skop yang diuji sahaja.

Ia tidak membuktikan:

- semua modul perniagaan lengkap;
- semua API production berfungsi;
- semua authorization betul;
- semua aliran frontend berfungsi;
- semua migration remote sepadan;
- bootstrap Super Admin berjaya;
- deployment V1 dan V2 lengkap;
- Password Reset tersedia.

Ujian perlu dikembangkan seiring pelaksanaan modul.

### 27.1 Required Test Coverage

Ujian seterusnya perlu meliputi:

1. Authentication integration tests.
2. Bootstrap SUPER_ADMIN tests.
3. Server-side authorization tests.
4. Cross-country access tests.
5. Account disablement dan session revocation tests.
6. OTP abuse dan rate-limit tests.
7. Password Reset tests selepas pelaksanaan.
8. Database migration consistency.
9. Frontend dan API integration tests.
10. Profile update dan protected identity tests.
11. Takaza participation workflow.
12. Amer appointment workflow.
13. TAFAKUT independence dan decision workflow.
14. Audit completeness.
15. Production smoke tests.
16. V1/V2 deployment separation tests.

### 27.2 Development Environment Note

Persekitaran Android Termux pernah menghadapi isu platform `workerd` ketika menjalankan build secara tempatan.

GitHub Actions merupakan laluan build dan test yang digunakan untuk pengesahan projek.

Kegagalan platform Android tidak boleh disalah anggap sebagai kegagalan build production.

---

## 28. Current Known Blockers and Risks

| Item | Status | Impact |
|---|---|---|
| Bootstrap Super Admin | NEEDS VERIFICATION | Pentadbiran awal belum boleh dianggap selesai |
| Password Reset | NOT IMPLEMENTED | Pemulihan kata laluan belum tersedia |
| Admin-assisted recovery | PENDING IMPLEMENTATION / POLICY DETAIL | Pemulihan e-mel tidak boleh dianggap tersedia |
| Full UAC enforcement | NEEDS VERIFICATION | Risiko akses tanpa kebenaran |
| V1/V2 deployment | NEEDS VERIFICATION | Pengasingan deployment perlu diuji |
| Full Takaza workflow | NOT IMPLEMENTED / NEEDS VERIFICATION | Operasi Takaza belum lengkap |
| KAWAIF and TAFAKUT | NOT IMPLEMENTED / NEEDS VERIFICATION | Penilaian kelayakan belum lengkap |
| Rekod Amal | NOT IMPLEMENTED / NEEDS VERIFICATION | Rekod aktiviti belum lengkap |
| Case Management | ON HOLD | Pengurusan kes belum lengkap |
| Frontend integration | NEEDS VERIFICATION | Pengalaman pengguna belum disahkan |
| Production integration | NEEDS VERIFICATION | Ujian end-to-end masih diperlukan |
| Audit completeness | NEEDS VERIFICATION | Semua tindakan penting belum disahkan menghasilkan audit |
| Juhud Reports CMS | NOT IMPLEMENTED / NEEDS VERIFICATION | Penerbitan laporan belum lengkap |

---

# PART B — IMPLEMENTATION ROADMAP

## 29. Roadmap Principles

Pembangunan mesti mengikuti prinsip berikut:

- selesaikan critical blockers sebelum mengembangkan fungsi lain;
- selesaikan bootstrap dan authentication asas;
- kuatkuasakan authorization sebelum membuka operasi pentadbiran;
- kekalkan pemisahan V1 dan V2;
- pelihara data dan sejarah;
- elakkan schema changes yang belum diluluskan;
- kekalkan migration discipline;
- laksanakan backend validation sebelum bergantung kepada frontend controls;
- kemas kini ujian dan dokumentasi bersama setiap perubahan besar;
- jangan mengisytiharkan fungsi lengkap tanpa bukti;
- jangan anggap keputusan reka bentuk sebagai bukti implementation.

---

## 30. Phase 0 — Repository and Environment Stabilization

**Priority: CRITICAL**

**Tasks:**

1. Confirm V1 and V2 directory separation.
2. Confirm separate Wrangler configurations.
3. Confirm separate Worker names.
4. Confirm separate D1 database bindings and IDs.
5. Verify GitHub Actions deployment workflows.
6. Verify Pages deployment paths.
7. Confirm migration history.
8. Verify production health.
9. Preserve historical packages and documentation until audited.
10. Verify backup branch and V1 preservation tag.
11. Review repository documentation and remove duplicate sources of truth only after approval.

**Exit criteria:**

- V1 and V2 remain independently deployable.
- No accidental V1 deployment from V2 workflow.
- No accidental V2 deployment from V1 workflow.
- Database and Worker configuration are confirmed.
- Pages routes and assets work correctly.
- Repository structure and documentation are consistent.

---

## 31. Phase 1 — Bootstrap and Authentication

**Priority: CRITICAL**

**Tasks:**

1. Resolve bootstrap SUPER_ADMIN.
2. Verify owner email identity.
3. Verify password and role assignment.
4. Verify SUPER_ADMIN login.
5. Verify global authorization.
6. Verify Country ADMIN creation.
7. Verify account status enforcement.
8. Verify OTP policy.
9. Verify session lifetime and revocation.
10. Implement Password Reset.
11. Define and implement separate Admin-assisted recovery.
12. Verify profile update and protected identity fields.


**Exit criteria:**

- Bootstrap SUPER_ADMIN works.
- No duplicate or ambiguous bootstrap identity remains.
- Country ADMIN can be created within authorized scope.
- Account and session controls pass tests.
- Password Reset passes full security tests.
- Disabled or suspended accounts are not automatically reactivated.
- Profile changes preserve verification and audit history.

---

## 32. Phase 2 — Authorization and Organization

**Priority: HIGH**

**Tasks:**

1. Complete UAC enforcement.
2. Implement country scope.
3. Implement organization hierarchy.
4. Implement Chief Admin and Deputy structure within confirmed requirements. Unresolved appointment, succession and acting authority rules under ODR-009 must not be assumed or implemented.
5. Implement cross-organization support.
6. Resolve pending governance decisions.
7. Implement Admin Markaz scope.
8. Verify Dashboard navigation against permissions.
9. Test access denial across country and organization boundaries.

**Exit criteria:**

- No unauthorized cross-country access.
- Administrative roles remain distinct.
- Organization scope is enforced by the backend.
- Dashboard actions match actual authorization.
- Cross-organization support is consent-based, time-limited and auditable.

---

## 33. Phase 3 — Syukbah Management

**Priority: HIGH**

**Tasks:**

1. Implement Global Baseline Syukbah.
2. Implement country Syukbah activation.
3. Implement Admin Syukbah.
4. Implement Deputy appointment and explicitly assigned duties only. Acting authority must remain disabled until ODR-011 is finalized and approved.
5. Implement moderator management.
6. Implement discussion permissions.
7. Implement soft deletion and audit.
8. Resolve additional Syukbah approval rules.

**Exit criteria:**

- Syukbah is independent of organization hierarchy.
- Admin and Moderator permissions are enforced.
- Discussion and CMS remain separate.
- Delegation and moderation actions are auditable.

---

## 34. Phase 4 — Jemaah and Takaza Participation

**Priority: HIGH**

**Tasks:**

1. Implement Jemaah Membership.
2. Implement Main and Sub Takaza.
3. Enforce two-level hierarchy.
4. Implement Takaza lifecycle.
5. Implement four participation methods.
6. Implement Admin confirmation.
7. Implement capacity rules.
8. Implement withdrawal.
9. Implement removal and appeal.
10. Implement transfer.
11. Implement rejoining and linked history.
12. Ensure no separate V2 Project Member entity exists.
13. Implement cancellation and Requires Attention integration.

**Exit criteria:**

- Membership and participation remain separate.
- Every participant has a valid participation record.
- Main and Sub Takaza operate independently.
- Participation history is retained.
- Capacity changes do not automatically remove existing participants.
- Withdrawal and removal remain distinct.
- Appeal does not erase original removal history.

---

## 35. Phase 5 — KAWAIF and TAFAKUT

**Priority: HIGH**

**Tasks:**

1. Implement KAWAIF records.
2. Implement Admin verification.
3. Implement KAWAIF configuration.
4. Implement TAFAKUT form types.
5. Implement template versioning.
6. Implement assessor assignment.
7. Enforce two independent assessors.
8. Implement disagreement and third Admin.
9. Implement new assessors for additional rounds.
10. Implement immutable submission.
11. Implement Ahbab and assessor form workflows.
12. Implement final Admin decision and justification.
13. Implement notifications and decision visibility.
14. Implement reassessment and historical records.

**Exit criteria:**

- Assessment independence is enforced.
- Old assessment versions remain available.
- Decisions and justifications are auditable.
- KAWAIF does not automatically determine TAFAKUT outcome.
- No assessor can alter a submitted assessment.

---

## 36. Phase 6 — Amer, Supervisor and Events

**Priority: HIGH**

**Tasks:**

1. Complete Amer appointment workflow.
2. Enforce confirmed participation prerequisite.
3. Implement Admin and candidate consent.
4. Implement appointment duration and replacement.
5. Implement expiry and notification.
6. Resolve Supervisor authority and eligibility.
7. Implement Supervisor appointment.
8. Implement flexible event scheduling.
9. Implement event reuse and creation.
10. Implement attendance and remarks.

**Exit criteria:**

- Amer must be a confirmed participant in the same Takaza before appointment becomes effective.
- Appointment may occur before the official start date.
- Consent and audit rules are enforced.
- Supervisor permissions follow approved decisions.
- Events and attendance are linked to the correct Takaza.
- Appointment expiry does not automatically alter Takaza lifecycle.

---

## 37. Phase 7 — Percha, Kharguzari and Reporting

**Priority: HIGH**

**Tasks:**

1. Generate Percha after Bayan Hidayat.
2. Implement amendment proposal and independent approval.
3. Implement Kharguzari.
4. Implement individual Kharguzari access.
5. Implement immutable original records.
6. Implement follow-up comments.
7. Implement Amer report.
8. Implement overdue and extension behavior.
9. Enforce completion conditions.
10. Implement Annual Archive.
11. Implement Annual Summary.
12. Keep Juhud Reports separate.

**Exit criteria:**

- Percha amendments are independently approved.
- Original Kharguzari records remain preserved.
- Amer report is mandatory for completion.
- Archive access is scope-controlled.
- Annual Summary remains separate from operational records.
- No Takaza is automatically completed while required reports remain outstanding.

---

## 38. Phase 8 — Case Management and Hardening

**Priority: AFTER CORE WORKFLOWS**

**Tasks:**

1. Define full Case Management specification.
2. Implement case ownership and assignment.
3. Implement case status and resolution.
4. Implement escalation and notifications.
5. Implement case audit.
6. Review security controls.
7. Review rate limits.
8. Review database integrity.
9. Run full regression tests.
10. Perform production smoke tests.
11. Update operational documentation.

**Exit criteria:**

- Case Management follows an approved specification.
- No unresolved critical security defect.
- All release gates pass.
- Audit and notification behavior is verified.

---

## 39. Release Gates

Production release must not be considered complete until the relevant gates are satisfied.

### Gate A — Identity and Bootstrap

- Bootstrap owner verified.
- SUPER_ADMIN role verified.
- Login tested.
- No duplicate or ambiguous bootstrap identity.
- Account status and owner verification are consistent.

### Gate B — Authorization

- Backend role checks verified.
- Country scope verified.
- Administrative scope verified.
- Cross-scope denial tested.
- Account disablement enforcement tested.
- Functional appointment permissions tested.

### Gate C — Database

- Migrations reviewed.
- Migration order confirmed.
- Production database state verified.
- Backup and recovery plan considered.
- No unauthorized schema change.
- V1 and V2 databases remain separate.

### Gate D — Security

- OTP limits tested.
- Session revocation tested.
- Password handling reviewed.
- Password Reset tested after implementation.
- Protected identity fields verified.
- Audit records verified.
- Disabled and suspended account behavior verified.

### Gate E — Deployment

- V1 Worker remains separate.
- V2 Worker remains separate.
- Pages paths are correct.
- Production environment variables are correct.
- Health endpoint and database connectivity verified.
- Deployment workflows use the intended directories and configurations.

### Gate F — Functional Tests

- Required workflows tested.
- Negative authorization tests passed.
- Relevant integration tests passed.
- Regression tests passed.
- Frontend and backend integration verified.
- No unresolved critical blocker.

---

## 40. Non-Negotiable Requirements

The following must not be violated during implementation:

1. No separate V2 Project Member entity.
2. Jemaah Membership and Takaza Participation remain separate.
3. Amer must already be a confirmed participant in the same Takaza before appointment becomes effective.
4. Amer appointment may occur before the official Takaza start date.
5. Supervisor authority must not be invented.
6. `WITHDRAWN` and `REMOVED` remain distinct.
7. Account `DISABLED` cannot be overridden by LIMITED access.
8. Password Reset requires verified email OTP and revocation of all existing sessions and tokens.
9. Password Reset and email change must not reactivate a disabled or suspended account.
10. No Takaza completion without the required Amer report.
11. Main and Sub Takaza lifecycle remain independent.
12. Historical records must be preserved.
13. Frontend visibility is not authorization.
14. No implementation status may be overstated without evidence.
15. No production migration or deployment is authorized by this document alone.
16. V1 and V2 must retain separate Workers and databases.
17. Pending decisions must not be implemented as approved requirements.
18. Changes to approved requirements must follow the decision-control process.

---

## 41. Maintenance and Evidence

Dokumen ini perlu dikemas kini apabila:

- fungsi baharu dilaksanakan;
- ujian baharu lulus;
- deployment disahkan;
- migration digunakan;
- isu pelaksanaan ditemui;
- status fungsi berubah;
- spesifikasi reka bentuk berubah;
- keputusan dalam Master Decision Register berubah;
- blocker diselesaikan.

Setiap perubahan status perlu disertakan:

- tarikh pengesahan;
- skop yang diperiksa;
- bukti kod atau migration;
- ujian yang dijalankan;
- environment yang terlibat;
- keputusan dan isu yang masih berbaki.

Setiap fungsi hanya boleh dinaik taraf kepada `IMPLEMENTED` apabila bukti yang sesuai tersedia.

Bukti boleh merangkumi:

1. kod atau API yang berkaitan;
2. schema dan migration jika diperlukan;
3. ujian automatik;
4. ujian integrasi;
5. ujian authorization;
6. pengesahan UI jika melibatkan frontend;
7. pengesahan deployment jika melibatkan production.

Contoh:

`IMPLEMENTED — SCHEMA FOUNDATION`

tidak boleh ditukar kepada:

`IMPLEMENTED — FULL WORKFLOW`

tanpa bukti tambahan.

Status `DEPLOYED` mesti menyatakan environment yang telah disahkan.

Status `REPORTED PASS` mesti dikekalkan sehingga ujian dijalankan semula atau bukti terkini diperoleh.

### 41.1 Related Documents

Dokumen ini mesti kekal selaras dengan:

- `MASTER_DECISION_REGISTER.md`
- `MODULE_REQUIREMENTS.md`
- `OPEN_DECISIONS_REGISTER.md`
- `V2_DESIGN_CHECKPOINT.md`
- `AUTH.md`
- `UAC_MATRIX.md`
- `DASHBOARD_NAVIGATION_SPEC_V2.md`
- `JMV2001-Ahbab-Profile-Account-Management.md`
- `JMV2002-Organization-Structure-Governance.md`
- `JMV2003-Syukbah-Management.md`
- `JMV2004-Takaza-Management.md`
- `REPOSITORY_DISPOSITION.md`

Spesifikasi modul menentukan keperluan dan tingkah laku. Master Decision Register menentukan keputusan. Dokumen ini menentukan status pelaksanaan dan roadmap.

---

Document Status: WORKING BASELINE — Implementation Tracking  
Version: 3.0  
Last Updated: 28 November 2026  
Next Review: After repository, bootstrap and deployment verification.

End of Document.

