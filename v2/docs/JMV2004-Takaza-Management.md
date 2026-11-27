
# JUHUDMANAGER V2 — TAKAZA MANAGEMENT

**Document ID:** JMV2-004  
**Version:** 1.2 — Consolidated Working Baseline  
**Status:** REQUIREMENTS BASELINE — FOR REVIEW  
**Last Updated:** 28 November 2026  
**Repository Path:** `v2/docs/JMV2004-Takaza-Management.md`

---

## 1. Tujuan

Dokumen ini menetapkan keperluan pengurusan Takaza dalam JuhudManager V2.

Istilah Takaza digunakan bagi konsep Project dan Takaza. Kedua-duanya merujuk kepada konsep yang sama dalam sistem ini.

Takaza mempunyai kitaran pengurusan, penyertaan, pentadbiran dan rekod tersendiri.

Dokumen ini meliputi:

- Struktur Main Takaza dan Sub Takaza.
- Hubungan Takaza dengan Jemaah.
- Penciptaan dan pengaktifan Takaza.
- Kaedah penyertaan.
- Pengurusan peserta.
- Pelantikan Amer.
- Pelantikan Supervisor.
- KAWAIF.
- TAFAKUT.
- Aktiviti dan kehadiran.
- Percha.
- Kharguzari.
- Laporan penuh Amer.
- Penyelesaian dan pembatalan Takaza.
- Arkib tahunan.
- Annual Summary.
- Juhud Reports.
- Notifikasi dan audit.

Dokumen ini mesti dibaca bersama:

- `MASTER_DECISION_REGISTER.md`
- `OPEN_DECISIONS_REGISTER.md`
- `MODULE_REQUIREMENTS.md`
- `UAC_MATRIX.md`
- `DASHBOARD_NAVIGATION_SPEC_V2.md`
- `JMV2001-Ahbab-Profile-Account-Management.md`
- `JMV2002-Organization-Structure-Governance.md`
- `JMV2003-Syukbah-Management.md`

Dokumentasi keperluan tidak bermaksud fungsi telah dilaksanakan.

## 2. Prinsip Asas Takaza

Prinsip utama:

1. Takaza ialah entiti operasi yang mempunyai identiti dan kitaran hidup tersendiri.
2. Hanya dua jenis Takaza dibenarkan: Main Takaza dan Sub Takaza.
3. Hubungan Main/Sub menentukan hierarki sahaja.
4. Main Takaza dan Sub Takaza mempunyai lifecycle masing-masing.
5. Jemaah Membership dan Takaza Participation ialah dua rekod berasingan.
6. Keahlian Jemaah tidak secara automatik menjadikan seseorang peserta Takaza yang disahkan.
7. Setiap Takaza mempunyai rekod peserta tersendiri.
8. Setiap Main Takaza dan Sub Takaza mempunyai pelantikan Amer masing-masing.
9. Keputusan TAFAKUT bukan secara automatik keputusan pelantikan atau penyertaan.
10. KAWAIF ialah rujukan kelayakan dan pengalaman, bukan keputusan TAFAKUT.
11. Penarikan diri dan penyingkiran ialah dua keadaan berbeza.
12. Sejarah penyertaan, penilaian, pelantikan dan laporan mesti dikekalkan.
13. Semua tindakan pentadbiran mesti mematuhi UAC dan skop kuasa.
14. Semua keputusan dan perubahan penting mesti mempunyai audit trail.
15. Perkara yang belum dimuktamadkan tidak boleh dianggap sebagai keperluan yang telah diluluskan.

Takaza tidak boleh dipadam secara fizikal sehingga kehilangan rekod sejarahnya.

## 3. Struktur Takaza

Takaza mempunyai dua jenis sahaja:

1. Main Takaza.
2. Sub Takaza.

### 3.1 Main Takaza

Main Takaza ialah Takaza utama yang boleh mempunyai satu atau lebih Sub Takaza.

Main Takaza:

- Dikaitkan dengan Jemaah.
- Mempunyai peserta dan rekod penyertaan sendiri.
- Mempunyai Amer sendiri.
- Mempunyai kitaran hidup sendiri.
- Boleh mempunyai Sub Takaza.
- Boleh diselesaikan atau dibatalkan secara berasingan daripada Sub Takaza.

### 3.2 Sub Takaza

Sub Takaza ialah Takaza yang berada di bawah satu Main Takaza.

Peraturan:

- Sub Takaza mesti mempunyai satu Main Takaza sebagai parent.
- Sub Takaza tidak boleh mempunyai anak atau Sub Takaza lain.
- Maksimum dua tahap hierarki sahaja.
- Main dan Sub Takaza mesti berada dalam negara yang sama buat masa ini.
- Sub Takaza boleh mempunyai Jemaah sendiri.
- Sub Takaza boleh mempunyai peserta, Amer dan pengurusan tersendiri.
- Sub Takaza mempunyai lifecycle sendiri.

Ahbab tidak semestinya menjadi peserta Main Takaza untuk dipertimbangkan bagi Sub Takaza.

### 3.3 Hubungan Parent dan Child

Hubungan Main/Sub menentukan hierarki sahaja.

Ia tidak bermaksud lifecycle kedua-duanya bergantung antara satu sama lain.

Oleh itu:

- Status Main Takaza tidak secara automatik mengubah status Sub Takaza.
- Status Sub Takaza tidak secara automatik mengubah status Main Takaza.
- Tarikh Main Takaza tidak secara automatik mengubah tarikh Sub Takaza.
- Tarikh Sub Takaza tidak secara automatik mengubah tarikh Main Takaza.
- Penamatan Main Takaza tidak secara automatik menamatkan Sub Takaza.
- Pembatalan Main Takaza tidak secara automatik membatalkan Sub Takaza.
- Penyelesaian Main Takaza tidak secara automatik menyelesaikan Sub Takaza.

Setiap perubahan mesti dibuat melalui proses yang sah bagi Takaza berkenaan.

## 4. Penciptaan dan Pengaktifan Takaza

Admin yang mempunyai kuasa boleh:

- Mencipta Main Takaza.
- Mencipta Sub Takaza.
- Mengubah konfigurasi Takaza dalam skop yang dibenarkan.
- Mengesahkan Takaza.
- Mengaktifkan Takaza.
- Menukar status Takaza mengikut kuasa dan proses yang sah.

Penciptaan, pengesahan dan pengaktifan tidak memerlukan kelulusan `SUPER_ADMIN` jika tindakan tersebut berada dalam kuasa Admin berkaitan.

Takaza boleh diaktifkan walaupun:

- Pelantikan Amer belum lengkap.
- Pelantikan Supervisor belum dibuat.
- Semua peserta belum disahkan.
- Sebahagian konfigurasi operasi belum lengkap.

Sistem mesti memaparkan maklumat setup yang belum lengkap.

Setup yang belum lengkap tidak semestinya menghalang pengaktifan, kecuali terdapat syarat khusus yang telah diluluskan.

Semua tindakan penciptaan, pengesahan, pengaktifan dan perubahan mesti direkodkan.

### 4.1 Status Takaza

Status Takaza:

- `DRAFT`
- `RELEASED`
- `ACTIVE`
- `ON_HOLD`
- `COMPLETED`
- `CANCELLED`

Maksud:

**DRAFT**

- Takaza sedang disediakan.
- Konfigurasi masih boleh dilengkapkan.
- Takaza belum dilepaskan untuk operasi biasa.

**RELEASED**

- Takaza telah dilepaskan untuk proses penyertaan atau persediaan.
- Permohonan dan pencalonan boleh diproses mengikut konfigurasi.

**ACTIVE**

- Takaza sedang berjalan.
- Operasi dan aktiviti Takaza boleh dilaksanakan.

**ON_HOLD**

- Operasi atau keputusan tertentu ditangguhkan.
- Takaza belum dianggap selesai atau dibatalkan.
- Sebab dan skop penangguhan mesti direkodkan.

**COMPLETED**

- Semua syarat penyelesaian yang diwajibkan telah dipenuhi.
- Laporan penuh Amer telah diterima.
- Penyelesaian telah disahkan mengikut proses yang diluluskan.

**CANCELLED**

- Takaza dibatalkan melalui tindakan Admin yang mempunyai kuasa.
- Sebab pembatalan mesti direkodkan.
- Kesan kepada setiap peserta diurus secara berasingan.

### 4.2 Perubahan Status

Setiap perubahan status mesti merekodkan:

- Status asal.
- Status baharu.
- Pelaku.
- Tarikh dan masa.
- Sebab atau justifikasi jika diperlukan.
- Kelulusan berkaitan jika diperlukan.

Sistem tidak boleh membuat cascade status antara Main Takaza dan Sub Takaza.

Sistem tidak boleh menukar Takaza kepada `COMPLETED` hanya kerana tarikh tamat telah berlalu.

