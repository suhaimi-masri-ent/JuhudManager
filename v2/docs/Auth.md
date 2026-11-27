JUHUDMANAGER V2 — AUTHENTICATION & USER REGISTRATION SPECIFICATION

Document ID: JMV2-AUTH-001
Version: 1.0 — Consolidated Working Baseline
Status: WORKING BASELINE
Last Updated: 27 November 2026
Suggested Filename: "Auth.md"
Repository Path: "v2/docs/Auth.md"

---

1. Purpose

Dokumen ini menetapkan asas pengesahan pengguna, pendaftaran akaun, identiti login, OTP, kata laluan, sesi dan pemulihan akaun bagi JuhudManager V2.

Authentication bertanggungjawab mengesahkan identiti pengguna dan mengurus sesi.

Authorization pula menentukan tindakan yang boleh dilakukan berdasarkan role, access level, skop organisasi dan hubungan pengguna dengan rekod.

Kedua-duanya mesti dilaksanakan secara berasingan.

2. Core Principles

1. Seorang individu mempunyai satu "user_id" utama.
2. Seseorang boleh mempunyai lebih daripada satu identiti login yang sah.
3. Identiti yang sama tidak boleh didaftarkan kepada dua akaun berlainan.
4. Authentication dan Ahbab Profile ialah komponen berasingan.
5. Role dan access level ialah konsep berasingan.
6. Akaun yang belum diluluskan tidak mendapat akses operasi secara automatik.
7. Semua tindakan sensitif perlu mempunyai audit trail.
8. Data identiti dan credential mesti dilindungi.
9. Admin tidak boleh melihat kata laluan tetap pengguna.
10. Pengesahan identiti tidak bermaksud pengguna secara automatik mendapat role atau penyertaan Takaza.

3. User Account and Identity

3.1 User Account

Setiap individu mempunyai satu rekod akaun utama dengan "user_id" yang unik.

Rekod akaun menjadi rujukan kepada:

- identiti login;
- credential;
- sesi;
- profil Ahbab;
- role;
- hubungan organisasi;
- Jemaah Membership;
- Takaza Participation;
- sejarah dan audit.

3.2 Identity Types

Jenis identiti yang perlu disokong:

- "NATIONAL_ID"
- "EMAIL"
- "WHATSAPP"
- "PASSPORT"

Identiti ini tidak semestinya mempunyai kaedah pengesahan yang sama.

3.3 Identity Uniqueness

Peraturan asas:

- National ID unik mengikut jenis identiti dan negara pengeluar.
- Passport unik mengikut jenis identiti dan negara pengeluar.
- E-mel unik secara global selepas normalisasi.
- WhatsApp unik secara global menggunakan format E.164.

Identiti yang telah dikaitkan dengan akaun lain tidak boleh digunakan untuk pendaftaran akaun baharu.

3.4 Identity Status

Status identiti perlu membezakan keadaan seperti:

- "PENDING"
- "VERIFIED"
- "REVOKED"

Identiti yang belum disahkan tidak boleh digunakan seolah-olah sudah disahkan.

Butiran status tambahan boleh ditentukan mengikut keperluan teknikal tanpa mengubah prinsip ini.

4. Registration

4.1 Self-Registration

Pendaftaran kendiri menggunakan pengesahan e-mel OTP sebagai asas aliran pendaftaran semasa.

Maklumat identiti dan profil yang diperlukan perlu dikumpulkan mengikut borang pendaftaran serta peraturan identiti.

Pendaftaran kendiri mesti:

1. mewujudkan rekod pendaftaran;
2. menyemak keunikan identiti;
3. menghantar OTP e-mel;
4. mengesahkan OTP;
5. mengemas kini status pengesahan;
6. meneruskan proses semakan dan pengaktifan mengikut polisi pendaftaran.

Pengesahan e-mel tidak dengan sendirinya memberikan role Admin atau Super Admin.

4.2 Registration Review

Status pendaftaran perlu dibezakan daripada status akaun.

Contoh status pendaftaran:

- "AWAITING_EMAIL_VERIFICATION"
- "PENDING_REVIEW"
- "APPROVED"
- "REJECTED"

Nama status sebenar hendaklah mengikut schema dan implementasi yang digunakan.

Keputusan pendaftaran oleh Admin mesti direkodkan bersama:

- Admin ID;
- masa keputusan;
- keputusan;
- sebab jika diperlukan.

Pendaftaran yang ditolak tidak boleh menerima akses operasi.

4.3 Access Before Approval

