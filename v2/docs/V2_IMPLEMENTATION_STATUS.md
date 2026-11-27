# JUHUDMANAGER V2 — IMPLEMENTATION STATUS

**Document ID**: JMV2-IMP-001
**Version**: 2.1
Status: WORKING BASELINE — Implementation Tracking
Last Updated: 27 November 2026
Suggested Filename: "V2_IMPLEMENTATION_STATUS.md"
Repository Path: "v2/docs/V2_IMPLEMENTATION_STATUS.md"

---

## 1. Purpose

Dokumen ini merekodkan status pelaksanaan sebenar JuhudManager V2 berdasarkan bukti kod, migration, ujian dan deployment yang telah dilaporkan atau disahkan.

Dokumen ini membezakan:

- fungsi yang telah dilaksanakan;
- asas teknikal yang telah tersedia tetapi belum lengkap sebagai aliran kerja;
- fungsi yang belum dilaksanakan;
- fungsi yang sedang dibangunkan;
- fungsi yang memerlukan pengesahan lanjut;
- fungsi yang ditangguhkan atau berada dalam status ON HOLD.

Keputusan reka bentuk yang telah dipersetujui tidak boleh dianggap sebagai fungsi yang telah tersedia sehingga pelaksanaannya disahkan.

Dokumen ini ialah rekod status kerja. Ia bukan pengganti kepada spesifikasi modul atau Master Decision Register.

2. Status Labels

Status| Meaning
"IMPLEMENTED"| Pelaksanaan telah disahkan pada skop yang dinyatakan.
"PARTIALLY IMPLEMENTED"| Sebahagian fungsi tersedia, tetapi belum lengkap.
"IN PROGRESS"| Pelaksanaan sedang berjalan.
"NOT IMPLEMENTED"| Belum dilaksanakan.
"NEEDS VERIFICATION"| Perlu pemeriksaan kod, ujian atau persekitaran.
"ON HOLD"| Kerja ditangguhkan sementara.
"DEPRECATED"| Pelaksanaan atau pendekatan lama tidak lagi digunakan.
"NOT APPLICABLE"| Tidak berkaitan dengan skop berkenaan.
"REPORTED PASS"| Keputusan lulus telah dilaporkan tetapi belum semestinya disahkan semula.
"DEPLOYED"| Telah disahkan dalam persekitaran yang dinyatakan.

Status mesti menyatakan skop sebenar.

Contohnya, "IMPLEMENTED — SCHEMA FOUNDATION" tidak bermaksud keseluruhan workflow modul telah lengkap.

"REPORTED PASS" tidak sama dengan pengesahan terkini.

3. Repository and Architecture

3.1 V1/V2 Separation

Status: PARTIALLY IMPLEMENTED — NEEDS FINAL VERIFICATION

Kerja pemisahan V1 dan V2 telah disediakan pada branch:

"integration/v1-v2-separation-develop"

Struktur yang disediakan:

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

Perkara yang telah disediakan dalam kerja pemisahan:

- direktori V1 dan V2;
- konfigurasi Worker V1 dan V2 yang berasingan;
- workflow deployment V1 dan V2 yang diasingkan;
- struktur Pages yang menggabungkan output V1 dan V2;
- dokumentasi asas pemisahan;
- workflow migration V2 yang berasingan.

Pemisahan fail dan konfigurasi tidak dengan sendirinya membuktikan semua deployment berfungsi.

Pengesahan akhir diperlukan bagi:

- V1 Worker deployment;
- V1 Pages deployment;
- V2 Worker deployment;
- V2 Pages deployment;
- laluan aplikasi dan aset;
- workflow GitHub Actions;
- konfigurasi production;
- kesinambungan fungsi V1 selepas pemindahan.

Pemisahan pada integration branch tidak bermaksud perubahan telah digabungkan ke branch production.

3.2 V1 Preservation

Status: NEEDS VERIFICATION

V1 telah dipindahkan ke struktur "v1/" pada branch integrasi.

Backup branch dan tag pemeliharaan V1 telah disediakan sebelum kerja pemisahan.

Pengesahan akhir perlu memastikan:

- source V1 lengkap;
- konfigurasi Worker dan Pages betul;
- database V1 tidak berubah;
- fungsi V1 masih boleh dibina dan digunakan;
- deployment V1 tidak bergantung kepada laluan lama;
- workflow V1 tidak menggunakan konfigurasi V2.

V1 tidak boleh dianggap selamat untuk ditinggalkan atau diarkibkan sepenuhnya sehingga pengesahan ini selesai.

3.3 V2 Isolation

Status: IMPLEMENTED — FOUNDATION

V2 mempunyai:

- direktori aplikasi tersendiri;
- konfigurasi Wrangler tersendiri;
- direktori migration tersendiri;
- database D1 khusus V2;
- Worker berasingan daripada V1.

V2 tidak boleh menggunakan database produksi V1.

3.4 Branch and Repository Controls

Status: NEEDS VERIFICATION

Branch integrasi semasa:

"integration/v1-v2-separation-develop"

Pengesahan sebelum merge perlu merangkumi:

- tiada unresolved merge conflict;
- perubahan staged dan unstaged telah disemak;
- workflow deployment menggunakan path yang betul;
- tiada fail V1 atau V2 yang tertinggal;
- tiada konfigurasi sensitif dimasukkan ke repository;
- backup dan tag V1 masih tersedia.

---

4. Cloudflare Worker and Database Foundation

4.1 Worker

Status: IMPLEMENTED — FOUNDATION

Maklumat konfigurasi V2 yang direkodkan:

Item| Value
Worker| "juhudmanager-v2-api"
Main entry| "src/index.js"
Configuration| "v2/wrangler.jsonc"
D1 binding| "DB"
Compatibility date| "2026-11-20"

Health endpoint pernah memberikan keputusan:

- status "ok";
- service "juhudmanager-v2-api";
- environment production;
- database connected.

Keputusan tersebut ialah pengesahan pada masa pemeriksaan terdahulu.

Ia bukan jaminan bahawa semua API, authorization dan modul perniagaan telah berfungsi.

4.2 D1 Database

Status: IMPLEMENTED — FOUNDATION

Database V2:

- Database name: "juhudmanager-v2-db"
- Database ID: "4a4e736b-83ee-4889-bfbb-7fe189f92b5f"

Migration yang dilaporkan telah digunakan sehingga:

"0021_super_admin_owner_verification.sql"

Migration 0021 dilaporkan berjaya digunakan pada 26 November 2026.

Jumlah jadual yang dilaporkan selepas migration tersebut ialah 33.

Pengesahan akhir masih perlu memastikan:

- migration history sepadan dengan fail migration dalam repo;
- struktur remote sepadan dengan struktur yang dijangka;
- semua foreign key dan constraint berfungsi;
- tiada migration yang tertinggal;
- data dan trigger berkaitan berada dalam keadaan konsisten;
- migration V2 tidak pernah diarahkan kepada database V1.

4.3 Migration Safety

Status: IMPLEMENTED — PROCESS FOUNDATION

Migration V2 mesti:

- menggunakan database V2 sahaja;
- dikendalikan melalui workflow yang mempunyai kawalan pengesahan;
- mengekalkan migration history;
- tidak menggunakan database V1;
- diuji sebelum digunakan pada production;
- mempunyai prosedur pemulihan yang sesuai.

Workflow migration yang tersedia tidak bermaksud setiap migration telah melalui pengesahan penuh semua kes penggunaan.

---

5. Database Schema Foundation

Status: PARTIALLY IMPLEMENTED

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

Kewujudan schema tidak bermaksud semua fungsi pengurusan dan aliran kerja modul telah lengkap.

Pengesahan diperlukan bagi setiap jadual, foreign key, index, trigger dan domain constraint sebelum status dinaik taraf.

---

6. Authentication and Account Foundation

6.1 Registration

Status: PARTIALLY IMPLEMENTED

Asas pendaftaran melalui e-mel dan pengesahan OTP telah dilaksanakan pada skop yang dilaporkan.

Peraturan reka bentuk:

- OTP enam digit;
- tempoh sah lima minit;
- maksimum lima percubaan;
- tempoh resend 60 saat;
- identity reservation 15 minit;
- kata laluan minimum 12 aksara.

Pengesahan keseluruhan aliran pendaftaran, termasuk kes khas dan bootstrap owner, masih diperlukan.

6.2 Email OTP and Activation

