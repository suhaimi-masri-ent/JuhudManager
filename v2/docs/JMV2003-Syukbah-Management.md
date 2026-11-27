
# JUHUDMANAGER V2 — SYUKBAH MANAGEMENT

**Document ID:** JMV2-003  
**Version:** 1.2 — Consolidated Working Baseline  
**Status:** REQUIREMENTS BASELINE — FOR REVIEW  
**Last Updated:** 28 November 2026  
**Repository Path:** `v2/docs/JMV2003-Syukbah-Management.md`

---

## 1. Tujuan

Dokumen ini menetapkan bagaimana Syukbah diwujudkan, dikonfigurasi, diaktifkan, ditadbir dan diurus dalam JuhudManager V2.

Syukbah ialah struktur kerja dan pentadbiran yang berasingan daripada hierarki organisasi utama.

Dokumen ini meliputi:

- Kategori dan identiti Syukbah.
- Global Baseline Syukbah.
- Additional Country Syukbah.
- Pengaktifan dan penyahaktifan Syukbah.
- Struktur pentadbiran Syukbah.
- Pelantikan Admin Syukbah.
- Tugasan dan delegation Deputy Admin.
- Moderator dan perbincangan Syukbah.
- Tugasan merentas Syukbah.
- Bantuan silang antara organisasi.
- Hubungan Syukbah dengan Chief Admin.
- Proses keputusan dan pelaksanaan.
- Audit dan sejarah.

Dokumen ini mesti dibaca bersama:

- `MASTER_DECISION_REGISTER.md`
- `OPEN_DECISIONS_REGISTER.md`
- `JMV2002-Organization-Structure-Governance.md`
- `UAC_MATRIX.md`
- `MODULE_REQUIREMENTS.md`

Dokumentasi keperluan tidak bermaksud fungsi telah dilaksanakan.

## 2. Prinsip Asas Syukbah

Prinsip utama:

1. Setiap peringkat organisasi yang berkenaan boleh mempunyai senarai Syukbah tersendiri.
2. Senarai asas Syukbah adalah sama bagi semua negara.
3. Tidak semua Syukbah wajib diaktifkan pada setiap negara atau peringkat organisasi.
4. Syukbah boleh diaktifkan kemudian apabila diperlukan.
5. Syukbah bukan peringkat hierarki organisasi.
6. Syukbah tidak menggantikan struktur Markaz.
7. Syukbah mempunyai identiti dan rekod tersendiri.
8. Admin Syukbah hanya mempunyai kuasa dalam Syukbah dan skop yang ditugaskan kepadanya.
9. Pelantikan Admin Syukbah tidak secara automatik memberikan jawatan Admin Markaz atau Admin Takaza.
10. System role, jawatan organisasi, appointment dan delegation mesti kekal sebagai konsep berasingan.
11. Semua pelantikan, perubahan skop dan tindakan pentadbiran mesti boleh diaudit.
12. Rekod dan sejarah Syukbah mesti dikekalkan walaupun Syukbah tidak lagi aktif.

Syukbah boleh diwujudkan pada peringkat organisasi yang dibenarkan oleh konfigurasi negara.

Sistem tidak boleh menganggap semua negara mempunyai hierarki atau peringkat organisasi yang sama.

## 3. Kategori Syukbah

Terdapat dua kategori utama Syukbah.

### 3.1 Global Baseline Syukbah

Global Baseline Syukbah ialah senarai asas Syukbah yang diurus pada peringkat global.

Prinsip:

- Senarai asas Syukbah diurus oleh `SUPER_ADMIN`.
- Senarai asas yang sama digunakan sebagai baseline untuk semua negara.
- Perubahan kepada Global Baseline dibuat pada peringkat global.
- Negara tidak boleh mengubah Global Baseline secara unilateral.
- Negara boleh mengaktifkan Syukbah yang diperlukan mengikut kuasa yang diluluskan.
- Tidak semua Syukbah perlu diaktifkan pada setiap negara atau peringkat organisasi.
- Pengaktifan Syukbah pada satu negara tidak secara automatik mengaktifkannya di negara lain.

Global Baseline ialah sumber rujukan bersama, bukan arahan bahawa semua Syukbah mesti aktif di semua tempat.

`SUPER_ADMIN` mengurus baseline global tetapi tidak secara automatik menjadi pengurus operasi harian setiap Syukbah di setiap negara.

### 3.2 Additional Country Syukbah

Negara boleh mencadangkan Syukbah tambahan yang khusus untuk negara tersebut.

Prinsip:

