JMV2004 — Pengurusan Takaza

Project: JuhudManager V2
Document ID: JMV2004
Suggested filename: "JMV2004-Takaza-Management.md"
Status: REQUIREMENTS BASELINE — FOR REVIEW
Scope: Main Takaza, Sub Takaza, Jemaah, peserta, Amer, Supervisor, TAFAKUT, Percha, aktiviti dan laporan Takaza.

---

1. Tujuan

Dokumen ini menetapkan keperluan pengurusan Takaza dalam JuhudManager V2.

Istilah "Takaza" digunakan bagi konsep Project dan Takaza. Kedua-duanya merujuk kepada konsep yang sama dalam sistem ini.

2. Struktur Takaza

Takaza mempunyai dua jenis:

1. Main Takaza
2. Sub Takaza

2.1 Main Takaza

Main Takaza ialah Takaza utama yang boleh mempunyai Sub Takaza.

2.2 Sub Takaza

Sub Takaza ialah Takaza yang berada di bawah Main Takaza.

Peraturan:

- Maksimum dua tahap hierarki sahaja.
- Main Takaza boleh mempunyai Sub Takaza.
- Sub Takaza tidak boleh mempunyai anak atau Sub Takaza lain.
- Main dan Sub Takaza mesti berada dalam negara yang sama buat masa ini.

2.3 Hubungan Parent dan Child

Hubungan Main/Sub menentukan hierarki sahaja.

Ia tidak bermaksud kitaran hidup kedua-duanya bergantung antara satu sama lain.

Oleh itu:

- Status Main Takaza tidak secara automatik mengubah status Sub Takaza.
- Tarikh Main Takaza tidak secara automatik mengubah tarikh Sub Takaza.
- Penamatan Main Takaza tidak secara automatik menamatkan Sub Takaza.
- Sub Takaza boleh mempunyai perjalanan dan pengurusan tersendiri.

3. Penciptaan dan Pengaktifan

- Admin boleh mencipta Main Takaza.
- Admin boleh mencipta Sub Takaza.
- Admin boleh mengesahkan atau mengaktifkan Takaza tanpa kelulusan SUPER_ADMIN.
- Admin boleh mengaktifkan Takaza walaupun pelantikan Amer, peserta atau Supervisor belum lengkap.
- Sistem perlu memaparkan maklumat setup yang belum lengkap.
- Setup yang belum lengkap tidak semestinya menghalang pengaktifan.

Status Takaza:

- "DRAFT"
- "RELEASED"
- "ACTIVE"
- "ON_HOLD"
- "COMPLETED"
- "CANCELLED"

4. Hubungan Takaza dengan Jemaah

- Main Takaza dikaitkan dengan Jemaah.
- Semua Ahbab yang menjadi ahli Jemaah bagi Main Takaza secara automatik menjadi peserta Main Takaza.
- Sub Takaza boleh mempunyai peserta yang dipilih secara khusus oleh Admin.
- Keahlian Jemaah tidak secara automatik menjadikan seseorang peserta Sub Takaza.
- Ahbab daripada Jemaah lain boleh dimasukkan secara langsung ke Sub Takaza tanpa perlu menjadi peserta Main Takaza.

5. Pelantikan Amer

Setiap Main Takaza dan setiap Sub Takaza mempunyai Amer sendiri.

5.1 Syarat Amer

- Amer mesti menjadi peserta Takaza yang berkenaan.
- Admin melantik Amer.
- Setiap Takaza mempunyai satu pelantikan Amer aktif pada satu-satu masa.

5.2 Penggantian Amer

- Admin boleh menggantikan Amer.
- Penggantian tidak memerlukan TAFAKUT baharu.
- Amer terdahulu boleh kekal sebagai peserta Takaza.
- Pelantikan terdahulu tidak dipadam.
- Sejarah pelantikan mesti dikekalkan.

5.3 Penamatan Pelantikan Amer

Penamatan pelantikan boleh dimulakan oleh:

- Amer sendiri.
- Admin.

Rekod penamatan mesti mengandungi:

- Sebab.
- Tarikh dan masa.
- Pihak yang memulakan penamatan.
- Sejarah pelantikan.

Penamatan jawatan Amer tidak secara automatik menamatkan penyertaan individu tersebut dalam Takaza.

6. Supervisor

- Main Takaza: Supervisor mesti menjadi peserta Takaza.
- Sub Takaza: Supervisor boleh dilantik walaupun bukan peserta.
- Supervisor berbeza daripada peserta.
- Pelantikan Supervisor diurus oleh Admin.
- Takaza boleh diaktifkan walaupun Supervisor belum dilantik.

