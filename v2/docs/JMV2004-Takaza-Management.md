JUHUDMANAGER V2 — TAKAZA MANAGEMENT

Document ID: JMV2004
Version: 3.0 — Consolidated Requirements Baseline
Status: REQUIREMENTS BASELINE — FOR REVIEW
Last Updated: 27 November 2026
Repository Path: "v2/docs/JMV2004-Takaza-Management.md"

---

1. Tujuan

Dokumen ini menetapkan keperluan pengurusan Takaza dalam JuhudManager V2.

Istilah Takaza digunakan bagi konsep Project dan Takaza. Kedua-duanya merujuk kepada konsep yang sama dalam sistem ini.

Dokumen ini meliputi:

- Main Takaza dan Sub Takaza.
- Hubungan Takaza dengan Jemaah.
- Kaedah penyertaan.
- Pengurusan peserta.
- Pelantikan Amer dan Supervisor.
- KAWAIF.
- TAFAKUT.
- Aktiviti dan tarikh Takaza.
- Percha.
- Kharguzari.
- Laporan Amer.
- Penyelesaian Takaza.
- Arkib tahunan.
- Audit dan notifikasi.

2. Struktur Takaza

Takaza mempunyai dua jenis:

1. Main Takaza.
2. Sub Takaza.

2.1 Main Takaza

Main Takaza ialah Takaza utama yang boleh mempunyai Sub Takaza.

Main Takaza dikaitkan dengan Jemaah dan mempunyai kitaran pengurusan sendiri.

2.2 Sub Takaza

Sub Takaza ialah Takaza yang berada di bawah Main Takaza.

Peraturan:

- Maksimum dua tahap hierarki sahaja.
- Main Takaza boleh mempunyai Sub Takaza.
- Sub Takaza tidak boleh mempunyai anak atau Sub Takaza lain.
- Main dan Sub Takaza mesti berada dalam negara yang sama buat masa ini.
- Sub Takaza boleh mempunyai Jemaah, peserta, Amer dan pengurusan tersendiri.

2.3 Hubungan Parent dan Child

Hubungan Main/Sub menentukan hierarki sahaja.

Ia tidak bermaksud kitaran hidup kedua-duanya bergantung antara satu sama lain.

Oleh itu:

- Status Main Takaza tidak secara automatik mengubah status Sub Takaza.
- Tarikh Main Takaza tidak secara automatik mengubah tarikh Sub Takaza.
- Penamatan Main Takaza tidak secara automatik menamatkan Sub Takaza.
- Pembatalan Main Takaza tidak secara automatik membatalkan Sub Takaza.
- Sub Takaza boleh mempunyai perjalanan dan pengurusan tersendiri.

3. Penciptaan dan Pengaktifan

- Admin yang mempunyai kuasa boleh mencipta Main Takaza.
- Admin yang mempunyai kuasa boleh mencipta Sub Takaza.
- Admin boleh mengesahkan atau mengaktifkan Takaza tanpa kelulusan SUPER_ADMIN.
- Admin boleh mengaktifkan Takaza walaupun pelantikan Amer, peserta atau Supervisor belum lengkap.
- Sistem perlu memaparkan maklumat setup yang belum lengkap.
- Setup yang belum lengkap tidak semestinya menghalang pengaktifan.
- Semua tindakan penciptaan, pengesahan dan pengaktifan direkodkan.

3.1 Status Takaza

Status Takaza:

- "DRAFT"
- "RELEASED"
- "ACTIVE"
- "ON_HOLD"
- "COMPLETED"
- "CANCELLED"

Maksud ringkas:

- "DRAFT": Takaza sedang disediakan.
- "RELEASED": Takaza telah dilepaskan untuk proses penyertaan atau persediaan.
- "ACTIVE": Takaza sedang berjalan.
- "ON_HOLD": Operasi atau keputusan tertentu ditangguhkan.
- "COMPLETED": Semua syarat penyelesaian telah dipenuhi.
- "CANCELLED": Takaza dibatalkan melalui tindakan yang dibenarkan.

Perubahan status mesti direkodkan bersama pelaku, masa dan sebab jika diperlukan.

3.2 Tarikh Takaza

- Admin menetapkan tarikh cadangan mula dan tarikh tamat.
- Tarikh cadangan mula belum menjadi tarikh rasmi yang dikunci.
- Amer Jemaah boleh bersetuju dengan tarikh cadangan atau mencadangkan tarikh baharu.
- Selepas Amer bersetuju, Admin mengesahkan dan mengunci tarikh rasmi.
- Selepas tarikh dikunci, Amer tidak boleh mengubahnya melalui proses biasa.
- Sebarang pindaan selepas penguncian memerlukan proses Admin dan rekod sejarah.
- Tarikh tamat boleh ditetapkan sebagai tarikh tetap.
- Admin boleh meminda tarikh tamat dengan sebab dan rekod sejarah.
- Admin boleh menamatkan Takaza lebih awal dengan sebab yang direkodkan.

4. Hubungan Takaza dengan Jemaah

Jemaah Membership dan Takaza Participation ialah dua rekod yang berasingan.

Keahlian Jemaah tidak boleh dianggap sebagai rekod penyertaan Takaza yang telah disahkan.