- Syukbah tambahan hanya terpakai kepada negara berkenaan selepas proses kelulusan yang sah.
- Negara lain tidak secara automatik menerima Syukbah tambahan itu.
- Syukbah tambahan mesti mempunyai identiti, skop dan tujuan yang jelas.
- Syukbah tambahan tidak boleh bercanggah dengan Global Baseline tanpa keputusan yang diluluskan.
- `SUPER_ADMIN` mempunyai akses penyeliaan global mengikut UAC tetapi bukan pengurus operasi harian Syukbah negara.

**Status: OPEN DECISION**

Kuasa mencadangkan, menyemak, meluluskan, menggantung dan menamatkan Additional Country Syukbah masih perlu dimuktamadkan.

Rujukan: `OPEN_DECISIONS_REGISTER.md`, ODR-003.

Sistem tidak boleh menganggap Additional Country Syukbah boleh diwujudkan atau diaktifkan tanpa proses kelulusan yang sah.

## 4. Identiti dan Rekod Syukbah

Setiap Syukbah mesti mempunyai:

- ID unik dalam pangkalan data.
- Kod rasmi.
- Nama rasmi.
- Kategori.
- Skop.
- Negara berkaitan jika berkenaan.
- Peringkat organisasi jika berkenaan.
- Status.
- Maklumat bahasa.
- Tarikh penciptaan.
- Sejarah perubahan.

Skop Syukbah mesti mengenal pasti sama ada ia:

- Global Baseline.
- Additional Country Syukbah.
- Digunakan pada negara tertentu.
- Digunakan pada peringkat organisasi tertentu.

### 4.1 Peraturan Identiti

- ID Syukbah tidak boleh digunakan semula selepas Syukbah ditamatkan.
- Kod rasmi tidak boleh digunakan semula selepas persaraan Syukbah.
- Nama dan kod boleh berubah mengikut kuasa yang dibenarkan.
- Sejarah nama, kod, skop dan status mesti dikekalkan.
- Syukbah yang tidak lagi digunakan tidak boleh dipadam sehingga kehilangan sejarahnya.
- Perubahan identiti tidak boleh menyebabkan rekod lama kehilangan pautan kepada Syukbah asal.
- Perubahan skop tidak boleh secara automatik memindahkan rekod sejarah operasi.

### 4.2 Multibahasa

Nama dan kandungan Syukbah perlu menyokong bahasa sistem.

Bahasa asas sistem:

- English (EN)
- Japanese (JP)
- Arabic (AR)
- Malay (MY)
- Indonesian (ID)
- Urdu (UR)

Bahasa tambahan boleh dimasukkan kemudian.

Prinsip:

- Data Syukbah tidak boleh digandakan semata-mata kerana perbezaan bahasa.
- Terjemahan nama dan kandungan hendaklah disimpan sebagai maklumat bahasa bagi identiti Syukbah yang sama.
- Perubahan terjemahan tidak boleh menghasilkan identiti Syukbah baharu.
- Nama rasmi dan kod Syukbah mesti kekal boleh dikenal pasti merentas bahasa.

## 5. Pengaktifan dan Status Syukbah

Syukbah boleh diwujudkan tanpa terus diaktifkan.

Pengaktifan mesti mengikut kuasa dan proses yang diluluskan bagi kategori serta skop Syukbah berkenaan.

### 5.1 Status Syukbah

Baseline status yang dicadangkan:

- `INACTIVE`
- `ACTIVE`
- `RETIRED`

`RETIRED` ialah status persaraan dan perlu dianggap sebagai baseline sementara sehingga dimuktamadkan.

Maksud status:

**INACTIVE**

- Syukbah belum digunakan atau sedang tidak digunakan.
- Operasi biasa Syukbah tidak tersedia.
- Syukbah boleh diaktifkan kemudian mengikut kuasa yang sah.

**ACTIVE**

- Syukbah tersedia untuk operasi yang dibenarkan.
- Pelantikan Admin boleh dibuat mengikut proses yang sah.
- Operasi Syukbah tertakluk kepada UAC dan skop yang diluluskan.

**RETIRED**

- Syukbah telah bersara.
- Syukbah tidak boleh digunakan untuk operasi baharu.
- Rekod sejarah mesti dikekalkan.
- Pengaktifan semula memerlukan keputusan dan proses khusus.

### 5.2 Peraturan Pengaktifan

- Pengaktifan dan penyahaktifan mesti direkodkan.
- Pihak yang membuat perubahan mesti mempunyai kuasa yang sah.
- Tarikh dan masa perubahan mesti direkodkan.
- Sebab perubahan direkodkan jika diperlukan.
- Penyahaktifan tidak boleh memadam pelantikan atau rekod sejarah.
- Syukbah `INACTIVE` tidak boleh menjalankan operasi biasa.
- Syukbah `RETIRED` tidak boleh digunakan untuk operasi baharu.
- Pengaktifan semula `RETIRED` tidak boleh dianggap sama seperti pengaktifan biasa.

