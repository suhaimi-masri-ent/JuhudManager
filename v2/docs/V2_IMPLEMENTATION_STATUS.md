JUHUDMANAGER V2 — IMPLEMENTATION STATUS

Document ID: JMV2-IMP-001
Version: 2.0
Status: WORKING BASELINE — Implementation Tracking
Last Updated: 27 November 2026
Suggested Filename: "V2_IMPLEMENTATION_STATUS.md"
Repository Path: "v2/docs/V2_IMPLEMENTATION_STATUS.md"

---

1. Purpose

Dokumen ini merekodkan status pelaksanaan sebenar JuhudManager V2 berdasarkan maklumat kod, migration, ujian dan deployment yang telah dilaporkan atau disahkan.

Dokumen ini membezakan:

- fungsi yang telah dilaksanakan;
- asas teknikal yang telah tersedia tetapi belum lengkap sebagai aliran kerja;
- fungsi yang belum dilaksanakan;
- fungsi yang memerlukan pengesahan lanjut.

Keputusan reka bentuk yang telah dipersetujui tidak boleh dianggap sebagai fungsi yang telah tersedia sehingga pelaksanaannya disahkan.

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

3. Repository and Architecture

3.1 V1/V2 Separation

Status: PARTIALLY IMPLEMENTED — NEEDS VERIFICATION

Kerja pemisahan V1 dan V2 telah dijalankan pada branch:

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
│   └── wrangler.jsonc
├── docs/
└── README.md

Perkara yang telah disediakan dalam kerja pemisahan:

- direktori V1 dan V2;
- konfigurasi Worker V1 dan V2 yang berasingan;
- workflow deployment V1 dan V2 yang diasingkan;
- struktur Pages yang menggabungkan output V1 dan V2;
- dokumentasi asas pemisahan.

Pemisahan fail dan konfigurasi tidak dengan sendirinya membuktikan semua deployment berfungsi.

Perlu pengesahan berasingan bagi:

- V1 Worker deployment;
- V1 Pages deployment;
- V2 Worker deployment;
- V2 Pages deployment;
- laluan aplikasi dan aset;
- workflow GitHub Actions;
- konfigurasi production.

3.2 V1 Preservation

Status: NEEDS VERIFICATION

V1 telah dipindahkan ke struktur "v1/" pada branch integrasi.

Pengesahan akhir perlu memastikan:

- source V1 lengkap;
- konfigurasi Worker dan Pages betul;
- database V1 tidak berubah;
- fungsi V1 masih boleh dibina dan digunakan;
- deployment V1 tidak bergantung kepada laluan lama.

V1 tidak boleh dianggap selamat untuk diarkibkan atau ditinggalkan sehingga pengesahan ini selesai.

3.3 V2 Isolation

Status: IMPLEMENTED — FOUNDATION

V2 mempunyai:

- direktori aplikasi tersendiri;
- konfigurasi Wrangler tersendiri;
- direktori migration tersendiri;
- database D1 khusus V2;
- Worker berasingan daripada V1.

V2 tidak boleh menggunakan database produksi V1.

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

Keputusan tersebut ialah pengesahan pada masa pemeriksaan terdahulu, bukan jaminan bahawa semua API dan modul perniagaan telah berfungsi.

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
- data dan trigger berkaitan berada dalam keadaan konsisten.

4.3 Migration Safety

Status: IMPLEMENTED — PROCESS FOUNDATION

Migration V2 mesti:

- menggunakan database V2 sahaja;
- dikendalikan melalui workflow yang mempunyai kawalan pengesahan;
- mengekalkan migration history;
- tidak menggunakan database V1;
- diuji sebelum digunakan pada production.

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
- authentication OTP and verification records.

Constraint dan domain validation berkaitan pelantikan Amer turut disediakan pada skop asas.

Kewujudan schema tidak bermaksud semua fungsi pengurusan dan aliran kerja modul telah lengkap.

6. Authentication and Account Foundation

6.1 Registration

Status: PARTIALLY IMPLEMENTED

Asas pendaftaran melalui e-mel dan pengesahan OTP telah dilaksanakan pada skop yang dilaporkan.

Peraturan reka bentuk yang digunakan:

- OTP enam digit;
- tempoh sah lima minit;
- maksimum lima percubaan;
- tempoh resend 60 saat;
- identity reservation 15 minit;
- kata laluan minimum 12 aksara.

Pengesahan keseluruhan aliran pendaftaran, termasuk kes khas dan bootstrap owner, masih memerlukan pengesahan.

6.2 Email OTP and Activation

Status: PARTIALLY IMPLEMENTED

Asas penghantaran OTP dan pengaktifan akaun melalui e-mel telah disediakan.

Sender yang digunakan:

"noreply@m.juhud.run.place"

Penghantaran dan pengesahan OTP perlu diuji semula dalam keadaan production, termasuk kegagalan penghantaran dan percubaan berulang.

6.3 Login and Sessions

Status: PARTIALLY IMPLEMENTED

Backend asas login dan session telah dilaksanakan.

