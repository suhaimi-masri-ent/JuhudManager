JUHUDMANAGER V2 — SYUKBAH MANAGEMENT

Document ID: JMV2003
Version: 1.1 — Consolidated Working Baseline
Status: REQUIREMENTS BASELINE — FOR REVIEW
Last Updated: 27 November 2026
Repository Path: "v2/docs/JMV2003-Syukbah-Management.md"

---

1. Tujuan

Dokumen ini menetapkan bagaimana Syukbah diwujudkan, diaktifkan, ditadbir dan diurus pada setiap peringkat organisasi JuhudManager V2.

Syukbah ialah struktur kerja dan pentadbiran yang berasingan daripada struktur hierarki organisasi.

Dokumen ini meliputi:

- Kategori dan identiti Syukbah.
- Global Baseline Syukbah.
- Additional Country Syukbah.
- Pengaktifan dan penyahaktifan.
- Pentadbiran dan pelantikan.
- Tugasan Admin dan Deputy.
- Moderator dan perbincangan Syukbah.
- Bantuan silang.
- Audit dan sejarah.

2. Prinsip Asas Syukbah

- Setiap peringkat organisasi boleh mempunyai senarai Syukbah tersendiri.
- Senarai asas Syukbah adalah sama bagi semua negara.
- Tidak semua Syukbah wajib diaktifkan pada setiap peringkat.
- Sesebuah Syukbah boleh diaktifkan kemudian apabila diperlukan.
- Admin Syukbah hanya mempunyai kuasa dalam Syukbah yang ditugaskan kepadanya, tertakluk kepada UAC dan kuasa pentadbiran yang sah.
- Syukbah bukan peringkat hierarki organisasi.
- Syukbah tidak menggantikan struktur Markaz.
- Pelantikan Admin Syukbah tidak secara automatik memberikan jawatan Admin Markaz atau Admin Takaza.
- Rekod dan sejarah Syukbah mesti kekal walaupun Syukbah tidak lagi aktif.

3. Kategori Syukbah

Terdapat dua kategori utama.

3.1 Global Baseline Syukbah

- Senarai asas Syukbah diurus oleh SUPER_ADMIN.
- Senarai asas yang sama digunakan sebagai baseline untuk semua negara.
- Perubahan kepada senarai asas dibuat pada peringkat global.
- Negara tidak boleh mengubah Global Baseline secara unilateral.
- Penggunaan atau pengaktifan Syukbah pada peringkat negara boleh dibuat mengikut kuasa yang diluluskan.
- Tidak semua Syukbah perlu diaktifkan pada setiap negara atau peringkat organisasi.

Global Baseline ialah sumber rujukan bersama, bukan arahan bahawa semua Syukbah mesti aktif di semua tempat.

3.2 Additional Country Syukbah

- Negara boleh mencadangkan Syukbah tambahan yang khusus untuk negara tersebut.
- Syukbah tambahan hanya terpakai kepada negara berkenaan selepas proses kelulusan yang sah.
- Negara lain tidak secara automatik menerima Syukbah tambahan itu.
- SUPER_ADMIN mempunyai akses penyeliaan global tetapi bukan pengurus operasi harian Syukbah negara.
- Skop Syukbah tambahan mesti jelas dan tidak boleh bercanggah dengan Global Baseline tanpa keputusan yang diluluskan.

Status kelulusan Additional Country Syukbah: OPEN DECISION.

Pihak yang boleh mencadangkan, menyemak dan meluluskan Syukbah tambahan perlu dimuktamadkan.

4. Identiti dan Rekod Syukbah

Setiap Syukbah mesti mempunyai:

- ID unik dalam pangkalan data.
- Kod rasmi yang unik.
- Nama rasmi.
- Kategori.
- Skop.
- Status.
- Maklumat bahasa.
- Sejarah perubahan.

Skop Syukbah perlu mengenal pasti sama ada ia:

- Global.
- Negara tertentu.
- Digunakan pada peringkat organisasi tertentu.

4.1 Peraturan Identiti

