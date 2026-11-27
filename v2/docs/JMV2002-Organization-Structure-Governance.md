JUHUDMANAGER V2 — ORGANIZATION STRUCTURE & GOVERNANCE

Document ID: JMV2002
Version: 1.1 — Consolidated Working Baseline
Status: REQUIREMENTS BASELINE — FOR REVIEW
Last Updated: 27 November 2026
Repository Path: "v2/docs/JMV2002-Organization-Structure-Governance.md"

---

1. Tujuan

Dokumen ini menetapkan struktur organisasi dan prinsip tadbir urus JuhudManager V2, termasuk:

- Struktur organisasi dan hubungan antara peringkat.
- Penempatan Ahbab dan hubungan keahlian.
- Pentadbiran negara dan hubungan negara naungan.
- Pelantikan kepimpinan.
- Kuasa Chief Admin dan Deputy Chief Admin.
- Pengurusan Admin Markaz dan Admin Syukbah.
- Proses membuat keputusan.
- Bantuan silang organisasi.
- Audit dan sejarah perubahan.

Sistem perlu merekodkan struktur organisasi, hubungan pentadbiran, pelantikan, kuasa membuat keputusan dan sejarah perubahan.

Perkara yang belum diputuskan hendaklah kekal sebagai "PENDING" dan tidak boleh dianggap telah diluluskan.

2. Hierarki Organisasi

2.1 Prinsip Umum

Struktur organisasi dibentuk secara bertingkat dan hubungan pentadbiran hendaklah jelas.

Struktur yang digunakan dalam baseline sedia ada ialah:

1. Individu / Ahbab
2. Mohallah
3. Halqah
4. Zone
5. Markaz Negeri
6. Markaz Negara

Walau bagaimanapun, struktur akhir organisasi bagi setiap negara masih perlu diselaraskan dengan keperluan negara berkenaan.

Cadangan peringkat yang turut perlu dipertimbangkan:

- Markaz Negara
- Negeri
- Daerah
- Kawasan
- Mohallah

Nama, bilangan dan susunan peringkat organisasi tidak boleh dianggap seragam untuk semua negara sebelum keputusan hierarki negara dimuktamadkan.

2.2 Konfigurasi Negara

Sistem perlu menyokong konfigurasi hierarki organisasi mengikut negara.

Prinsip:

- Setiap rekod organisasi mesti mempunyai negara yang jelas.
- Hubungan parent-child organisasi mesti sah.
- Satu unit organisasi tidak boleh mempunyai dua parent aktif pada masa yang sama, kecuali hubungan khas yang diluluskan.
- Perubahan struktur mesti mengekalkan sejarah.
- Perubahan hierarki tidak boleh secara automatik memindahkan atau mengubah rekod sejarah operasi.

Status: Hierarki akhir setiap negara masih "PENDING".

3. Peraturan Keahlian dan Penempatan

3.1 Ahbab dan Mohallah

- Seorang Ahbab hanya boleh mempunyai satu Mohallah aktif pada satu-satu masa.
- Ahbab boleh berpindah ke Mohallah lain.
- Perpindahan boleh dimulakan sendiri oleh Ahbab tanpa kelulusan Admin bagi proses pertukaran alamat biasa.
- Sistem perlu menamatkan keahlian Mohallah lama dan merekodkan keahlian baharu.
- Semua sejarah keahlian, tarikh kuat kuasa dan rekod perpindahan mesti dikekalkan.
- Rekod aktiviti terdahulu kekal terikat kepada Mohallah tempat aktiviti itu berlaku.

Perubahan penempatan tidak boleh memadam atau memindahkan rekod sejarah operasi ke organisasi baharu.

3.2 Alamat Kediaman

- Ahbab boleh mendaftarkan lebih daripada satu alamat kediaman.
- Hanya satu alamat boleh berstatus aktif pada satu-satu masa.
- Ahbab sendiri memilih alamat aktif.
- Perubahan alamat aktif akan mengubah penempatan pentadbiran/Mohallah jika sistem dapat mengenal pasti Mohallah berkenaan.
- Sistem perlu memaklumkan Ahbab selepas perubahan.
- Sejarah alamat dan sejarah keahlian Mohallah mesti dikekalkan.

Jika sistem tidak dapat mengenal pasti Mohallah dengan yakin:

- Alamat masih boleh diaktifkan.
- Status penempatan menjadi "PENDING MOHALLAH ASSIGNMENT".
- Admin berkaitan dimaklumkan.
- Admin boleh menyelesaikan penempatan kemudian.
- Sistem merekodkan tarikh, pihak yang menyelesaikan dan sejarah perubahan.

