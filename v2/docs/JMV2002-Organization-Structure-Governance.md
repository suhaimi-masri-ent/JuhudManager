
# JUHUDMANAGER V2 — ORGANIZATION STRUCTURE & GOVERNANCE

**Document ID:** JMV2-002  
**Version:** 1.2 — Consolidated Working Baseline  
**Status:** REQUIREMENTS BASELINE — FOR REVIEW  
**Last Updated:** 28 November 2026  
**Repository Path:** `v2/docs/JMV2002-Organization-Structure-Governance.md`

---

## 1. Tujuan

Dokumen ini menetapkan baseline struktur organisasi dan prinsip tadbir urus JuhudManager V2.

Skop dokumen merangkumi:

- Struktur organisasi dan hubungan antara peringkat.
- Konfigurasi organisasi mengikut negara.
- Penempatan Ahbab dan hubungan keahlian.
- Pentadbiran negara dan hubungan negara naungan.
- Pemisahan system role daripada jawatan organisasi.
- Pelantikan kepimpinan.
- Kuasa Chief Admin dan Deputy Chief Admin.
- Pengurusan Admin Markaz dan Admin Syukbah.
- Proses cadangan dan keputusan.
- Bantuan silang organisasi.
- Pelaporan organisasi.
- Audit dan sejarah perubahan.

Sistem mesti merekodkan struktur organisasi, hubungan pentadbiran, pelantikan, kuasa membuat keputusan dan sejarah perubahan.

Dokumen ini mesti dibaca bersama Master Decision Register, Open Decisions Register dan UAC Matrix.

Prinsip utama:

1. Struktur organisasi mesti mempunyai hubungan parent-child yang jelas.
2. Setiap rekod organisasi mesti mempunyai identiti negara yang jelas.
3. Konfigurasi organisasi boleh berbeza mengikut negara.
4. Hubungan penyeliaan tidak bermaksud penggabungan identiti atau data negara.
5. System role, jawatan organisasi, appointment dan delegation ialah konsep yang berasingan.
6. Kuasa Admin mesti terhad kepada skop yang diluluskan.
7. Akses silang organisasi mesti mempunyai asas kuasa yang jelas.
8. Perubahan struktur tidak boleh memadam sejarah operasi.
9. Semua pelantikan dan keputusan penting mesti mempunyai rekod audit.
10. Perkara yang belum diputuskan mesti kekal sebagai `OPEN`, `PENDING` atau `PROVISIONAL` mengikut status sebenar.

Dokumentasi keperluan tidak bermaksud fungsi telah dilaksanakan.

## 2. Hierarki Organisasi

### 2.1 Prinsip Umum

Struktur organisasi dibentuk secara bertingkat mengikut konfigurasi negara.

Struktur yang digunakan sebagai rujukan dalam baseline ialah:

1. Individu / Ahbab
2. Mohallah
3. Halqah
4. Zone
5. Markaz Negeri
6. Markaz Negara

Walau bagaimanapun, senarai tersebut bukan hierarki wajib yang mesti digunakan oleh semua negara.

Peringkat yang turut boleh dipertimbangkan mengikut keperluan negara termasuk:

- Markaz Negara.
- Negeri.
- Daerah.
- Kawasan.
- Mohallah.

Nama, bilangan, susunan dan kewujudan peringkat organisasi tidak boleh dianggap seragam untuk semua negara sebelum keputusan hierarki negara dimuktamadkan.

### 2.2 Konfigurasi Organisasi Mengikut Negara

Sistem perlu menyokong konfigurasi hierarki organisasi mengikut negara.

Prinsip:

- Setiap unit organisasi mesti dikaitkan dengan negara yang sah.
- `country_id` menggunakan identiti negara yang ditetapkan melalui `country_code` mengikut baseline V2.
- Hubungan parent-child organisasi mesti sah.
- Setiap unit organisasi hanya boleh mempunyai satu parent aktif pada satu-satu masa, kecuali hubungan khas yang diluluskan.
- Unit organisasi tidak boleh dipindahkan kepada negara lain hanya melalui perubahan parent biasa.
- Perubahan struktur mesti mengekalkan sejarah.
- Perubahan hierarki tidak boleh secara automatik memindahkan rekod sejarah operasi.
- Konfigurasi satu negara tidak boleh mengubah struktur negara lain tanpa kuasa yang sah.

Hierarki akhir bagi setiap negara masih merupakan keputusan terbuka.

### 2.3 Struktur Fleksibel

Sistem tidak boleh menganggap semua negara menggunakan struktur:

`Markaz Negara → Markaz Negeri → Zone → Halqah → Mohallah`

Struktur sebenar mesti mengikut konfigurasi yang diluluskan bagi negara berkenaan.

Contohnya:

- Sesebuah negara boleh menggunakan Zone.
- Sesebuah negara boleh tidak menggunakan Zone.
- Sesebuah negara boleh mempunyai peringkat tambahan.
- Sesebuah negara boleh menggunakan susunan pentadbiran yang berbeza.

Walau bagaimanapun, hubungan organisasi mesti kekal konsisten, boleh disahkan dan boleh diaudit.

### 2.4 Status Keputusan Hierarki