### 5.3 Kesan kepada Pelantikan

Apabila Syukbah dinyahaktifkan atau bersara:

- Sistem mesti menghalang operasi baharu yang tidak dibenarkan.
- Pelantikan Admin dan Deputy mesti kekal dalam sejarah.
- Sistem mesti menentukan status pelantikan semasa mengikut proses penamatan atau penggantungan yang sah.
- Akses operasi mesti disemak berdasarkan status Syukbah.
- Sejarah tugasan, keputusan dan perbincangan mesti dikekalkan.

Sistem tidak boleh memadam atau menukar sejarah pelantikan secara automatik tanpa rekod tindakan yang sah.

## 6. Struktur Pentadbiran Syukbah

Setiap Syukbah yang aktif dan memerlukan pentadbiran mempunyai:

- Seorang Admin Syukbah.
- Tiada Deputy Admin yang diwajibkan. Seorang atau lebih Deputy Admin boleh dilantik mengikut keperluan dan proses yang diluluskan.

Tidak boleh ada dua Admin Syukbah aktif bagi Syukbah dan skop yang sama pada masa yang sama.

Bilangan Deputy Admin Syukbah tidak dihadkan kepada seorang.

Pelantikan Admin mesti mempunyai rekod:

- Individu yang dilantik.
- Syukbah yang ditadbir.
- Peringkat organisasi.
- Skop kuasa.
- Pihak yang melantik.
- Tarikh mula.
- Tarikh tamat jika berkenaan.
- Status pelantikan.
- Sebab pelantikan atau penamatan jika diperlukan.

### 6.1 Admin Syukbah

Admin Syukbah bertanggungjawab:

- Mengurus operasi Syukbah.
- Melaksanakan keputusan yang telah disahkan oleh pihak berkuasa berkaitan.
- Menentukan kaedah pelaksanaan yang selaras dengan keputusan.
- Membahagikan tugasan kepada Deputy Admin Syukbah.
- Memantau tugasan dan kemajuan.
- Menyediakan laporan Syukbah.
- Mengurus perbincangan Syukbah.
- Mengurus Moderator tambahan dalam perbincangan Syukbah sendiri.
- Memastikan rekod dan aktiviti Syukbah dikendalikan mengikut peraturan.
- Memastikan tindakan pentadbiran mempunyai rekod yang diperlukan.

Admin Syukbah:

- Tidak boleh mengubah keputusan rasmi yang telah disahkan tanpa proses pindaan keputusan.
- Tidak mempunyai kuasa pentadbiran Markaz secara automatik.
- Tidak mempunyai kuasa Admin Takaza secara automatik.
- Tidak boleh melangkaui skop Syukbah yang ditugaskan.
- Tidak boleh melantik dirinya sendiri kepada jawatan atau skop lain.
- Mesti mematuhi UAC Matrix.
- Mesti mematuhi keputusan tadbir urus yang telah diluluskan.

### 6.2 Deputy Admin Syukbah

Deputy Admin Syukbah:

- Membantu Admin Syukbah.
- Menerima tugasan daripada Admin Syukbah.
- Boleh menjalankan tugas sementara apabila Admin Syukbah tidak hadir atau tidak dapat menjalankan tugas jika diberi kuasa.
- Tidak memperoleh semua kuasa Admin Syukbah secara automatik hanya kerana memegang jawatan Deputy.
- Tidak boleh menggunakan kuasa di luar skop delegation yang sah.

Prinsip sementara:

- Admin Syukbah boleh menentukan Deputy yang menjalankan tugas pemangkuan dalam skop yang dibenarkan.
- Jika Admin Syukbah tidak dapat membuat pilihan, Chief Admin berkaitan boleh menentukan tindakan sementara mengikut kuasa yang sah.
- Kuasa pemangkuan mesti mempunyai skop dan tempoh yang jelas.

Sistem merekodkan:

- Deputy yang memangku.
- Tempoh pemangkuan.
- Skop kuasa.
- Pihak yang memberi kuasa.
- Tarikh mula dan tamat.
- Sebab pemangkuan jika diperlukan.
- Status pemangkuan.

Mekanisme lengkap delegation dan acting authority masih merupakan keputusan terbuka.
Peruntukan sementara di atas bukan kelulusan muktamad kuasa pemangkuan. Tiada kuasa acting boleh dibina atau digunakan sehingga ODR-011 dimuktamadkan.