## 5. Tarikh Takaza

Admin menetapkan:

- Tarikh cadangan mula.
- Tarikh cadangan tamat.
- Tarikh rasmi mula selepas pengesahan.
- Tarikh rasmi tamat.

### 5.1 Tarikh Cadangan Mula

- Admin menetapkan tarikh cadangan mula.
- Tarikh cadangan belum menjadi tarikh rasmi yang dikunci.
- Amer Jemaah menyemak tarikh cadangan.
- Amer boleh bersetuju dengan tarikh cadangan.
- Amer boleh mencadangkan tarikh baharu.
- Selepas persetujuan Amer, Admin mengesahkan dan mengunci tarikh rasmi.

Tarikh rasmi hanya dikunci selepas proses persetujuan dan pengesahan yang ditetapkan selesai.

### 5.2 Pindaan Tarikh

Selepas tarikh dikunci:

- Amer tidak boleh mengubah tarikh melalui proses biasa.
- Pindaan memerlukan tindakan Admin yang mempunyai kuasa.
- Sebab pindaan mesti direkodkan.
- Tarikh asal mesti dikekalkan.
- Tarikh baharu mesti direkodkan sebagai perubahan.
- Pihak berkaitan perlu dimaklumkan.

### 5.3 Tarikh Tamat

- Admin boleh menetapkan tarikh tamat.
- Admin boleh meminda tarikh tamat dengan sebab dan rekod sejarah.
- Admin boleh menamatkan Takaza lebih awal melalui tindakan yang dibenarkan.
- Pindaan tarikh tamat tidak secara automatik mengubah tempoh pelantikan Amer atau Supervisor.
- Perubahan tempoh pelantikan mesti diproses sebagai perubahan pelantikan berasingan.

## 6. Hubungan Takaza dengan Jemaah

Jemaah Membership dan Takaza Participation ialah dua rekod yang berasingan.

Keahlian Jemaah tidak boleh dianggap sebagai rekod penyertaan Takaza yang telah disahkan.

Peraturan:

- Main Takaza dikaitkan dengan Jemaah.
- Ahbab yang menjadi ahli Jemaah boleh dikenal pasti sebagai calon penyertaan Main Takaza.
- Calon penyertaan perlu melalui proses yang dikonfigurasi.
- Admin mengesahkan penyertaan sebelum status peserta diberikan.
- Keahlian Jemaah tidak secara automatik menjadikan seseorang peserta Sub Takaza.
- Ahbab daripada Jemaah lain boleh dipertimbangkan untuk Sub Takaza melalui kaedah penyertaan yang dibenarkan.
- Setiap penyertaan Takaza mempunyai rekod tersendiri.
- Seseorang boleh mempunyai rekod penyertaan berasingan bagi beberapa Takaza.

Tiada entiti V2 berasingan bernama `Project Member` diperlukan.

Rekod Takaza Participation digunakan untuk tujuan tersebut.

## 7. Kaedah Penyertaan Takaza

Sistem mesti menyokong kaedah penyertaan yang boleh dikonfigurasi dan dikembangkan.

Kaedah yang dikenal pasti:

1. `AUTOMATIC_INCLUSION`
2. `VOLUNTARY_APPLICATION`
3. `ADMIN_NOMINATION`
4. `DIRECT_ASSIGNMENT`

Kaedah boleh digunakan secara berasingan atau digabungkan mengikut konfigurasi Takaza.

Admin boleh menetapkan syarat bagi setiap kaedah tertakluk kepada keputusan yang telah diluluskan.

### 7.1 AUTOMATIC_INCLUSION

- Sistem mengenal pasti Ahbab yang memenuhi kriteria.
- Sistem mewujudkan rekod calon dengan status `PENDING_ADMIN_CONFIRMATION`.
- Admin perlu mengesahkan calon sebelum status peserta diberikan.
- Ahbab yang sudah menjadi ahli Jemaah ketika Main Takaza dibentuk juga perlu melalui pengesahan Admin.
- Ahbab yang menyertai Jemaah selepas Takaza berstatus `ACTIVE` boleh dikenal pasti sebagai calon tambahan.
- Keahlian Jemaah tidak secara automatik menjadikan Ahbab peserta Takaza.

### 7.2 VOLUNTARY_APPLICATION

- Ahbab boleh memohon untuk menyertai Takaza.
- Permohonan adalah bebas antara satu Takaza dengan Takaza lain.
- Ahbab perlu memberikan persetujuan.
- Admin menilai permohonan.
- TAFAKUT dijalankan jika diwajibkan oleh kriteria Takaza.
- Keputusan akhir dibuat oleh Admin yang mempunyai kuasa.
- Permohonan dan keputusan mesti direkodkan.

### 7.3 ADMIN_NOMINATION

- Admin boleh mencalonkan Ahbab untuk menyertai Takaza.
- Ahbab mesti memberikan persetujuan.
- Admin menilai pencalonan.
- TAFAKUT dijalankan jika diwajibkan oleh kriteria.
- Keputusan akhir dibuat oleh Admin yang mempunyai kuasa.
- Pencalonan, persetujuan dan keputusan mesti direkodkan.

### 7.4 DIRECT_ASSIGNMENT

`DIRECT_ASSIGNMENT` ialah kaedah penyertaan yang disokong sebagai pilihan konfigurasi.

Perkara berikut masih belum dimuktamadkan:

- Sama ada persetujuan Ahbab wajib.
- Sama ada TAFAKUT wajib.
- Syarat kelayakan khusus.
- Sama ada Admin boleh membuat penugasan tanpa permohonan berasingan.
- Keperluan notifikasi atau pengakuan penerimaan.
- Pengendalian penolakan atau tiada respons.
- Perbezaan syarat bagi Main dan Sub Takaza.

**Status: OPEN DECISION**

Rujukan: `OPEN_DECISIONS_REGISTER.md`, ODR-005.

Jangan menganggap `DIRECT_ASSIGNMENT` secara automatik mengetepikan persetujuan, TAFAKUT atau syarat kelayakan.

### 7.5 Perubahan Konfigurasi Penyertaan

Jika konfigurasi kaedah penyertaan diubah selepas Takaza berstatus `RELEASED` atau `ACTIVE`:

- Perubahan digunakan kepada penyertaan baharu.
- Perubahan boleh digunakan kepada permohonan yang belum diputuskan.
- Perubahan tidak secara automatik mengubah rekod peserta sedia ada.
- Sejarah konfigurasi lama mesti dikekalkan.
- Perubahan mesti mempunyai audit trail.

## 8. Pengurusan Peserta

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
- Rekod TAFAKUT berkaitan jika diperlukan.

### 8.1 Status Penyertaan

Sistem perlu membezakan status proses dan status penyertaan.

Status yang dikenal pasti:

- `PENDING_ADMIN_CONFIRMATION`
- `PENDING_CONSENT`
- `PENDING_TAFAKUT`
- `ACTIVE`
- `WITHDRAWAL_REQUESTED`
- `WITHDRAWN`
- `REMOVED`

Status TAFAKUT seperti `SUSPEND` dan `ON_HOLD` tidak boleh disamakan dengan status akaun pengguna atau status keahlian Jemaah.

Status penyertaan juga tidak boleh disamakan dengan lifecycle Takaza.

### 8.2 Penyertaan Main Takaza

- Ahli Jemaah Main Takaza boleh dikenal pasti sebagai calon penyertaan.
- Sistem menyediakan rekod calon melalui kaedah yang dikonfigurasi.
- Admin mengesahkan penyertaan.
- Hanya selepas pengesahan, rekod menjadi penyertaan peserta yang disahkan.
- Ahbab yang menyertai Jemaah kemudian boleh dikenal pasti sebagai calon mengikut konfigurasi dan keputusan Admin.

### 8.3 Penyertaan Sub Takaza

Sub Takaza boleh menggunakan mana-mana kaedah penyertaan yang dibenarkan.

- Ahbab tidak semestinya peserta Main Takaza untuk dipertimbangkan bagi Sub Takaza.
- Permohonan atau pencalonan diproses secara berasingan.
- Persetujuan Ahbab diperlukan bagi `VOLUNTARY_APPLICATION` dan `ADMIN_NOMINATION`.
- TAFAKUT dilaksanakan jika diwajibkan oleh kriteria.
- Admin membuat keputusan akhir.

### 8.4 Kapasiti Peserta

- Admin menentukan kapasiti peserta.
- Admin boleh mengubah kapasiti selepas Takaza berstatus `RELEASED` atau `ACTIVE`.
- Semua perubahan direkodkan.
- Jika kapasiti diturunkan di bawah bilangan peserta sedia ada, peserta sedia ada kekal.
- Sistem tidak boleh menyingkirkan peserta secara automatik.
- Sistem memaparkan amaran kapasiti melebihi had.
- Had baharu digunakan untuk penyertaan akan datang.
- Tiada waiting list automatik dalam baseline ini.
- Admin boleh mencadangkan Takaza alternatif.