3.3 Mohallah dan Halqah

Bagi negara yang menggunakan struktur Halqah:

- Setiap Mohallah hanya boleh berada di bawah satu Halqah aktif pada satu-satu masa.
- Hanya Admin yang mempunyai kuasa penempatan boleh menukar penempatan Mohallah.
- Penempatan boleh berubah pada masa hadapan.
- Sistem mesti menyimpan sejarah penempatan, tarikh kuat kuasa, Admin yang membuat perubahan dan sebab perubahan.

Apabila Ahbab berpindah Mohallah, konteks Halqah Ahbab mengikuti Halqah yang ditetapkan kepada Mohallah baharu.

Peraturan ini tertakluk kepada hierarki negara yang telah dikonfigurasi.

3.4 Halqah dan Zone

Bagi negara yang menggunakan struktur Halqah dan Zone:

- Setiap Halqah boleh berada di bawah satu Zone atau tidak mempunyai Zone.
- Admin yang diberi kuasa menentukan penempatan Halqah.
- Admin boleh menukar Zone atau menetapkan Halqah tanpa Zone jika struktur negara membenarkannya.
- Semua perubahan mesti mempunyai sejarah, tarikh kuat kuasa, Admin dan sebab.

3.5 Zone dan Markaz Negeri

Bagi negara yang menggunakan struktur Zone:

- Setiap Zone mesti berada di bawah satu Markaz Negeri.
- Zone tidak boleh wujud tanpa Markaz Negeri.
- Admin yang diberi kuasa boleh memindahkan Zone ke Markaz Negeri lain.
- Sejarah perpindahan mesti dikekalkan.

3.6 Markaz Negeri dan Markaz Negara

- Setiap Markaz Negeri mesti berada di bawah satu Markaz Negara pada satu-satu masa.
- Markaz Negeri boleh mempunyai Halqah secara langsung tanpa Zone jika konfigurasi negara membenarkannya.
- Setiap negara mempunyai identiti negara tersendiri dalam sistem.
- Hubungan pentadbiran dengan Markaz Negara negara lain tidak menggabungkan identiti atau data negara.
- Jika sesebuah negara belum mempunyai Markaz Negara sendiri, negara tersebut boleh bernaung di bawah Markaz Negara negara lain.
- Negara naungan kekal sebagai entiti negara berasingan.
- Negara naungan boleh berpindah kepada Markaz Negara lain melalui proses yang diluluskan.
- Sejarah hubungan, tarikh kuat kuasa, pihak yang meluluskan dan sebab perubahan mesti direkodkan.

Istilah rasmi bagi hubungan negara naungan masih belum dimuktamadkan.

4. Pentadbiran Negara dan Akses

4.1 SUPER_ADMIN

SUPER_ADMIN mempunyai kuasa global.

Tanggungjawab dan kuasa:

- Mengurus konfigurasi dan kawalan sistem global.
- Mengurus baseline organisasi global.
- Melihat rekod seluruh negara mengikut kawalan keselamatan.
- Mengurus konfigurasi yang ditetapkan sebagai kuasa global.
- Mengurus Global Baseline Syukbah.
- Menyelia pentadbiran sistem dan tindakan global.
- Melaksanakan tindakan global yang dibenarkan oleh UAC.

Semua tindakan pentadbiran direkodkan dalam audit log.

SUPER_ADMIN tidak boleh menggunakan akses global sebagai alasan untuk mengabaikan audit atau kawalan keselamatan.

4.2 Markaz Negara Naungan

Markaz Negara yang menaungi negara lain mempunyai kuasa penyeliaan terhadap negara naungan mengikut hubungan dan skop yang diluluskan.

Prinsip:

- Negara naungan kekal sebagai negara berasingan.
- Data negara tidak digabungkan.
- Pentadbiran tempatan negara naungan kekal dikenal pasti.
- Kuasa penyeliaan tidak secara automatik memberikan semua kuasa operasi tempatan.
- Pelantikan Admin tempatan mesti mengikut mekanisme pelantikan yang diluluskan.
- Tindakan penyeliaan dan pentadbiran mesti direkodkan.

Skop kuasa terperinci Markaz Negara yang menaungi masih tertakluk kepada konfigurasi dan keputusan tadbir urus.

4.3 Admin Negara Tempatan