- ID Syukbah tidak boleh digunakan semula selepas Syukbah ditamatkan.
- Kod rasmi tidak boleh digunakan semula selepas persaraan Syukbah.
- Nama dan kod boleh berubah mengikut kuasa yang dibenarkan.
- Sejarah nama, kod, skop dan status mesti dikekalkan.
- Syukbah yang tidak lagi digunakan tidak boleh dipadam sehingga kehilangan sejarahnya.
- Perubahan identiti tidak boleh menyebabkan rekod lama kehilangan pautan kepada Syukbah asal.

4.2 Multibahasa

Nama dan kandungan Syukbah perlu menyokong bahasa sistem.

Bahasa asas sistem:

- English (EN)
- Japanese (JP)
- Arabic (AR)
- Malay (MY)
- Indonesian (ID)
- Urdu (UR)

Bahasa tambahan boleh dimasukkan kemudian.

Data Syukbah tidak boleh digandakan semata-mata kerana perbezaan bahasa.

Terjemahan nama dan kandungan hendaklah disimpan sebagai maklumat bahasa bagi identiti Syukbah yang sama.

5. Pengaktifan Syukbah

- Syukbah boleh diwujudkan tanpa terus diaktifkan.
- Syukbah boleh berstatus "INACTIVE" atau "ACTIVE".
- Syukbah yang tidak aktif tidak menjalankan operasi biasa.
- Syukbah boleh diaktifkan kemudian.
- Apabila diaktifkan, Admin Syukbah boleh dilantik mengikut proses pelantikan yang sah.
- Sejarah pengaktifan dan penyahaktifan mesti direkodkan.

5.1 Status Syukbah

Baseline status yang dicadangkan:

- "INACTIVE"
- "ACTIVE"
- "RETIRED"

"RETIRED" ialah status persaraan dan perlu dianggap sebagai baseline sementara sehingga dimuktamadkan.

Peraturan:

- "INACTIVE" bermaksud Syukbah belum digunakan atau sedang tidak digunakan.
- "ACTIVE" bermaksud Syukbah tersedia untuk operasi yang dibenarkan.
- "RETIRED" bermaksud Syukbah telah bersara dan tidak boleh digunakan untuk operasi baharu.
- Rekod sejarah Syukbah yang telah bersara mesti dikekalkan.
- Pengaktifan semula Syukbah "RETIRED" memerlukan keputusan dan proses khusus.

6. Struktur Pentadbiran Syukbah

Setiap Syukbah yang aktif dan memerlukan pentadbiran mempunyai:

- Seorang Admin Syukbah.
- Seorang atau lebih Deputy Admin Syukbah.

Tidak boleh ada dua Admin Syukbah aktif bagi Syukbah dan skop yang sama pada masa yang sama.

Pelantikan Admin mesti mempunyai rekod tempoh, skop dan pihak yang melantik.

6.1 Admin Syukbah

Admin Syukbah bertanggungjawab:

- Mengurus operasi Syukbah.
- Melaksanakan keputusan yang telah disahkan oleh pihak berkuasa berkaitan.
- Menentukan kaedah pelaksanaan yang selaras dengan keputusan.
- Membahagikan tugasan kepada Deputy Admin Syukbah.
- Memantau tugasan dan kemajuan.
- Menyediakan laporan Syukbah.
- Mengurus perbincangan Syukbah.
- Mengurus Moderator tambahan dalam perbincangan Syukbah sendiri.

Admin Syukbah:

- Tidak boleh mengubah keputusan rasmi yang telah disahkan tanpa proses pindaan keputusan.
- Tidak mempunyai kuasa pentadbiran Markaz secara automatik.
- Tidak mempunyai kuasa Admin Takaza secara automatik.
- Tidak boleh melangkaui skop Syukbah yang ditugaskan.
- Mesti mematuhi UAC Matrix.

6.2 Deputy Admin Syukbah

- Membantu Admin Syukbah.
- Menerima tugasan daripada Admin Syukbah.
- Boleh menjalankan tugas sementara apabila Admin Syukbah tidak hadir atau tidak dapat menjalankan tugas, jika diberi kuasa.
- Admin Syukbah boleh menentukan Deputy yang menjalankan tugas pemangkuan dalam skop yang dibenarkan.
- Jika Admin Syukbah tidak dapat membuat pilihan, Chief Admin berkaitan boleh menentukan tindakan sementara mengikut kuasa yang sah.