Pemindahan peserta ke Takaza alternatif memerlukan:

- Persetujuan pihak yang berkaitan.
- TAFAKUT baharu bagi Takaza penerima jika diwajibkan.
- Keputusan Admin.
- Rekod penyertaan baharu.
- Rekod penyertaan asal dikekalkan.

## 9. Pelantikan Amer

Setiap Main Takaza dan setiap Sub Takaza mempunyai Amer sendiri.

Setiap Takaza hanya mempunyai satu pelantikan Amer aktif pada satu-satu masa.

### 9.1 Syarat Amer

- Amer mesti menjadi peserta yang telah disahkan dalam Takaza yang berkenaan.
- Jika calon belum menjadi peserta, proses penyertaan biasa mesti diselesaikan terlebih dahulu.
- Admin dan calon mesti bersetuju dengan pelantikan.
- Pelantikan boleh dibuat sebelum tarikh rasmi mula Takaza.
- Tidak perlu menunggu Takaza berstatus `ACTIVE` untuk melantik Amer.
- Pelantikan Amer tidak boleh berkuat kuasa sebelum syarat peserta disahkan dipenuhi.

Calon yang belum menjadi peserta tidak boleh dilantik sebagai Amer aktif.

### 9.2 TAFAKUT bagi Amer

- Tiada TAFAKUT berasingan diperlukan jika calon mempunyai keputusan TAFAKUT terdahulu yang sah untuk tujuan berkenaan.
- Kesesuaian sebagai Amer boleh dimasukkan dalam pusingan TAFAKUT seterusnya jika diperlukan.
- Keputusan TAFAKUT terdahulu tidak secara automatik melantik calon sebagai Amer.
- Pelantikan tetap memerlukan keputusan Admin dan persetujuan calon.

### 9.3 Tempoh Pelantikan

Rekod pelantikan Amer mengandungi:

- Amer.
- Takaza.
- Tarikh mula.
- Tarikh tamat.
- Pihak yang melantik.
- Persetujuan.
- Sebab pelantikan.
- Status pelantikan.
- Sejarah perubahan.

Tempoh pelantikan biasanya mengikut tempoh Takaza.

Admin boleh:

- Memendekkan tempoh.
- Melanjutkan tempoh.
- Menamatkan pelantikan lebih awal.
- Menggantikan Amer.

Semua tindakan mesti direkodkan.

Perubahan pelantikan Amer tidak secara automatik mengubah tarikh atau status Takaza.

### 9.4 Penggantian Amer

Admin boleh menggantikan Amer sebelum tempoh pelantikan tamat.

Syarat:

- Sebab penggantian mesti direkodkan.
- Justifikasi daripada sekurang-kurangnya seorang Admin lain diperlukan.
- Admin kedua memberikan justifikasi, bukan kuasa veto.
- Admin yang mengurus Takaza membuat keputusan akhir.
- Sejarah pelantikan terdahulu tidak dipadam.
- Amer terdahulu boleh kekal sebagai peserta jika penyertaannya masih sah.

Rekod penggantian mesti membezakan:

- Pelantikan terdahulu.
- Justifikasi Admin kedua.
- Keputusan Managing Admin.
- Pelantikan baharu.

### 9.5 Penamatan Pelantikan Amer

Penamatan boleh dibuat oleh Admin mengikut kuasa yang sah atau melalui permintaan Amer untuk melepaskan jawatan.

Penamatan jawatan Amer tidak secara automatik menamatkan penyertaan individu tersebut dalam Takaza.

Jika tempoh Amer tamat ketika Takaza masih `ACTIVE`:

- Pelantikan Amer tamat.
- Sistem memaklumkan Admin.
- Takaza kekal dalam status semasa.
- Admin menentukan tindakan pelantikan seterusnya.

Sistem tidak boleh secara automatik membatalkan atau menyelesaikan Takaza hanya kerana pelantikan Amer tamat.

## 10. Pelantikan Supervisor

Supervisor ialah pelantikan berasingan daripada Amer dan peserta.

### 10.1 Pelantikan

Baseline sementara:

- Supervisor dilantik oleh Admin.
- Pelantikan memerlukan persetujuan Admin dan individu yang dipilih.
- Takaza boleh diaktifkan walaupun Supervisor belum dilantik.
- Status pelantikan, tempoh dan sejarah mesti direkodkan.
- Tempoh pelantikan sementara mengikuti prinsip tempoh Amer.
- Admin boleh memendekkan, melanjutkan atau menamatkan pelantikan lebih awal.
- Semua perubahan mesti direkodkan.
- Pelantikan Supervisor tidak mengubah tarikh atau status Takaza.

### 10.2 Kelayakan dan Kuasa

Perkara berikut belum dimuktamadkan:

- Sama ada Supervisor wajib menjadi peserta Takaza.
- Skop tugas dan tanggungjawab.
- Kuasa membuat keputusan.
- Hubungan Supervisor dengan Amer dan Admin.
- Sama ada Supervisor boleh meluluskan atau menolak keputusan operasi.
- Sama ada Supervisor boleh mengakses rekod peserta atau laporan.
- Sama ada Supervisor boleh bertindak bagi pihak Amer atau Admin.
- Keperluan TAFAKUT khusus.
- Kelayakan tambahan.

Keputusan TAFAKUT sedia ada boleh dipertimbangkan.

Kesesuaian Supervisor boleh dimasukkan dalam pusingan TAFAKUT seterusnya jika diperlukan.

**Status: PROVISIONAL / OPEN DECISION**

Rujukan: `OPEN_DECISIONS_REGISTER.md`, ODR-004.

Jangan memberikan Supervisor kuasa khas yang belum diluluskan.

### 10.3 Perubahan Pelantikan

- Pelantikan Supervisor tidak mengubah status atau tarikh Takaza.
- Semua perubahan tempoh atau penamatan direkodkan.
- Penggantian Supervisor tidak memadam sejarah pelantikan terdahulu.
- Kuasa Supervisor tidak boleh diperluas melalui andaian atau gelaran jawatan sahaja.

## 11. KAWAIF

KAWAIF ialah rekod kelayakan, kemahiran dan pengalaman Ahbab dalam profil.

KAWAIF berasingan daripada borang dan proses temu duga TAFAKUT.

### 11.1 Pengurusan KAWAIF

- Ahbab boleh mengemukakan KAWAIF sendiri.
- Ahbab boleh mengemas kini rekod yang belum disahkan.
- Rekod yang dikemukakan menunggu pengesahan Admin.
- Admin boleh menambah atau mengemas kini KAWAIF jika rekod tiada atau sudah lapuk.
- Admin perlu merekodkan sumber atau asas perubahan.
- Rekod lama dan baharu mesti dikekalkan.
- Sistem merekodkan pelaku dan masa.
- Maklumat yang belum disahkan mesti dibezakan daripada maklumat yang telah disahkan.

### 11.2 Kuasa Pentadbiran

Admin pada skop lebih tinggi atau lebih luas mengurus:

- Kategori KAWAIF.
- Kriteria.
- Skor jika digunakan.
- Kelayakan.
- Struktur rujukan.

Admin Takaza menggunakan KAWAIF sebagai rujukan pemilihan, bukan sebagai keputusan TAFAKUT.

### 11.3 Prinsip KAWAIF

- KAWAIF ialah rujukan kelayakan dan pengalaman.
- KAWAIF bukan keputusan automatik penyertaan.
- KAWAIF tidak menggantikan TAFAKUT.
- Pengesahan KAWAIF boleh dibuat oleh Admin yang berbeza daripada penilai TAFAKUT.
- KAWAIF yang belum disahkan tidak boleh dianggap sebagai fakta yang telah disahkan.
- Perubahan KAWAIF mesti mengekalkan sejarah.

Struktur kategori, kriteria dan skor KAWAIF masih memerlukan perincian lanjut.

## 12. Proses TAFAKUT

TAFAKUT dijalankan bagi setiap proses kelayakan Takaza yang memerlukannya.

TAFAKUT ialah proses penilaian dan bukan secara automatik keputusan pelantikan atau penyertaan.

### 12.1 Dua Admin Penilai

Setiap pusingan TAFAKUT memerlukan tepat dua Admin penilai bebas.

- Kedua-duanya memberikan penilaian secara berasingan.
- Penilai tidak boleh melihat jawapan atau keputusan penilai lain sebelum kedua-duanya menghantar penilaian.
- Penilaian setiap penilai mesti disimpan secara berasingan.
- Penilaian yang telah dihantar tidak boleh diubah.
- Sistem hanya memaparkan maklumat mengikut kebenaran peranan selepas kedua-dua penilaian dihantar.