- Mengurus pentadbiran negara sendiri.
- Tidak mempunyai kuasa pentadbiran terhadap negara lain secara automatik.
- Akses terhad kepada negara dan skop yang ditugaskan.
- Pelantikan dan penamatan tugas Admin direkodkan.
- Tindakan mesti mengikut UAC Matrix.

4.4 Negara sebagai Entiti Berasingan

- Setiap negara kekal sebagai entiti berasingan.
- Hubungan naungan tidak menggabungkan data negara.
- Rekod organisasi dan laporan negara mesti kekal boleh dikenal pasti mengikut negara masing-masing.
- Perubahan hubungan naungan tidak boleh mengubah pemilikan sejarah rekod operasi.
- Akses silang negara mesti mempunyai asas kuasa yang jelas dan diaudit.

5. Struktur Kepimpinan dan Pentadbiran

5.1 Prinsip Kepimpinan

Setiap peringkat organisasi yang memerlukan pentadbiran mempunyai:

- Seorang Chief Admin.
- Seorang atau lebih Deputy Chief Admin.

Hanya seorang Chief Admin aktif dibenarkan bagi setiap unit organisasi pada satu-satu masa.

Bilangan Deputy Chief Admin tidak dihadkan kepada seorang.

Pelantikan dan penamatan jawatan mesti mempunyai rekod sejarah.

5.2 Gelaran Kepimpinan

- Markaz Negeri: Chief Admin dikenali sebagai "Faisalah".
- Markaz Negara: struktur kepimpinan masih mempunyai dua pilihan yang belum dimuktamadkan.
- Peringkat lain menggunakan prinsip Chief Admin dan Deputy Chief Admin mengikut struktur negara.

5.3 Pilihan Tadbir Urus Markaz Negara

Status: OPEN DECISION

Dua pilihan sedang dipertimbangkan:

Pilihan A — Amer Negara

- Amer Negara menjadi pihak yang mempunyai kuasa keputusan akhir.
- Struktur keputusan akhir tidak memerlukan Faisalah berasingan bagi fungsi yang sama.

Pilihan B — Ahli Syura dengan Faisalah

- Beberapa Admin membentuk Ahli Syura.
- Ahli Syura memberikan pandangan, nasihat dan cadangan.
- Salah seorang dilantik sebagai Faisalah.
- Faisalah mempunyai kuasa keputusan akhir.

Kedua-dua pilihan ini ialah alternatif.

Sistem tidak boleh menganggap kedua-duanya digunakan serentak sebagai struktur keputusan akhir.

Keputusan rasmi mesti direkodkan dalam Master Decision Register sebelum pembangunan kuasa khusus dibuat.

6. Peranan Chief Admin

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

Chief Admin tidak secara automatik mempunyai semua kuasa Admin Syukbah atau Admin Takaza.

Setiap jenis Admin mempunyai tanggungjawab dan kebenaran yang berasingan.

7. Peranan Deputy Chief Admin

Deputy Chief Admin:

- Membantu Chief Admin.
- Boleh menjalankan tugas yang diwakilkan.
- Boleh memangku tugas apabila Chief Admin tidak hadir, tidak aktif atau tidak dapat dihubungi, mengikut proses pelantikan atau pemangkuan yang sah.
- Tidak memperoleh semua kuasa Chief Admin secara automatik hanya kerana memegang jawatan Deputy.

Sistem perlu merekodkan:

- Deputy yang memangku.
- Tempoh pemangkuan.
- Skop kuasa.
- Pihak yang memberikan kuasa pemangkuan.
- Tarikh mula dan tamat.
- Sebab pemangkuan jika diperlukan.

7.1 Pemangkuan

Prinsip sementara:

- Chief Admin boleh menentukan Deputy yang memangku tugas.
- Jika Chief Admin tidak dapat membuat keputusan, proses penentuan pemangku perlu mengikut kuasa peringkat lebih tinggi yang sah.
- Semua kuasa pemangkuan mesti mempunyai skop dan tempoh.
- Kuasa pemangkuan tamat apabila tempoh atau keadaan pemangkuan berakhir.

Mekanisme terperinci bagi pelantikan dan delegasi Deputy masih perlu dimuktamadkan.

8. Proses Cadangan dan Keputusan

Prinsip umum:

1. Cadangan dikemukakan kepada pihak kepimpinan berkaitan.
2. Ahli Syura memberikan pandangan atau nasihat jika struktur Ahli Syura digunakan.
3. Pihak yang mempunyai kuasa keputusan akhir membuat keputusan mengikut struktur tadbir urus yang diluluskan.
4. Admin berkaitan menerima makluman selepas keputusan disahkan.
5. Admin yang diberi kuasa mengurus pelaksanaan keputusan.