BELUM DIPUTUSKAN: Aliran kerja dan kuasa terperinci Supervisor.

7. Pengurusan Peserta Main Takaza

Semua ahli Jemaah bagi Main Takaza menjadi peserta secara automatik.

Sistem perlu menyimpan:

- Ahbab.
- Jemaah.
- Main Takaza.
- Tarikh penyertaan.
- Status penyertaan.
- Sejarah perubahan.

8. Pengurusan Peserta Sub Takaza

Sub Takaza menyokong dua sumber penyertaan:

- "VOLUNTARY"
- "ADMIN_NOMINATED"

8.1 Permohonan Sukarela

- Ahbab boleh memohon untuk menyertai Sub Takaza.
- Permohonan adalah bebas antara satu Takaza dengan Takaza lain.
- Ahbab perlu memberikan persetujuan.
- Admin perlu meluluskan penyertaan.
- TAFAKUT perlu dijalankan sebelum keputusan akhir.

8.2 Pencalonan Admin

- Admin boleh mencalonkan Ahbab untuk Sub Takaza.
- Ahbab mesti memberikan persetujuan.
- Admin meluluskan penyertaan selepas proses berkaitan.
- TAFAKUT perlu dijalankan sebelum keputusan akhir.

8.3 Keputusan Permohonan

- Lulus TAFAKUT tidak bermaksud permohonan diluluskan secara automatik.
- Admin membuat keputusan akhir.
- Beberapa permohonan boleh diproses secara berasingan.
- Kegagalan TAFAKUT menyebabkan status kelayakan bagi Takaza berkenaan menjadi "SUSPEND" atau "ON_HOLD".
- Kegagalan TAFAKUT tidak menyekat akaun login Ahbab.
- "REJECT" ialah keputusan yang berbeza dan hanya digunakan dalam keadaan yang jarang berlaku.

9. Proses TAFAKUT

TAFAKUT dijalankan bagi setiap Takaza secara berasingan.

9.1 Dua Admin Penilai

- Dua Admin membuat keputusan secara berasingan.
- Kedua-duanya perlu memberikan keputusan.
- "PASS + PASS" menghasilkan keputusan lulus.
- "FAIL + FAIL" menghasilkan keputusan gagal dan status kelayakan "SUSPEND".
- "PASS + FAIL" menghasilkan keputusan bercanggah dan memerlukan Admin ketiga.

9.2 Admin Ketiga

- Admin ketiga menyelesaikan keputusan bercanggah.
- Keputusan akhir ialah "PASS" atau "FAIL".
- Sistem merekodkan ketiga-tiga keputusan.
- Sistem mengekalkan identiti penilai, masa dan sejarah keputusan.

9.3 Pengulangan TAFAKUT

- TAFAKUT baharu boleh menggunakan Admin yang sama atau Admin lain.
- Sejarah TAFAKUT terdahulu mesti dikekalkan.
- Keputusan lama tidak boleh dipadam atau ditulis ganti.

9.4 Kesan TAFAKUT

Status "SUSPEND" atau "ON_HOLD" hanya berkaitan kelayakan menyertai Takaza.

Ia tidak bermaksud:

- Akaun Ahbab dinyahaktifkan.
- Login disekat.
- Profil dipadam.
- Sejarah penyertaan dipadam.

10. Penarikan Diri dan Penyingkiran Peserta

10.1 Ahbab Menarik Diri

- Ahbab boleh menarik diri daripada Takaza.
- Penarikan diri Ahbab tidak boleh diveto oleh Admin.
- Admin boleh menambah catatan "APPROVED" atau "NOT_APPROVED".
- Walaupun Admin memberikan catatan "NOT_APPROVED", Ahbab masih boleh menarik diri.
- Status penarikan diri ialah "WITHDRAWN".

10.2 Admin Menyingkirkan Peserta

- Admin boleh menyingkirkan peserta.
- Admin mesti memberikan sebab.
- Ahbab mesti dimaklumkan.
- Status penyingkiran ialah "REMOVED".
- Dalam aliran kerja semasa, Ahbab tidak boleh membatalkan atau membuat rayuan terhadap keputusan penyingkiran.

10.3 Sejarah