Rujukan: `OPEN_DECISIONS_REGISTER.md`, ODR-011.

### 6.3 Pembahagian Tugasan

Admin Syukbah boleh membahagikan tugasan kepada Deputy Admin dalam skop Syukbah sendiri.

Prinsip:

- Pembahagian tugasan biasa dalam skop Syukbah tidak memerlukan kelulusan Chief Admin.
- Tugasan mesti mempunyai skop yang jelas.
- Tugasan mesti direkodkan.
- Pembahagian tugasan tidak mengubah jawatan rasmi seseorang.
- Tugasan tidak boleh memberikan akses melebihi kuasa Admin yang memberikannya.
- Tugasan sementara tamat mengikut tempoh atau arahan penamatan yang direkodkan.
- Tugasan tidak boleh digunakan untuk memintas UAC atau kuasa pelantikan.

Pembahagian tugasan biasa mesti dibezakan daripada delegation kuasa rasmi dan pemangkuan jawatan.

## 7. Pelantikan Admin Syukbah

### 7.1 Kelayakan Calon

Baseline kelayakan calon Admin Syukbah:

- Calon mestilah Ahbab.
- Calon mesti memenuhi kriteria kelayakan jawatan yang diluluskan.
- TAFAKUT digunakan jika diwajibkan oleh kriteria yang diluluskan.
- Keputusan TAFAKUT tidak secara automatik menggantikan keputusan pelantikan.
- Pelantikan mesti direkodkan bersama pihak yang melantik, tarikh mula dan skop.

Kelayakan terperinci masih tertakluk kepada keputusan rasmi.

Rujukan: `OPEN_DECISIONS_REGISTER.md`, ODR-012.

### 7.2 Kuasa Pelantikan

Kuasa melantik atau menamatkan Admin Syukbah mesti mengikut struktur tadbir urus dan UAC yang diluluskan.

Jangan menganggap Local Chief Admin mempunyai kuasa mutlak untuk melantik atau menamatkan semua Admin Syukbah tanpa merujuk kepada skop kuasa yang telah dipersetujui.

**Status: OPEN DECISION**

Perkara yang perlu dimuktamadkan:

- Pihak yang mencalonkan.
- Pihak yang menyemak kelayakan.
- Pihak yang meluluskan pelantikan.
- Pihak yang boleh menamatkan pelantikan.
- Kriteria TAFAKUT yang terpakai.
- Proses penggantian Admin.
- Keperluan persetujuan calon.
- Tempoh dan pembaharuan pelantikan jika berkenaan.

Sistem tidak boleh menganggap pelantikan telah diluluskan hanya kerana calon telah dicadangkan atau memenuhi syarat TAFAKUT.

### 7.3 Seorang Ahbab Memegang Beberapa Jawatan Admin Syukbah

Seorang Ahbab boleh menjadi Admin bagi beberapa Syukbah pada masa yang sama jika pelantikan berasingan itu diluluskan.

Prinsip:

- Setiap pelantikan dianggap bebas.
- Pelantikan bagi satu Syukbah tidak secara automatik menamatkan pelantikan di Syukbah lain.
- Jika Admin baharu mengambil alih satu Syukbah, hanya pelantikan bagi Syukbah tersebut ditamatkan atau digantikan.
- Sejarah setiap pelantikan dikekalkan.
- Setiap pelantikan mempunyai skop kuasa tersendiri.
- Kuasa daripada satu pelantikan tidak boleh digunakan dalam Syukbah lain tanpa asas authorization yang sah.

Rekod pelantikan perlu mengandungi:

- Ahbab yang dilantik.
- Syukbah.
- Peringkat organisasi.
- Pihak yang melantik.
- Tarikh mula dan tamat.
- Sebab pelantikan atau penamatan.
- Keputusan kelayakan yang berkaitan.
- Status pelantikan.

## 8. Tugasan Merentas Syukbah

Admin Syukbah boleh diarahkan membantu Syukbah lain oleh Chief Admin yang mempunyai kuasa berkaitan.

Tugasan merentas Syukbah dalam organisasi yang sama tidak semestinya memerlukan pertukaran pelantikan rasmi.

Peraturan:

- Tugasan mesti mempunyai arahan yang jelas.
- Skop kerja mesti ditetapkan.
- Tempoh tugasan mesti direkodkan.
- Pihak yang memberikan arahan mesti direkodkan.
- Akses sistem hanya diberikan setakat yang diperlukan.
- Tugasan sementara tidak menjadikan individu itu Admin Syukbah lain secara rasmi.
- Akses tambahan tamat apabila tugasan atau tempoh berakhir.
- Semua tindakan direkodkan.
- Tugasan tidak boleh memberikan kuasa melebihi skop pihak yang mengarahkannya.