Pengguna yang belum mendapat kelulusan operasi hanya menerima akses terhad yang dibenarkan.

"LIMITED" bukan role.

Akses terhad tidak boleh membenarkan pengguna mengakses Jemaah, Takaza, Rekod Amal atau fungsi operasi yang belum diluluskan.

Butiran akses terperinci ditentukan oleh JMV2001 dan UAC Matrix.

4.4 Foreign Users

Sistem perlu menyokong identiti kebangsaan pengguna antarabangsa.

Contoh:

- Malaysia: National ID dengan negara pengeluar "MY";
- Indonesia: National ID dengan negara pengeluar "ID";
- Singapore: National ID dengan negara pengeluar "SG".

Format dan pengesahan identiti hendaklah mengambil kira negara pengeluar.

Passport boleh disimpan sebagai identiti tambahan mengikut polisi yang diluluskan.

Passport tidak boleh dianggap sebagai pengganti automatik National ID dalam pendaftaran tanpa keputusan khusus.

4.5 Admin-Assisted Registration

Pendaftaran berbantukan Admin perlu disokong sebagai keperluan reka bentuk, khususnya bagi individu yang tidak mempunyai akses kepada e-mel atau WhatsApp.

Namun, aliran penuh dan kaedah pengesahan alternatif masih memerlukan perincian.

Prinsip keselamatan:

- Admin tidak boleh mengetahui kata laluan tetap pengguna.
- Credential sementara tidak boleh menjadi kata laluan kekal yang diketahui Admin.
- Penetapan credential mesti menggunakan proses yang selamat.
- Semua tindakan Admin direkodkan.

5. Login Methods

Sistem perlu membezakan identiti yang disimpan daripada kaedah login yang benar-benar telah dilaksanakan.

Jenis login yang boleh dipertimbangkan:

Identity| Authentication Method| Status
Email| OTP atau kaedah yang diluluskan| OTP registration implemented; login flow needs verification
WhatsApp| OTP| NOT IMPLEMENTED / NEEDS VERIFICATION
National ID| Password| NEEDS VERIFICATION
Passport| Password| PENDING

Satu "user_id" boleh mempunyai beberapa identiti login.

Identiti yang belum disahkan tidak boleh digunakan untuk login.

Password tidak diwajibkan untuk semua pengguna secara automatik sehingga polisi login bagi setiap jenis akaun dimuktamadkan.

6. Password Policy

AGREED

- Minimum 12 aksara.
- Kata laluan disimpan menggunakan algoritma hashing yang sesuai.
- Argon2id boleh digunakan jika disokong oleh persekitaran pelaksanaan.
- Kata laluan plaintext tidak boleh disimpan.
- Admin tidak boleh melihat kata laluan pengguna.
- Kata laluan sementara, jika digunakan, mesti melalui proses penetapan yang selamat.

6.1 Password Change

Perubahan kata laluan mesti:

- mengesahkan pengguna yang membuat permintaan;
- menyimpan hash baharu;
- membatalkan sesi atau token yang perlu dibatalkan;
- merekodkan tindakan keselamatan;
- tidak mendedahkan kata laluan lama atau baharu dalam log.

6.2 Password Reset / Forgot Password

<text>Status: NOT IMPLEMENTED</text>

Fungsi Password Reset / Forgot Password belum dilaksanakan.

Ia tidak boleh dianggap tersedia dalam UI, API atau dokumentasi operasi.

Reka bentuk masa hadapan perlu merangkumi:

- pengesahan identiti;
- token reset sekali guna;
- tempoh sah token;
- pembatalan token lama;
- penamatan sesi dan token yang berkaitan;
- notifikasi;
- audit.

7. OTP Policy

AGREED — CURRENT BASELINE

Setting| Value
OTP length| 6 digits
Expiry| 5 minutes
Maximum attempts| 5
Resend cooldown| 60 seconds
Identity reservation| 15 minutes

Keperluan keselamatan:

- OTP dijana menggunakan sumber rawak yang selamat.
- OTP disimpan dalam bentuk hash atau perlindungan yang sesuai.
- OTP yang telah digunakan tidak boleh digunakan semula.
- OTP baharu membatalkan OTP terdahulu bagi proses yang sama.
- Percubaan berlebihan perlu disekat.
- Rate limiting perlu digunakan.
- OTP tidak boleh dimasukkan dalam log plaintext.

7.1 Email OTP

Email OTP ialah kaedah pengesahan yang telah digunakan dalam asas pendaftaran V2.