Peraturan:

- Main Takaza dikaitkan dengan Jemaah.
- Ahbab yang menjadi ahli Jemaah boleh dikenal pasti sebagai calon penyertaan Main Takaza.
- Calon penyertaan perlu melalui pengesahan Admin.
- Keahlian Jemaah tidak secara automatik menjadikan seseorang peserta Sub Takaza.
- Ahbab daripada Jemaah lain boleh dipertimbangkan untuk Sub Takaza melalui kaedah penyertaan yang dibenarkan.
- Setiap penyertaan Takaza mempunyai rekod tersendiri.
- Seseorang boleh mempunyai rekod penyertaan berasingan bagi beberapa Takaza.

Tiada entiti V2 berasingan bernama Project Member diperlukan. Rekod penyertaan Takaza digunakan untuk tujuan tersebut.

5. Kaedah Penyertaan Takaza

Sistem mesti menyokong kaedah penyertaan yang boleh dikonfigurasi dan dikembangkan.

Kaedah yang dikenal pasti:

1. "AUTOMATIC_INCLUSION"
2. "VOLUNTARY_APPLICATION"
3. "ADMIN_NOMINATION"
4. "DIRECT_ASSIGNMENT"

Kaedah boleh digunakan secara berasingan atau digabungkan mengikut konfigurasi Takaza.

Admin boleh menetapkan syarat bagi setiap kaedah.

5.1 AUTOMATIC_INCLUSION

- Sistem mengenal pasti Ahbab yang memenuhi kriteria.
- Sistem mewujudkan rekod calon dengan status "PENDING_ADMIN_CONFIRMATION".
- Admin perlu mengesahkan calon sebelum status peserta diberikan.
- Ahbab yang sudah menjadi ahli Jemaah ketika Main Takaza dibentuk juga perlu melalui pengesahan Admin.
- Ahbab yang menyertai Jemaah selepas Takaza berstatus "ACTIVE" boleh dikenal pasti sebagai calon tambahan.
- Keahlian Jemaah tidak secara automatik menjadikan Ahbab peserta Takaza.

5.2 VOLUNTARY_APPLICATION

- Ahbab boleh memohon untuk menyertai Takaza.
- Permohonan adalah bebas antara satu Takaza dengan Takaza lain.
- Ahbab perlu memberikan persetujuan.
- Admin menilai permohonan.
- TAFAKUT dijalankan jika diwajibkan oleh kriteria Takaza.
- Keputusan akhir dibuat oleh Admin yang mempunyai kuasa.

5.3 ADMIN_NOMINATION

- Admin boleh mencalonkan Ahbab untuk menyertai Takaza.
- Ahbab mesti memberikan persetujuan.
- Admin menilai pencalonan.
- TAFAKUT dijalankan jika diwajibkan oleh kriteria Takaza.
- Keputusan akhir dibuat oleh Admin yang mempunyai kuasa.

5.4 DIRECT_ASSIGNMENT

- Admin boleh menggunakan kaedah penugasan langsung jika kaedah itu dibenarkan dalam konfigurasi Takaza.
- Sistem mesti merekodkan pihak yang membuat penugasan dan sebabnya.
- Keperluan persetujuan Ahbab dan TAFAKUT masih belum dimuktamadkan.
- Jangan menganggap DIRECT_ASSIGNMENT secara automatik mengetepikan persetujuan atau TAFAKUT.

Status: OPEN DECISION

5.5 Perubahan Konfigurasi Penyertaan

Jika konfigurasi kaedah penyertaan diubah selepas Takaza berstatus "RELEASED" atau "ACTIVE":

- Perubahan digunakan kepada penyertaan baharu.
- Perubahan boleh digunakan kepada permohonan yang belum diputuskan.
- Perubahan tidak secara automatik mengubah rekod peserta sedia ada.
- Sejarah konfigurasi lama mesti dikekalkan.

6. Pengurusan Peserta

Setiap Takaza mempunyai rekod peserta tersendiri.

Rekod sekurang-kurangnya mengandungi:

- Ahbab.
- Takaza.
- Jemaah berkaitan jika ada.
- Kaedah penyertaan.
- Tarikh permohonan atau pencalonan.
- Tarikh persetujuan.
- Tarikh pengesahan Admin.
- Status penyertaan.
- Sejarah perubahan.

6.1 Status Penyertaan

Sistem perlu membezakan status proses dan status penyertaan.

Antara status yang digunakan:

- "PENDING_ADMIN_CONFIRMATION"
- "PENDING_CONSENT"
- "PENDING_TAFAKUT"
- "ACTIVE"
- "WITHDRAWAL_REQUESTED"
- "WITHDRAWN"
- "REMOVED"

Status kelayakan TAFAKUT seperti "SUSPEND" dan "ON_HOLD" tidak boleh disamakan dengan status akaun pengguna atau status keahlian Jemaah.

6.2 Penyertaan Main Takaza

- Ahli Jemaah Main Takaza boleh dikenal pasti sebagai calon penyertaan.
- Sistem menyediakan rekod calon melalui kaedah yang dikonfigurasi.
- Admin mengesahkan penyertaan.
- Hanya selepas pengesahan, rekod menjadi penyertaan peserta yang disahkan.
- Ahbab yang menyertai Jemaah kemudian boleh dikenal pasti sebagai calon mengikut konfigurasi dan keputusan Admin.