- Penarikan diri tidak memadam rekod penyertaan.
- Penyingkiran tidak memadam rekod penyertaan.
- Rekod TAFAKUT terdahulu kekal.
- Jika Ahbab mahu menyertai semula Takaza yang sama atau Takaza lain, permohonan baharu dan TAFAKUT baharu diperlukan.

11. Kapasiti Takaza

- Admin menentukan kapasiti peserta.
- Admin boleh mengubah kapasiti selepas Takaza berstatus "RELEASED" atau "ACTIVE".
- Semua perubahan direkodkan.
- Jika kapasiti diturunkan di bawah bilangan peserta sedia ada, sistem tidak boleh menyingkirkan peserta secara automatik.
- Tiada waiting list automatik apabila kapasiti penuh.
- Admin boleh mencadangkan Takaza alternatif.
- Pemindahan ke Takaza alternatif memerlukan persetujuan kedua-dua pihak dan TAFAKUT baharu.

12. KAWAIF

KAWAIF ialah rekod kelayakan Ahbab pada profil.

KAWAIF berasingan daripada borang atau proses temu duga TAFAKUT.

Peraturan:

- KAWAIF disimpan dalam profil Ahbab.
- Admin mengesahkan atau memperakui KAWAIF.
- Admin boleh memasukkan atau mengemas kini KAWAIF jika rekod tiada atau sudah lapuk.
- KAWAIF boleh digunakan untuk membantu pemilihan Ahbab bagi Takaza yang sesuai.

BELUM DIPUTUSKAN: Struktur kategori, skor dan kaedah penilaian KAWAIF.

13. Borang TAFAKUT

Borang TAFAKUT digunakan untuk mendapatkan maklumat Ahbab bagi proses penilaian dan temu duga.

Maklumat yang telah dikenal pasti termasuk:

- Maklumat peribadi.
- Pengalaman.
- Aktiviti.
- Azam Ahbab.
- Perbelanjaan dalam MYR.
- Status.
- Latar belakang.

Maklumat ini digunakan sebagai bahan penilaian dan temu duga.

Borang TAFAKUT tidak menggantikan rekod KAWAIF.

14. Aliran Pembentukan Takaza

Aliran operasi yang telah ditetapkan:

1. Admin menyediakan senarai Takaza.
2. Ahbab menyediakan KAWAIF untuk menyertai Takaza yang sesuai atau Takaza yang ditugaskan oleh Admin.
3. Admin membentuk Jemaah dengan menambah Ahbab.
4. Admin melantik Amer.
5. Aktiviti pra-permulaan ditetapkan bagi setiap Jemaah.
6. Bayan Hidayat dijalankan pada tarikh mula Takaza.
7. Selepas Bayan Hidayat, sistem menjana Percha secara automatik.
8. Aktiviti Wapsi dan aktiviti tarikh tamat dijalankan.
9. Admin mengesahkan aktiviti tarikh tamat selesai.
10. Amer menghantar laporan penuh Takaza.
11. Selepas syarat penyelesaian dipenuhi, Takaza boleh berstatus "COMPLETED".

15. Aktiviti Pra-Permulaan

- Admin menetapkan aktiviti pra-permulaan bagi setiap Jemaah.
- Aktiviti boleh berbeza antara Jemaah.
- Admin merekodkan pengesahan aktiviti.
- Amer merekodkan pengesahan aktiviti.
- Ketiadaan pengesahan atau ketidakhadiran seseorang tidak secara automatik menyekat atau membatalkan Takaza.

16. Percha

Percha dijana secara automatik selepas Bayan Hidayat.

Maklumat Percha:

- Nombor Percha.
- Senarai ahli Jemaah.
- Tempat atau lokasi pembentukan.
- Halqah.
- Laluan atau destinasi.
- Tarikh Bayan Hidayat.
- Kharguzari.
- Tarikh Bayan Wapsi.
- Aktiviti pada tarikh tamat Takaza.

Kharguzari dijadualkan sehari sebelum tarikh Bayan Wapsi.

16.1 Pindaan Percha

- Admin boleh mencadangkan pindaan.
- Pindaan memerlukan kelulusan Admin kedua yang berbeza daripada Admin yang membuat pindaan.
- Jika diluluskan, pindaan direkodkan.
- Jika ditolak, rekod asal dikekalkan.
- Admin yang membuat pindaan boleh mengemukakan semula pindaan.
- Semua versi, keputusan dan sejarah mesti dikekalkan.

17. Kharguzari Individu