Status keputusan sekurang-kurangnya merangkumi:

- "APPROVED"
- "REJECTED"
- "RETURNED"

Keputusan mesti menyimpan:

- Kandungan cadangan.
- Pandangan dan nasihat Ahli Syura jika berkenaan.
- Keputusan akhir.
- Sebab keputusan.
- Pihak yang membuat keputusan.
- Tarikh dan masa.
- Sejarah tindakan susulan.

Kuasa keputusan akhir mesti mengikuti struktur Markaz Negara atau peringkat organisasi yang telah diluluskan.

8.1 Pindaan atau Pembatalan Keputusan

Keputusan yang telah disahkan boleh dipinda atau dibatalkan oleh pihak yang mempunyai kuasa berkaitan.

Sistem mesti:

- Meminta sebab pindaan atau pembatalan.
- Mengekalkan keputusan asal.
- Menyimpan keputusan baharu.
- Merekodkan pihak yang membuat perubahan.
- Merekodkan tarikh dan masa.
- Mengekalkan keseluruhan sejarah keputusan.

Pindaan tidak boleh memadam keputusan asal daripada sejarah.

9. Pelantikan Admin

9.1 Prinsip Umum

Pelantikan Admin mesti mengikut:

- Skop organisasi.
- Jenis Admin.
- Kuasa pihak yang melantik.
- Kelayakan calon.
- Tempoh pelantikan jika berkenaan.
- Rekod persetujuan dan keputusan.
- Audit trail.

Jenis Admin perlu dibezakan sekurang-kurangnya kepada:

- Admin Markaz.
- Admin Syukbah.
- Admin Takaza.

Pelantikan satu jenis Admin tidak secara automatik memberikan kuasa jenis Admin yang lain.

9.2 Pelantikan Chief Admin dan Deputy Chief Admin

Status: OPEN DECISION

Mekanisme khusus masih belum dimuktamadkan.

Perkara yang perlu diputuskan:

- Pihak yang boleh mencalonkan.
- Pihak yang boleh memilih.
- Pihak yang meluluskan.
- Kelayakan calon.
- Tempoh jawatan.
- Penamatan dan penggantian.
- Mekanisme pemangkuan.

SUPER_ADMIN boleh mengurus konfigurasi sistem yang berkaitan, tetapi konfigurasi teknikal tidak boleh menggantikan keputusan tadbir urus yang belum diluluskan.

9.3 Pelantikan Admin Syukbah

Admin Syukbah ialah fungsi pentadbiran berasingan daripada Admin Markaz.

Kuasa pelantikan mesti mengikut struktur tadbir urus dan UAC yang diluluskan.

Jangan menganggap Local Chief Admin mempunyai kuasa mutlak untuk melantik atau menamatkan semua Admin Syukbah tanpa merujuk kepada skop kuasa yang telah dipersetujui.

9.4 Pelantikan Admin Takaza

Admin Takaza ialah peranan khusus untuk pengurusan Takaza.

Kuasa dan tanggungjawabnya ditentukan oleh spesifikasi Takaza dan UAC.

Pelantikan Admin Takaza tidak menjadikannya Admin Markaz atau Admin Syukbah secara automatik.

10. Pengasingan Admin Markaz dan Admin Syukbah

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

Pengurusan Syukbah secara terperinci dirujuk kepada JMV2003.

11. Bantuan Silang Peringkat

Admin daripada organisasi lain boleh membantu organisasi lain melalui proses bantuan silang yang sah.

Syarat:

1. Persetujuan Chief Admin organisasi pemberi bantuan.
2. Persetujuan Chief Admin organisasi penerima bantuan.
3. Skop tugasan yang jelas.
4. Tempoh bantuan yang jelas.
5. Akses sistem terhad kepada tugasan yang diluluskan.
6. Akses kepada data sensitif hanya jika benar-benar diperlukan.
7. Semua persetujuan dan tindakan direkodkan.

Maklumat yang mesti direkodkan:

- Organisasi pemberi bantuan.
- Organisasi penerima bantuan.
- Admin yang terlibat.
- Tugasan.
- Skop akses.
- Tarikh mula.
- Tarikh tamat.
- Persetujuan kedua-dua Chief Admin.
- Sejarah perubahan dan penamatan.

Akses sementara tamat apabila tempoh atau tugasan berakhir.

Bantuan silang tidak boleh dianggap sebagai pertukaran jawatan atau pelantikan Admin kekal.