Tugasan merentas Syukbah mesti dibezakan daripada:

- Pelantikan Admin Syukbah baharu.
- Delegation kuasa rasmi.
- Bantuan silang antara organisasi.

## 9. Bantuan Silang Antara Organisasi

Admin Syukbah daripada organisasi lain boleh membantu organisasi lain melalui proses bantuan silang yang sah.

Bantuan silang bukan pertukaran jawatan atau pelantikan Admin kekal dalam organisasi penerima.

### 9.1 Syarat Bantuan Silang

Syarat:

1. Chief Admin organisasi pemberi bantuan bersetuju.
2. Chief Admin organisasi penerima bantuan bersetuju.
3. Skop dan tempoh bantuan direkodkan.
4. Tugasan dikenal pasti dengan jelas.
5. Akses data dihadkan kepada keperluan tugasan.
6. Akses kepada data sensitif memerlukan justifikasi.
7. Akses sementara tamat secara automatik apabila tempoh atau tugasan berakhir.
8. Semua persetujuan dan tindakan direkodkan.

Jika salah satu persetujuan Chief Admin yang diwajibkan tiada, bantuan silang tidak boleh diaktifkan.

### 9.2 Rekod Bantuan Silang

Rekod bantuan silang mesti mengandungi:

- Organisasi pemberi bantuan.
- Organisasi penerima bantuan.
- Negara yang terlibat.
- Admin yang terlibat.
- Syukbah berkaitan.
- Tugasan dan skop.
- Tempoh bantuan.
- Persetujuan kedua-dua Chief Admin.
- Pihak yang memberikan akses.
- Akses yang diberikan.
- Tarikh mula dan tamat.
- Sejarah perubahan.
- Sebab penamatan jika berkaitan.

### 9.3 Tempoh dan Penamatan

- Akses sementara tamat apabila tempoh atau tugasan berakhir.
- Akses boleh ditamatkan lebih awal oleh pihak yang mempunyai kuasa.
- Penamatan mesti direkodkan.
- Sistem mesti memastikan akses sementara tidak kekal selepas tempoh sah.
- Bantuan silang tidak boleh memberikan kuasa melebihi skop yang diluluskan.
- Bantuan silang tidak boleh digunakan untuk memintas pengasingan data negara.
- Bantuan silang tidak memberikan jawatan Admin kekal dalam organisasi penerima.

Rujukan prinsip tadbir urus: `JMV2002-Organization-Structure-Governance.md`.

## 10. Hubungan Syukbah dengan Chief Admin

Chief Admin menyelaras hubungan pentadbiran antara Admin Markaz dan Admin Syukbah mengikut skop kuasa yang sah.

Prinsip:

- Chief Admin boleh mengarahkan tugasan tertentu kepada Syukbah mengikut kuasa yang diluluskan.
- Chief Admin memantau pelaksanaan keputusan.
- Chief Admin boleh memberikan tugasan sementara kepada Admin Syukbah.
- Tugasan sementara tidak secara automatik mengubah pelantikan rasmi Admin Syukbah.
- Chief Admin tidak secara automatik mengambil alih semua kuasa operasi dalaman Syukbah.
- Admin Syukbah kekal bertanggungjawab terhadap operasi Syukbah dalam skop pelantikannya.
- Chief Admin tidak boleh menggunakan gelaran jawatan untuk melangkaui UAC.
- Semua arahan dan delegation mesti mempunyai skop yang jelas.

Hubungan Chief Admin dan Admin Syukbah tidak boleh dianggap sebagai penggabungan kedua-dua jawatan.

## 11. Proses Keputusan dan Pelaksanaan

Proses keputusan Syukbah mesti mengikuti struktur tadbir urus yang telah diluluskan.

Prinsip:

1. Cadangan dikemukakan kepada pihak berkuasa berkaitan.
2. Cadangan direkodkan.
3. Ahli Syura memberikan pandangan atau nasihat jika berkenaan dan jika struktur tersebut telah diluluskan.
4. Pihak yang mempunyai kuasa keputusan akhir membuat keputusan.
5. Keputusan direkodkan.
6. Selepas keputusan disahkan, Admin Syukbah berkaitan menerima notifikasi.
7. Admin Syukbah menentukan kaedah pelaksanaan yang selaras dengan keputusan.
8. Pelaksanaan dan kemajuan direkodkan.

Admin Syukbah tidak menggantikan kuasa membuat keputusan rasmi yang ditetapkan kepada pihak berkuasa berkaitan.