Sistem merekodkan:

- Deputy yang memangku.
- Tempoh pemangkuan.
- Skop kuasa.
- Pihak yang memberi kuasa.
- Tarikh mula dan tamat.
- Sebab pemangkuan jika diperlukan.

Deputy tidak memperoleh semua kuasa Admin Syukbah secara automatik hanya kerana memegang jawatan Deputy.

6.3 Pembahagian Tugasan

- Admin Syukbah boleh membahagikan tugasan kepada Deputy Admin.
- Tidak memerlukan kelulusan Chief Admin bagi pembahagian tugasan biasa dalam skop Syukbah.
- Tugasan mesti mempunyai skop dan rekod.
- Pembahagian tugasan tidak mengubah jawatan rasmi seseorang.
- Tugasan tidak boleh memberikan akses melebihi kuasa Admin yang memberikannya.
- Tugasan sementara tamat mengikut tempoh atau arahan penamatan yang direkodkan.

7. Pelantikan Admin Syukbah

7.1 Kelayakan Calon

- Calon Admin Syukbah mestilah Ahbab.
- Calon mesti memenuhi kriteria kelayakan jawatan.
- TAFAKUT perlu digunakan jika diwajibkan oleh kriteria yang diluluskan.
- Keputusan TAFAKUT tidak secara automatik menggantikan keputusan pelantikan.
- Pelantikan mesti direkodkan bersama pihak yang melantik, tarikh mula dan skop.

7.2 Kuasa Pelantikan

Kuasa melantik atau menamatkan Admin Syukbah mesti mengikut struktur tadbir urus dan UAC yang diluluskan.

Jangan menganggap Local Chief Admin mempunyai kuasa mutlak untuk melantik atau menamatkan semua Admin Syukbah tanpa merujuk kepada skop kuasa yang telah dipersetujui.

Status: OPEN DECISION

Perkara yang perlu dimuktamadkan:

- Pihak yang mencalonkan.
- Pihak yang menyemak kelayakan.
- Pihak yang meluluskan pelantikan.
- Pihak yang boleh menamatkan pelantikan.
- Kriteria TAFAKUT yang terpakai.
- Proses penggantian Admin.

7.3 Seorang Ahbab Memegang Beberapa Jawatan Admin Syukbah

- Seorang Ahbab boleh menjadi Admin bagi beberapa Syukbah pada masa yang sama.
- Setiap pelantikan dianggap bebas.
- Pelantikan bagi satu Syukbah tidak secara automatik menamatkan pelantikan di Syukbah lain.
- Jika Admin baharu mengambil alih satu Syukbah, hanya pelantikan bagi Syukbah tersebut ditamatkan atau digantikan.
- Sejarah setiap pelantikan dikekalkan.

Rekod pelantikan perlu mengandungi:

- Ahbab yang dilantik.
- Syukbah.
- Peringkat organisasi.
- Pihak yang melantik.
- Tarikh mula dan tamat.
- Sebab pelantikan atau penamatan.
- Keputusan kelayakan yang berkaitan.

8. Tugasan Merentas Syukbah

Admin Syukbah boleh diarahkan membantu Syukbah lain oleh Chief Admin yang mempunyai kuasa berkaitan.

Peraturan:

- Tugasan mesti mempunyai arahan yang jelas.
- Skop kerja mesti ditetapkan.
- Tempoh tugasan mesti direkodkan.
- Pihak yang memberikan arahan mesti direkodkan.
- Akses sistem hanya diberikan setakat yang diperlukan.
- Tugasan sementara tidak menjadikan individu itu Admin Syukbah lain secara rasmi.
- Akses tambahan tamat apabila tugasan atau tempoh berakhir.
- Semua tindakan direkodkan.

Tugasan merentas Syukbah dalam organisasi yang sama tidak boleh dianggap sebagai pertukaran pelantikan rasmi.

9. Bantuan Silang Antara Organisasi

Admin Syukbah daripada organisasi lain boleh membantu organisasi lain melalui proses bantuan silang yang sah.

Syarat:

1. Kedua-dua Chief Admin yang terlibat mesti bersetuju.
2. Skop dan tempoh bantuan mesti direkodkan.
3. Tugasan mesti dikenal pasti.
4. Akses data dihadkan kepada keperluan tugasan.
5. Akses kepada data sensitif memerlukan justifikasi.
6. Akses sementara tamat secara automatik apabila tempoh atau tugasan berakhir.
7. Semua tindakan direkodkan.

Rekod bantuan silang mesti mengandungi:

- Organisasi pemberi bantuan.
- Organisasi penerima bantuan.
- Admin yang terlibat.
- Tugasan dan skop.
- Tempoh.
- Persetujuan kedua-dua Chief Admin.
- Akses yang diberikan.
- Tarikh penamatan.

Bantuan silang tidak memberikan jawatan Admin kekal dalam organisasi penerima.

10. Hubungan Syukbah dengan Chief Admin

- Chief Admin menyelaras Admin Markaz dan hubungan pentadbiran dengan Admin Syukbah.
- Chief Admin boleh mengarahkan tugasan tertentu kepada Syukbah mengikut kuasa yang sah.
- Chief Admin memantau pelaksanaan keputusan.
- Chief Admin boleh memberikan tugasan sementara kepada Admin Syukbah.
- Tugasan sementara tidak secara automatik mengubah pelantikan rasmi Admin Syukbah.
- Chief Admin tidak secara automatik mengambil alih semua kuasa operasi dalaman Syukbah.
- Admin Syukbah kekal bertanggungjawab terhadap operasi Syukbah dalam skop pelantikannya.

11. Proses Keputusan dan Pelaksanaan

Prinsip:

1. Cadangan dikemukakan kepada pihak berkuasa berkaitan.
2. Ahli Syura memberikan pandangan atau nasihat jika berkenaan dan jika struktur tersebut digunakan.
3. Pihak yang mempunyai kuasa keputusan akhir membuat keputusan mengikut struktur tadbir urus yang diluluskan.
4. Selepas keputusan disahkan, Admin Syukbah berkaitan menerima notifikasi.
5. Admin Syukbah menentukan kaedah pelaksanaan yang selaras dengan keputusan.
6. Pelaksanaan dan kemajuan direkodkan.

Admin Syukbah tidak menggantikan kuasa membuat keputusan rasmi yang ditetapkan kepada pihak berkuasa berkaitan.

Sistem mesti membezakan:

- Keputusan dasar.
- Arahan pelaksanaan.
- Tugasan operasi.
- Laporan kemajuan.

Admin Syukbah tidak boleh mengubah keputusan dasar melalui tindakan operasi biasa.

12. Perbincangan Syukbah dan Moderator

Setiap Admin Syukbah secara automatik menjadi Moderator bagi perbincangan Syukbah sendiri.

Admin Syukbah boleh menambah atau membuang Moderator tambahan secara langsung.

Moderator tambahan:

- Tidak semestinya Admin.
- Boleh terdiri daripada Ahbab.
- Tidak memerlukan pelantikan formal.
- Tindakan tambah dan buang direkodkan bersama pelaku dan masa.
- Kuasa Moderator hanya terpakai kepada perbincangan Syukbah yang ditugaskan.

12.1 Hak Moderator

Moderator hanya boleh:

- Membuat komen.
- Memadam komen.

Moderator tidak boleh:

- Mengedit komen orang lain.
- Menyembunyikan komen.
- Pin komen.
- Unpin komen.

Pengguna boleh memadam komen sendiri.

Moderator boleh memadam komen pengguna lain.

12.2 Rekod Komen

- Komen yang dipadam menggunakan soft-delete.
- Rekod asal dan sejarah tindakan mesti dikekalkan.
- Komen tidak boleh diedit selepas dihantar.
- Penulis boleh memadam komen sendiri.
- Moderator boleh memadam komen lain.
- Tindakan pemadaman mesti direkodkan.
- Rekod komen yang dipadam tidak boleh hilang melalui operasi biasa.

12.3 Maklumat Rasmi

Maklumat rasmi tidak bergantung kepada fungsi Pin/Unpin.