**Status: OPEN DECISION**

Perkara yang masih perlu diputuskan:

- Hierarki standard yang dicadangkan.
- Peringkat wajib dan pilihan.
- Kebenaran mewujudkan peringkat tambahan.
- Kuasa meluluskan perubahan hierarki.
- Hubungan antara peringkat organisasi dan kuasa pentadbiran.
- Kesan perubahan hierarki terhadap rekod sedia ada.

Rujukan: `OPEN_DECISIONS_REGISTER.md`, ODR-002.

## 3. Peraturan Keahlian dan Penempatan

### 3.1 Ahbab dan Mohallah

- Seorang Ahbab hanya boleh mempunyai satu Mohallah aktif pada satu-satu masa.
- Ahbab boleh berpindah ke Mohallah lain.
- Perpindahan biasa boleh dimulakan oleh Ahbab melalui perubahan alamat aktif tanpa kelulusan Admin, tertakluk kepada pengenalpastian Mohallah yang sah.
- Sistem mesti mengekalkan sejarah keahlian.
- Keahlian Mohallah lama ditamatkan mengikut proses perpindahan yang sah.
- Keahlian baharu diwujudkan mengikut proses penempatan yang ditetapkan.
- Semua sejarah keahlian, tarikh kuat kuasa dan rekod perpindahan mesti dikekalkan.
- Rekod aktiviti terdahulu kekal terikat kepada organisasi tempat aktiviti itu berlaku.

Perubahan penempatan tidak boleh memadam atau memindahkan rekod sejarah operasi ke organisasi baharu.

Perubahan alamat dan pengurusan profil Ahbab dirujuk kepada `JMV2001-Ahbab-Profile-Account-Management.md`.

### 3.2 Alamat Kediaman

- Ahbab boleh mendaftarkan lebih daripada satu alamat kediaman.
- Hanya satu alamat boleh berstatus `ACTIVE` pada satu-satu masa.
- Ahbab sendiri memilih alamat aktif.
- Perubahan alamat aktif boleh mengubah penempatan pentadbiran/Mohallah jika sistem dapat mengenal pasti Mohallah dengan yakin.
- Sistem perlu memaklumkan Ahbab selepas perubahan.
- Sejarah alamat dan sejarah keahlian Mohallah mesti dikekalkan.

Jika sistem tidak dapat mengenal pasti Mohallah dengan yakin:

- Alamat masih boleh diaktifkan.
- Status penempatan menjadi `PENDING MOHALLAH ASSIGNMENT`.
- Admin berkaitan dimaklumkan.
- Admin yang mempunyai kuasa boleh menyelesaikan penempatan kemudian.
- Sistem merekodkan tarikh, pihak yang menyelesaikan dan sejarah perubahan.
- Sistem tidak boleh membuat penempatan berdasarkan tekaan.

Status `PENDING MOHALLAH ASSIGNMENT` ialah status penempatan, bukan status akaun Ahbab.

### 3.3 Mohallah dan Halqah

Bagi negara yang menggunakan struktur Halqah:

- Setiap Mohallah hanya boleh berada di bawah satu Halqah aktif pada satu-satu masa.
- Hanya Admin yang mempunyai kuasa penempatan boleh menukar penempatan Mohallah.
- Penempatan boleh berubah pada masa hadapan.
- Sistem mesti menyimpan sejarah penempatan.
- Sejarah sekurang-kurangnya mengandungi tarikh kuat kuasa, Admin yang membuat perubahan dan sebab perubahan.

Apabila Ahbab berpindah Mohallah, konteks Halqah Ahbab mengikuti penempatan Halqah bagi Mohallah baharu.

Peraturan ini tertakluk kepada hierarki negara yang telah dikonfigurasi.

### 3.4 Halqah dan Zone

Bagi negara yang menggunakan struktur Halqah dan Zone:

- Setiap Halqah boleh berada di bawah satu Zone atau tidak mempunyai Zone.
- Admin yang diberi kuasa menentukan penempatan Halqah.
- Admin boleh menukar Zone atau menetapkan Halqah tanpa Zone jika struktur negara membenarkannya.
- Semua perubahan mesti mempunyai sejarah, tarikh kuat kuasa, Admin dan sebab.

Sistem tidak boleh mewajibkan Zone bagi negara yang tidak menggunakan peringkat tersebut.

### 3.5 Zone dan Markaz Negeri

Bagi negara yang menggunakan struktur Zone:

- Setiap Zone mesti berada di bawah satu Markaz Negeri.
- Zone tidak boleh wujud tanpa parent yang sah.
- Admin yang diberi kuasa boleh memindahkan Zone ke Markaz Negeri lain.
- Sejarah perpindahan mesti dikekalkan.
- Pemindahan tidak boleh mengubah pemilikan sejarah rekod operasi.

### 3.6 Markaz Negeri dan Markaz Negara