Sistem mesti membezakan:

- Keputusan dasar.
- Arahan pelaksanaan.
- Tugasan operasi.
- Laporan kemajuan.

Admin Syukbah tidak boleh mengubah keputusan dasar melalui tindakan operasi biasa.

### 11.1 Pelaksanaan Keputusan

Admin Syukbah bertanggungjawab melaksanakan keputusan dalam skop yang diberikan.

Sistem perlu menyimpan:

- Keputusan asal.
- Pihak yang membuat keputusan.
- Tarikh keputusan.
- Arahan pelaksanaan.
- Admin yang bertanggungjawab.
- Tugasan yang diwujudkan.
- Status pelaksanaan.
- Laporan kemajuan.
- Sejarah pindaan atau pembatalan.

Pindaan keputusan mesti melalui proses yang sah.

Rekod keputusan asal tidak boleh dipadam atau ditulis semula.

## 12. Perbincangan Syukbah dan Moderator

Setiap Admin Syukbah secara automatik menjadi Moderator bagi perbincangan Syukbah sendiri sepanjang pelantikan Admin tersebut aktif.

Admin Syukbah boleh menambah atau membuang Moderator tambahan secara langsung dalam perbincangan Syukbah sendiri.

Moderator tambahan:

- Tidak semestinya Admin.
- Boleh terdiri daripada Ahbab.
- Tidak memerlukan pelantikan formal sebagai Admin.
- Tindakan tambah dan buang direkodkan bersama pelaku dan masa.
- Kuasa Moderator hanya terpakai kepada perbincangan Syukbah yang ditugaskan.
- Tidak mempunyai kuasa pentadbiran rekod Syukbah secara automatik.

Moderator bukan jawatan Admin Syukbah.

### 12.1 Hak Moderator

Moderator hanya boleh:

- Membuat komen.
- Memadam komen pengguna lain.

Moderator tidak boleh:

- Mengedit komen orang lain.
- Menyembunyikan komen.
- Pin komen.
- Unpin komen.

Pengguna boleh memadam komen sendiri.

Moderator boleh memadam komen pengguna lain.

Moderator tidak boleh menggunakan permission perbincangan untuk membuat perubahan kepada rekod operasi atau keputusan rasmi Syukbah.

### 12.2 Rekod Komen

- Komen yang dipadam menggunakan soft-delete.
- Rekod asal dan sejarah tindakan mesti dikekalkan.
- Komen tidak boleh diedit selepas dihantar.
- Penulis boleh memadam komen sendiri.
- Moderator boleh memadam komen pengguna lain.
- Tindakan pemadaman mesti direkodkan.
- Rekod komen yang dipadam tidak boleh hilang melalui operasi biasa.
- Rekod audit mesti mengenal pasti pelaku, komen berkaitan dan masa tindakan.

### 12.3 Maklumat Rasmi

Maklumat rasmi tidak bergantung kepada fungsi Pin atau Unpin.

Maklumat rasmi hendaklah disediakan melalui CMS atau paparan rasmi/dashboard.

CMS ialah modul berasingan yang akan diintegrasikan kemudian.

Untuk fasa ini:

- Sediakan reka bentuk API yang boleh menyokong integrasi CMS.
- Jangan membangunkan keseluruhan CMS dalam skop dokumen ini.
- Perbincangan Syukbah bukan CMS.
- Perbincangan Syukbah bukan saluran penerbitan rasmi.
- Kandungan perbincangan tidak boleh dianggap sebagai keputusan rasmi organisasi secara automatik.

## 13. Laporan Syukbah

Admin Syukbah bertanggungjawab menyediakan laporan berkaitan operasi Syukbah dalam skop pelantikannya.

Prinsip:

- Laporan mesti terikat kepada Syukbah dan organisasi yang berkaitan.
- Laporan mesti mempunyai tempoh dan tarikh yang jelas.
- Laporan mesti mengenal pasti pihak yang menyediakan dan mengesahkan laporan jika berkenaan.
- Akses laporan mesti mengikut UAC dan skop organisasi.
- Rekod laporan terdahulu mesti dikekalkan.
- Perubahan struktur organisasi tidak boleh memindahkan sejarah laporan secara automatik.
- Laporan negara yang berbeza tidak boleh digabungkan tanpa asas kuasa yang sah.

Perincian berikut masih memerlukan penyelarasan:

- Jenis laporan Syukbah.
- Kekerapan laporan.
- Format laporan.
- Pihak yang mengesahkan.
- Tempoh edit.
- Pembetulan laporan.
- Hubungan laporan Syukbah dengan laporan Markaz.