Keputusan awal:

| Penilai 1 | Penilai 2 | Hasil |
|---|---|---|
| PASS | PASS | PASS |
| FAIL | FAIL | FAIL |
| PASS | FAIL | Penilai ketiga diperlukan |
| FAIL | PASS | Penilai ketiga diperlukan |

### 12.2 Penilai Ketiga bagi Percanggahan

Jika dua penilai pertama tidak sependapat:

- Seorang Admin ketiga dilantik.
- Penilai ketiga memberikan penilaian bebas.
- Ketiga-tiga penilaian dikekalkan.
- Keputusan penilai ketiga menyelesaikan percanggahan bagi pusingan tersebut.
- Identiti penilai ketiga dan penilaiannya direkodkan.
- Penilaian asal tidak boleh ditulis ganti.

Keputusan akhir tetap tertakluk kepada kuasa Managing Admin yang mengurus Takaza.

Proses penilai ketiga bagi percanggahan tidak boleh disamakan dengan pusingan TAFAKUT tambahan.

### 12.3 Pusingan TAFAKUT Tambahan

- Bilangan pusingan TAFAKUT tidak dihadkan.
- Setiap pusingan tambahan menggunakan dua penilai baharu.
- Kedua-dua penilai baharu tidak boleh pernah menilai calon tersebut dalam proses berkenaan.
- Penilai tambahan dilantik oleh Admin dengan skop kuasa lebih tinggi atau lebih luas.
- Semua penilaian terdahulu kekal sebagai rekod.
- Pusingan tambahan menghasilkan rekod penilaian baharu.
- Keputusan pusingan terdahulu tidak boleh dipadam atau ditulis ganti.

Dua penilai baharu bagi pusingan tambahan ialah keperluan berasingan daripada penilai ketiga yang dilantik untuk menyelesaikan percanggahan dalam satu pusingan.

### 12.4 Penggantian Penilai

Jika penilai tidak dapat menyelesaikan tugas:

- Penilai boleh digantikan oleh Admin yang mempunyai kuasa.
- Kerja yang telah diselesaikan dan masih sah dikekalkan.
- Proses tidak perlu dimulakan semula sepenuhnya.
- Penggantian dan sebabnya direkodkan.
- Rekod penilai asal tidak boleh dipadam.
- Penilaian yang telah dihantar kekal tidak berubah.

### 12.5 Integriti Penilaian

Sistem mesti mengekalkan:

- Identiti penilai.
- Pusingan penilaian.
- Tarikh dan masa penghantaran.
- Keputusan.
- Komen dan justifikasi.
- Rekod penggantian.
- Rekod penilai ketiga.
- Rekod penilaian semula.
- Keputusan akhir Managing Admin.

Penilaian yang telah dihantar adalah immutable.

Penilaian semula mesti menghasilkan rekod baharu.

### 12.6 Keputusan Akhir Managing Admin

Managing Admin boleh membuat keputusan akhir yang berbeza daripada keputusan majoriti penilai.

Ini ialah lapisan keputusan berasingan daripada proses penilaian.

Syarat:

- Managing Admin mesti mempunyai kuasa dalam skop Takaza berkenaan.
- Keputusan akhir mesti direkodkan secara jelas.
- Justifikasi wajib diberikan jika keputusan berbeza daripada keputusan majoriti penilai.
- Identiti Managing Admin mesti direkodkan.
- Tarikh dan masa keputusan mesti direkodkan.
- Keputusan akhir mesti dipautkan kepada pusingan dan rekod penilaian berkaitan.
- Keputusan penilai asal kekal immutable.
- Keputusan Managing Admin tidak boleh ditulis seolah-olah ia keputusan sebulat suara atau majoriti penilai.
- Sebarang perubahan keputusan kemudian mesti menghasilkan rekod sejarah baharu.

Sistem mesti membezakan:

1. Penilaian individu.
2. Hasil penilaian bagi pusingan.
3. Keputusan akhir Managing Admin.

### 12.7 Status TAFAKUT

Status yang digunakan:

- `PASS`
- `FAIL`
- `SUSPEND`
- `ON_HOLD`

Maksud:

**PASS**

- Penilaian memenuhi kriteria yang ditetapkan.

**FAIL**

- Penilaian tidak memenuhi kriteria yang ditetapkan.

**SUSPEND**

- Kelayakan penyertaan digantung.

**ON_HOLD**

- Proses atau keputusan ditangguhkan.

`SUSPEND` dan `ON_HOLD` tidak mengubah:

- Status login.
- Status akaun.
- Profil Ahbab.
- Sejarah penyertaan.
- Rekod Jemaah.

Keputusan `FAIL` bukan larangan kekal.

Tiada had percubaan atau tempoh menunggu wajib ditetapkan dalam baseline ini.

### 12.8 Borang TAFAKUT

Borang TAFAKUT mempunyai jenis, template dan pusingan.

Jenis borang yang telah dikenal pasti termasuk Type A, Type B dan Type C.

Admin pada skop lebih tinggi atau lebih luas mengurus:

- Jenis borang.
- Template.
- Versi template.
- Kriteria.
- Soalan.
- Susunan soalan.
- Jenis input.
- Soalan tambahan.
- Konfigurasi borang.

Admin Takaza memilih jenis dan pusingan yang diluluskan tetapi tidak boleh mengubah template induk.

Setiap perubahan template menghasilkan versi baharu.

Versi lama mesti dikekalkan dan dipautkan kepada rekod penilaian yang menggunakannya.

### 12.9 Sumber Data Borang

Borang boleh mengandungi:

1. Data automatik daripada profil, aktiviti atau sistem.
2. Data yang dimasukkan oleh Ahbab.
3. Data penilaian yang dimasukkan oleh penilai.

Ahbab boleh menyemak data automatik dan memohon pembetulan.

Ahbab tidak boleh mengubah terus sumber data asal yang belum disahkan.

Pembetulan mesti melalui pengesahan Admin dan mengekalkan sejarah.

Pengesah data tidak semestinya penilai TAFAKUT.

### 12.10 Pengisian dan Penghantaran Borang Ahbab

- Ahbab boleh menyimpan borang sebagai `DRAFT`.
- Ahbab boleh menyambung pengisian kemudian.
- Ahbab boleh mengedit sebelum dihantar.
- Selepas dihantar, borang dikunci.
- Pembetulan selepas penghantaran dibuat melalui Admin.
- Versi asal dan pembetulan mesti dikekalkan.

### 12.11 Pengisian dan Penghantaran Borang Penilai

- Penilai bertanggungjawab menghantar penilaiannya.
- Penilaian yang telah dihantar tidak boleh diubah.
- Penilaian semula mesti menghasilkan rekod baharu.
- Admin boleh memulangkan borang yang telah dibuka tetapi belum dihantar kepada `DRAFT` dengan sebab yang direkodkan.
- Penilaian yang telah dihantar tidak boleh dikembalikan kepada `DRAFT` untuk mengubah keputusan asal.
- Borang yang telah dibuka tetapi belum dihantar tidak boleh dibatalkan melalui operasi biasa pada baseline ini.

### 12.12 Maklumat Keputusan kepada Ahbab

- Ahbab dimaklumkan apabila borang dibuka untuk tindakan.
- Ahbab dimaklumkan apabila keputusan selesai.
- Ahbab boleh melihat komen dan keputusan akhir selepas proses selesai.
- Ahbab tidak mempunyai fungsi balasan atau maklum balas dalam rekod keputusan TAFAKUT pada baseline ini.

### 12.13 Notifikasi TAFAKUT

- Ahbab menerima notifikasi apabila borang dibuka.
- Ahbab menerima notifikasi apabila keputusan dibuat.
- Penilai menerima notifikasi apabila dilantik.
- Notifikasi menggunakan bahasa pilihan pengguna.
- Tiada peringatan automatik atau tarikh akhir mandatori pada baseline ini.

## 13. Penarikan Diri Peserta

Penarikan diri ialah hak Ahbab.

### 13.1 Permintaan Penarikan Diri

- Ahbab boleh meminta untuk menarik diri daripada Takaza.
- Permintaan mesti direkodkan.
- Admin perlu mengesahkan dan merekodkan permintaan.
- Admin mesti mengakui dan memproses permintaan yang sah.
- Admin tidak boleh menghalang, memveto atau sewenang-wenangnya menolak penarikan diri yang sah.
- Status menjadi `WITHDRAWN` selepas Admin mengesahkan rekod penarikan diri.
- Pengesahan Admin ialah langkah pentadbiran untuk merekodkan penarikan diri, bukan kuasa budi bicara untuk menafikan hak Ahbab.

### 13.2 Rekod Penarikan Diri

Sistem mesti merekodkan:

- Ahbab yang meminta penarikan diri.
- Takaza berkaitan.
- Rekod penyertaan.
- Tarikh dan masa permintaan.
- Tarikh dan masa pengesahan Admin.
- Admin yang mengesahkan.
- Catatan pentadbiran jika berkenaan.

Permintaan asal mesti dikekalkan.

Permintaan yang belum disahkan tidak boleh dipaparkan seolah-olah status `WITHDRAWN` telah selesai.

### 13.3 Kesan Penarikan Diri

- Rekod penyertaan tidak dipadam.
- Sejarah penyertaan kekal.
- Penarikan diri tidak mengubah status akaun Ahbab.
- Penarikan diri tidak secara automatik mengubah keahlian Jemaah.
- Penarikan diri tidak mengubah rekod penyertaan dalam Takaza lain.

## 14. Penyingkiran Peserta

Admin yang mempunyai kuasa boleh menyingkirkan peserta mengikut peraturan yang diluluskan.

### 14.1 Syarat Penyingkiran

- Justifikasi daripada sekurang-kurangnya seorang Admin lain diperlukan.
- Admin kedua memberikan justifikasi, bukan kuasa veto.
- Admin pengurusan Takaza membuat keputusan akhir.
- Sebab penyingkiran mesti direkodkan.
- Justifikasi Admin kedua mesti dikekalkan secara berasingan.
- Ahbab mesti dimaklumkan tentang penyingkiran dan sebabnya.
- Status penyingkiran ialah `REMOVED`.

### 14.2 Rekod Penyingkiran

Sistem mesti merekodkan:

- Ahbab yang disingkirkan.
- Takaza berkaitan.
- Rekod penyertaan.
- Sebab penyingkiran.
- Justifikasi Admin kedua.
- Managing Admin yang membuat keputusan.
- Tarikh dan masa keputusan.
- Notifikasi kepada Ahbab.
- Sejarah perubahan status.

Rekod penyertaan asal tidak boleh dipadam.

### 14.3 Perbezaan Withdrawal dan Removal

`WITHDRAWN` dan `REMOVED` ialah dua keadaan berbeza.

- `WITHDRAWN`: Ahbab meminta untuk menarik diri.
- `REMOVED`: Admin membuat keputusan menyingkirkan Ahbab.

Kedua-duanya tidak boleh dianggap sama atau ditukar antara satu sama lain tanpa proses dan rekod yang sah.

## 15. Rayuan dan Penyertaan Semula

### 15.1 Rayuan

Ahbab boleh membuat rayuan terhadap keputusan penyingkiran.

Peraturan:

- Rayuan diputuskan oleh Admin dengan skop lebih tinggi atau lebih luas.
- Admin yang membuat keputusan asal tidak boleh menjadi satu-satunya pihak yang menyemak rayuan terhadap keputusannya sendiri.
- Rayuan tidak secara automatik mengubah status penyertaan.
- Jika rayuan diluluskan, keputusan penyingkiran boleh dibatalkan.
- Penyertaan boleh dipulihkan tanpa memulakan proses penyertaan baharu, tertakluk kepada keputusan rayuan.
- Rekod penyingkiran asal mesti kekal.
- Jika rayuan ditolak, Ahbab boleh memohon semula pada masa hadapan melalui proses penyertaan biasa dan TAFAKUT jika diperlukan.

### 15.2 Rekod Rayuan

Rekod rayuan mesti mengandungi:

- Keputusan penyingkiran asal.
- Permohonan rayuan.
- Tarikh rayuan.
- Admin penyemak.
- Tarikh keputusan.
- Keputusan rayuan.
- Justifikasi.
- Perubahan status penyertaan jika ada.

### 15.3 Penyertaan Semula

Jika Ahbab mahu menyertai semula Takaza yang sama atau Takaza lain:

- Rekod penyertaan baharu diwujudkan.
- Rekod lama dikekalkan.
- Rekod baharu dipautkan kepada sejarah terdahulu.
- Proses persetujuan dan TAFAKUT ditentukan oleh kaedah serta kriteria Takaza semasa.
- Penyertaan baharu tidak boleh menulis ganti rekod lama.

`WITHDRAWN` dan `REMOVED` tidak boleh menyebabkan sejarah penyertaan dipadam.

Perincian edge case penyertaan semula kekal tertakluk kepada ODR-010.

## 16. Pemindahan Peserta

Pemindahan peserta ke Takaza lain bukan perubahan biasa pada rekod penyertaan asal.

Pemindahan memerlukan:

1. Persetujuan pihak yang berkaitan.
2. TAFAKUT baharu bagi Takaza penerima jika diwajibkan.
3. Keputusan Admin.
4. Rekod penyertaan baharu.
5. Rekod penyertaan asal dikekalkan.

Peraturan:

- Takaza penerima menggunakan syarat kelayakan sendiri.
- Rekod asal tidak boleh dipindahkan sehingga kehilangan sejarah.
- Rekod baharu mesti mempunyai pautan kepada rekod terdahulu jika berkaitan.
- Pemindahan tidak boleh dilakukan secara senyap.
- Semua persetujuan dan keputusan mesti direkodkan.

## 17. Aktiviti dan Kehadiran Takaza

Aktiviti Takaza tidak dihadkan kepada tiga aktiviti tetap.

Admin menentukan aktiviti yang diperlukan mengikut Takaza.

Aktiviti boleh berlaku pada peringkat:

- Pra-permulaan.
- Hari permulaan.
- Sepanjang Takaza.
- Sebelum tarikh tamat.
- Hari tarikh tamat.

Senarai ini bukan bilangan atau urutan aktiviti yang wajib.

### 17.1 Sumber Aktiviti

Admin boleh:

- Memilih rekod Aktiviti Khidmat sedia ada.
- Mencipta aktiviti baharu untuk Takaza.

Jika aktiviti sedia ada dipilih, sistem menggunakan semula maklumat aktiviti asal yang berkaitan.

Hubungan aktiviti dengan Takaza mesti direkodkan.

### 17.2 Pengesahan Aktiviti

- Admin merekodkan pengesahan aktiviti.
- Amer merekodkan pengesahan yang berkaitan.
- Kehadiran dan catatan disimpan secara berasingan daripada status lifecycle Takaza.
- Ketidakhadiran seseorang tidak secara automatik membatalkan Takaza.
- Aktiviti boleh mempunyai rekod peserta, kehadiran dan catatan.
- Perubahan aktiviti mesti mempunyai sejarah.

Template aktiviti boleh dikembangkan kemudian.

Keperluan template aktiviti masih OPEN.

Rujukan: `OPEN_DECISIONS_REGISTER.md`, ODR-014.

## 18. Aliran Pembentukan dan Pengurusan Takaza

Aliran operasi baseline:

1. Admin mencipta dan mengkonfigurasi Takaza.
2. Admin menentukan kaedah penyertaan dan kriteria.
3. KAWAIF disediakan atau dikemas kini jika diperlukan.
4. Admin mengaitkan Takaza dengan Jemaah yang berkenaan.
5. Sistem mengenal pasti calon melalui kaedah penyertaan yang dikonfigurasi.
6. Ahbab memberikan persetujuan apabila diwajibkan.
7. TAFAKUT dijalankan jika diwajibkan.
8. Admin mengesahkan peserta selepas proses berkaitan selesai.
9. Admin melantik Amer selepas calon menjadi peserta yang disahkan.
10. Admin melantik Supervisor jika diperlukan.
11. Aktiviti pra-permulaan ditetapkan.
12. Amer Jemaah menyemak tarikh cadangan mula dan bersetuju atau mencadangkan tarikh baharu.
13. Admin mengesahkan dan mengunci tarikh rasmi.
14. Takaza menjalankan aktiviti mengikut jadual.
15. Bayan Hidayat dijalankan pada tarikh mula.
16. Selepas Bayan Hidayat, sistem menjana Percha secara automatik.
17. Aktiviti Wapsi dan aktiviti tarikh tamat dijalankan.
18. Admin mengesahkan aktiviti tarikh tamat selesai.
19. Amer menyediakan dan menghantar laporan penuh Takaza.
20. Admin mengesahkan bahawa semua syarat penyelesaian dipenuhi.
21. Takaza ditukar kepada `COMPLETED`.

Langkah tertentu boleh berlaku mengikut konfigurasi dan keadaan Takaza.

Namun, syarat penyelesaian yang diwajibkan tidak boleh dilangkau.

## 19. Percha

Percha dijana secara automatik selepas Bayan Hidayat.

Maklumat Percha:

- Nombor Percha.
- Jemaah.
- Tempat atau lokasi pembentukan.
- Halqah.
- Laluan atau route.
- Destinasi.
- Tarikh Bayan Hidayat.
- Kharguzari.
- Tarikh Bayan Wapsi.
- Aktiviti pada tarikh tamat Takaza.