- Setiap Markaz Negeri mesti berada di bawah satu Markaz Negara pada satu-satu masa, jika struktur negara menggunakan kedua-dua peringkat.
- Markaz Negeri boleh mempunyai Halqah secara langsung tanpa Zone jika konfigurasi negara membenarkannya.
- Setiap negara mempunyai identiti negara tersendiri dalam sistem.
- Hubungan pentadbiran dengan Markaz Negara negara lain tidak menggabungkan identiti atau data negara.
- Jika sesebuah negara belum mempunyai Markaz Negara sendiri, negara tersebut boleh bernaung di bawah Markaz Negara negara lain melalui hubungan yang diluluskan.
- Negara naungan kekal sebagai entiti negara berasingan.
- Negara naungan boleh berpindah kepada Markaz Negara lain melalui proses yang diluluskan.
- Sejarah hubungan, tarikh kuat kuasa, pihak yang meluluskan dan sebab perubahan mesti direkodkan.

Istilah rasmi bagi hubungan negara naungan masih belum dimuktamadkan.

## 4. Pentadbiran Negara dan Akses

### 4.1 Pemisahan System Administration dan Organizational Governance

Pentadbiran sistem dan kepimpinan organisasi ialah dua perkara berbeza.

System role menentukan kuasa pentadbiran sistem mengikut UAC.

Jawatan organisasi menentukan tanggungjawab kepimpinan dalam struktur organisasi.

Seseorang yang mempunyai system role tidak secara automatik menjadi pemegang jawatan organisasi.

Begitu juga, pemegang jawatan organisasi tidak secara automatik mempunyai semua kuasa pentadbiran sistem.

### 4.2 SUPER_ADMIN

`SUPER_ADMIN` mempunyai skop pentadbiran sistem global.

Tanggungjawab dan kuasa mengikut UAC termasuk:

- Mengurus konfigurasi dan kawalan sistem global.
- Mengurus baseline organisasi global.
- Melihat rekod seluruh negara mengikut kawalan keselamatan.
- Mengurus konfigurasi yang ditetapkan sebagai kuasa global.
- Mengurus Global Baseline Syukbah.
- Menyelia pentadbiran sistem dan tindakan global.
- Melaksanakan tindakan global yang dibenarkan oleh UAC.

Semua tindakan pentadbiran mesti direkodkan dalam Audit Log.

SUPER_ADMIN tidak boleh menggunakan akses global sebagai alasan untuk mengabaikan audit atau kawalan keselamatan.

SUPER_ADMIN tidak secara automatik menjadi Amer Negara, Faisalah atau pemegang jawatan kepimpinan organisasi.

### 4.3 Country ADMIN

`ADMIN` mempunyai skop pentadbiran mengikut negara dan kuasa yang diberikan.

Prinsip:

- Admin negara hanya mempunyai skop negara yang ditugaskan.
- Admin tidak mempunyai kuasa pentadbiran terhadap negara lain secara automatik.
- Akses terhad kepada negara dan skop yang diluluskan.
- Pelantikan dan penamatan tugas Admin mesti direkodkan.
- Tindakan mesti mengikut UAC Matrix.
- Admin negara tidak secara automatik mempunyai semua kuasa kepimpinan organisasi.
- Admin negara tidak boleh mengubah konfigurasi global yang dikhaskan kepada SUPER_ADMIN.

Hubungan pentadbiran negara mesti disahkan di backend berdasarkan rekod role dan skop negara dalam database.

Client-supplied country, role atau identiti organisasi tidak boleh dianggap sebagai bukti authorization.

### 4.4 Markaz Negara Naungan

Markaz Negara yang menaungi negara lain mempunyai kuasa penyeliaan terhadap negara naungan mengikut hubungan dan skop yang diluluskan.

Prinsip:

- Negara naungan kekal sebagai negara berasingan.
- Data negara tidak digabungkan.
- Pentadbiran tempatan negara naungan kekal dikenal pasti.
- Kuasa penyeliaan tidak secara automatik memberikan semua kuasa operasi tempatan.
- Pelantikan Admin tempatan mesti mengikut mekanisme pelantikan yang diluluskan.
- Tindakan penyeliaan dan pentadbiran mesti direkodkan.
- Akses kepada rekod negara naungan mesti mempunyai asas authorization yang jelas.

Skop kuasa terperinci Markaz Negara yang menaungi masih tertakluk kepada keputusan tadbir urus.

### 4.5 Negara sebagai Entiti Berasingan

- Setiap negara kekal sebagai entiti berasingan.
- Hubungan naungan tidak menggabungkan data negara.
- Rekod organisasi dan laporan negara mesti kekal boleh dikenal pasti mengikut negara masing-masing.
- Perubahan hubungan naungan tidak boleh mengubah pemilikan sejarah rekod operasi.
- Akses silang negara mesti mempunyai asas kuasa yang jelas dan diaudit.
- Pertukaran hubungan naungan tidak boleh memindahkan role atau appointment secara automatik.

### 4.6 Prinsip Pengasingan Data

Semua API dan operasi data mesti menguatkuasakan skop negara dan organisasi.

Sekurang-kurangnya:

1. Backend mengesahkan identiti pengguna melalui session yang sah.
2. Backend mendapatkan role dan skop daripada rekod database.
3. Backend mengesahkan hubungan pengguna dengan negara atau organisasi yang diminta.
4. Backend menyemak resource-level authorization.
5. Permintaan yang tidak dapat disahkan mesti ditolak.
6. Frontend tidak boleh menjadi satu-satunya lapisan kawalan akses.