6.3 Penyertaan Sub Takaza

Sub Takaza boleh menggunakan mana-mana kaedah penyertaan yang dibenarkan.

- Ahbab tidak semestinya peserta Main Takaza untuk dipertimbangkan bagi Sub Takaza.
- Permohonan atau pencalonan diproses secara berasingan.
- Persetujuan Ahbab diperlukan bagi VOLUNTARY_APPLICATION dan ADMIN_NOMINATION.
- TAFAKUT dilaksanakan jika diwajibkan oleh kriteria.
- Admin membuat keputusan akhir.

7. Pelantikan Amer

Setiap Main Takaza dan setiap Sub Takaza mempunyai Amer sendiri.

7.1 Syarat Amer

- Amer mesti menjadi peserta yang telah disahkan dalam Takaza yang berkenaan.
- Jika calon belum menjadi peserta, proses penyertaan biasa mesti diselesaikan terlebih dahulu.
- Admin dan calon mesti bersetuju dengan pelantikan.
- Setiap Takaza mempunyai satu pelantikan Amer aktif pada satu-satu masa.
- Pelantikan boleh dibuat sebelum tarikh rasmi mula Takaza.
- Tidak perlu menunggu Takaza berstatus "ACTIVE" untuk melantik Amer.

7.2 TAFAKUT bagi Amer

- Tiada TAFAKUT berasingan diperlukan jika calon mempunyai keputusan TAFAKUT terdahulu yang sah untuk tujuan berkenaan.
- Kesesuaian sebagai Amer boleh dimasukkan dalam pusingan TAFAKUT seterusnya jika diperlukan.
- Pelantikan Amer tetap memerlukan keputusan Admin dan persetujuan calon.

7.3 Tempoh Pelantikan

Rekod pelantikan Amer mengandungi:

- Amer.
- Takaza.
- Tarikh mula.
- Tarikh tamat.
- Pihak yang melantik.
- Persetujuan.
- Sebab pelantikan.
- Sejarah perubahan.

Tempoh pelantikan biasanya mengikut tempoh Takaza.

Admin boleh:

- Memendekkan tempoh.
- Melanjutkan tempoh.
- Menamatkan pelantikan lebih awal.
- Menggantikan Amer.

Semua tindakan mesti direkodkan.

Perubahan pelantikan Amer tidak secara automatik mengubah tarikh atau status Takaza.

7.4 Penggantian Amer

- Admin boleh menggantikan Amer sebelum tempoh pelantikan tamat.
- Penggantian mesti mempunyai sebab.
- Justifikasi daripada sekurang-kurangnya seorang Admin lain diperlukan.
- Admin kedua memberikan justifikasi, bukan kuasa veto.
- Admin yang mengurus Takaza membuat keputusan akhir.
- Sejarah pelantikan terdahulu tidak dipadam.
- Amer terdahulu boleh kekal sebagai peserta jika penyertaannya masih sah.

7.5 Penamatan Pelantikan Amer

Penamatan boleh dibuat oleh Admin mengikut kuasa yang sah atau melalui permintaan Amer untuk melepaskan jawatan.

Penamatan jawatan Amer tidak secara automatik menamatkan penyertaan individu tersebut dalam Takaza.

Jika tempoh Amer tamat ketika Takaza masih "ACTIVE":

- Pelantikan Amer tamat.
- Sistem memaklumkan Admin.
- Takaza kekal dalam status semasa.
- Admin menentukan tindakan pelantikan seterusnya.

8. Supervisor

Supervisor ialah pelantikan berasingan daripada Amer dan peserta.

8.1 Pelantikan

- Supervisor dilantik oleh Admin.
- Pelantikan memerlukan persetujuan Admin dan individu yang dipilih.
- Takaza boleh diaktifkan walaupun Supervisor belum dilantik.
- Status pelantikan, tempoh dan sejarah mesti direkodkan.
- Tempoh pelantikan sementara mengikuti prinsip tempoh Amer sebagai baseline sementara.
- Admin boleh memendekkan, melanjutkan atau menamatkan pelantikan lebih awal.

8.2 Kelayakan dan Kuasa

Perkara berikut belum dimuktamadkan:

- Sama ada Supervisor wajib menjadi peserta Takaza.
- Skop tugas dan tanggungjawab.
- Kuasa membuat keputusan.
- Hubungan Supervisor dengan Amer dan Admin.
- Keperluan TAFAKUT khusus.

Keputusan TAFAKUT sedia ada boleh dipertimbangkan. Kesesuaian Supervisor boleh dimasukkan dalam pusingan TAFAKUT seterusnya jika diperlukan.

Jangan memberikan Supervisor kuasa khas yang belum diluluskan.

8.3 Perubahan Pelantikan

- Pelantikan Supervisor tidak mengubah status atau tarikh Takaza.
- Semua perubahan tempoh atau penamatan direkodkan.
- Penggantian Supervisor tidak memadam sejarah pelantikan terdahulu.

9. KAWAIF

KAWAIF ialah rekod kelayakan, kemahiran dan pengalaman Ahbab dalam profil.

