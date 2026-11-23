# JUHUDMANAGER V2

## Fasa 1 --- Ahbab Profile & Account Management

**Status:** REQUIREMENTS FREEZE --- FOR REVIEW\
**Tarikh:** 23 November 2026

------------------------------------------------------------------------

## 1. Objektif

Menyediakan pengurusan profil dan akaun Ahbab yang membolehkan Ahbab
mengurus maklumat peribadi sendiri, sementara Admin mempunyai kuasa
pemantauan dan pengurusan akaun mengikut bidang kuasa.

Semua perubahan penting mesti mempunyai rekod sejarah dan audit.

## 2. Pengurusan Profil Ahbab

Ahbab boleh mengemas kini sendiri:

-   Nama penuh.
-   Tarikh lahir.
-   Alamat kediaman.
-   Nombor telefon.
-   E-mel.
-   Gambar profil.
-   Maklumat peribadi lain yang dibenarkan.

Peraturan:

1.  Nama penuh dan tarikh lahir boleh diubah terus tanpa kelulusan
    Admin.
2.  NRIC dan negara pengeluar NRIC tidak boleh diubah sendiri.
3.  Nombor telefon dan e-mel baharu mesti disahkan melalui OTP.
4.  Maklumat hubungan baharu hanya digunakan untuk log masuk dan
    pemulihan akaun selepas pengesahan.
5.  Gambar profil boleh ditukar tanpa kelulusan Admin.
6.  Perubahan maklumat disimpan dalam sejarah, termasuk nilai lama,
    nilai baharu, pengguna dan masa perubahan.
7.  Admin yang mempunyai kuasa boleh menyemak sejarah perubahan.

## 3. Pengurusan Alamat Kediaman

### 3.1 Pendaftaran Alamat

-   Ahbab boleh mendaftarkan beberapa alamat kediaman.
-   Hanya satu alamat boleh berstatus `ACTIVE` pada satu-satu masa.
-   Ahbab sendiri memilih alamat yang aktif.
-   Alamat lain kekal sebagai rekod tidak aktif.

### 3.2 Pertukaran Alamat Aktif

Apabila Ahbab memilih alamat lain sebagai alamat aktif:

1.  Alamat baharu terus diaktifkan.
2.  Sistem menentukan Mohallah berdasarkan alamat baharu.
3.  Keahlian aktif di Mohallah lama ditamatkan.
4.  Keahlian aktif di Mohallah baharu diwujudkan.
5.  Penempatan Halqah mengikuti Mohallah baharu.
6.  Ahbab menerima notifikasi.
7.  Admin Mohallah berkaitan menerima notifikasi.
8.  Semua sejarah alamat dan keahlian dikekalkan.

Tiada kelulusan Admin diperlukan.

### 3.3 Mohallah Belum Dikenal Pasti

Jika sistem tidak dapat menentukan Mohallah dengan yakin:

-   Ahbab masih boleh mengaktifkan alamat.
-   Alamat kekal `ACTIVE`.
-   Status pentadbiran menjadi `PENDING MOHALLAH ASSIGNMENT`.
-   Admin dimaklumkan untuk tindakan susulan.
-   Apabila Mohallah dikenal pasti, sistem mengemas kini penempatan dan
    merekodkan sejarahnya.

### 3.4 Pemadaman Alamat

-   Ahbab boleh memadam alamat yang tidak aktif daripada senarai alamat
    semasa.
-   Alamat tidak dihapuskan secara fizikal.
-   Rekod dipindahkan kepada status sejarah/arkib.
-   Alamat aktif mesti ditukar terlebih dahulu sebelum boleh dipadam.
-   Rekod sejarah tidak boleh hilang.

## 4. Pengesahan Nombor Telefon dan E-mel

Apabila Ahbab menukar nombor telefon atau e-mel:

1.  Sistem menghantar OTP ke maklumat baharu.
2.  Ahbab memasukkan OTP.
3.  Sistem mengesahkan OTP.
4.  Maklumat baharu diaktifkan selepas pengesahan berjaya.
5.  Perubahan direkodkan dalam sejarah.

Maklumat baharu tidak boleh digunakan untuk log masuk atau pemulihan
akaun sebelum disahkan.

## 5. Forgot Password dan Account Recovery

### 5.1 Pemulihan Biasa

-   Ahbab boleh menggunakan fungsi Forgot Password.
-   Sistem menghantar pautan atau token pemulihan melalui e-mel
    berdaftar.
-   Token hanya boleh digunakan sekali.
-   Tempoh sah token boleh dikonfigurasi oleh SUPER_ADMIN.
-   Token disimpan secara selamat.
-   Selepas penetapan kata laluan baharu, sesi lama dibatalkan dan
    tindakan direkodkan.
-   Ahbab menerima notifikasi keselamatan.

### 5.2 Tiada Akses kepada E-mel

Jika Ahbab tidak lagi mempunyai akses kepada e-mel berdaftar:

-   Ahbab boleh meminta bantuan Admin.
-   Admin perlu mengesahkan identiti Ahbab.
-   Selepas pengesahan, proses pemulihan boleh diteruskan.
-   Ahbab boleh mendaftarkan e-mel baharu dan mengesahkannya.
-   Semua tindakan direkodkan dalam Audit Log.

## 6. Admin Account Management

Admin yang mempunyai kuasa boleh melakukan:

-   `DISABLE`
-   `REACTIVATE`

### 6.1 DISABLE

Apabila akaun di-`DISABLE`:

1.  Akaun tidak boleh digunakan untuk log masuk.
2.  Semua sesi aktif ditamatkan serta-merta.
3.  Semua authentication token aktif dibatalkan.
4.  Data Ahbab tidak dipadam.
5.  Ahbab menerima notifikasi.
6.  Sebab tindakan boleh diberikan tetapi tidak diwajibkan.
7.  Tindakan, Admin, tarikh, masa dan sebab (jika ada) direkodkan.

### 6.2 REACTIVATE

Apabila akaun di-`REACTIVATE`:

1.  Admin yang mempunyai kuasa boleh mengaktifkan akaun.
2.  Ahbab menerima notifikasi.
3.  Ahbab wajib menetapkan kata laluan baharu.
4.  Kata laluan lama tidak boleh digunakan semula.
5.  Sesi lama kekal dibatalkan.
6.  Akaun boleh digunakan selepas proses penetapan kata laluan baharu
    selesai.
7.  Sebab tindakan adalah pilihan.
8.  Semua tindakan direkodkan.

## 7. Account Activity History

Ahbab boleh melihat sejarah aktiviti akaunnya sendiri.

Antara rekod yang dipaparkan:

-   Perubahan profil.
-   Perubahan alamat.
-   Pertukaran Mohallah.
-   Pengesahan e-mel dan telefon.
-   Permohonan pemulihan akaun.
-   Tindakan `DISABLE` dan `REACTIVATE`.
-   Rayuan dan keputusan rayuan.
-   Tarikh dan masa tindakan.
-   Sebab tindakan jika diberikan.

Ahbab hanya boleh melihat sejarah akaunnya sendiri.

Admin boleh melihat rekod mengikut bidang kuasa dan kebenaran
masing-masing.

## 8. Account Disable Appeal

Ahbab boleh membuat rayuan jika akaunnya di-`DISABLE`.

Peraturan:

1.  Satu rayuan sahaja dibenarkan bagi setiap tindakan `DISABLE`.
2.  Rayuan dinilai oleh Admin pada peringkat organisasi yang lebih
    tinggi daripada Admin yang melakukan `DISABLE`.
3.  Admin yang melakukan tindakan asal tidak boleh menjadi penilai
    rayuan tersebut.
4.  Penghantaran rayuan tidak mengaktifkan akaun secara automatik.
5.  Keputusan rayuan:
    -   `APPROVED`
    -   `REJECTED`
6.  Jika diluluskan, proses `REACTIVATE` dan penetapan kata laluan
    baharu boleh diteruskan.
7.  Jika ditolak, akaun kekal `DISABLED`.
8.  Tiada rayuan kedua bagi tindakan `DISABLE` yang sama.
9.  Tindakan `DISABLE` baharu memberikan satu peluang rayuan baharu.
10. Ahbab menerima notifikasi keputusan.
11. Semua permohonan, keputusan, alasan, Admin dan masa tindakan
    direkodkan.

## 9. My Active Sessions

Ahbab boleh melihat sesi log masuk aktif miliknya.

Maklumat yang dipaparkan:

-   Peranti.
-   Browser.
-   Masa log masuk terakhir.
-   Lokasi anggaran jika tersedia.

Ahbab boleh:

-   Menamatkan sesi tertentu.
-   Menamatkan semua sesi lain kecuali sesi semasa.

Apabila kata laluan ditukar:

-   Semua sesi lain ditamatkan.
-   Token lama dibatalkan.
-   Sesi semasa mungkin memerlukan log masuk semula.
-   Tindakan direkodkan dalam Audit Log.

Pengguna hanya boleh mengurus sesi akaunnya sendiri.

SUPER_ADMIN boleh mempunyai akses khas untuk penyiasatan keselamatan,
tertakluk kepada audit.

## 10. Keselamatan dan Audit

Semua tindakan penting mesti direkodkan.

Audit sekurang-kurangnya mengandungi:

-   Pengguna atau Admin yang melakukan tindakan.
-   Jenis tindakan.
-   Rekod yang terlibat.
-   Nilai lama dan baharu jika berkaitan.
-   Tarikh dan masa.
-   Sebab jika diberikan.
-   Keputusan dan status selepas tindakan.

Audit Log tidak boleh diubah atau dipadam melalui operasi biasa.

Data sensitif hanya boleh dilihat oleh pengguna yang mempunyai
kebenaran.

## 11. Perkara di Luar Skop Fasa 1

Tidak termasuk dalam pembangunan fasa ini:

-   2FA.
-   CMS.
-   Eksport PDF, Excel dan CSV.
-   Pengurusan struktur organisasi.
-   Pengurusan Syukbah.
-   Modul laporan organisasi.

Seni bina perlu mengambil kira kemungkinan integrasi pada fasa akan
datang.

## 12. Status Pembangunan

Dokumen ini menetapkan keperluan Fasa 1 sahaja.

-   Tiada perubahan kod dibuat melalui dokumen ini.
-   Tiada perubahan database atau migration dibuat.
-   Tiada deployment dibuat.
-   Pelaksanaan hanya bermula selepas spesifikasi disemak dan
    diluluskan.

**Tamat --- Fasa 1: Ahbab Profile & Account Management**