Jangan menganggap workflow laporan yang belum diputuskan sebagai fungsi yang telah diluluskan.

## 14. Audit dan Sejarah

Sistem perlu merekodkan sekurang-kurangnya:

- Penciptaan Syukbah.
- Perubahan nama atau kod.
- Perubahan kategori.
- Perubahan skop.
- Pengaktifan dan penyahaktifan.
- Persaraan Syukbah.
- Pelantikan dan penamatan Admin.
- Pelantikan Deputy.
- Pemangkuan Admin.
- Delegation.
- Pembahagian tugasan.
- Pelantikan Moderator tambahan.
- Penamatan Moderator.
- Tugasan antara Syukbah.
- Bantuan silang organisasi.
- Perubahan akses.
- Arahan dan keputusan.
- Aktiviti pelaksanaan keputusan.
- Penyediaan dan pembetulan laporan.
- Pemadaman komen.

### 14.1 Kandungan Audit

Rekod audit sekurang-kurangnya mengandungi:

- Pelaku.
- Jenis tindakan.
- Rekod yang terlibat.
- Syukbah dan organisasi berkaitan.
- Negara berkaitan jika berkenaan.
- Nilai lama dan baharu jika berkaitan.
- Tarikh dan masa.
- Sebab atau justifikasi jika diperlukan.
- Pihak yang meluluskan jika berkaitan.
- Skop kuasa yang digunakan jika diperlukan.

### 14.2 Integriti Audit

- Rekod audit tidak boleh diubah atau dipadam melalui operasi biasa.
- Tindakan sensitif mesti mempunyai audit trail.
- Audit mesti membezakan tindakan pengguna, tindakan Admin dan tindakan sistem.
- Permohonan yang belum diluluskan tidak boleh direkodkan seolah-olah keputusan telah dibuat.
- Sejarah pelantikan, delegation dan keputusan mesti kekal boleh dirujuk.
- Akses kepada Audit Log mesti mengikut UAC.

## 15. Perkara Belum Dimuktamadkan

Perkara berikut kekal sebagai keputusan terbuka atau memerlukan perincian lanjut.

### 15.1 Global Baseline Syukbah

**Status: NEEDS FURTHER DEFINITION**

Perlu dimuktamadkan:

- Senarai lengkap Global Baseline Syukbah.
- Kategori setiap Syukbah.
- Kod rasmi.
- Nama rasmi.
- Peraturan perubahan baseline.
- Mekanisme persaraan Syukbah.

### 15.2 Additional Country Syukbah

**Status: OPEN**

Perlu dimuktamadkan:

- Pihak yang boleh mencadangkan.
- Pihak yang menyemak.
- Pihak yang meluluskan.
- Keperluan kelulusan sebelum pengaktifan.
- Kuasa menggantung atau menamatkan.
- Hubungan dengan Global Baseline.

Rujukan: ODR-003.

### 15.3 Pelantikan Admin Syukbah

**Status: OPEN**

Perlu dimuktamadkan:

- Pihak yang mencalonkan.
- Pihak yang menyemak kelayakan.
- Pihak yang meluluskan.
- Pihak yang menamatkan pelantikan.
- Kelayakan calon.
- Persetujuan calon.
- Keperluan TAFAKUT.
- Tempoh dan pembaharuan pelantikan.

Rujukan: ODR-012.

### 15.4 Delegation dan Pemangkuan Deputy

**Status: OPEN**

Perlu dimuktamadkan:

- Skop tugasan yang boleh didelegasikan.
- Kuasa yang boleh dipangku.
- Kuasa yang tidak boleh dipangku.
- Pihak yang memberi kuasa.
- Keadaan Admin dianggap tidak tersedia.
- Tempoh delegation.
- Penamatan kuasa.
- Audit tindakan Deputy.
- Kuasa Deputy terhadap Moderator.

Rujukan: ODR-011.

### 15.5 Laporan Syukbah

**Status: NEEDS FURTHER DEFINITION**

Perlu dimuktamadkan:

- Jenis laporan.
- Format dan kandungan.
- Kekerapan.
- Pengesahan.
- Tempoh edit.
- Pembetulan.
- Hubungan dengan laporan organisasi.

### 15.6 CMS dan Penerbitan Rasmi

**Status: NEEDS FURTHER DEFINITION**

Perlu dimuktamadkan:

- Struktur CMS.
- Pihak yang boleh menerbitkan.
- Pihak yang boleh menyemak.
- Workflow penerbitan.
- Hubungan CMS dengan dashboard dan perbincangan Syukbah.
- API dan integrasi.

CMS tidak termasuk dalam skop pembangunan penuh dokumen ini.