Status: PARTIALLY IMPLEMENTED — NEEDS PRODUCTION VERIFICATION

Asas penghantaran OTP dan pengaktifan akaun melalui e-mel telah disediakan.

Sender yang digunakan:

"noreply@m.juhud.run.place"

Penghantaran dan pengesahan OTP perlu diuji semula dalam keadaan production, termasuk:

- kegagalan penghantaran;
- OTP tamat tempoh;
- percubaan berulang;
- resend cooldown;
- OTP digunakan lebih daripada sekali;
- OTP untuk tujuan transaksi berbeza;
- identity reservation tamat tempoh.

6.3 Login and Sessions

Status: PARTIALLY IMPLEMENTED

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
- logout dan logout semua sesi.

6.4 Email Change

Status: NEEDS VERIFICATION

Reka bentuk membenarkan proses pertukaran e-mel bagi akaun "FULL", "LIMITED" dan "DISABLED", tertakluk kepada pengesahan identiti dan OTP.

Kebenaran menukar e-mel tidak mengaktifkan semula akaun atau memberikan akses tambahan.

Pelaksanaan keseluruhan perlu disahkan.

6.5 Password Reset / Forgot Password

<text weight="semibold" color="danger">Status: NOT IMPLEMENTED — REQUIRED</text>

Fungsi Password Reset / Forgot Password belum dilaksanakan.

Keperluan yang telah dipersetujui:

- menggunakan e-mel berdaftar dan telah disahkan;
- OTP enam digit;
- tempoh sah lima minit;
- maksimum lima percubaan;
- resend cooldown 60 saat;
- OTP sekali guna dan terasing mengikut tujuan;
- kata laluan baharu minimum 12 aksara;
- membatalkan semua sesi dan token berkaitan selepas reset berjaya;
- merekodkan audit event;
- menghantar security notification.

Admin-Assisted Account Recovery ialah workflow berasingan apabila pengguna tidak lagi mempunyai akses kepada e-mel yang disahkan.

Fungsi ini tidak boleh dipaparkan atau didokumenkan sebagai tersedia sehingga dilaksanakan dan diuji.

6.6 Bootstrap Super Admin

Status: NEEDS VERIFICATION — BLOCKING FOR INITIAL ADMIN SETUP

Proses bootstrap Super Admin masih belum disahkan berjaya.

Keadaan yang dilaporkan sebelum ini menunjukkan:

- rekod bootstrap owner belum mempunyai role Super Admin aktif;
- akaun berkaitan berada dalam status "DISABLED";
- identiti e-mel masih mempunyai status pengesahan yang belum selesai;
- proses owner verification pernah gagal dengan mesej bahawa designated bootstrap owner tidak layak untuk pengesahan e-mel.

Keadaan ini perlu diselesaikan dan diuji sebelum aliran pentadbiran awal dianggap berfungsi.

Urutan ujian yang dirancang:

1. Bootstrap Super Admin.
2. Pengesahan akses Super Admin.
3. Pelantikan atau pembentukan Admin negara.
4. Pengesahan skop Admin negara.
5. Ujian kemas kini profil Ahbab.

Jangan menganggap bootstrap selesai hanya kerana migration atau jadual berkaitan telah diwujudkan.

---

7. Authorization and UAC

Status: PARTIALLY IMPLEMENTED — NEEDS VERIFICATION

Asas role dan authorization telah disediakan.

Model core role yang dipersetujui:

- "SUPER_ADMIN"
- "ADMIN"
- "AHBAB"

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
- pemisahan antara visibility dan permission.

UAC Matrix ialah rujukan reka bentuk. Ia tidak membuktikan setiap permission telah dilaksanakan.

---

8. Jemaah and Membership

Status: PARTIALLY IMPLEMENTED — SCHEMA FOUNDATION

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

---

9. Takaza and Participation

Status: PARTIALLY IMPLEMENTED — SCHEMA FOUNDATION

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

Spesifikasi penuh telah diselaraskan dalam "JMV2004-Takaza-Management.md".

Pelaksanaannya masih perlu dibuat dan diuji.

---

10. Amer Appointment