KAWAIF berasingan daripada borang dan proses temu duga TAFAKUT.

9.1 Pengurusan KAWAIF

- Ahbab boleh mengemukakan KAWAIF sendiri.
- Ahbab boleh mengemas kini rekod yang belum disahkan.
- Rekod yang dikemukakan menunggu pengesahan Admin.
- Admin boleh menambah atau mengemas kini KAWAIF jika rekod tiada atau sudah lapuk.
- Admin perlu merekodkan sumber atau asas perubahan.
- Rekod lama dan baharu mesti dikekalkan.
- Sistem merekodkan pelaku dan masa.

9.2 Kuasa Pentadbiran

Admin pada skop lebih tinggi atau lebih luas mengurus:

- Kategori KAWAIF.
- Kriteria.
- Skor jika digunakan.
- Kelayakan.
- Struktur rujukan.

Admin Takaza menggunakan KAWAIF sebagai rujukan pemilihan, bukan sebagai keputusan TAFAKUT.

9.3 Prinsip KAWAIF

- KAWAIF ialah rujukan kelayakan dan pengalaman.
- KAWAIF bukan keputusan automatik penyertaan.
- KAWAIF tidak menggantikan TAFAKUT.
- Pengesahan KAWAIF boleh dibuat oleh Admin yang berbeza daripada penilai TAFAKUT.

10. Proses TAFAKUT

TAFAKUT dijalankan bagi setiap proses kelayakan Takaza yang memerlukannya.

10.1 Dua Admin Penilai

- Setiap pusingan TAFAKUT memerlukan tepat dua Admin penilai bebas.
- Kedua-duanya memberikan penilaian secara berasingan.
- Penilai tidak boleh melihat jawapan atau keputusan penilai lain sebelum kedua-duanya menghantar penilaian.
- Selepas kedua-dua penilaian dihantar, sistem boleh memaparkan maklumat yang dibenarkan mengikut peranan.

Keputusan:

Penilai 1| Penilai 2| Hasil
PASS| PASS| PASS
FAIL| FAIL| FAIL
PASS| FAIL| Perlu penilai ketiga
FAIL| PASS| Perlu penilai ketiga

10.2 Penilai Ketiga

- Jika dua penilai pertama tidak sependapat, seorang Admin ketiga dilantik.
- Penilai ketiga memberikan keputusan bebas.
- Sistem mengekalkan ketiga-tiga penilaian.
- Keputusan penilai ketiga menyelesaikan percanggahan pada pusingan tersebut.
- Keputusan akhir tetap tertakluk kepada kuasa Admin pengurusan Takaza yang berkenaan.
- Admin pengurusan boleh membuat keputusan akhir yang berbeza daripada keputusan majoriti dengan justifikasi yang direkodkan.

10.3 Pusingan TAFAKUT Tambahan

- Bilangan pusingan TAFAKUT tidak dihadkan.
- Setiap pusingan tambahan menggunakan dua penilai baharu yang belum pernah menilai Ahbab tersebut dalam proses berkenaan.
- Penilai tambahan dilantik oleh Admin dengan skop kuasa lebih tinggi atau lebih luas.
- Penilai yang tidak dapat menyelesaikan tugas boleh digantikan.
- Penggantian penilai tidak memerlukan proses dimulakan semula jika kerja yang telah diselesaikan masih sah.
- Penilaian yang telah dihantar kekal sebagai rekod.
- Penilaian terdahulu tidak boleh ditulis ganti.

10.4 Status TAFAKUT

Status berikut mesti dibezakan:

- "PASS"
- "FAIL"
- "SUSPEND"
- "ON_HOLD"

Maksud:

- "PASS": Penilaian memenuhi kriteria.
- "FAIL": Penilaian tidak memenuhi kriteria.
- "SUSPEND": Kelayakan penyertaan digantung.
- "ON_HOLD": Proses atau keputusan ditangguhkan.

"SUSPEND" dan "ON_HOLD" tidak mengubah:

- Status login.
- Status akaun.
- Profil Ahbab.
- Sejarah penyertaan.
- Rekod Jemaah.

Keputusan "FAIL" bukan larangan kekal. Tiada had percubaan atau tempoh menunggu wajib yang ditetapkan dalam baseline ini.

10.5 Borang TAFAKUT

Borang TAFAKUT mempunyai jenis dan pusingan.

Jenis borang yang telah dikenal pasti termasuk Type A, Type B dan Type C.

Admin pada skop lebih tinggi atau lebih luas mengurus:

- Jenis borang.
- Template.
- Kriteria.
- Soalan.
- Susunan soalan.
- Jenis input.
- Soalan tambahan.
- Konfigurasi borang.

Admin Takaza memilih jenis dan pusingan yang diluluskan tetapi tidak boleh mengubah template induk.

Setiap perubahan template menghasilkan versi baharu. Versi lama mesti dikekalkan dan dipautkan kepada rekod penilaian yang menggunakannya.

10.6 Sumber Data Borang

Borang boleh mengandungi:

1. Data automatik daripada profil, aktiviti atau sistem.
2. Data yang dimasukkan oleh Ahbab.
3. Data penilaian yang dimasukkan oleh penilai.