12. Laporan Organisasi

Laporan bergerak secara bottom-up mengikut struktur organisasi yang digunakan oleh negara.

Bagi struktur sedia ada:

- Ahbab / Individu.
- Mohallah.
- Halqah.
- Zone.
- Markaz Negeri.
- Markaz Negara.

Bagi negara yang menggunakan hierarki berbeza, sistem mesti mengikut konfigurasi organisasi negara berkenaan.

Markaz Negara ialah peringkat pelaporan kebangsaan tertinggi.

Peraturan terperinci laporan, pengesahan, tempoh edit, penutupan dan ranking akan dirujuk dalam dokumen pengurusan laporan yang berkaitan.

Hubungan negara naungan tidak menggabungkan laporan negara.

13. Rekod Audit

Sistem perlu merekodkan sekurang-kurangnya:

- Perubahan struktur organisasi.
- Perpindahan organisasi.
- Perubahan hubungan negara naungan.
- Pelantikan dan penamatan jawatan.
- Pemangkuan.
- Perubahan kuasa.
- Cadangan dan keputusan.
- Pindaan atau pembatalan keputusan.
- Pelantikan Admin.
- Bantuan silang.
- Akses sementara.
- Persetujuan Chief Admin.
- Tindakan Admin.

Rekod audit hendaklah mengandungi:

- Actor.
- Jenis tindakan.
- Rekod yang terlibat.
- Nilai lama dan baharu jika berkaitan.
- Tarikh dan masa.
- Sebab atau justifikasi jika diperlukan.
- Keputusan dan status selepas tindakan.

Rekod audit tidak boleh diubah atau dipadam melalui operasi biasa.

14. Perkara Belum Dimuktamadkan

Perkara berikut kekal sebagai keputusan terbuka:

1. Struktur tadbir urus Markaz Negara: Amer Negara sebagai pemutus akhir ATAU Ahli Syura dengan Faisalah sebagai pemutus akhir.
2. Hierarki organisasi akhir bagi setiap negara.
3. Istilah rasmi bagi negara yang bernaung di bawah Markaz Negara lain.
4. Mekanisme pelantikan Chief Admin dan Deputy Chief Admin.
5. Kaedah pemilihan Faisalah jika struktur Ahli Syura digunakan.
6. Perincian kuasa setiap jawatan mengikut peringkat.
7. Perincian kuasa penyeliaan Markaz Negara terhadap negara naungan.
8. Mekanisme pelantikan dan penamatan Admin Syukbah mengikut skop tadbir urus.
9. Perincian delegasi dan pemangkuan Deputy.
10. Perincian aliran laporan dan pengesahan yang akan diselaraskan dengan dokumen laporan.

Semua perkara di atas hendaklah diselaraskan dengan "OPEN_DECISIONS_REGISTER.md" dan "MASTER_DECISION_REGISTER.md".

15. Related Documents

- "MASTER_DECISION_REGISTER.md"
- "OPEN_DECISIONS_REGISTER.md"
- "MODULE_REQUIREMENTS.md"
- "UAC_MATRIX.md"
- "JMV2001-Ahbab-Profile-Account-Management.md"
- "JMV2003-Syukbah-Management.md"
- "JMV2004-Takaza-Management.md"
- "V2_DESIGN_CHECKPOINT.md"
- "V2_IMPLEMENTATION_STATUS.md"

Jika terdapat percanggahan, keputusan terkini yang telah dipersetujui menjadi rujukan.

UAC Matrix menentukan authorization dan skop akses.

Dokumen ini menetapkan baseline struktur organisasi dan tadbir urus.

16. Nota Pembangunan

Dokumen ini ialah baseline keperluan untuk semakan.

Jangan membina fungsi yang masih berstatus "PENDING" atau "OPEN DECISION" seolah-olah keputusan telah diluluskan.

Jangan menganggap struktur organisasi bagi satu negara mesti digunakan secara mutlak oleh semua negara.

Jangan mencampurkan kuasa Admin Markaz, Admin Syukbah dan Admin Takaza.

Jangan membenarkan akses silang organisasi tanpa persetujuan kedua-dua Chief Admin dan skop tugasan yang direkodkan.

Semua pelaksanaan mesti mematuhi UAC, audit dan keputusan rasmi yang telah diluluskan.

---

Document Status: REQUIREMENTS BASELINE — FOR REVIEW
Version: 1.1
Last Updated: 27 November 2026

Tamat — Organization Structure & Governance