Status: PARTIALLY IMPLEMENTED — FOUNDATION

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
- Takaza tidak perlu menunggu status "ACTIVE" untuk pelantikan;
- pelantikan memerlukan persetujuan Admin dan individu yang dipilih;
- penggantian memerlukan sebab dan justifikasi Admin kedua;
- Admin yang mengurus Takaza membuat keputusan akhir;
- appointment mempunyai tempoh dan sejarah;
- tamat appointment tidak mengubah lifecycle Takaza.

Asas teknikal pelantikan tidak membuktikan keseluruhan proses persetujuan, justifikasi, notifikasi dan audit telah lengkap.

---

11. Supervisor Appointment

Status: NOT IMPLEMENTED / NEEDS VERIFICATION

Reka bentuk sementara menetapkan prinsip pelantikan dengan persetujuan Admin dan individu yang dipilih.

Tempoh pelantikan buat masa ini mengikuti prinsip Amer.

Skop kuasa, tanggungjawab khusus dan sama ada Supervisor wajib menjadi peserta masih belum diputuskan.

Tiada fungsi tambahan boleh dianggap tersedia tanpa pemeriksaan kod dan keputusan yang diluluskan.

---

12. KAWAIF

Status: NOT IMPLEMENTED / NEEDS VERIFICATION

KAWAIF telah ditetapkan sebagai rekod kelayakan dan pengalaman Ahbab.

Fungsi yang diperlukan tetapi belum disahkan lengkap:

- pengurusan kategori;
- pengurusan kriteria;
- input Ahbab;
- pengesahan Admin;
- kemas kini oleh Admin;
- sumber dan asas maklumat;
- sejarah perubahan;
- versioning;
- rujukan dalam penilaian kesesuaian Takaza.

Jangan menganggap pengiraan kelayakan telah tersedia hanya kerana maklumat KAWAIF boleh disimpan.

---

13. TAFAKUT

Status: NOT IMPLEMENTED / NEEDS VERIFICATION

Enjin penilaian TAFAKUT penuh belum disahkan tersedia.

Fungsi reka bentuk yang diperlukan termasuk:

- jenis borang;
- templat mengikut jenis dan pusingan;
- versi borang;
- kriteria penilaian;
- dua penilai bebas;
- penyelesaian percanggahan oleh Admin ketiga;
- pusingan tambahan tanpa had tetap;
- dua penilai baharu bagi setiap pusingan tambahan;
- penilaian semula;
- pembetulan data;
- keputusan akhir Admin;
- paparan keputusan kepada Ahbab;
- notifikasi;
- sejarah penilaian.

Kriteria, pemarkahan dan formula kelayakan tidak boleh direka secara automatik tanpa keputusan yang telah dipersetujui.

---

14. Rekod Amal

Status: NOT IMPLEMENTED / NEEDS VERIFICATION

Rekod Amal telah ditetapkan sebagai sumber rasmi rekod aktiviti dan pengalaman Ahbab.

Pelaksanaan penuh belum disahkan.

Keperluan yang perlu dilaksanakan termasuk:

- pengurusan rekod;
- pengesahan dan pembetulan;
- sejarah;
- hubungan dengan TAFAKUT;
- hubungan dengan laporan;
- kawalan pemilikan dan akses;
- pengiraan kemajuan jika ditetapkan.

---

15. Takaza Events and Attendance

Status: NOT IMPLEMENTED / NEEDS VERIFICATION

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

Kehadiran tidak boleh digunakan sebagai pengganti status lifecycle Takaza.

---

16. Percha, Kharguzari and Reports

Status: NOT IMPLEMENTED / NEEDS VERIFICATION

Fungsi berikut belum disahkan lengkap:

- penjanaan Percha selepas Bayan Hidayat;
- maklumat Percha;
- pindaan dan versioning Percha;
- persetujuan dan kelulusan pindaan oleh Admin berlainan;
- Kharguzari individu;
- komen susulan;
- laporan penuh Amer;
- status laporan "OVERDUE";
- lanjutan masa laporan;
- syarat penyelesaian Takaza.

Laporan penuh Amer ialah syarat penyelesaian Takaza mengikut keputusan reka bentuk semasa.

Laporan operasi Takaza mesti kekal berasingan daripada Juhud Reports CMS.

---

17. Comments and Discussion

Status: NOT IMPLEMENTED / NEEDS VERIFICATION