Ahbab boleh menyemak data automatik dan memohon pembetulan.

Ahbab tidak boleh mengubah terus sumber data asal yang belum disahkan.

Pembetulan mesti melalui pengesahan Admin dan mengekalkan sejarah.

Pengesah data tidak semestinya penilai TAFAKUT.

10.7 Pengisian dan Penghantaran Borang

Bagi borang yang diisi oleh Ahbab:

- Ahbab boleh menyimpan sebagai "DRAFT".
- Ahbab boleh menyambung pengisian kemudian.
- Ahbab boleh mengedit sebelum dihantar.
- Selepas dihantar, borang dikunci.
- Pembetulan selepas penghantaran dibuat melalui Admin.

Bagi borang penilai:

- Penilai bertanggungjawab menghantar penilaiannya.
- Penilaian yang telah dihantar tidak boleh diubah.
- Penilaian semula mesti menghasilkan rekod baharu.
- Admin boleh memulangkan borang kepada "DRAFT" dengan sebab yang direkodkan.
- Borang yang telah dibuka tetapi belum dihantar tidak boleh dibatalkan melalui operasi biasa pada baseline ini.

10.8 Maklumat Keputusan kepada Ahbab

- Ahbab dimaklumkan apabila borang dibuka untuk tindakan.
- Ahbab dimaklumkan apabila keputusan selesai.
- Ahbab boleh melihat komen dan keputusan akhir selepas proses selesai.
- Ahbab tidak mempunyai fungsi balasan atau maklum balas dalam rekod keputusan TAFAKUT pada baseline ini.

10.9 Notifikasi TAFAKUT

- Ahbab menerima notifikasi apabila borang dibuka.
- Ahbab menerima notifikasi apabila keputusan dibuat.
- Penilai menerima notifikasi apabila dilantik.
- Notifikasi menggunakan bahasa pilihan pengguna.
- Tiada peringatan automatik atau tarikh akhir mandatori pada baseline ini.

11. Penarikan Diri dan Penyingkiran Peserta

11.1 Ahbab Menarik Diri

- Ahbab boleh meminta untuk menarik diri daripada Takaza.
- Admin perlu mengesahkan dan merekodkan permintaan.
- Admin tidak boleh menghalang penarikan diri yang sah.
- Status menjadi "WITHDRAWN" selepas Admin mengesahkan rekod penarikan diri.
- Tarikh permintaan dan tarikh pengesahan mesti direkodkan.
- Sejarah penyertaan kekal.

11.2 Admin Menyingkirkan Peserta

- Admin yang mempunyai kuasa boleh menyingkirkan peserta.
- Justifikasi daripada sekurang-kurangnya seorang Admin lain diperlukan.
- Admin kedua memberikan justifikasi, bukan kuasa veto.
- Admin pengurusan Takaza membuat keputusan akhir.
- Sebab dan justifikasi mesti direkodkan.
- Ahbab mesti dimaklumkan tentang penyingkiran dan sebabnya.
- Status penyingkiran ialah "REMOVED".

11.3 Rayuan

- Ahbab boleh membuat rayuan terhadap penyingkiran.
- Rayuan diputuskan oleh Admin dengan skop lebih tinggi atau lebih luas.
- Rayuan tidak secara automatik mengubah status penyertaan.
- Jika rayuan diluluskan, keputusan penyingkiran boleh dibatalkan dan penyertaan dipulihkan tanpa memulakan proses penyertaan baharu.
- Rekod penyingkiran asal mesti kekal.
- Jika rayuan ditolak, Ahbab boleh memohon semula pada masa hadapan melalui proses penyertaan biasa dan TAFAKUT jika diperlukan.

11.4 Perbezaan Status

"WITHDRAWN" dan "REMOVED" ialah dua keadaan yang berbeza.

- "WITHDRAWN": Ahbab menarik diri.
- "REMOVED": Admin menyingkirkan Ahbab.

Kedua-duanya tidak memadam rekod penyertaan.

11.5 Penyertaan Semula

Jika Ahbab mahu menyertai semula Takaza yang sama atau Takaza lain:

- Rekod penyertaan baharu diwujudkan.
- Rekod lama dikekalkan.
- Rekod baharu dipautkan kepada sejarah terdahulu.
- Proses persetujuan dan TAFAKUT ditentukan oleh kaedah serta kriteria Takaza semasa.

12. Kapasiti Takaza

- Admin menentukan kapasiti peserta.
- Admin boleh mengubah kapasiti selepas Takaza berstatus "RELEASED" atau "ACTIVE".
- Semua perubahan direkodkan.
- Jika kapasiti diturunkan di bawah bilangan peserta sedia ada, peserta sedia ada kekal.
- Sistem tidak boleh menyingkirkan peserta secara automatik.
- Sistem memaparkan amaran kapasiti melebihi had.
- Had baharu digunakan untuk penyertaan akan datang.
- Tiada waiting list automatik pada baseline ini.
- Admin boleh mencadangkan Takaza alternatif.

Pemindahan peserta ke Takaza alternatif memerlukan:

- Persetujuan pihak yang berkaitan.
- TAFAKUT baharu bagi Takaza penerima jika diwajibkan.
- Keputusan Admin.
- Rekod penyertaan baharu.
- Rekod penyertaan asal dikekalkan.