- Kharguzari ialah laporan individu semasa aktiviti berkaitan.
- Ahbab hanya boleh melihat laporan sendiri.
- Admin yang mempunyai kuasa boleh melihat laporan dalam skop Takaza/negara yang dibenarkan.
- Amer boleh mengakses laporan yang dibenarkan untuk menyediakan laporan penuh Takaza.

17.1 Rekod Kharguzari

- Laporan asal tidak boleh diubah selepas dihantar.
- Susulan atau komen dibuat secara berasingan.
- Penulis boleh mengedit komen sendiri.
- Laporan asal kekal sebagai rekod sejarah.

18. Laporan Penuh Takaza oleh Amer

- Amer wajib menghantar laporan penuh Takaza.
- Laporan penuh diperlukan sebelum Takaza berstatus "COMPLETED".
- Tidak memerlukan pengesahan Admin kedua.
- Laporan boleh dilihat oleh Admin yang diberi kuasa dan peserta Takaza.
- Amer, Admin dan peserta boleh memberikan komen.
- Penulis boleh mengedit komen sendiri.
- Laporan asal tidak boleh diubah selepas dihantar.

18.1 Penyelesaian Takaza

Takaza hanya boleh berstatus "COMPLETED" apabila:

1. Admin mengesahkan aktiviti tarikh tamat selesai.
2. Amer menghantar laporan penuh Takaza.

Admin mengesahkan aktiviti tarikh tamat dan sistem memaklumkan Amer.

Tidak memerlukan pengesahan kedua selepas Admin mengesahkan aktiviti tersebut.

BELUM DIPUTUSKAN: Urutan tindakan jika laporan penuh Amer dihantar lewat atau aktiviti tarikh tamat telah selesai tetapi laporan masih belum diterima.

19. Komen dan Perbincangan Takaza

- Amer, Admin dan peserta boleh memberikan komen pada laporan penuh Takaza.
- Penulis boleh mengedit komen sendiri.
- Komen dan sejarah perubahan perlu disimpan.
- Hak akses tertakluk kepada status penyertaan dan kebenaran pengguna.

20. Arkib Takaza Tahunan

- Takaza diarkibkan secara automatik mengikut kitaran tahunan.
- Arkib Takaza berasingan daripada Laporan Tahunan Admin.
- Arkib tidak bermaksud rekod dipadam.
- Data Takaza terdahulu kekal boleh diakses mengikut kebenaran.
- Sejarah dan laporan lama mesti dikekalkan.

21. Notifikasi

Sistem perlu memberi notifikasi bagi peristiwa penting, termasuk:

- Permohonan menyertai Takaza.
- Pencalonan Admin.
- Permintaan persetujuan Ahbab.
- Keputusan TAFAKUT.
- Keputusan permohonan.
- Pelantikan Amer.
- Penggantian Amer.
- Penamatan pelantikan Amer.
- Penarikan diri atau penyingkiran peserta.
- Perubahan kapasiti.
- Aktiviti Takaza.
- Penjanaan Percha.
- Pindaan Percha.
- Kharguzari.
- Laporan penuh Amer.
- Penyelesaian Takaza.

Notifikasi perlu mengikut bahasa pilihan pengguna.

22. Audit dan Sejarah

Sistem perlu mengekalkan sejarah:

- Penciptaan Main/Sub Takaza.
- Perubahan status.
- Perubahan tarikh.
- Hubungan Main/Sub.
- Jemaah.
- Peserta.
- Permohonan dan pencalonan.
- Keputusan TAFAKUT.
- Pelantikan Amer.
- Pelantikan Supervisor.
- Penarikan diri.
- Penyingkiran.
- Perubahan kapasiti.
- Aktiviti.
- Percha.
- Kharguzari.
- Laporan penuh.
- Pengesahan penyelesaian.
- Arkib tahunan.

Rekod sejarah tidak boleh dipadam melalui operasi biasa.

23. Perkara Belum Dimuktamadkan

1. Aliran kerja dan kuasa Supervisor.
2. Struktur kategori dan penilaian KAWAIF.
3. Perincian borang TAFAKUT.
4. Urutan penyelesaian Takaza apabila laporan Amer lewat.
5. Butiran teknikal arkib tahunan.
6. Perincian notifikasi dan tempoh peringatan.
7. Perincian paparan dan laporan statistik Takaza.

---

Nota pembangunan: Takaza dan Sub Takaza mempunyai kitaran hidup masing-masing. Jangan membina cascade status, tarikh atau penamatan daripada Main Takaza kepada Sub Takaza. Semua rekod penyertaan dan TAFAKUT mesti mengekalkan sejarah.