Percha mesti dikaitkan dengan Takaza yang berkenaan.

### 19.1 Pindaan Percha

- Admin boleh mencadangkan pindaan.
- Pindaan memerlukan kelulusan Admin kedua yang berbeza daripada Admin yang membuat pindaan.
- Admin yang mencadangkan pindaan tidak boleh meluluskan pindaan sendiri.
- Jika diluluskan, pindaan direkodkan sebagai versi baharu.
- Jika ditolak, rekod asal kekal tidak berubah.
- Admin yang membuat pindaan boleh mengemukakan semula pindaan.
- Semua versi, keputusan dan sejarah mesti dikekalkan.

### 19.2 Rekod Pindaan

Sistem mesti merekodkan:

- Versi Percha asal.
- Cadangan pindaan.
- Admin yang mencadangkan.
- Tarikh dan masa cadangan.
- Admin yang menyemak.
- Keputusan kelulusan atau penolakan.
- Tarikh dan masa keputusan.
- Sebab atau komen jika berkaitan.
- Versi Percha selepas kelulusan.

Percha asal tidak boleh ditulis ganti sehingga kehilangan sejarah.

## 20. Kharguzari

Kharguzari ialah rekod laporan individu semasa aktiviti berkaitan.

Kharguzari individu perlu dihantar satu hari sebelum Bayan Wapsi.

### 20.1 Pihak yang Boleh Merekod

Kharguzari individu boleh direkodkan oleh:

- Ahbab untuk rekod sendiri.
- Admin dalam skop kuasa yang dibenarkan.

Amer boleh mengakses rekod yang dibenarkan untuk menyediakan laporan penuh Takaza.

### 20.2 Integriti Kharguzari

- Kharguzari asal tidak boleh diubah selepas dihantar.
- Susulan atau komen dibuat sebagai rekod berasingan.
- Penulis boleh mengedit komen sendiri.
- Laporan asal kekal sebagai rekod sejarah.
- Akses kepada laporan tertakluk kepada UAC dan skop Takaza.
- Admin tidak boleh mengubah laporan asal secara senyap.
- Pembetulan yang dibenarkan mesti mengekalkan nilai asal dan sejarah tindakan.

### 20.3 Akses

- Ahbab hanya boleh melihat Kharguzari sendiri.
- Admin boleh melihat rekod dalam skop yang dibenarkan.
- Amer boleh mengakses rekod yang diperlukan untuk laporan penuh Takaza.
- Pengguna tidak boleh melihat rekod Kharguzari di luar skop kebenaran.

## 21. Laporan Penuh Takaza oleh Amer

Amer wajib menyediakan dan menghantar laporan penuh Takaza.

Laporan penuh Amer ialah syarat wajib sebelum Takaza boleh berstatus `COMPLETED`.

### 21.1 Kandungan dan Tanggungjawab

- Amer bertanggungjawab menyediakan laporan penuh.
- Laporan mesti berkaitan dengan Takaza yang diurus.
- Amer boleh menggunakan Kharguzari dan rekod aktiviti yang dibenarkan.
- Laporan mesti dihantar melalui rekod rasmi sistem.
- Laporan asal tidak boleh diubah selepas dihantar.
- Komen atau susulan disimpan sebagai rekod berasingan.

Akses laporan tertakluk kepada UAC dan skop yang diluluskan.

### 21.2 Laporan Lewat

Jika aktiviti tarikh tamat selesai tetapi laporan Amer belum diterima:

- Status laporan menjadi `OVERDUE` apabila tarikh akhir yang ditetapkan telah berlalu.
- Takaza tidak boleh bertukar kepada `COMPLETED`.
- Amer kekal bertanggungjawab menghantar laporan.
- Admin boleh melanjutkan tarikh akhir dengan sebab.
- Tarikh akhir asal mesti dikekalkan.
- Setiap lanjutan mesti direkodkan.
- Pelanjutan tarikh tidak secara automatik menyelesaikan laporan.
- Laporan kekal `OVERDUE` sehingga dihantar.

### 21.3 Rekod Lanjutan

Sistem mesti mengekalkan:

- Tarikh akhir asal.
- Tarikh akhir semasa.
- Permintaan atau tindakan lanjutan.
- Admin yang memberikan lanjutan.
- Sebab lanjutan.
- Tarikh dan masa perubahan.
- Tarikh dan masa penghantaran laporan.

Lanjutan tidak boleh memadam tanggungjawab Amer atau tarikh akhir asal.

## 22. Penyelesaian Takaza

Takaza hanya boleh berstatus `COMPLETED` apabila semua syarat penyelesaian yang diwajibkan telah dipenuhi.

Syarat baseline:

1. Admin mengesahkan aktiviti tarikh tamat selesai.
2. Amer menghantar laporan penuh Takaza.
3. Semua syarat penyelesaian yang diwajibkan bagi Takaza berkenaan dipenuhi.
4. Pengesahan penyelesaian direkodkan.

Laporan penuh Amer wajib diterima sebelum penyelesaian.

Jika laporan belum diterima:

- Takaza tidak boleh `COMPLETED`.
- Laporan kekal tertunggak atau `OVERDUE` mengikut tarikh akhir.
- Admin boleh melanjutkan tarikh akhir dengan sebab.
- Pelanjutan tidak secara automatik menyelesaikan Takaza.

Takaza tidak boleh auto-complete hanya kerana tarikh tamat telah berlalu.

### 22.1 Pengesahan Penyelesaian

Sistem mesti merekodkan:

- Takaza berkaitan.
- Aktiviti akhir yang disahkan.
- Laporan penuh Amer.
- Admin yang mengesahkan.
- Tarikh dan masa pengesahan.
- Status sebelum dan selepas.
- Sebarang syarat tambahan yang diwajibkan.

### 22.2 Perubahan Selepas COMPLETED

Perubahan selepas Takaza `COMPLETED` masih tertakluk kepada keputusan terbuka.

**Status: OPEN DECISION**

Rujukan: `OPEN_DECISIONS_REGISTER.md`, ODR-008.

Jangan membenarkan pembukaan semula atau pindaan retrospektif secara automatik.

Rekod penyelesaian asal mesti dikekalkan.

## 23. Pembatalan Takaza dan Requires Attention

Pembatalan Takaza secara automatik mewujudkan kes `Requires Attention`.

Kes tersebut perlu mengenal pasti:

- Takaza yang dibatalkan.
- Jenis Main atau Sub Takaza.
- Main Takaza berkaitan jika berkenaan.
- Ahbab yang terjejas.
- Rekod penyertaan yang terlibat.
- Tindakan susulan yang diperlukan.

### 23.1 Kesan Pembatalan

- Pembatalan Takaza tidak secara automatik membatalkan semua penyertaan.
- Pembatalan tidak secara automatik menukar semua peserta kepada `CANCELLED`.
- Pembatalan tidak secara automatik menukar peserta kepada `WITHDRAWN`.
- Admin perlu mengurus setiap peserta yang terjejas secara individu.
- Sejarah pembatalan dan keputusan individu mesti dikekalkan.

### 23.2 Case Management

Aliran penuh Case Management masih belum dimuktamadkan dan kekal `ON HOLD`.

Hanya proses minimum `Requires Attention` berkaitan pembatalan Takaza termasuk dalam baseline ini.

Jangan membangunkan workflow Case Management penuh atau menambah kategori kes lain tanpa keputusan yang diluluskan.

Rujukan: `OPEN_DECISIONS_REGISTER.md`, ODR-006.

## 24. Arkib Takaza Tahunan

Arkib tahunan ialah rekod sejarah Takaza dan bukan mekanisme pemadaman.

### 24.1 Akses Arkib

Admin boleh melihat arkib mengikut skop kuasa masing-masing.

Ahbab boleh melihat arkib Takaza yang pernah disertainya, termasuk apabila akaunnya tidak lagi aktif, tertakluk kepada polisi akses dan keselamatan.

Ahbab tidak boleh melihat rekod Takaza orang lain tanpa kebenaran.

Akses arkib mesti menggunakan authorization server-side.

### 24.2 Maklumat Arkib

Arkib perlu menyokong:

- Bilangan Main Takaza.
- Bilangan Sub Takaza.
- Bilangan peserta.
- Pecahan status penyertaan.
- Takaza mengikut tahun.
- Takaza mengikut status.
- Rekod sejarah.
- Laporan berkaitan.

Statistik mesti membezakan Main Takaza dan Sub Takaza.

### 24.3 Penapis Arkib

Penapis asas:

- Negara.
- Tahun.
- Status.

Penapis Main Takaza sebagai pilihan tambahan masih belum dimuktamadkan.

Rujukan: `OPEN_DECISIONS_REGISTER.md`, ODR-013.

### 24.4 Pembentukan dan Pembetulan Arkib