Rujukan terperinci ialah `UAC_MATRIX.md`.

## 5. Struktur Kepimpinan dan Pentadbiran

### 5.1 Prinsip Kepimpinan

Setiap unit organisasi yang memerlukan pentadbiran kepimpinan mempunyai:

- Seorang Chief Admin.
- Seorang atau lebih Deputy Chief Admin.

Hanya seorang Chief Admin aktif dibenarkan bagi setiap unit organisasi pada satu-satu masa.

Bilangan Deputy Chief Admin tidak dihadkan kepada seorang.

Pelantikan dan penamatan jawatan mesti mempunyai rekod sejarah.

Jawatan organisasi tidak boleh disamakan dengan system role atau appointment operasi yang lain.

### 5.2 Gelaran Kepimpinan

Gelaran kepimpinan yang telah dikenal pasti:

- Markaz Negeri: Chief Admin dikenali sebagai `Faisalah`.
- Markaz Negara: model kepimpinan akhir masih belum diputuskan.
- Peringkat lain menggunakan prinsip Chief Admin dan Deputy Chief Admin mengikut struktur negara yang diluluskan.

Penggunaan gelaran tidak boleh digunakan untuk membuat andaian tentang kuasa yang belum diluluskan.

### 5.3 Pilihan Tadbir Urus Markaz Negara

**Status: OPEN DECISION**

Dua pilihan sedang dipertimbangkan.

**Pilihan A — Amer Negara**

- Amer Negara menjadi pihak yang mempunyai kuasa keputusan akhir.
- Struktur keputusan akhir tidak memerlukan Faisalah berasingan bagi fungsi yang sama.

**Pilihan B — Ahli Syura dengan Faisalah**

- Beberapa Admin membentuk Ahli Syura.
- Ahli Syura memberikan pandangan, nasihat dan cadangan.
- Salah seorang dilantik sebagai Faisalah.
- Faisalah mempunyai kuasa keputusan akhir.

Kedua-dua pilihan ini ialah alternatif.

Sistem tidak boleh menganggap kedua-duanya digunakan serentak sebagai struktur keputusan akhir.

Keputusan rasmi mesti direkodkan dalam Master Decision Register sebelum pembangunan kuasa khusus dibuat.

Rujukan: `OPEN_DECISIONS_REGISTER.md`, ODR-001.

### 5.4 Pengasingan Kepimpinan dan Pentadbiran

Sistem mesti membezakan:

- System role.
- Jawatan Chief Admin.
- Jawatan Deputy Chief Admin.
- Jawatan Amer.
- Jawatan Supervisor.
- Admin Markaz.
- Admin Syukbah.
- Admin Takaza.
- Delegated authority.
- Temporary acting authority.

Pelantikan kepada satu jawatan tidak boleh secara automatik memberikan semua kuasa jawatan lain.

## 6. Peranan Chief Admin

Chief Admin bertanggungjawab terhadap pentadbiran organisasi dalam skopnya.

Tanggungjawab umum:

- Menyelaras Admin Markaz.
- Menyelaras hubungan pentadbiran dengan Admin Syukbah.
- Memantau aktiviti dan laporan organisasi.
- Mengagihkan tugas pentadbiran.
- Memastikan keputusan yang diluluskan dilaksanakan.
- Memantau perkembangan organisasi.
- Menyediakan atau menyelaras laporan kepada peringkat lebih tinggi.
- Mengurus tindakan organisasi mengikut kuasa yang diberikan.
- Memberikan persetujuan bagi bantuan silang organisasi jika mempunyai kuasa.
- Memantau pelaksanaan tanggungjawab yang telah didelegasikan.

Chief Admin tidak secara automatik mempunyai semua kuasa Admin Syukbah atau Admin Takaza.

Setiap jenis Admin mempunyai tanggungjawab dan kebenaran yang berasingan.

Kuasa sebenar mesti ditentukan melalui UAC dan keputusan tadbir urus yang diluluskan.

## 7. Peranan Deputy Chief Admin

Deputy Chief Admin:

- Membantu Chief Admin.
- Boleh menjalankan tugas yang diwakilkan.
- Boleh memangku tugas apabila Chief Admin tidak hadir, tidak aktif atau tidak dapat dihubungi, mengikut proses pelantikan atau pemangkuan yang sah.
- Tidak memperoleh semua kuasa Chief Admin secara automatik hanya kerana memegang jawatan Deputy.
- Tidak boleh membuat keputusan di luar skop delegation yang sah.

Sistem perlu merekodkan:

- Deputy yang memangku.
- Tempoh pemangkuan.
- Skop kuasa.
- Pihak yang memberikan kuasa pemangkuan.
- Tarikh mula dan tamat.
- Sebab pemangkuan jika diperlukan.
- Status pemangkuan.

### 7.1 Pemangkuan

Prinsip sementara:

- Chief Admin boleh menentukan Deputy yang memangku tugas dalam skop kuasanya.
- Jika Chief Admin tidak dapat membuat keputusan, proses penentuan pemangku perlu mengikut kuasa peringkat lebih tinggi yang sah.
- Semua kuasa pemangkuan mesti mempunyai skop dan tempoh.
- Kuasa pemangkuan tamat apabila tempoh atau keadaan pemangkuan berakhir.
- Tindakan yang dibuat semasa pemangkuan mesti boleh dikenal pasti sebagai tindakan pemangku.

Mekanisme terperinci bagi pelantikan dan delegasi Deputy masih perlu dimuktamadkan.

Rujukan: `OPEN_DECISIONS_REGISTER.md`, ODR-009.

## 8. Proses Cadangan dan Keputusan

### 8.1 Prinsip Umum

Proses cadangan dan keputusan mesti mengikuti struktur tadbir urus yang telah diluluskan.

Aliran umum:

1. Cadangan dikemukakan kepada pihak kepimpinan berkaitan.
2. Cadangan direkodkan.
3. Ahli Syura memberikan pandangan atau nasihat jika struktur Ahli Syura telah digunakan dan diluluskan.
4. Pihak yang mempunyai kuasa keputusan akhir membuat keputusan.
5. Keputusan direkodkan.
6. Admin berkaitan menerima makluman selepas keputusan disahkan.
7. Admin yang diberi kuasa mengurus pelaksanaan keputusan.
8. Pelaksanaan dan tindakan susulan direkodkan.

Sistem tidak boleh menentukan pemutus akhir berdasarkan andaian apabila model tadbir urus belum diluluskan.

### 8.2 Status Keputusan

Status keputusan sekurang-kurangnya merangkumi:

- `APPROVED`
- `REJECTED`
- `RETURNED`

Status ini digunakan untuk merekodkan hasil proses keputusan yang berkaitan.

Maksud dan transisi status hendaklah konsisten dalam workflow yang menggunakannya.

### 8.3 Maklumat Keputusan

Keputusan mesti menyimpan:

- Kandungan cadangan.
- Pihak yang mengemukakan cadangan.
- Pandangan dan nasihat Ahli Syura jika berkenaan.
- Keputusan akhir.
- Sebab keputusan.
- Pihak yang membuat keputusan.
- Tarikh dan masa.
- Status keputusan.
- Sejarah tindakan susulan.
- Rekod pindaan atau pembatalan jika berlaku.

### 8.4 Kuasa Keputusan Akhir

Kuasa keputusan akhir mesti mengikuti struktur Markaz Negara atau peringkat organisasi yang telah diluluskan.

Bagi struktur Markaz Negara yang masih OPEN, sistem tidak boleh menganggap salah satu pilihan sebagai model rasmi.

### 8.5 Pindaan atau Pembatalan Keputusan

Keputusan yang telah disahkan boleh dipinda atau dibatalkan oleh pihak yang mempunyai kuasa berkaitan.

Sistem mesti:

- Meminta sebab pindaan atau pembatalan.
- Mengekalkan keputusan asal.
- Menyimpan keputusan baharu.
- Merekodkan pihak yang membuat perubahan.
- Merekodkan tarikh dan masa.
- Mengekalkan keseluruhan sejarah keputusan.

Pindaan tidak boleh memadam keputusan asal daripada sejarah.

## 9. Pelantikan Admin

### 9.1 Prinsip Umum

Pelantikan Admin mesti mengikut:

- Skop organisasi.
- Jenis Admin.
- Kuasa pihak yang melantik.
- Kelayakan calon.
- Persetujuan calon jika diwajibkan.
- Tempoh pelantikan jika berkenaan.
- Rekod keputusan.
- Audit trail.

Jenis Admin perlu dibezakan sekurang-kurangnya kepada:

- Admin Markaz.
- Admin Syukbah.
- Admin Takaza.

Pelantikan satu jenis Admin tidak secara automatik memberikan kuasa jenis Admin yang lain.

### 9.2 Pelantikan Chief Admin dan Deputy Chief Admin

**Status: OPEN DECISION**

Mekanisme khusus masih belum dimuktamadkan.

Perkara yang perlu diputuskan:

- Pihak yang boleh mencalonkan.
- Pihak yang boleh memilih.
- Pihak yang meluluskan.
- Kelayakan calon.
- Tempoh jawatan.
- Persetujuan calon.
- Penamatan dan penggantian.
- Mekanisme pemangkuan.
- Pengendalian kekosongan jawatan.

SUPER_ADMIN boleh mengurus konfigurasi sistem yang berkaitan, tetapi konfigurasi teknikal tidak boleh menggantikan keputusan tadbir urus yang belum diluluskan.

Rujukan: `OPEN_DECISIONS_REGISTER.md`, ODR-009.

### 9.3 Pelantikan Admin Syukbah

Admin Syukbah ialah fungsi pentadbiran berasingan daripada Admin Markaz.

Kuasa pelantikan mesti mengikut struktur tadbir urus dan UAC yang diluluskan.

Jangan menganggap Local Chief Admin mempunyai kuasa mutlak untuk melantik atau menamatkan semua Admin Syukbah tanpa merujuk kepada skop kuasa yang telah dipersetujui.

Kelayakan dan proses pelantikan Admin Syukbah masih mempunyai perkara terbuka.

Rujukan:

- `JMV2003-Syukbah-Management.md`
- `OPEN_DECISIONS_REGISTER.md`, ODR-003, ODR-011 dan ODR-012.

### 9.4 Pelantikan Admin Takaza

Admin Takaza ialah peranan khusus untuk pengurusan Takaza.

Kuasa dan tanggungjawabnya ditentukan oleh spesifikasi Takaza dan UAC.

Pelantikan Admin Takaza tidak menjadikannya Admin Markaz atau Admin Syukbah secara automatik.

Pelantikan dan penamatan mesti mengikut kuasa yang diluluskan serta mempunyai rekod audit.

Rujukan: `JMV2004-Takaza-Management.md`.

### 9.5 Appointment dan Delegation

Appointment dan delegation mesti mempunyai rekod yang berasingan daripada system role.

Rekod appointment atau delegation perlu mengenal pasti:

- Individu yang dilantik atau menerima delegation.
- Jawatan atau tanggungjawab.
- Organisasi atau unit berkaitan.
- Skop kuasa.
- Pihak yang melantik atau mendelegasikan.
- Tarikh mula.
- Tarikh tamat jika berkenaan.
- Status.
- Sebab atau justifikasi jika diperlukan.

Appointment yang telah tamat atau dibatalkan tidak boleh terus memberikan kuasa.

## 10. Pengasingan Admin Markaz dan Admin Syukbah

Setiap peringkat Markaz mempunyai fungsi pentadbiran yang berasingan:

1. Admin Markaz.
2. Admin Syukbah.

Chief Admin menyelaras urusan organisasi dan hubungan pentadbiran antara kedua-dua fungsi mengikut kuasanya.

Admin Markaz bertanggungjawab terhadap urusan pentadbiran organisasi.

Admin Syukbah bertanggungjawab terhadap urusan Syukbah masing-masing.

Prinsip:

- Kedua-dua fungsi tidak boleh dianggap sama.
- Pelantikan satu fungsi tidak memberikan kuasa fungsi yang lain.
- Akses ditentukan melalui UAC.
- Semua tindakan direkodkan.
- Admin Syukbah tidak secara automatik mempunyai kuasa untuk mengubah struktur Markaz.
- Admin Markaz tidak secara automatik mempunyai semua kuasa operasi dalaman Syukbah.
- Delegation antara kedua-dua fungsi mesti mempunyai skop yang jelas.
- Pengurusan Syukbah secara terperinci dirujuk kepada JMV2003.

### 10.1 Moderator

Moderator ialah permission khusus untuk ruang perbincangan Syukbah.

Prinsip baseline:

- Admin Syukbah secara automatik menjadi Moderator bagi ruang perbincangan Syukbah sendiri.
- Admin Syukbah boleh melantik atau membatalkan Moderator tambahan mengikut peraturan modul.
- Moderator hanya mempunyai permission perbincangan yang ditetapkan.
- Moderator tidak secara automatik mempunyai kuasa pentadbiran rekod Syukbah.

Moderator tidak boleh dianggap sebagai Admin Syukbah.

Perincian permission Moderator dirujuk kepada JMV2003 dan UAC Matrix.

## 11. Bantuan Silang Peringkat

Admin daripada organisasi lain boleh membantu organisasi lain melalui proses bantuan silang yang sah.

Bantuan silang tidak bermaksud pertukaran jawatan atau pelantikan Admin kekal.

### 11.1 Syarat Bantuan Silang

Syarat:

1. Persetujuan Chief Admin organisasi pemberi bantuan.
2. Persetujuan Chief Admin organisasi penerima bantuan.
3. Skop tugasan yang jelas.
4. Tempoh bantuan yang jelas.
5. Akses sistem terhad kepada tugasan yang diluluskan.
6. Akses kepada data sensitif hanya jika benar-benar diperlukan.
7. Semua persetujuan dan tindakan direkodkan.

Jika salah satu persetujuan yang diwajibkan tiada, bantuan silang tidak boleh diaktifkan.

### 11.2 Maklumat Rekod Bantuan

Maklumat yang mesti direkodkan:

- Organisasi pemberi bantuan.
- Organisasi penerima bantuan.
- Negara yang terlibat.
- Admin yang terlibat.
- Tugasan.
- Skop akses.
- Tarikh mula.
- Tarikh tamat.
- Persetujuan kedua-dua Chief Admin.
- Pihak yang memberikan akses.
- Sejarah perubahan.
- Sebab penamatan jika berkaitan.

### 11.3 Tempoh dan Penamatan

- Akses sementara tamat apabila tempoh atau tugasan berakhir.
- Akses boleh ditamatkan lebih awal oleh pihak yang mempunyai kuasa.
- Penamatan mesti direkodkan.
- Sistem mesti memastikan akses sementara tidak kekal selepas tempoh sah.
- Bantuan silang tidak boleh memberikan kuasa melebihi skop yang diluluskan.
- Bantuan silang tidak boleh digunakan untuk memintas pengasingan data negara.

## 12. Laporan Organisasi

Laporan bergerak secara bottom-up mengikut struktur organisasi yang digunakan oleh negara.

Bagi struktur rujukan sedia ada:

- Ahbab / Individu.
- Mohallah.
- Halqah.
- Zone.
- Markaz Negeri.
- Markaz Negara.

Bagi negara yang menggunakan hierarki berbeza, sistem mesti mengikut konfigurasi organisasi negara berkenaan.

Markaz Negara ialah peringkat pelaporan kebangsaan tertinggi jika struktur negara menggunakan peringkat tersebut.

### 12.1 Prinsip Pelaporan

- Laporan mesti terikat kepada organisasi yang berkaitan.
- Rekod sejarah laporan mesti kekal terikat kepada organisasi dan tempoh asal.
- Perubahan hierarki tidak boleh memindahkan sejarah laporan secara automatik.
- Hubungan negara naungan tidak menggabungkan laporan negara.
- Akses laporan mesti mengikut UAC dan skop organisasi.
- Laporan tidak boleh didedahkan kepada Admin di luar bidang kuasanya tanpa asas authorization yang sah.

### 12.2 Perincian Laporan

Peraturan terperinci berkaitan:

- Jenis laporan.
- Kekerapan laporan.
- Pengesahan laporan.
- Tempoh edit.
- Penutupan laporan.
- Pembetulan laporan.
- Ranking.
- Statistik.
- Pelaporan antara peringkat.

akan dirujuk dalam dokumen pengurusan laporan yang berkaitan.

Perkara yang belum diputuskan tidak boleh dianggap sebagai workflow yang telah diluluskan.

## 13. Rekod Audit

Sistem perlu merekodkan sekurang-kurangnya:

- Perubahan struktur organisasi.
- Penciptaan dan penamatan unit organisasi.
- Perpindahan organisasi.
- Perubahan hubungan negara naungan.
- Pelantikan dan penamatan jawatan.
- Pemangkuan.
- Perubahan kuasa.
- Delegation.
- Cadangan dan keputusan.
- Pindaan atau pembatalan keputusan.
- Pelantikan Admin.
- Penamatan tugas Admin.
- Bantuan silang.
- Akses sementara.
- Persetujuan Chief Admin.
- Tindakan Admin.

### 13.1 Kandungan Audit

Rekod audit hendaklah mengandungi:

- Actor.
- Jenis tindakan.
- Rekod yang terlibat.
- Organisasi dan negara berkaitan.
- Nilai lama dan baharu jika berkaitan.
- Tarikh dan masa.
- Sebab atau justifikasi jika diperlukan.
- Keputusan dan status selepas tindakan.
- Skop kuasa yang digunakan jika diperlukan.

### 13.2 Integriti Audit

- Rekod audit tidak boleh diubah atau dipadam melalui operasi biasa.
- Tindakan sensitif mesti mempunyai audit trail.
- Audit mesti membezakan tindakan pengguna, tindakan Admin dan tindakan sistem.
- Permohonan yang belum diluluskan tidak boleh direkodkan seolah-olah keputusan telah dibuat.
- Sejarah pelantikan dan keputusan mesti kekal boleh dirujuk.
- Akses kepada Audit Log mesti mengikut UAC.

## 14. Perkara Belum Dimuktamadkan

Perkara berikut kekal sebagai keputusan terbuka atau memerlukan perincian lanjut.

### 14.1 Model Tadbir Urus Markaz Negara

**Status: OPEN**

Dua alternatif:

1. Amer Negara sebagai pemutus akhir.
2. Ahli Syura dengan Faisalah sebagai pemutus akhir.

Sistem tidak boleh melaksanakan kedua-duanya sebagai model keputusan akhir serentak.

Rujukan: ODR-001.

### 14.2 Hierarki Organisasi Setiap Negara

**Status: OPEN**

Perlu dimuktamadkan:

- Hierarki standard.
- Peringkat wajib dan pilihan.
- Peringkat tambahan.
- Hubungan parent-child.
- Kuasa meluluskan perubahan struktur.
- Kesan perubahan terhadap rekod sedia ada.

Rujukan: ODR-002.

### 14.3 Hubungan Negara Naungan

**Status: OPEN**

Perlu dimuktamadkan:

- Istilah rasmi.
- Kuasa penyeliaan.
- Kuasa pentadbiran tempatan.
- Mekanisme pertukaran hubungan naungan.
- Kelulusan yang diperlukan.
- Had akses silang negara.

### 14.4 Pelantikan Chief Admin dan Deputy Chief Admin

**Status: OPEN**

Perlu dimuktamadkan:

- Pihak yang mencalonkan.
- Pihak yang memilih.
- Pihak yang meluluskan.
- Kelayakan calon.
- Persetujuan calon.
- Tempoh jawatan.
- Penamatan dan penggantian.
- Mekanisme pemangkuan.

Rujukan: ODR-009.

### 14.5 Kuasa Setiap Jawatan

**Status: NEEDS FURTHER DEFINITION**

Perincian kuasa perlu diselaraskan antara:

- SUPER_ADMIN.
- Country ADMIN.
- Chief Admin.
- Deputy Chief Admin.
- Admin Markaz.
- Admin Syukbah.
- Admin Takaza.
- Amer.
- Supervisor.
- Moderator.
- TAFAKUT Assessor.