Keperluan reka bentuk:

- komen disimpan berasingan daripada rekod asal;
- penulis boleh mengemas kini komen sendiri mengikut kebenaran;
- sejarah perubahan dikekalkan;
- akses dikawal melalui UAC;
- Moderator hanya mempunyai kuasa yang ditetapkan untuk ruang perbincangan Syukbah;
- Moderator tidak secara automatik mempunyai kuasa mengubah komen orang lain;
- CMS dan perbincangan bukan modul yang sama.

Pelaksanaan penuh belum disahkan.

---

18. Notifications

Status: PARTIALLY IMPLEMENTED — NEEDS VERIFICATION

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

Peringatan automatik dan had masa tambahan tidak boleh dianggap tersedia tanpa keputusan dan pelaksanaan khusus.

---

19. Case Management

Status: ON HOLD

Reka bentuk menetapkan bahawa pembatalan Takaza menghasilkan rekod "Requires Attention" secara automatik.

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
- audit dan notifikasi.

Jangan menganggap keseluruhan Case Management tersedia hanya kerana rekod Requires Attention boleh diwujudkan.

---

20. Annual Archive and Reporting

Status: NOT IMPLEMENTED / NEEDS VERIFICATION

Keperluan reka bentuk telah dikenal pasti:

- arkib Takaza mengikut tahun;
- akses mengikut skop Admin;
- akses Ahbab berdasarkan penyertaan terdahulu;
- statistik Main/Sub Takaza;
- statistik peserta;
- penapis negara, tahun dan status;
- ringkasan negara;
- ringkasan Main Takaza;
- ringkasan Sub Takaza;
- status ringkasan "DRAFT", "INTERIM", "FINAL";
- catatan Admin;
- sejarah pindaan.

Pelaksanaan penuh belum disahkan.

Perkara yang masih pending:

- polisi pembetulan Annual Archive;
- penapis Main Takaza;
- prosedur pembetulan data sejarah.

Tiada PDF atau Excel export dalam baseline semasa.

---

21. Juhud Reports CMS

Status: NOT IMPLEMENTED / NEEDS VERIFICATION

Juhud Reports ialah modul penerbitan berasingan daripada laporan operasi Takaza.

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

22. Audit and History

Status: PARTIALLY IMPLEMENTED — NEEDS COMPLETENESS VERIFICATION

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
- perubahan konfigurasi.

Kewujudan jadual audit tidak membuktikan setiap tindakan telah menghasilkan rekod audit yang betul.

Audit mesti mengekalkan actor, timestamp, old/new values dan reason apabila diwajibkan.

---

23. Frontend and Integration

Status: NEEDS VERIFICATION

Direktori "v2/web/" telah disediakan.

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

24. Automated Tests and Build

Status: REPORTED PASS — SCOPE LIMITED

Keputusan ujian yang dilaporkan:

- "npm test": 94/94 tests passed.
- GitHub Actions build and test: success.
- Worker dry-run/build: pernah dilaporkan berjaya.

Keputusan tersebut ialah hasil yang dilaporkan pada pemeriksaan terdahulu.

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

24.1 Development Environment Note

Persekitaran Android Termux pernah menghadapi isu platform "workerd" ketika menjalankan build secara tempatan.

GitHub Actions merupakan laluan build dan test yang digunakan untuk pengesahan projek.

Kegagalan platform Android tidak boleh disalah anggap sebagai kegagalan build production.

---

25. Current Known Blockers and Risks

Item| Status| Impact
Bootstrap Super Admin| NEEDS VERIFICATION| Pentadbiran awal belum boleh dianggap selesai
Password Reset| NOT IMPLEMENTED| Pemulihan kata laluan belum tersedia
Full Takaza workflow| NOT IMPLEMENTED / NEEDS VERIFICATION| Operasi Takaza belum lengkap
KAWAIF and TAFAKUT| NOT IMPLEMENTED / NEEDS VERIFICATION| Penilaian kelayakan belum lengkap
Rekod Amal| NOT IMPLEMENTED / NEEDS VERIFICATION| Rekod aktiviti belum lengkap
Case Management| ON HOLD| Pengurusan kes belum lengkap
Frontend integration| NEEDS VERIFICATION| Pengalaman pengguna belum disahkan
V1/V2 deployment| NEEDS VERIFICATION| Pengasingan deployment perlu diuji
Production integration| NEEDS VERIFICATION| Ujian end-to-end masih diperlukan
Audit completeness| NEEDS VERIFICATION| Semua tindakan penting belum disahkan menghasilkan audit
Juhud Reports CMS| NOT IMPLEMENTED / NEEDS VERIFICATION| Penerbitan laporan belum lengkap