Maklumat rasmi hendaklah disediakan melalui CMS atau paparan rasmi/dashboard.

CMS ialah modul berasingan yang akan diintegrasikan kemudian.

Untuk fasa ini:

- Sediakan reka bentuk API yang boleh menyokong integrasi CMS.
- Jangan membangunkan keseluruhan CMS dalam skop dokumen ini.
- Perbincangan Syukbah bukan CMS dan bukan saluran penerbitan rasmi.
- Kandungan perbincangan tidak boleh dianggap sebagai keputusan rasmi organisasi secara automatik.

13. Audit dan Sejarah

Sistem perlu merekodkan:

- Penciptaan Syukbah.
- Perubahan nama atau kod.
- Perubahan skop.
- Pengaktifan dan penyahaktifan.
- Persaraan Syukbah.
- Pelantikan dan penamatan Admin.
- Pemangkuan Admin.
- Pembahagian tugasan.
- Pelantikan Moderator tambahan.
- Penamatan Moderator.
- Tugasan antara Syukbah.
- Bantuan silang organisasi.
- Perubahan akses.
- Aktiviti pelaksanaan keputusan.
- Pemadaman komen.

Rekod audit sekurang-kurangnya mengandungi:

- Pelaku.
- Jenis tindakan.
- Rekod yang terlibat.
- Nilai lama dan baharu jika berkaitan.
- Tarikh dan masa.
- Sebab atau justifikasi jika diperlukan.

Rekod audit tidak boleh diubah atau dipadam melalui operasi biasa.

14. Perkara Belum Dimuktamadkan

Perkara berikut kekal terbuka:

1. Senarai lengkap Global Baseline Syukbah.
2. Struktur kategori dan kod rasmi bagi setiap Syukbah.
3. Mekanisme kelulusan penciptaan Syukbah tambahan negara.
4. Pihak yang mempunyai kuasa melantik dan menamatkan Admin Syukbah.
5. Butiran syarat TAFAKUT bagi setiap jenis jawatan Admin Syukbah.
6. Mekanisme pemangkuan dan delegasi Deputy Admin Syukbah.
7. Perincian laporan khusus bagi setiap Syukbah.
8. Struktur dan integrasi CMS.
9. Polisi persaraan dan pengaktifan semula Syukbah "RETIRED".

Semua perkara ini mesti diselaraskan dengan "OPEN_DECISIONS_REGISTER.md" dan "MASTER_DECISION_REGISTER.md".

15. Related Documents

- "MASTER_DECISION_REGISTER.md"
- "OPEN_DECISIONS_REGISTER.md"
- "MODULE_REQUIREMENTS.md"
- "UAC_MATRIX.md"
- "JMV2002-Organization-Structure-Governance.md"
- "JMV2004-Takaza-Management.md"
- "V2_DESIGN_CHECKPOINT.md"
- "V2_IMPLEMENTATION_STATUS.md"

Jika terdapat percanggahan:

1. Keputusan terkini yang telah dipersetujui menjadi rujukan.
2. UAC Matrix menentukan authorization dan skop akses.
3. JMV2002 menentukan struktur organisasi dan tadbir urus.
4. Dokumen ini menentukan pengurusan Syukbah.
5. Perkara yang belum diputuskan mesti kekal "PENDING".

16. Nota Pembangunan

- Jangan menganggap semua Syukbah mesti aktif pada setiap peringkat.
- Jangan menganggap Additional Country Syukbah boleh diaktifkan tanpa proses kelulusan yang sah.
- Jangan mencampurkan Admin Markaz, Admin Syukbah dan Admin Takaza.
- Jangan menganggap pelantikan Admin Syukbah memberikan kuasa global atau kuasa Markaz.
- Jangan memberikan kuasa Moderator melebihi skop yang ditetapkan.
- Jangan membenarkan bantuan silang tanpa persetujuan kedua-dua Chief Admin.
- Jangan menganggap tugasan sementara sebagai pelantikan rasmi.
- Semua perubahan mesti mengekalkan sejarah dan audit.

---

Document Status: REQUIREMENTS BASELINE — FOR REVIEW
Version: 1.1
Last Updated: 27 November 2026

Tamat — Syukbah Management