Tiada kuasa tambahan boleh dianggap wujud hanya berdasarkan gelaran jawatan.

### 14.6 Kuasa Penyeliaan Negara Naungan

**Status: OPEN**

Perlu dimuktamadkan skop kuasa Markaz Negara yang menaungi negara lain, termasuk perbezaan antara penyeliaan dan pentadbiran operasi tempatan.

### 14.7 Pelantikan dan Penamatan Admin Syukbah

**Status: OPEN**

Perlu dimuktamadkan:

- Kuasa melantik.
- Kuasa menamatkan.
- Kelayakan calon.
- Keperluan TAFAKUT.
- Persetujuan calon.
- Tempoh pelantikan.
- Delegation Deputy.

Rujukan: ODR-003, ODR-011 dan ODR-012.

### 14.8 Delegasi dan Pemangkuan Deputy

**Status: OPEN**

Perlu dimuktamadkan:

- Skop delegation.
- Kuasa yang boleh dipangku.
- Kuasa yang tidak boleh dipangku.
- Pihak yang meluluskan pemangkuan.
- Tempoh.
- Penamatan.
- Keperluan audit.

### 14.9 Aliran Laporan

**Status: NEEDS FURTHER DEFINITION**

Perincian aliran laporan, pengesahan, tempoh edit, penutupan dan pembetulan mesti diselaraskan dengan dokumen laporan yang berkaitan.

Semua perkara di atas hendaklah diselaraskan dengan `OPEN_DECISIONS_REGISTER.md` dan `MASTER_DECISION_REGISTER.md`.

## 15. Related Documents

Dokumen ini perlu dibaca bersama:

- `MASTER_DECISION_REGISTER.md`
- `OPEN_DECISIONS_REGISTER.md`
- `MODULE_REQUIREMENTS.md`
- `UAC_MATRIX.md`
- `JMV2001-Ahbab-Profile-Account-Management.md`
- `JMV2003-Syukbah-Management.md`
- `JMV2004-Takaza-Management.md`
- `V2_DESIGN_CHECKPOINT.md`
- `V2_IMPLEMENTATION_STATUS.md`
- `DASHBOARD_NAVIGATION_SPEC_V2.md`

Jika terdapat percanggahan:

1. Keputusan terkini yang telah dipersetujui dalam Master Decision Register menjadi rujukan utama.
2. Open Decisions Register menjadi rujukan bagi perkara yang belum diputuskan.
3. UAC Matrix menentukan authorization dan skop akses.
4. Dokumen ini menetapkan baseline struktur organisasi dan tadbir urus.
5. Dokumen modul berkaitan menentukan workflow operasi khusus.
6. Perkara yang masih `OPEN`, `PENDING`, `PROVISIONAL` atau `ON HOLD` mesti mengekalkan status tersebut.

Dokumen ini tidak boleh mengubah keputusan yang telah diluluskan melalui daftar keputusan rasmi.

## 16. Nota Pembangunan dan Working Rules

Dokumen ini ialah baseline keperluan untuk semakan.

Peraturan pembangunan:

- Jangan membina fungsi yang masih berstatus `PENDING` atau `OPEN` seolah-olah keputusan telah diluluskan.
- Jangan menganggap struktur organisasi bagi satu negara mesti digunakan secara mutlak oleh semua negara.
- Jangan menganggap hubungan negara naungan menggabungkan data negara.
- Jangan mencampurkan kuasa SUPER_ADMIN dengan jawatan kepimpinan organisasi.
- Jangan mencampurkan kuasa Country ADMIN dengan kuasa Chief Admin tanpa asas authorization yang sah.
- Jangan mencampurkan kuasa Admin Markaz, Admin Syukbah dan Admin Takaza.
- Jangan menganggap Deputy mempunyai semua kuasa Chief Admin secara automatik.
- Jangan mengaktifkan delegation tanpa skop dan tempoh yang sah.
- Jangan membenarkan akses silang organisasi tanpa persetujuan kedua-dua Chief Admin dan skop tugasan yang direkodkan.
- Jangan menggunakan frontend sebagai satu-satunya kawalan authorization.
- Jangan menerima role, country atau organization scope daripada client sebagai bukti kuasa.
- Jangan memindahkan sejarah operasi apabila struktur organisasi berubah.
- Jangan memadam sejarah pelantikan, keputusan atau hubungan organisasi.
- Jangan membina semula jadual database yang telah wujud tanpa audit schema.
- Jangan menyatakan fungsi sebagai `IMPLEMENTED` tanpa bukti kod dan ujian.
- Semua pelaksanaan mesti mematuhi UAC, audit dan keputusan rasmi yang telah diluluskan.
- Semua perkara yang belum diputuskan mesti kekal sebagai `OPEN`, `PENDING`, `PROVISIONAL` atau `ON HOLD` mengikut status sebenar.

---

**Document Status:** REQUIREMENTS BASELINE — FOR REVIEW  
**Version:** 1.2  
**Last Updated:** 28 November 2026  
**Next Review:** Verification of Organization Hierarchy, Country Administration, Leadership Appointments, Cross-Organization Support and Governance Workflows.

**Tamat — Organization Structure & Governance**
