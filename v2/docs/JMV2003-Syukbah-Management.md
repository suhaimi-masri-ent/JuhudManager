JMV2003 — Pengurusan Syukbah

Project: JuhudManager V2
Document ID: JMV2003
Suggested filename: "JMV2003-Syukbah-Management.md"
Status: REQUIREMENTS BASELINE — FOR REVIEW
Scope: Pengurusan kategori Syukbah, pentadbiran, pelantikan, tugasan, moderator dan hubungan Syukbah dengan organisasi.

---

1. Tujuan

Dokumen ini menetapkan bagaimana Syukbah diwujudkan, diaktifkan, ditadbir dan diurus pada setiap peringkat organisasi JuhudManager V2.

Syukbah ialah struktur kerja dan pentadbiran yang berasingan daripada struktur hierarki organisasi.

2. Prinsip Asas Syukbah

- Setiap peringkat organisasi boleh mempunyai senarai Syukbah tersendiri.
- Senarai asas Syukbah adalah sama bagi semua peringkat.
- Tidak semua Syukbah wajib diaktifkan pada setiap peringkat.
- Sesebuah Syukbah boleh diaktifkan kemudian apabila diperlukan.
- Admin Syukbah hanya mempunyai kuasa dalam Syukbah yang ditugaskan kepadanya, tertakluk kepada arahan dan kuasa Chief Admin.

3. Kategori Syukbah

Terdapat dua kategori:

3.1 Global Baseline Syukbah

- Senarai asas Syukbah diurus oleh SUPER_ADMIN.
- Senarai asas yang sama digunakan untuk semua negara.
- Perubahan kepada senarai asas dibuat pada peringkat global.

3.2 Additional Country Syukbah

- Negara boleh menambah Syukbah tambahan sendiri.
- Syukbah tambahan hanya terpakai kepada negara tersebut.
- Negara lain tidak secara automatik menerima Syukbah tambahan itu.
- SUPER_ADMIN mempunyai akses penyeliaan global tetapi bukan pengurus operasi harian Syukbah negara.

4. Identiti dan Rekod Syukbah

Setiap Syukbah mesti mempunyai:

- ID unik dalam pangkalan data.
- Kod rasmi yang unik.
- Nama rasmi.
- Kategori.
- Skop.
- Status aktif atau tidak aktif.
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

5. Pengaktifan Syukbah

- Syukbah boleh diwujudkan tanpa terus diaktifkan.
- Syukbah boleh berstatus aktif atau tidak aktif.
- Syukbah yang tidak aktif tidak menjalankan operasi biasa.
- Syukbah boleh diaktifkan kemudian.
- Apabila diaktifkan, Admin Syukbah boleh dilantik.
- Sejarah pengaktifan dan penyahaktifan mesti direkodkan.

6. Struktur Pentadbiran Syukbah

Setiap Syukbah yang aktif mempunyai:

- Seorang Admin Syukbah.
- Seorang atau lebih Deputy Admin Syukbah.

Tidak boleh ada dua Admin Syukbah aktif bagi Syukbah yang sama pada masa yang sama.

6.1 Admin Syukbah

Admin Syukbah bertanggungjawab:

- Mengurus operasi Syukbah.
- Melaksanakan keputusan yang telah disahkan oleh Amer Negara, Faisalah atau Chief Admin berkaitan.
- Menentukan kaedah pelaksanaan yang selaras dengan keputusan.
- Membahagikan tugasan kepada Deputy Admin Syukbah.
- Memantau tugasan dan kemajuan.
- Menyediakan laporan Syukbah.
- Mengurus perbincangan Syukbah.

Admin Syukbah tidak boleh mengubah keputusan rasmi yang telah disahkan oleh pihak berkuasa tanpa proses pindaan keputusan.

6.2 Deputy Admin Syukbah

- Membantu Admin Syukbah.
- Menerima tugasan daripada Admin Syukbah.
- Boleh menjalankan tugas sementara apabila Admin Syukbah tidak hadir atau tidak dapat menjalankan tugas.
- Admin Syukbah memilih Deputy yang memangku tugas.
- Jika Admin Syukbah tidak dapat membuat pilihan, Chief Admin berkaitan menentukan pemangku.

Sistem merekodkan:

- Deputy yang memangku.
- Tempoh pemangkuan.
- Skop kuasa.
- Pihak yang memberi kuasa.
- Tarikh mula dan tamat.

6.3 Pembahagian Tugasan

- Admin Syukbah boleh membahagikan tugasan kepada Deputy Admin.
- Tidak memerlukan kelulusan Chief Admin bagi pembahagian tugasan biasa.
- Tugasan mesti mempunyai skop dan rekod.
- Pembahagian tugasan tidak mengubah jawatan rasmi seseorang.

7. Pelantikan Admin Syukbah

- Calon Admin Syukbah mestilah Ahbab.
- Calon mesti melepasi syarat TAFAKUT yang berkaitan.
- Local Chief Admin mempunyai kuasa melantik atau menamatkan pelantikan Admin Syukbah dalam pentadbiran sendiri.
- Tidak memerlukan kelulusan tambahan daripada Amer, Faisalah atau Chief Admin peringkat lebih tinggi.
- Sistem menyimpan sejarah pelantikan dan penamatan.

7.1 Seorang Ahbab Memegang Beberapa Jawatan Admin Syukbah

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