### 15.7 Persaraan dan Pengaktifan Semula Syukbah

**Status: OPEN**

Perlu dimuktamadkan:

- Kuasa meluluskan persaraan.
- Kesan terhadap pelantikan Admin.
- Kesan terhadap rekod operasi.
- Syarat pengaktifan semula.
- Sama ada pengaktifan semula memerlukan kelulusan khusus.

Semua perkara terbuka mesti diselaraskan dengan `OPEN_DECISIONS_REGISTER.md` dan `MASTER_DECISION_REGISTER.md`.

## 16. Related Documents

Dokumen ini perlu dibaca bersama:

- `MASTER_DECISION_REGISTER.md`
- `OPEN_DECISIONS_REGISTER.md`
- `MODULE_REQUIREMENTS.md`
- `UAC_MATRIX.md`
- `JMV2001-Ahbab-Profile-Account-Management.md`
- `JMV2002-Organization-Structure-Governance.md`
- `JMV2004-Takaza-Management.md`
- `V2_DESIGN_CHECKPOINT.md`
- `V2_IMPLEMENTATION_STATUS.md`
- `DASHBOARD_NAVIGATION_SPEC_V2.md`
- `REPOSITORY_DISPOSITION.md`
- `docs/SYSTEM_REALIGNMENT_DESIGN.md`

Jika terdapat percanggahan:

1. Keputusan terkini yang telah disahkan dalam Master Decision Register menjadi rujukan utama.
2. Open Decisions Register menjadi rujukan bagi perkara yang belum diputuskan.
3. UAC Matrix menentukan authorization dan skop akses.
4. JMV2002 menentukan struktur organisasi dan tadbir urus.
5. Dokumen ini menentukan pengurusan Syukbah.
6. JMV2004 menentukan pengurusan Takaza.
7. Dokumen modul berkaitan menentukan workflow operasi khusus.
8. Perkara yang masih `OPEN`, `PENDING`, `PROVISIONAL` atau `ON HOLD` mesti mengekalkan status tersebut.

Dokumen ini tidak boleh mengubah keputusan yang telah diluluskan melalui daftar keputusan rasmi.

## 17. Nota Pembangunan dan Working Rules

Peraturan pembangunan:

- Jangan menganggap semua Syukbah mesti aktif pada setiap negara atau peringkat.
- Jangan menganggap Additional Country Syukbah boleh diwujudkan atau diaktifkan tanpa proses kelulusan yang sah.
- Jangan mencampurkan Admin Markaz, Admin Syukbah dan Admin Takaza.
- Jangan menganggap pelantikan Admin Syukbah memberikan kuasa global atau kuasa Markaz.
- Jangan menganggap seorang Deputy mempunyai semua kuasa Admin Syukbah secara automatik.
- Jangan mengaktifkan delegation tanpa skop dan tempoh yang sah.
- Jangan menganggap tugasan sementara sebagai pelantikan rasmi.
- Jangan memberikan kuasa Moderator melebihi skop yang ditetapkan.
- Jangan membenarkan Moderator mengubah rekod operasi atau keputusan rasmi.
- Jangan membenarkan bantuan silang tanpa persetujuan kedua-dua Chief Admin.
- Jangan memberikan akses silang organisasi melebihi skop yang diluluskan.
- Jangan membenarkan akses sementara kekal selepas tempoh sah.
- Jangan menggunakan frontend sebagai satu-satunya kawalan authorization.
- Jangan menerima role, country atau organization scope daripada client sebagai bukti kuasa.
- Jangan memadam sejarah Syukbah, pelantikan, tugasan atau keputusan.
- Jangan menganggap perbincangan Syukbah sebagai CMS atau penerbitan rasmi.
- Jangan membangunkan keseluruhan CMS dalam skop dokumen ini.
- Jangan membina semula jadual database yang telah wujud tanpa audit schema.
- Jangan menyatakan fungsi sebagai `IMPLEMENTED` tanpa bukti kod dan ujian.
- Semua pelaksanaan mesti mematuhi UAC, audit dan keputusan rasmi yang telah diluluskan.
- Semua perkara yang belum diputuskan mesti kekal sebagai `OPEN`, `PENDING`, `PROVISIONAL` atau `ON HOLD` mengikut status sebenar.

---

**Document Status:** REQUIREMENTS BASELINE — FOR REVIEW  
**Version:** 1.2  
**Last Updated:** 28 November 2026  
**Next Review:** Verification of Global Baseline Syukbah, Additional Country Syukbah Approval, Admin Appointment Authority, Deputy Delegation, Moderator Permissions and Syukbah Reporting.

**Tamat — Syukbah Management**