- Arkib dijana secara automatik sebagai baseline.
- Admin boleh menambah maklumat yang dibenarkan.
- Penambahan maklumat tidak boleh mengubah rekod operasi asal secara senyap.
- Sebarang pembetulan mesti mempunyai sejarah dan audit.
- Polisi pembetulan arkib mengikut jenis data dan skop Admin masih belum dimuktamadkan.

Tiada keperluan eksport PDF atau Excel dalam baseline ini.

Rujukan: `OPEN_DECISIONS_REGISTER.md`, ODR-007.

## 25. Annual Summary

Annual Summary ialah rekod ringkasan yang berasingan daripada operasi harian Takaza.

Ringkasan boleh disediakan bagi:

- Keseluruhan negara.
- Setiap Main Takaza.
- Setiap Sub Takaza.

Ringkasan biasanya disediakan selepas Takaza selesai.

Ringkasan interim boleh dibuat ketika Takaza masih aktif.

### 25.1 Status Annual Summary

Status:

- `DRAFT`
- `INTERIM`
- `FINAL`

Status ringkasan tidak mengubah status Takaza.

### 25.2 Kandungan Annual Summary

Ringkasan mengandungi:

- Statistik.
- Catatan.
- Ulasan Admin.

Baseline kandungan ialah teks dan statistik.

Lampiran fail tidak termasuk dalam skop semasa.

### 25.3 Integriti Ringkasan

- Annual Summary tidak menggantikan rekod operasi.
- Perubahan ringkasan tidak boleh mengubah rekod peserta atau laporan asal.
- Status ringkasan mesti berasingan daripada status Takaza.
- Sejarah penyediaan dan perubahan mesti dikekalkan.

## 26. Juhud Reports

Juhud Reports ialah modul penerbitan yang berasingan.

Ia mesti kekal berbeza daripada:

- Laporan operasi Takaza.
- Laporan penuh Amer.
- Kharguzari individu.
- Arkib Takaza Tahunan.
- Annual Summary.

Peraturan penerbitan, editorial workflow dan access permission Juhud Reports ditentukan dalam dokumen modul berasingan.

Jangan mencampurkan fungsi penerbitan Juhud Reports dengan rekod operasi Takaza.

## 27. Komen dan Perbincangan Takaza

Komen boleh digunakan untuk perbincangan berkaitan laporan penuh Takaza.

Pihak yang dibenarkan boleh memberikan komen mengikut authorization:

- Amer.
- Admin.
- Peserta yang dibenarkan.

Peraturan:

- Penulis boleh mengedit komen sendiri mengikut peraturan yang diluluskan.
- Komen dan sejarah perubahan perlu disimpan.
- Hak akses tertakluk kepada status penyertaan dan kebenaran pengguna.
- Komen tidak menggantikan laporan rasmi.
- Rekod laporan asal tidak boleh diubah melalui fungsi komen.
- Komen tidak boleh digunakan untuk memintas proses keputusan rasmi.

Perbincangan Takaza bukan CMS atau Juhud Reports.

## 28. Notifikasi

Notifikasi mesti menggunakan bahasa pilihan pengguna.

Peristiwa yang memerlukan notifikasi termasuk:

- Calon penyertaan dikenal pasti.
- Permohonan menyertai Takaza.
- Pencalonan Admin.
- Permintaan persetujuan Ahbab.
- Pengesahan peserta.
- Keputusan TAFAKUT.
- Pelantikan penilai.
- Pelantikan penilai ketiga.
- Keputusan akhir Managing Admin.
- Pelantikan Amer.
- Penggantian Amer.
- Penamatan pelantikan Amer.
- Pelantikan Supervisor.
- Perubahan pelantikan Supervisor.
- Permintaan penarikan diri.
- Pengesahan penarikan diri.
- Penyingkiran peserta.
- Keputusan rayuan.
- Perubahan kapasiti.
- Perubahan tarikh.
- Aktiviti Takaza.
- Penjanaan Percha.
- Cadangan pindaan Percha.
- Keputusan pindaan Percha.
- Kharguzari.
- Laporan penuh Amer.
- Laporan lewat.
- Lanjutan tarikh laporan.
- Penyelesaian Takaza.
- Pembatalan Takaza.
- Penciptaan kes `Requires Attention`.

Tiada peringatan automatik atau tarikh akhir mandatori melainkan diluluskan secara khusus dalam keputusan atau konfigurasi kemudian.

Notifikasi tidak boleh mendedahkan maklumat di luar skop kebenaran penerima.

## 29. Audit dan Sejarah

Sistem mesti mengekalkan sejarah bagi:

- Penciptaan Main/Sub Takaza.
- Perubahan status.
- Perubahan tarikh.
- Hubungan Main/Sub.
- Hubungan Jemaah.
- Calon dan peserta.
- Kaedah penyertaan.
- Permohonan dan pencalonan.
- Persetujuan.
- Pengesahan peserta.
- Perubahan kapasiti.
- KAWAIF.
- Pengesahan KAWAIF.
- Pelantikan penilai TAFAKUT.
- Penilaian TAFAKUT.
- Penilai ketiga.
- Pusingan tambahan.
- Penggantian penilai.
- Keputusan akhir Managing Admin.
- Pelantikan Amer.
- Penggantian Amer.
- Penamatan pelantikan Amer.
- Pelantikan Supervisor.
- Penarikan diri.
- Penyingkiran.
- Rayuan.
- Penyertaan semula.
- Pemindahan peserta.
- Aktiviti dan kehadiran.
- Percha.
- Pindaan Percha.
- Kharguzari.
- Laporan penuh Amer.
- Lanjutan tarikh laporan.
- Pengesahan penyelesaian.
- Pembatalan dan kes susulan.
- Arkib tahunan.
- Annual Summary.
- Komen dan perubahan berkaitan.

### 29.1 Kandungan Audit

Rekod audit mesti mengandungi, mengikut kesesuaian:

- Entiti dan ID rekod.
- Nilai lama.
- Nilai baharu.
- Pelaku.
- Tarikh dan masa.
- Sebab atau justifikasi.
- Kelulusan berkaitan.
- Rekod penilaian atau keputusan berkaitan.
- Rekod permohonan dan pengesahan.
- Skop kuasa yang digunakan.

### 29.2 Integriti Sejarah

- Rekod sejarah tidak boleh dipadam melalui operasi biasa.
- Penilaian TAFAKUT yang telah dihantar tidak boleh diubah.
- Keputusan Managing Admin mesti disimpan berasingan daripada penilaian asal.
- Laporan asal tidak boleh diubah selepas dihantar.
- Rekod penyertaan asal mesti dikekalkan.
- Pindaan Percha mesti mengekalkan semua versi.
- Pembetulan arkib mesti mengekalkan sejarah.
- Tindakan sensitif mesti mempunyai audit trail.

## 30. Authorization dan Dashboard

Setiap modul Takaza mesti menguatkuasakan authorization di backend.

Dashboard visibility bukan authorization.

Menyembunyikan menu atau butang tidak menggantikan pemeriksaan permission di backend.

UAC Matrix menentukan baseline permission.

Dashboard and Navigation Specification menentukan paparan dan navigasi.

Authorization mesti mengambil kira:

- Role.
- Country scope.
- Organization scope.
- Takaza scope.
- Record ownership atau relationship.
- Explicit delegation jika diluluskan.
- Status workflow.
- Status penyertaan.
- Status pelantikan.

Pengguna tidak boleh memperoleh akses hanya kerana komponen frontend atau navigation item dipaparkan.

Backend tidak boleh menerima role, country atau Takaza scope daripada client sebagai bukti kuasa.

Semua tindakan mesti disahkan berdasarkan identiti dan authorization sebenar.

## 31. Perkara Belum Dimuktamadkan

Perkara berikut masih memerlukan keputusan atau perincian lanjut.

### 31.1 Supervisor Authority and Eligibility

**Status: OPEN / PROVISIONAL**

Rujukan: ODR-004.

Perlu dimuktamadkan:

- Sama ada Supervisor wajib menjadi peserta.
- Skop tugas dan tanggungjawab.
- Kuasa membuat keputusan.
- Akses kepada rekod peserta dan laporan.
- Hubungan dengan Amer dan Admin.
- Kuasa bertindak bagi pihak Amer atau Admin.
- Keperluan delegation.
- Kelayakan tambahan.
- Keperluan TAFAKUT.

### 31.2 DIRECT_ASSIGNMENT Participation Conditions

**Status: OPEN**

Rujukan: ODR-005.

Perlu dimuktamadkan:

- Persetujuan Ahbab.
- Keperluan TAFAKUT.
- Syarat kelayakan.
- Proses penugasan.
- Penolakan atau tiada respons.
- Perbezaan syarat Main dan Sub Takaza.