Polisi reka bentuk:

- idle timeout 30 minit;
- maksimum hayat sesi 12 jam;
- tindakan DISABLE menamatkan sesi dan token yang berkaitan;
- perubahan kata laluan perlu membatalkan sesi yang terjejas.

Pengesahan penuh perlu merangkumi semua laluan login, session expiry, revocation dan authorization.

6.4 Email Change

Status: NEEDS VERIFICATION

Reka bentuk membenarkan proses pertukaran e-mel bagi akaun "FULL", "LIMITED" dan "DISABLED", tertakluk kepada pengesahan identiti dan OTP.

Kebenaran menukar e-mel tidak mengaktifkan semula akaun atau memberikan akses tambahan.

Pelaksanaan keseluruhan perlu disahkan.

6.5 Password Reset / Forgot Password

Status: NOT IMPLEMENTED

Fungsi Password Reset / Forgot Password belum dilaksanakan.

Ia tidak boleh dipaparkan atau didokumenkan sebagai fungsi tersedia.

Reka bentuk masa hadapan perlu merangkumi:

- pengesahan identiti;
- token sekali guna;
- tempoh sah token;
- pembatalan token terdahulu;
- penamatan sesi atau token lama;
- notifikasi;
- audit.

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

7. Authorization and UAC

Status: PARTIALLY IMPLEMENTED / NEEDS VERIFICATION

Asas role dan authorization telah disediakan.

Model akses yang dipersetujui:

- "SUPER_ADMIN";
- "ADMIN";
- "AHBAB".

Amer dan Supervisor ialah pelantikan khusus Takaza, bukan role global.

Pengesahan penuh perlu memastikan:

- skop negara dan organisasi;
- hubungan pengguna dengan rekod;
- akses peserta terhadap Takaza;
- akses Amer terhadap Takaza yang berkaitan;
- skop tindakan Admin;
- kawalan Admin lebih tinggi atau lebih luas;
- kawalan rayuan dan penggantian;
- akses kepada sejarah dan arkib.

UAC Matrix ialah rujukan reka bentuk. Ia tidak membuktikan setiap permission telah dilaksanakan.

8. Jemaah and Membership

Status: PARTIALLY IMPLEMENTED — SCHEMA FOUNDATION

Asas schema Jemaah dan Jemaah Membership telah dilaporkan tersedia.

Belum disahkan sebagai lengkap:

- API pengurusan Jemaah;
- penempatan dan perubahan keahlian;
- pengurusan Mohallah;
- aliran keahlian;
- sejarah keahlian;
- integrasi penuh dengan struktur organisasi.

Jemaah Membership mesti kekal berasingan daripada Takaza Participation.

9. Takaza and Participation

Status: PARTIALLY IMPLEMENTED — SCHEMA FOUNDATION

Asas schema Takaza dan Takaza Participation telah disediakan.

Perkara yang belum boleh dianggap lengkap:

- penciptaan Takaza;
- Main/Sub Takaza management;
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
- cancellation dan Requires Attention integration.

Spesifikasi penuh telah diselaraskan dalam dokumen reka bentuk. Pelaksanaannya masih perlu dibuat dan diuji.

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
- Admin yang mengurus Takaza membuat keputusan akhir.

Asas teknikal pelantikan tidak membuktikan keseluruhan proses persetujuan, justifikasi, notifikasi dan audit telah lengkap.

11. Supervisor Appointment

Status: NOT IMPLEMENTED / NEEDS VERIFICATION

Reka bentuk sementara telah menetapkan prinsip pelantikan dengan persetujuan Admin dan individu yang dipilih.

Tempoh pelantikan buat masa ini mengikuti prinsip Amer.

Skop kuasa dan fungsi khusus Supervisor masih belum diputuskan.

Tiada fungsi tambahan boleh dianggap tersedia tanpa pemeriksaan kod.

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
- notifikasi.

Kriteria, pemarkahan dan formula kelayakan tidak boleh direka secara automatik tanpa keputusan yang telah dipersetujui.

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
- pengiraan kemajuan jika ditetapkan.

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
- templat acara.

Kehadiran tidak boleh digunakan sebagai pengganti status lifecycle Takaza.

16. Percha, Kharguzari and Reports

Status: NOT IMPLEMENTED / NEEDS VERIFICATION

Fungsi berikut belum disahkan lengkap:

- penjanaan Percha selepas Bayan Hidayat;
- maklumat Percha;
- pindaan dan versioning Percha;
- Kharguzari individu;
- komen susulan;
- laporan penuh Amer;
- status laporan "OVERDUE";
- lanjutan masa laporan;
- syarat penyelesaian Takaza.

Laporan penuh Amer ialah syarat penyelesaian Takaza mengikut keputusan reka bentuk semasa.

17. Comments and Discussion

Status: NOT IMPLEMENTED / NEEDS VERIFICATION

Keperluan reka bentuk:

- komen disimpan berasingan daripada rekod asal;
- penulis boleh mengemas kini komen sendiri mengikut kebenaran;
- sejarah perubahan dikekalkan;
- akses dikawal melalui UAC.