13. Aktiviti Takaza

Aktiviti Takaza tidak dihadkan kepada tiga aktiviti tetap.

Admin menentukan aktiviti yang diperlukan mengikut Takaza.

Aktiviti boleh berlaku pada peringkat:

- Pra-permulaan.
- Hari permulaan.
- Sepanjang Takaza.
- Sebelum tarikh tamat.
- Hari tarikh tamat.

13.1 Sumber Aktiviti

Admin boleh:

- Memilih rekod Aktiviti Khidmat sedia ada.
- Mencipta aktiviti baharu untuk Takaza.

Jika aktiviti sedia ada dipilih, sistem menggunakan semula maklumat aktiviti asal yang berkaitan.

Aktiviti dan kehadiran dikaitkan dengan Takaza berkenaan.

13.2 Pengesahan Aktiviti

- Admin merekodkan pengesahan aktiviti.
- Amer merekodkan pengesahan yang berkaitan.
- Kehadiran dan catatan disimpan secara berasingan daripada status kitaran hidup Takaza.
- Ketidakhadiran seseorang tidak secara automatik membatalkan Takaza.
- Aktiviti boleh mempunyai rekod peserta, kehadiran dan catatan.

Template aktiviti boleh dikembangkan kemudian.

14. Aliran Pembentukan Takaza

Aliran operasi baseline:

1. Admin mencipta dan mengkonfigurasi Takaza.
2. Admin menentukan kaedah penyertaan dan kriteria.
3. KAWAIF disediakan atau dikemas kini.
4. Admin mengaitkan Takaza dengan Jemaah yang berkenaan.
5. Sistem mengenal pasti calon melalui kaedah penyertaan yang dikonfigurasi.
6. Admin mengesahkan peserta selepas proses berkaitan.
7. Admin melantik Amer selepas calon menjadi peserta yang disahkan.
8. Admin melantik Supervisor jika diperlukan.
9. Aktiviti pra-permulaan ditetapkan.
10. Amer Jemaah menyemak tarikh cadangan mula dan bersetuju atau mencadangkan tarikh baharu.
11. Admin mengesahkan dan mengunci tarikh rasmi.
12. Bayan Hidayat dijalankan pada tarikh mula.
13. Selepas Bayan Hidayat, sistem menjana Percha secara automatik.
14. Aktiviti Wapsi dan aktiviti tarikh tamat dijalankan.
15. Admin mengesahkan aktiviti tarikh tamat selesai.
16. Amer menyediakan dan menghantar laporan penuh Takaza.
17. Admin mengesahkan bahawa semua syarat penyelesaian dipenuhi.
18. Takaza ditukar kepada "COMPLETED".

Langkah tertentu boleh berlaku mengikut konfigurasi dan keadaan Takaza, tetapi syarat penyelesaian tidak boleh dilangkau.

15. Percha

Percha dijana secara automatik selepas Bayan Hidayat.

Maklumat Percha:

- Nombor Percha.
- Jemaah.
- Tempat atau lokasi pembentukan.
- Halqah.
- Laluan atau destinasi.
- Tarikh Bayan Hidayat.
- Kharguzari.
- Tarikh Bayan Wapsi.
- Aktiviti pada tarikh tamat Takaza.

15.1 Pindaan Percha

- Admin boleh mencadangkan pindaan.
- Pindaan memerlukan kelulusan Admin kedua yang berbeza daripada Admin yang membuat pindaan.
- Jika diluluskan, pindaan direkodkan sebagai versi baharu.
- Jika ditolak, rekod asal dikekalkan.
- Admin yang membuat pindaan boleh mengemukakan semula pindaan.
- Semua versi, keputusan dan sejarah mesti dikekalkan.
- Rekod asal tidak boleh ditulis ganti tanpa sejarah.

16. Kharguzari Individu

Kharguzari ialah laporan individu semasa aktiviti berkaitan.

- Ahbab hanya boleh melihat laporan sendiri.
- Admin yang mempunyai kuasa boleh melihat laporan dalam skop yang dibenarkan.
- Amer boleh mengakses laporan yang dibenarkan untuk menyediakan laporan penuh Takaza.

16.1 Rekod Kharguzari

- Laporan asal tidak boleh diubah selepas dihantar.
- Susulan atau komen dibuat secara berasingan.
- Penulis boleh mengedit komen sendiri.
- Laporan asal kekal sebagai rekod sejarah.
- Akses kepada laporan tertakluk kepada UAC dan skop Takaza.

17. Laporan Penuh Takaza oleh Amer

- Amer wajib menghantar laporan penuh Takaza.
- Laporan penuh diperlukan sebelum Takaza berstatus "COMPLETED".
- Laporan asal tidak boleh diubah selepas dihantar.
- Laporan boleh dilihat oleh Admin yang diberi kuasa dan pihak lain mengikut kebenaran yang ditetapkan.
- Amer, Admin dan peserta yang dibenarkan boleh memberikan komen.
- Penulis boleh mengedit komen sendiri.
- Komen disimpan berasingan daripada laporan asal.

17.1 Laporan Lewat

Jika aktiviti tarikh tamat selesai tetapi laporan Amer belum diterima:

- Status laporan menjadi "OVERDUE" apabila tarikh akhir yang ditetapkan telah berlalu.
- Takaza tidak boleh bertukar kepada "COMPLETED".
- Amer kekal bertanggungjawab menghantar laporan.
- Admin boleh melanjutkan tarikh akhir dengan sebab.
- Tarikh akhir asal dan setiap lanjutan mesti dikekalkan.
- Pelanjutan tarikh tidak secara automatik menyelesaikan laporan.
- Laporan kekal "OVERDUE" sehingga dihantar.

Takaza tidak boleh auto-complete hanya kerana tarikh tamat telah berlalu.

18. Penyelesaian Takaza

Takaza hanya boleh berstatus "COMPLETED" apabila:

1. Admin mengesahkan aktiviti tarikh tamat selesai.
2. Amer menghantar laporan penuh Takaza.
3. Semua syarat penyelesaian yang diwajibkan bagi Takaza berkenaan dipenuhi.

Admin mengesahkan aktiviti tarikh tamat dan sistem memaklumkan Amer.

Laporan penuh Amer wajib diterima sebelum penyelesaian.

Admin boleh menamatkan Takaza lebih awal dengan sebab yang direkodkan, tetapi tindakan itu tidak boleh mengabaikan syarat laporan dan rekod penyelesaian yang diwajibkan.

18.1 Pembatalan Takaza

Pembatalan Takaza secara automatik mewujudkan kes "REQUIRES_ATTENTION".

Kes tersebut perlu mengenal pasti:

- Takaza yang dibatalkan.
- Main/Sub Takaza yang berkaitan.
- Ahbab yang terjejas.
- Rekod penyertaan yang terlibat.
- Tindakan susulan yang diperlukan.

Pembatalan Takaza tidak secara automatik menukar semua penyertaan kepada "CANCELLED" atau "WITHDRAWN".

Admin perlu mengurus setiap peserta yang terjejas secara individu.

Aliran penuh Case Management masih belum dimuktamadkan dan kekal "ON HOLD".

19. Komen dan Perbincangan Takaza

- Amer, Admin dan peserta yang dibenarkan boleh memberikan komen pada laporan penuh Takaza.
- Penulis boleh mengedit komen sendiri.
- Komen dan sejarah perubahan perlu disimpan.
- Hak akses tertakluk kepada status penyertaan dan kebenaran pengguna.
- Komen tidak menggantikan laporan rasmi.
- Rekod laporan asal tidak boleh diubah melalui fungsi komen.

20. Arkib Takaza Tahunan

Arkib tahunan ialah rekod sejarah Takaza dan bukan mekanisme pemadaman.

20.1 Akses Arkib

Admin boleh melihat arkib mengikut skop kuasa masing-masing.

Ahbab hanya boleh melihat arkib Takaza yang pernah disertainya, termasuk apabila akaunnya tidak lagi aktif, tertakluk kepada polisi akses dan keselamatan.

Ahbab tidak boleh melihat rekod Takaza orang lain tanpa kebenaran.

20.2 Maklumat Arkib

Arkib perlu menyokong:

- Bilangan Main Takaza.
- Bilangan Sub Takaza.
- Bilangan peserta.
- Pecahan status penyertaan.
- Takaza mengikut tahun.
- Takaza mengikut status.
- Rekod sejarah.
- Laporan berkaitan.

Penapis asas:

- Negara.
- Tahun.
- Status.

Penapis Main Takaza sebagai pilihan tambahan masih perlu dimuktamadkan.

20.3 Pembentukan Arkib

- Arkib dijana secara automatik sebagai baseline.
- Admin boleh menambah maklumat yang dibenarkan.
- Penambahan maklumat tidak boleh mengubah rekod operasi asal secara senyap.
- Sebarang pembetulan mesti mempunyai sejarah dan audit.
- Polisi pembetulan arkib mengikut jenis data dan skop Admin masih belum dimuktamadkan.

Tiada keperluan eksport PDF atau Excel dalam baseline ini.

21. Admin Notes dan Annual Summary

Admin Notes dan Annual Summary ialah rekod berasingan daripada operasi harian Takaza.

Ringkasan boleh disediakan bagi:

- Keseluruhan negara.
- Setiap Main Takaza.
- Setiap Sub Takaza.

Ringkasan biasanya disediakan selepas Takaza selesai, tetapi ringkasan interim boleh dibuat ketika Takaza masih aktif.

Status ringkasan:

- "DRAFT"
- "INTERIM"
- "FINAL"

Status ringkasan tidak mengubah status Takaza.

Ringkasan mengandungi:

- Statistik.
- Catatan dan ulasan Admin.

Baseline kandungan ialah teks dan statistik; lampiran fail tidak termasuk dalam skop semasa.

22. Juhud Reports

Juhud Reports ialah modul penerbitan yang berasingan daripada:

- Laporan Takaza oleh Amer.
- Kharguzari individu.
- Arkib Takaza Tahunan.
- Annual Summary.

Jangan mencampurkan fungsi penerbitan Juhud Reports dengan rekod operasi Takaza.

23. Notifikasi

Sistem perlu memberi notifikasi bagi peristiwa penting, termasuk:

- Calon penyertaan dikenal pasti.
- Permohonan menyertai Takaza.
- Pencalonan Admin.
- Permintaan persetujuan Ahbab.
- Pengesahan peserta.
- Keputusan TAFAKUT.
- Keputusan permohonan.
- Pelantikan Amer.
- Penggantian Amer.
- Penamatan pelantikan Amer.
- Pelantikan Supervisor.
- Penarikan diri.
- Penyingkiran peserta.
- Keputusan rayuan.
- Perubahan kapasiti.
- Perubahan tarikh.
- Aktiviti Takaza.
- Penjanaan Percha.
- Pindaan Percha.
- Kharguzari.
- Laporan penuh Amer.
- Laporan lewat.
- Penyelesaian atau pembatalan Takaza.

Notifikasi perlu mengikut bahasa pilihan pengguna.

Tiada peringatan automatik atau tarikh akhir mandatori kecuali ditetapkan secara khusus dalam konfigurasi atau keputusan kemudian.

24. Audit dan Sejarah

Sistem perlu mengekalkan sejarah:

- Penciptaan Main/Sub Takaza.
- Perubahan status.
- Perubahan tarikh.
- Hubungan Main/Sub.
- Jemaah.
- Calon dan peserta.
- Kaedah penyertaan.
- Permohonan dan pencalonan.
- Persetujuan.
- Keputusan TAFAKUT.
- Versi borang TAFAKUT.
- Pelantikan Amer.
- Pelantikan Supervisor.
- Penarikan diri.
- Penyingkiran.
- Rayuan.
- Perubahan kapasiti.
- Aktiviti.
- Percha.
- Kharguzari.
- Laporan penuh.
- Lanjutan tarikh laporan.
- Pengesahan penyelesaian.
- Pembatalan dan kes susulan.
- Arkib tahunan.
- Annual Summary.

Rekod sejarah mesti menyimpan pelaku, masa, nilai lama dan baharu serta sebab jika diperlukan.

Rekod sejarah tidak boleh dipadam melalui operasi biasa.

25. Perkara Belum Dimuktamadkan

1. Skop kuasa dan kelayakan Supervisor.
2. Sama ada Supervisor wajib menjadi peserta.
3. Persetujuan dan TAFAKUT bagi "DIRECT_ASSIGNMENT".
4. Struktur kategori, kriteria dan skor KAWAIF.
5. Jenis, template dan kriteria borang TAFAKUT yang lengkap.
6. Polisi pembetulan Arkib Tahunan.
7. Perubahan selepas Takaza "COMPLETED".
8. Aliran penuh Case Management bagi "REQUIRES_ATTENTION".
9. Penapis Main Takaza dalam Arkib Tahunan.
10. Template aktiviti Takaza.
11. Perincian statistik dan paparan Arkib Tahunan.

Perkara terbuka mesti diselaraskan dengan "OPEN_DECISIONS_REGISTER.md".

26. Related Documents

- "MASTER_DECISION_REGISTER.md"
- "OPEN_DECISIONS_REGISTER.md"
- "MODULE_REQUIREMENTS.md"
- "IMPLEMENTATION_STATUS_AND_ROADMAP.md"
- "Auth.md"
- "JMV2001-Ahbab-Profile-Account-Management.md"
- "JMV2002-Organization-Structure-Governance.md"
- "JMV2003-Syukbah-Management.md"
- "UAC_MATRIX.md"
- "DASHBOARD_NAVIGATION_SPEC_V2.md"
- "V2_DESIGN_CHECKPOINT.md"
- "V2_IMPLEMENTATION_STATUS.md"

Jika terdapat percanggahan:

1. Keputusan terkini yang telah dipersetujui menjadi rujukan.
2. UAC Matrix menentukan authorization dan skop akses.
3. Dokumen organisasi menentukan struktur dan kuasa organisasi.
4. Dokumen ini menentukan pengurusan Takaza.
5. Perkara yang belum diputuskan mesti kekal "PENDING".

27. Nota Pembangunan

- Jangan bina cascade status, tarikh atau penamatan daripada Main Takaza kepada Sub Takaza.
- Jangan samakan Jemaah Membership dengan Takaza Participation.
- Jangan jadikan keahlian Jemaah sebagai penyertaan Takaza yang disahkan secara automatik.
- Jangan melantik Amer sebelum calon menjadi peserta yang disahkan.
- Jangan anggap TAFAKUT PASS sebagai kelulusan penyertaan automatik.
- Jangan anggap "DIRECT_ASSIGNMENT" mengetepikan persetujuan atau TAFAKUT.
- Jangan anggap Supervisor mempunyai kuasa yang belum diluluskan.
- Jangan auto-remove peserta apabila kapasiti dikurangkan.
- Jangan auto-complete Takaza apabila tarikh tamat berlalu.
- Jangan auto-cancel penyertaan apabila Takaza dibatalkan.
- Jangan memadam rekod penyertaan, penilaian atau laporan asal.
- Semua perubahan mesti mengekalkan sejarah dan audit.

---

Document Status: REQUIREMENTS BASELINE — FOR REVIEW
Version: 3.0
Last Updated: 27 November 2026

Tamat — Takaza Management