### 31.3 KAWAIF Structure

**Status: NEEDS FURTHER DEFINITION**

Perlu dimuktamadkan:

- Kategori.
- Kriteria.
- Skor jika digunakan.
- Kelayakan.
- Struktur rujukan.
- Kuasa pengurusan dan pengesahan.

### 31.4 TAFAKUT Form and Criteria

**Status: NEEDS FURTHER DEFINITION**

Perlu dimuktamadkan:

- Jenis borang.
- Template Type A, Type B dan Type C.
- Kriteria setiap jenis.
- Soalan dan susunan.
- Input type.
- Versi template.
- Kriteria tambahan.

Peraturan asas penilai, penilai ketiga, pusingan tambahan dan keputusan akhir Managing Admin yang telah disahkan tidak boleh dianggap terbuka semula.

### 31.5 Annual Archive Correction Policy

**Status: OPEN**

Rujukan: ODR-007.

Perlu dimuktamadkan:

- Jenis maklumat yang boleh dibetulkan.
- Skop Admin yang boleh membuat pembetulan.
- Keperluan justifikasi.
- Keperluan kelulusan kedua.
- Kesan kepada statistik dan ringkasan sejarah.
- Kaedah mengekalkan nilai asal.

### 31.6 Post-Completion Changes

**Status: OPEN**

Rujukan: ODR-008.

Perlu dimuktamadkan:

- Sama ada Takaza boleh dibuka semula.
- Kuasa meluluskan pembukaan semula.
- Maklumat yang boleh dibetulkan.
- Kesan kepada laporan, kehadiran dan Percha.
- Kesan kepada Arkib dan Annual Summary.
- Keperluan audit.

### 31.7 Case Management

**Status: ON HOLD**

Rujukan: ODR-006.

Perlu dimuktamadkan:

- Kategori kes.
- Pemilikan kes.
- Penugasan.
- Status dan workflow.
- Siasatan dan semakan.
- Escalation.
- Kuasa penutupan.
- Rayuan dan susulan.
- Notifikasi dan audit.

Hanya proses minimum `Requires Attention` akibat pembatalan Takaza termasuk dalam baseline.

### 31.8 Annual Archive Main Takaza Filter

**Status: OPEN**

Rujukan: ODR-013.

Perlu dimuktamadkan:

- Sama ada filter Main Takaza diperlukan.
- Pengelompokan Sub Takaza.
- Paparan Admin dan Ahbab.
- Kesan kepada statistik.

### 31.9 Event Templates

**Status: OPEN**

Rujukan: ODR-014.

Perlu dimuktamadkan:

- Keperluan template global.
- Template peringkat negara atau Takaza.
- Medan yang boleh diubah.
- Versioning.
- Penggunaan semula.
- Kuasa mencipta, mengubah dan mempersarakan template.

### 31.10 Rejoining and Reactivation Edge Cases

**Status: OPEN — LIMITED SCOPE**

Rujukan: ODR-010.

Perlu dimuktamadkan:

- Keadaan khusus penyertaan semula.
- Kesahan keputusan TAFAKUT terdahulu dalam keadaan tertentu.
- Keperluan semakan tambahan.
- Hubungan dengan keahlian Jemaah.

Peraturan yang telah disahkan tidak boleh dibuka semula:

- `WITHDRAWN` dan `REMOVED` berbeza.
- Penyertaan semula menghasilkan rekod baharu yang dipautkan kepada sejarah lama.
- Rekod penyertaan lama mesti dikekalkan.
- Password Reset tidak mengaktifkan semula akaun `DISABLED` atau `SUSPENDED`.
- Account reactivation dan participation rejoining ialah dua proses berasingan.

## 32. Related Documents

Dokumen ini mesti dibaca bersama:

- `MASTER_DECISION_REGISTER.md`
- `OPEN_DECISIONS_REGISTER.md`
- `MODULE_REQUIREMENTS.md`
- `AUTH.md`
- `JMV2001-Ahbab-Profile-Account-Management.md`
- `JMV2002-Organization-Structure-Governance.md`
- `JMV2003-Syukbah-Management.md`
- `UAC_MATRIX.md`
- `DASHBOARD_NAVIGATION_SPEC_V2.md`
- `V2_IMPLEMENTATION_STATUS.md`
- `V2_DESIGN_CHECKPOINT.md`
- `REPOSITORY_DISPOSITION.md`
- `docs/SYSTEM_REALIGNMENT_DESIGN.md`

Jika terdapat percanggahan:

1. Keputusan terkini yang telah disahkan dalam Master Decision Register menjadi rujukan utama.
2. Open Decisions Register menjadi rujukan bagi perkara yang belum diputuskan.
3. UAC Matrix menentukan authorization dan skop akses.
4. Dokumen organisasi menentukan struktur dan kuasa organisasi.
5. Dokumen ini menentukan pengurusan Takaza.
6. Dokumen modul berkaitan menentukan workflow operasi khusus.
7. Perkara yang masih `OPEN`, `PENDING`, `PROVISIONAL` atau `ON HOLD` mesti mengekalkan status tersebut.

Dokumen ini tidak boleh mengubah keputusan yang telah diluluskan melalui daftar keputusan rasmi.

## 33. Nota Pembangunan dan Working Rules

Peraturan pembangunan:

- Jangan bina cascade status, tarikh atau penamatan daripada Main Takaza kepada Sub Takaza.
- Jangan benarkan Sub Takaza mempunyai anak.
- Jangan benarkan Main dan Sub Takaza berada dalam negara berbeza dalam baseline semasa.
- Jangan samakan Jemaah Membership dengan Takaza Participation.
- Jangan jadikan keahlian Jemaah sebagai penyertaan Takaza yang disahkan secara automatik.
- Jangan wujudkan entiti V2 berasingan bernama Project Member.
- Jangan melantik Amer sebelum calon menjadi peserta yang disahkan dalam Takaza berkenaan.
- Jangan anggap TAFAKUT PASS sebagai kelulusan penyertaan atau pelantikan automatik.
- Jangan anggap `DIRECT_ASSIGNMENT` mengetepikan persetujuan atau TAFAKUT.
- Jangan anggap Supervisor mempunyai kuasa yang belum diluluskan.
- Jangan gunakan semula penilai lama dalam pusingan TAFAKUT tambahan.
- Jangan benarkan penilai melihat penilaian penilai lain sebelum kedua-duanya menghantar.
- Jangan ubah penilaian TAFAKUT yang telah dihantar.
- Jangan campurkan penilai ketiga bagi percanggahan dengan dua penilai baharu bagi pusingan tambahan.
- Jangan tulis keputusan Managing Admin ke atas rekod penilai.
- Jangan abaikan justifikasi apabila keputusan akhir Managing Admin berbeza daripada keputusan majoriti.
- Jangan sekat penarikan diri yang sah.
- Jangan samakan `WITHDRAWN` dengan `REMOVED`.
- Jangan padam sejarah penyertaan.
- Jangan auto-remove peserta apabila kapasiti dikurangkan.
- Jangan pindahkan peserta tanpa proses dan rekod penyertaan baharu.
- Jangan auto-complete Takaza apabila tarikh tamat berlalu.
- Jangan lengkapkan Takaza tanpa laporan penuh Amer.
- Jangan auto-cancel penyertaan apabila Takaza dibatalkan.
- Jangan membangunkan Case Management penuh ketika statusnya `ON HOLD`.
- Jangan benarkan Admin meluluskan pindaan Percha sendiri.
- Jangan ubah laporan asal atau Kharguzari asal secara senyap.
- Jangan benarkan pembetulan arkib menulis ganti rekod operasi asal.
- Jangan membangunkan eksport PDF atau Excel untuk Arkib dalam baseline ini.
- Jangan mencampurkan Juhud Reports dengan laporan operasi Takaza.
- Jangan menggunakan frontend sebagai satu-satunya kawalan authorization.
- Jangan menerima role, country atau Takaza scope daripada client sebagai bukti kuasa.
- Jangan membina semula jadual database yang telah wujud tanpa audit schema.
- Jangan menyatakan fungsi sebagai `IMPLEMENTED` tanpa bukti kod dan ujian.
- Semua tindakan penting mesti mengekalkan sejarah dan audit trail.
- Semua perkara yang belum diputuskan mesti kekal sebagai `OPEN`, `PENDING`, `PROVISIONAL` atau `ON HOLD` mengikut status sebenar.

---

**Document Status:** REQUIREMENTS BASELINE — FOR REVIEW  
**Version:** 1.2  
**Last Updated:** 28 November 2026  
**Next Review:** Supervisor Authority, DIRECT_ASSIGNMENT Conditions, KAWAIF Structure, TAFAKUT Templates, Archive Correction Policy, Post-Completion Changes and Case Management.

**Tamat — Takaza Management**