---

26. Recommended Implementation Sequence

Cadangan urutan kerja pembangunan seterusnya:

Phase 1 — Foundation Verification

- sahkan V1/V2 separation;
- sahkan Worker dan Pages;
- sahkan database dan migration;
- selesaikan bootstrap Super Admin;
- sahkan authentication dan session;
- sahkan UAC asas;
- sahkan Password Reset implementation plan.

Phase 2 — Ahbab and Organization

- profil Ahbab;
- identity verification;
- alamat dan Mohallah;
- struktur organisasi;
- Admin scope;
- Jemaah Membership;
- role and appointment foundations.

Phase 3 — Takaza Core

- Main/Sub Takaza;
- lifecycle;
- participation configuration;
- application and confirmation;
- capacity;
- withdrawal, removal, appeal;
- transfer.

Phase 4 — Amer and Supervisor

- Amer appointment;
- consent;
- replacement;
- appointment expiry;
- Supervisor appointment mengikut skop yang telah dipersetujui.

Phase 5 — KAWAIF and TAFAKUT

- KAWAIF management;
- templates and versioning;
- assessor assignment;
- independent assessments;
- additional rounds;
- final Admin decision.

Phase 6 — Rekod Amal and Takaza Operations

- Rekod Amal;
- events and attendance;
- Percha;
- Kharguzari;
- Amer full report;
- comments and notifications.

Phase 7 — Archive and Reporting

- annual archive;
- statistics;
- annual summary;
- Juhud Reports CMS;
- access control;
- audit completeness.

Phase 8 — Final Integration and Hardening

- frontend integration;
- end-to-end tests;
- security and authorization tests;
- deployment verification;
- backup and recovery checks;
- production readiness review.

Urutan ini ialah cadangan pelaksanaan. Keutamaan boleh disusun semula apabila terdapat keperluan teknikal yang sah, tanpa mengubah keputusan perniagaan yang telah dipersetujui.

---

27. Verification Rules

Setiap fungsi hanya boleh dinaik taraf kepada "IMPLEMENTED" apabila bukti yang sesuai tersedia.

Bukti boleh merangkumi:

1. kod atau API yang berkaitan;
2. schema dan migration jika diperlukan;
3. ujian automatik;
4. ujian integrasi;
5. ujian authorization;
6. pengesahan UI jika melibatkan frontend;
7. pengesahan deployment jika melibatkan production.

Status perlu menyatakan skop sebenar yang telah diuji.

Contohnya:

"IMPLEMENTED — SCHEMA FOUNDATION"

tidak boleh ditukar kepada:

"IMPLEMENTED — FULL WORKFLOW"

tanpa bukti tambahan.

Status "DEPLOYED" mesti menyatakan environment yang telah disahkan.

Status "REPORTED PASS" mesti dikekalkan sehingga ujian dijalankan semula atau bukti terkini diperoleh.

---

28. Maintenance

Dokumen ini perlu dikemas kini apabila:

- fungsi baharu dilaksanakan;
- ujian baharu lulus;
- deployment disahkan;
- isu pelaksanaan ditemui;
- status fungsi berubah;
- spesifikasi reka bentuk berubah;
- keputusan dalam Master Decision Register berubah.

Setiap perubahan status perlu disertakan tarikh dan skop pengesahan.

Dokumen ini mesti kekal selaras dengan:

- "MASTER_DECISION_REGISTER.md"
- "MODULE_REQUIREMENTS.md"
- "OPEN_DECISIONS_REGISTER.md"
- "V2_DESIGN_CHECKPOINT.md"
- "UAC_MATRIX.md"
- spesifikasi modul yang berkaitan.

---

Document Status: WORKING BASELINE — Implementation Tracking
Last Updated: 27 November 2026
Next Review: After repository, bootstrap and deployment verification.

End of Document.