Pelaksanaan penuh belum disahkan.

18. Notifications

Status: PARTIALLY IMPLEMENTED / NEEDS VERIFICATION

Penghantaran e-mel untuk proses pengesahan akaun telah disediakan pada skop yang dilaporkan.

Notifikasi modul perniagaan masih perlu disahkan, termasuk:

- pelantikan dan penggantian;
- permohonan penyertaan;
- TAFAKUT;
- keputusan akhir;
- withdrawal dan removal;
- appeal;
- laporan dan aktiviti;
- perubahan penting Takaza.

Notifikasi perlu menggunakan bahasa pilihan pengguna.

Peringatan automatik dan had masa tambahan tidak boleh dianggap tersedia tanpa keputusan dan pelaksanaan khusus.

19. Case Management

Status: ON HOLD

Reka bentuk menetapkan bahawa pembatalan Takaza menghasilkan rekod "Requires Attention" secara automatik.

Perkara yang telah dipersetujui:

- kes mengenal pasti Takaza dan Ahbab terjejas;
- penyertaan peserta tidak dibatalkan secara automatik;
- Admin mengurus tindakan terhadap peserta secara berasingan;
- sejarah dan rekod berkaitan dikekalkan.

Aliran kerja penuh Case Management masih "ON HOLD", termasuk assignment, tindakan, resolusi dan penutupan.

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

21. Audit and History

Status: PARTIALLY IMPLEMENTED

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
- arkib dan ringkasan tahunan.

Kewujudan jadual audit tidak membuktikan setiap tindakan telah menghasilkan rekod audit yang betul.

22. Frontend and Integration

Status: NEEDS VERIFICATION

Direktori "v2/web/" telah disediakan.

Pengesahan diperlukan bagi:

- halaman pendaftaran dan login;
- pengesahan OTP;
- dashboard mengikut role;
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
- authorization pada frontend dan backend.

Paparan frontend tidak boleh menjadi satu-satunya kawalan keselamatan. Backend mesti mengesahkan setiap tindakan.

23. Automated Tests and Build

Status: REPORTED PASS — SCOPE LIMITED

Keputusan ujian yang dilaporkan:

- "npm test": 94/94 tests passed.
- GitHub Actions build and test: success.
- Worker dry-run/build: pernah dilaporkan berjaya.

Ujian ini mengesahkan skop yang diuji sahaja.

Ia tidak membuktikan:

- semua modul perniagaan lengkap;
- semua API production berfungsi;
- semua authorization betul;
- semua aliran frontend berfungsi;
- semua migration remote sepadan;
- bootstrap Super Admin berjaya;
- deployment V1 dan V2 lengkap.

Ujian perlu dikembangkan seiring pelaksanaan modul.

24. Current Known Blockers and Risks

Item| Status| Impact
Bootstrap Super Admin| "NEEDS VERIFICATION"| Pentadbiran awal belum boleh dianggap selesai
Password Reset| "NOT IMPLEMENTED"| Pemulihan kata laluan belum tersedia
Full Takaza workflow| "NOT IMPLEMENTED / NEEDS VERIFICATION"| Operasi Takaza belum lengkap
KAWAIF and TAFAKUT| "NOT IMPLEMENTED / NEEDS VERIFICATION"| Penilaian kelayakan belum lengkap
Rekod Amal| "NOT IMPLEMENTED / NEEDS VERIFICATION"| Rekod aktiviti belum lengkap
Case Management| "ON HOLD"| Pengurusan kes belum lengkap
Frontend integration| "NEEDS VERIFICATION"| Pengalaman pengguna belum disahkan
V1/V2 deployment| "NEEDS VERIFICATION"| Pengasingan deployment perlu diuji
Production integration| "NEEDS VERIFICATION"| Ujian end-to-end masih diperlukan

25. Recommended Implementation Sequence

Cadangan urutan kerja pembangunan seterusnya:

Phase 1 — Foundation Verification

- sahkan V1/V2 separation;
- sahkan Worker dan Pages;
- sahkan database dan migration;
- selesaikan bootstrap Super Admin;
- sahkan authentication dan session;
- sahkan UAC asas.

Phase 2 — Ahbab and Organization

- profil Ahbab;
- identity verification;
- alamat dan Mohallah;
- struktur organisasi;
- Admin scope;
- Jemaah Membership.

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

26. Verification Rules

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

"IMPLEMENTED — schema foundation"

tidak boleh ditukar kepada:

"IMPLEMENTED — full workflow"

tanpa bukti tambahan.

27. Maintenance

Dokumen ini perlu dikemas kini apabila:

- fungsi baharu dilaksanakan;
- ujian baharu lulus;
- deployment disahkan;
- isu pelaksanaan ditemui;
- status fungsi berubah;
- spesifikasi reka bentuk berubah.

Setiap perubahan status perlu disertakan tarikh dan skop pengesahan.

---

Document Status: WORKING BASELINE — Implementation Tracking
Last Updated: 27 November 2026
Next Review: After repository and deployment verification.