Penghantaran e-mel menggunakan sender yang dikonfigurasi:

"noreply@m.juhud.run.place"

Pengesahan production perlu merangkumi penghantaran, tamat tempoh, percubaan salah, resend dan penggunaan semula OTP.

7.2 WhatsApp OTP

WhatsApp OTP belum disahkan sebagai aliran authentication yang lengkap.

Kewujudan integrasi WhatsApp bagi sesuatu fungsi tidak membuktikan semua login dan pengesahan identiti WhatsApp telah tersedia.

Kaedah dan skop penggunaannya perlu disahkan secara berasingan.

8. Identity Changes

8.1 National ID Changes

Ahbab tidak boleh menukar National ID secara terus.

Perubahan memerlukan:

1. permohonan perubahan;
2. dokumen pengenalan baharu;
3. pengesahan Admin yang dibenarkan;
4. pembatalan atau penamatan identiti lama;
5. pautan identiti baharu kepada "user_id" yang sama;
6. audit trail.

Identiti lama tidak boleh dipadam sehingga kehilangan sejarah.

8.2 Email Changes

WORKING BASELINE — Refer to JMV2001

- Perubahan e-mel memerlukan OTP bagi e-mel baharu.
- E-mel lama kekal aktif sehingga pengesahan berjaya.
- E-mel baharu hanya digunakan selepas OTP berjaya disahkan.
- Perubahan direkodkan dalam audit.

Kelayakan permohonan perubahan e-mel boleh melibatkan akaun "ACTIVE", "DISABLED" dan "LIMITED".

Kelayakan tersebut tidak mengaktifkan akaun atau memberikan akses tambahan.

Semakan Admin perlu mengikuti skop kuasa yang berkenaan.

8.3 WhatsApp Changes

Perubahan nombor WhatsApp memerlukan pengesahan nombor baharu melalui kaedah yang diluluskan.

Pelaksanaan dan skop OTP WhatsApp masih memerlukan pengesahan.

8.4 Passport Changes

Passport boleh ditambah, diganti atau ditamatkan sebagai identiti tambahan.

Perubahan tidak mewujudkan "user_id" baharu.

9. Session Management

AGREED — CURRENT BASELINE

Setting| Policy
Idle timeout| 30 minutes
Maximum lifetime| 12 hours
Logout| Revoke current session
Logout all| Revoke other active sessions
Account DISABLED| Revoke all sessions and related tokens

Pengguna boleh melihat sesi sendiri dan menamatkan sesi yang tidak dikenali melalui fungsi yang disediakan.

Session token perlu dilindungi dan tidak boleh disimpan atau dipaparkan dalam bentuk yang membolehkan penyalahgunaan.

Perubahan kata laluan, DISABLE dan tindakan keselamatan lain mesti membatalkan sesi yang berkaitan.

10. Account Recovery

10.1 Password Recovery

Status: NOT IMPLEMENTED

Password Reset / Forgot Password belum tersedia.

10.2 Recovery Without Email

Status: PENDING

Jika pengguna kehilangan akses kepada e-mel, proses pemulihan perlu menggunakan pengesahan identiti oleh Admin yang diberi kuasa.

Butiran proses masih belum dimuktamadkan.

Prinsip:

- identiti mesti disahkan;
- tindakan direkodkan;
- Admin tidak boleh melihat kata laluan pengguna;
- credential baharu ditetapkan melalui proses selamat;
- sesi dan token lama dibatalkan mengikut polisi.

11. Account Status and Authentication

Authentication perlu memeriksa status akaun sebelum memberikan sesi atau akses.

Status akaun yang digunakan dalam reka bentuk:

- "ACTIVE"
- "DISABLED"
- "SUSPENDED"

Status pendaftaran adalah berasingan.

Prinsip:

- "DISABLED" tidak boleh login.
- "SUSPENDED" tertakluk kepada sekatan keselamatan yang ditetapkan.
- Akaun yang belum diluluskan tidak menerima akses operasi.
- Perubahan status akaun mesti direkodkan.
- Pengaktifan semula tidak berlaku secara automatik melalui OTP atau perubahan identiti.

Perincian pengurusan status akaun dirujuk kepada JMV2001.

12. Proposed Data Responsibilities

Nama jadual sebenar hendaklah mengikut schema V2 yang telah dilaksanakan.

Secara konsep, data authentication merangkumi:

Data Area| Responsibility
Users| Rekod akaun utama
User Roles| Role pengguna
Authentication Identities| Identiti login
Credentials| Credential dan password hash
OTP Requests| Kitar hayat OTP
Sessions| Sesi aktif dan dibatalkan
Authentication Events| Peristiwa keselamatan
Audit Logs| Audit tindakan Admin dan tindakan penting

Jadual yang dicadangkan dalam dokumen lama tidak boleh dianggap perlu diwujudkan semula jika fungsi yang sama sudah diliputi oleh schema semasa.

Sebelum migration baharu, schema sebenar mesti diaudit bagi mengelakkan jadual atau data pendua.

13. API Responsibilities

API authentication perlu meliputi fungsi berikut mengikut keperluan dan implementasi:

- registration;
- OTP request;
- OTP verification;
- login;
- logout;
- session refresh;
- session listing;
- session revocation;
- identity change;
- account recovery;
- Admin-assisted registration;
- Admin-assisted recovery.

Nama endpoint, kaedah HTTP dan request/response schema hendaklah mengikuti struktur API sebenar.

Endpoint yang dicadangkan dalam dokumen ini bukan bukti bahawa endpoint tersebut telah dilaksanakan.

Semua endpoint terlindung mesti menguatkuasakan authentication dan authorization di backend.

14. Security Requirements

1. Semua komunikasi menggunakan HTTPS.
2. Password disimpan sebagai hash.
3. OTP tidak disimpan dalam plaintext.
4. Token rawak menggunakan sumber kriptografi yang selamat.
5. Session token dilindungi daripada pendedahan.
6. Data identiti sensitif dienkripsi jika perlu disimpan dalam bentuk yang boleh dibaca semula.
7. Lookup identiti sensitif menggunakan mekanisme keyed hash yang sesuai.
8. Rate limiting dan kawalan percubaan berulang dilaksanakan.
9. Respons tidak mendedahkan sama ada identiti tertentu telah didaftarkan secara tidak perlu.
10. Log tidak boleh mendedahkan National ID, password, OTP atau token.
11. Authorization diperiksa pada backend.
12. Semua tindakan sensitif direkodkan.
13. Data authentication tidak boleh digunakan untuk memintas UAC.
14. Akses Admin mesti mengikut skop dan kuasa yang dibenarkan.

15. Implementation Status

Component| Status
Registration backend foundation| PARTIALLY IMPLEMENTED
Email OTP registration| PARTIALLY IMPLEMENTED
Email delivery| PARTIALLY IMPLEMENTED / NEEDS PRODUCTION VERIFICATION
Account activation| PARTIALLY IMPLEMENTED
Login backend| PARTIALLY IMPLEMENTED
Session foundation| PARTIALLY IMPLEMENTED
Session policy enforcement| NEEDS VERIFICATION
Email change| NEEDS VERIFICATION
WhatsApp OTP| NOT IMPLEMENTED / NEEDS VERIFICATION
National ID verification| NOT IMPLEMENTED / NEEDS VERIFICATION
Passport login| PENDING
Admin-assisted registration| PENDING
Password Reset / Forgot Password| NOT IMPLEMENTED
Recovery without email| PENDING
Bootstrap Super Admin| NEEDS VERIFICATION

Status ini perlu diselaraskan dengan "V2_IMPLEMENTATION_STATUS.md".

16. Related Documents

Dokumen ini perlu dibaca bersama:

- "JMV2001-Ahbab-Profile-Account-Management.md"
- "UAC_MATRIX.md"
- "V2_DESIGN_CHECKPOINT.md"
- "V2_IMPLEMENTATION_STATUS.md"
- "DASHBOARD_NAVIGATION_SPEC_V2.md"

Jika terdapat percanggahan, keputusan terkini yang telah dipersetujui dan UAC bagi authorization menjadi rujukan penyelarasan.

17. Working Rules

- Jangan menganggap semua jenis identiti mempunyai kaedah login yang sama.
- Jangan menganggap WhatsApp OTP sudah lengkap.
- Jangan menganggap Password Reset sudah tersedia.
- Jangan membina semula jadual yang sudah wujud tanpa audit schema.
- Jangan mengubah polisi registration OTP semata-mata untuk menyokong fungsi lain.
- Jangan menggunakan OTP registration sebagai pengganti automatik kepada OTP bagi proses lain.
- Jangan menganggap pengesahan identiti memberikan role atau penyertaan.
- Jangan menyatakan fungsi sebagai "IMPLEMENTED" tanpa bukti kod dan ujian.

---

Document Status: WORKING BASELINE
Last Updated: 27 November 2026
Next Review: Authentication and registration implementation verification.