8. Tugasan Merentas Syukbah

Admin Syukbah boleh diarahkan membantu Syukbah lain oleh Chief Admin.

Peraturan:

- Tugasan mesti mempunyai arahan yang jelas.
- Skop kerja mesti ditetapkan.
- Tempoh tugasan mesti direkodkan.
- Pihak yang memberikan arahan mesti direkodkan.
- Akses sistem hanya diberikan setakat yang diperlukan.
- Tugasan sementara tidak menjadikan individu itu Admin Syukbah lain secara rasmi.
- Akses tambahan tamat apabila tugasan atau tempoh berakhir.

9. Bantuan Silang Antara Organisasi

Admin Syukbah daripada organisasi lain boleh membantu organisasi lain.

Syarat:

- Kedua-dua Chief Admin yang terlibat mesti bersetuju.
- Skop dan tempoh bantuan mesti direkodkan.
- Tugasan mesti dikenal pasti.
- Akses data dihadkan kepada keperluan tugasan.
- Akses kepada data sensitif memerlukan justifikasi.
- Akses sementara tamat secara automatik.
- Semua tindakan direkodkan.

10. Hubungan Syukbah dengan Chief Admin

- Chief Admin menyelaras Admin Markaz dan Admin Syukbah.
- Chief Admin boleh mengarahkan tugasan tertentu kepada Syukbah.
- Chief Admin memantau pelaksanaan keputusan.
- Chief Admin boleh memberikan tugasan sementara kepada Admin Syukbah.
- Tugasan sementara tidak secara automatik mengubah pelantikan rasmi Admin Syukbah.

11. Proses Keputusan dan Pelaksanaan

Prinsip:

1. Cadangan dikemukakan kepada pihak berkuasa berkaitan.
2. Ahli Syura memberikan pandangan atau nasihat jika berkenaan.
3. Amer Negara, Faisalah atau Chief Admin membuat keputusan akhir mengikut kuasa peringkat masing-masing.
4. Selepas keputusan disahkan, Admin Syukbah berkaitan menerima notifikasi secara automatik.
5. Admin Syukbah menentukan kaedah pelaksanaan yang selaras dengan keputusan.
6. Pelaksanaan dan kemajuan direkodkan.

Admin Syukbah tidak menggantikan kuasa membuat keputusan rasmi yang ditetapkan kepada Amer Negara, Faisalah atau Chief Admin.

12. Perbincangan Syukbah dan Moderator

Setiap Admin Syukbah secara automatik menjadi Moderator bagi perbincangan Syukbah sendiri.

Admin Syukbah boleh menambah atau membuang Moderator tambahan secara langsung.

Moderator tambahan:

- Tidak semestinya Admin.
- Boleh terdiri daripada Ahbab.
- Tidak memerlukan pelantikan formal.
- Tindakan tambah dan buang direkodkan bersama pelaku dan masa.

12.1 Hak Moderator

Moderator hanya boleh:

- Membuat komen.
- Memadam komen.

Moderator tidak boleh:

- Mengedit komen orang lain.
- Menyembunyikan komen.
- Pin atau Unpin komen.

Pengguna boleh memadam komen sendiri.

Moderator boleh memadam komen pengguna lain.

12.2 Rekod Komen

- Komen yang dipadam menggunakan soft-delete.
- Rekod asal dan sejarah tindakan mesti dikekalkan.
- Komen tidak boleh diedit selepas dihantar.
- Penulis boleh memadam komen sendiri.
- Moderator boleh memadam komen lain.
- Tindakan pemadaman mesti direkodkan.

12.3 Maklumat Rasmi

Maklumat rasmi tidak bergantung kepada fungsi Pin/Unpin.

Maklumat rasmi hendaklah disediakan melalui CMS atau paparan rasmi/dashboard.

CMS ialah modul berasingan yang akan diintegrasikan kemudian.

Untuk fasa ini:

- Sediakan reka bentuk API yang boleh menyokong integrasi CMS.
- Jangan membangunkan keseluruhan CMS dalam skop dokumen ini.

13. Audit dan Sejarah

Sistem perlu merekodkan:

- Penciptaan Syukbah.
- Perubahan nama atau kod.
- Perubahan skop.
- Pengaktifan dan penyahaktifan.
- Pelantikan dan penamatan Admin.
- Pemangkuan Admin.
- Pelantikan Moderator tambahan.
- Penamatan Moderator.
- Tugasan antara Syukbah.
- Bantuan silang organisasi.
- Perubahan akses.
- Aktiviti pelaksanaan keputusan.

Rekod audit tidak boleh diubah atau dipadam melalui operasi biasa.

14. Perkara Belum Dimuktamadkan

1. Senarai lengkap Global Baseline Syukbah.
2. Struktur kategori dan kod rasmi bagi setiap Syukbah.
3. Mekanisme kelulusan penciptaan Syukbah tambahan negara.
4. Butiran syarat TAFAKUT bagi setiap jenis jawatan Admin Syukbah.
5. Perincian laporan khusus bagi setiap Syukbah.
6. Struktur dan integrasi CMS.

---

Nota pembangunan: Jangan menganggap semua Syukbah mesti aktif pada setiap peringkat. Sistem mesti menyokong pengaktifan secara berperingkat dan mengekalkan sejarah setiap perubahan.
