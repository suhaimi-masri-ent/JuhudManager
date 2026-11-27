
# JUHUDMANAGER V2 — AHBAB PROFILE & ACCOUNT MANAGEMENT

**Document ID:** JMV2-001  
**Version:** 1.2 — Consolidated Working Baseline  
**Status:** REQUIREMENTS BASELINE — FOR REVIEW  
**Last Updated:** 28 November 2026  
**Repository Path:** `v2/docs/JMV2001-Ahbab-Profile-Account-Management.md`

---

## 1. Objektif

Dokumen ini menetapkan keperluan pengurusan profil dan akaun Ahbab dalam JuhudManager V2.

Sistem mesti membolehkan Ahbab mengurus maklumat peribadi sendiri, sementara Admin mempunyai kuasa pemantauan dan pengurusan akaun mengikut bidang kuasa serta authorization yang diberikan.

Semua perubahan penting mesti mempunyai rekod sejarah dan audit.

Pengurusan profil, authentication, account status dan authorization ialah tanggungjawab yang berasingan tetapi saling berkaitan.

Prinsip utama:

1. Setiap individu mempunyai satu `user_id` utama.
2. Perubahan profil tidak mewujudkan akaun baharu.
3. Perubahan identiti tidak boleh memadam sejarah identiti terdahulu.
4. Pengurusan profil tidak memberikan role atau authorization secara automatik.
5. Pengesahan identiti tidak bermaksud pengguna secara automatik mendapat kelayakan penyertaan Takaza.
6. Admin hanya boleh bertindak mengikut skop kuasa yang sah.
7. Semua tindakan sensitif mesti mempunyai audit trail.
8. Pemulihan credential tidak sama dengan pengaktifan semula akaun.
9. Status akaun dan status penyertaan organisasi mesti diuruskan secara berasingan.

## 2. Pengurusan Profil Ahbab

Ahbab boleh mengemas kini maklumat peribadi sendiri mengikut kawalan yang ditetapkan sistem.

Maklumat yang boleh dikemas kini termasuk:

- Nama penuh.
- Tarikh lahir.
- Alamat kediaman.
- Nombor telefon.
- E-mel.
- Gambar profil.
- Maklumat peribadi lain yang dibenarkan.

### 2.1 Peraturan Perubahan Profil

1. Nama penuh dan tarikh lahir boleh diubah sendiri tanpa kelulusan Admin, tertakluk kepada validasi.
2. National ID dan negara pengeluar National ID tidak boleh diubah sendiri.
3. Nombor telefon dan e-mel baharu mesti disahkan melalui kaedah pengesahan yang diluluskan.
4. Maklumat hubungan baharu hanya boleh digunakan untuk login dan pemulihan akaun selepas pengesahan berjaya.
5. Gambar profil boleh ditukar tanpa kelulusan Admin.
6. Perubahan maklumat mesti direkodkan dalam sejarah.
7. Rekod perubahan sekurang-kurangnya mengandungi pengguna, jenis perubahan, masa perubahan dan nilai lama serta nilai baharu jika sesuai.
8. Admin yang mempunyai authorization boleh menyemak sejarah perubahan mengikut skop.
9. Perubahan profil tidak boleh mengubah `user_id`.
10. Perubahan profil tidak boleh memadam sejarah identiti.
11. Perubahan profil tidak boleh mengubah role, status akaun, keahlian atau penyertaan Takaza secara automatik.

### 2.2 Pengasingan Profil dan Akaun

Profil Ahbab dan akaun login ialah dua tanggungjawab yang berbeza.

Contoh:

- Ahbab boleh mengemas kini alamat walaupun tidak mempunyai role Admin.
- Ahbab boleh mengemas kini e-mel tertakluk kepada pengesahan.
- Ahbab yang berstatus `DISABLED` tidak mendapat hak login hanya kerana berjaya mengemas kini e-mel.
- Perubahan profil tidak mengaktifkan semula akaun.
- Perubahan profil tidak memulihkan role atau hubungan organisasi yang telah ditamatkan.

Rujukan authentication dan credential ialah `AUTH.md`.

## 3. Pengurusan Alamat Kediaman

Sistem perlu menyokong beberapa rekod alamat kediaman bagi seorang Ahbab.

Alamat kediaman boleh menentukan penempatan Mohallah dan Halqah, tertakluk kepada struktur organisasi serta proses penempatan yang diluluskan.

### 3.1 Pendaftaran Alamat

- Ahbab boleh mendaftarkan beberapa alamat kediaman.
- Hanya satu alamat boleh berstatus `ACTIVE` pada satu-satu masa.
- Ahbab sendiri memilih alamat yang hendak dijadikan alamat aktif.
- Alamat lain kekal sebagai rekod tidak aktif atau sejarah.
- Sistem mesti mengekalkan sejarah alamat terdahulu.
- Pendaftaran alamat tidak mewujudkan `user_id` baharu.

### 3.2 Pertukaran Alamat Aktif

Apabila Ahbab memilih alamat lain sebagai alamat aktif:

1. Sistem mengesahkan alamat baharu.
2. Sistem menentukan Mohallah berdasarkan alamat baharu.
3. Jika Mohallah dapat dikenal pasti dengan yakin, sistem boleh meneruskan proses penempatan mengikut peraturan organisasi.
4. Keahlian aktif di Mohallah lama ditamatkan mengikut proses pertukaran penempatan yang sah.
5. Keahlian aktif di Mohallah baharu diwujudkan mengikut proses yang ditetapkan.
6. Penempatan Halqah mengikuti Mohallah baharu mengikut struktur organisasi.
7. Ahbab menerima notifikasi.
8. Admin Mohallah yang berkaitan menerima notifikasi.
9. Semua sejarah alamat dan keahlian dikekalkan.

Pertukaran alamat tidak boleh memadam rekod keahlian terdahulu.

Perubahan alamat biasa tidak memerlukan kelulusan Admin apabila sistem dapat menentukan Mohallah dengan yakin dan proses penempatan automatik telah disahkan.

Jika perubahan tersebut memberi kesan kepada keahlian atau penempatan yang memerlukan tindakan Admin, proses organisasi yang berkaitan mesti dipatuhi.

### 3.3 Mohallah Belum Dikenal Pasti

Jika sistem tidak dapat menentukan Mohallah dengan yakin:

- Ahbab masih boleh mendaftarkan atau mengaktifkan alamat baharu.
- Alamat boleh kekal berstatus `ACTIVE`.
- Status pentadbiran penempatan menjadi `PENDING MOHALLAH ASSIGNMENT`.
- Admin yang berkaitan dimaklumkan untuk tindakan susulan.
- Sistem tidak boleh menetapkan Mohallah secara tekaan.
- Apabila Mohallah dikenal pasti, sistem mengemas kini penempatan dan merekodkan sejarahnya.

Status `PENDING MOHALLAH ASSIGNMENT` ialah status penempatan, bukan status akaun.

Ia tidak boleh mengubah status login atau role pengguna.

### 3.4 Pemadaman Alamat

- Ahbab boleh meminta pemadaman alamat yang tidak aktif daripada senarai alamat semasa.
- Alamat aktif mesti ditukar terlebih dahulu sebelum boleh dikeluarkan daripada senarai alamat semasa.
- Rekod tidak dihapuskan secara fizikal jika diperlukan untuk sejarah atau audit.
- Rekod yang dikeluarkan daripada senarai semasa dipindahkan kepada status sejarah atau arkib.
- Rekod sejarah tidak boleh hilang.
- Pemadaman daripada senarai semasa tidak boleh memadam rekod keahlian atau sejarah penempatan yang berkaitan.

## 4. Pengesahan Nombor Telefon dan E-mel

Apabila Ahbab menukar nombor telefon atau e-mel, maklumat baharu mesti disahkan sebelum digunakan sebagai identiti login atau pemulihan akaun.

Aliran umum:

1. Ahbab memasukkan maklumat baharu.
2. Sistem menyemak format dan keunikan.
3. Sistem menghantar OTP melalui kaedah yang disokong.
4. Ahbab memasukkan OTP.
5. Sistem mengesahkan OTP.
6. Maklumat baharu diaktifkan selepas pengesahan berjaya.
7. Perubahan direkodkan dalam sejarah dan audit.

Maklumat baharu tidak boleh digunakan untuk login atau pemulihan akaun sebelum disahkan.

### 4.1 Email Change

Peraturan:

- E-mel baharu mesti unik secara global selepas normalisasi.
- E-mel baharu mesti disahkan menggunakan OTP.
- E-mel lama kekal sebagai identiti aktif sehingga pengesahan e-mel baharu berjaya.
- E-mel baharu tidak boleh dikaitkan kepada akaun lain yang masih memiliki identiti tersebut.
- Perubahan mesti direkodkan dalam audit.
- Perubahan e-mel tidak mengubah `user_id`.
- OTP perubahan e-mel mesti terikat kepada transaksi perubahan e-mel.
- OTP daripada pendaftaran atau Password Reset tidak boleh digunakan untuk mengesahkan perubahan e-mel.

Permohonan perubahan e-mel boleh diproses bagi:

- Akaun berstatus `ACTIVE`, tertakluk kepada access level yang diberikan seperti `FULL` atau `LIMITED`.
- Akaun berstatus `DISABLED`, tertakluk kepada pengesahan identiti dan kawalan keselamatan.

Akaun berstatus `SUSPENDED` tidak termasuk dalam kelayakan ini sehingga polisi khusus diluluskan.

Kebenaran menukar e-mel tidak bermaksud akaun `DISABLED` atau `SUSPENDED` boleh login atau mendapat akses operasi.

Perubahan e-mel juga tidak mengaktifkan semula akaun.

### 4.2 Phone / WhatsApp Change

- Nombor baharu mesti disahkan sebelum digunakan.
- Nombor mesti dinormalisasi kepada format antarabangsa E.164.
- Nombor yang telah digunakan oleh akaun lain tidak boleh dikaitkan kepada akaun baharu tanpa proses penyelesaian identiti yang sah.
- Pelaksanaan WhatsApp OTP perlu disahkan secara berasingan.
- Penggunaan WhatsApp untuk notifikasi tidak membuktikan bahawa WhatsApp OTP bagi authentication telah dilaksanakan.
- Perubahan nombor telefon tidak mengubah `user_id`.
- Perubahan nombor telefon tidak mengubah role atau status akaun.

### 4.3 Identity History

Setiap perubahan identiti mesti mengekalkan sejarah yang berkaitan.

Sekurang-kurangnya sejarah perlu membolehkan sistem mengenal pasti:

- Identiti terdahulu.
- Identiti baharu.
- Jenis identiti.
- Pengguna yang membuat permohonan.
- Pihak yang mengesahkan atau meluluskan jika berkenaan.
- Masa perubahan.
- Status pengesahan.
- Keputusan transaksi.

Data sensitif tidak boleh didedahkan kepada pengguna yang tidak mempunyai authorization.

## 5. Forgot Password dan Account Recovery

Password Reset, Admin-Assisted Account Recovery dan Account Reactivation ialah tiga proses yang berbeza.

Ketiga-tiganya tidak boleh dicampurkan.

### 5.1 Password Reset / Forgot Password

<badge>REQUIRED — NOT IMPLEMENTED</badge>

Password Reset / Forgot Password ialah fungsi wajib dalam JuhudManager V2 tetapi belum dilaksanakan.

Ahbab boleh memulakan proses Password Reset menggunakan e-mel yang telah didaftarkan dan disahkan.

Polisi:

| Tetapan | Keperluan |
|---|---|
| Kaedah pengesahan | Email OTP |
| Panjang OTP | 6 digit |
| Tempoh sah | 5 minit |
| Percubaan maksimum | 5 |
| Cooldown resend | 60 saat |
| Kata laluan baharu | Minimum 12 aksara |

Peraturan:

1. Pengguna mesti mempunyai e-mel berdaftar yang berstatus `VERIFIED`.
2. Sistem menghantar OTP kepada e-mel tersebut.
3. OTP hanya sah untuk transaksi Password Reset yang berkaitan.
4. OTP pendaftaran atau OTP bagi proses lain tidak boleh digunakan untuk Password Reset.
5. OTP yang telah digunakan, tamat tempoh atau dibatalkan tidak boleh digunakan semula.
6. OTP baharu membatalkan OTP terdahulu bagi transaksi reset yang sama.
7. Sistem mesti menguatkuasakan had percubaan dan resend cooldown.
8. Selepas OTP disahkan, pengguna boleh menetapkan kata laluan baharu.
9. Kata laluan baharu mesti mematuhi polisi minimum 12 aksara.
10. Password Reset hanya dianggap berjaya selepas password hash baharu berjaya disimpan.

### 5.2 Tindakan Keselamatan Selepas Password Reset

Selepas Password Reset berjaya, sistem mesti:

1. Membatalkan semua sesi aktif pengguna.
2. Membatalkan semua refresh token dan token berkaitan yang masih sah.
3. Memastikan token lama tidak boleh digunakan untuk mendapatkan sesi baharu.
4. Merekodkan audit event Password Reset.
5. Menghantar notifikasi keselamatan kepada e-mel berdaftar pengguna.
6. Tidak memasukkan OTP atau kata laluan dalam audit log atau notifikasi.

Pengguna mesti log masuk semula menggunakan kata laluan baharu.

Kegagalan pembatalan sesi atau token, audit atau notifikasi keselamatan wajib mesti direkodkan dan tidak boleh dilaporkan sebagai proses reset lengkap yang berjaya.

### 5.3 Tiada Akses kepada E-mel

**Status: PENDING — ADMIN-ASSISTED ACCOUNT RECOVERY**

Jika Ahbab tidak lagi mempunyai akses kepada e-mel berdaftar:

- Ahbab boleh meminta bantuan Admin.
- Admin yang mempunyai kuasa perlu mengesahkan identiti Ahbab.
- Proses ini mesti berasingan daripada Password Reset kendiri.
- Selepas pengesahan, Admin boleh meneruskan proses pemulihan mengikut prosedur yang diluluskan.
- Ahbab boleh mendaftarkan e-mel baharu dan mengesahkannya.
- Semua tindakan direkodkan dalam Audit Log.

Peraturan keselamatan:

1. Admin tidak boleh mengetahui atau menetapkan kata laluan kekal yang diketahui olehnya.
2. Credential baharu mesti ditetapkan melalui proses selamat.
3. Semua sesi dan token lama mesti dibatalkan apabila proses pemulihan memerlukan penggantian credential.
4. Pemulihan akaun tidak secara automatik mengaktifkan akaun `DISABLED` atau `SUSPENDED`.
5. Pemulihan akaun tidak memberikan role atau akses tambahan.
6. Semua keputusan dan tindakan Admin mesti direkodkan.
7. Pemulihan tanpa akses kepada e-mel tidak boleh digunakan untuk memintas pengesahan identiti.

Proses terperinci Admin-Assisted Account Recovery masih memerlukan keputusan dan spesifikasi lanjut.

### 5.4 Pemisahan Password Reset dan Account Reactivation

Password Reset hanya memulihkan credential login.

Password Reset tidak boleh:

- Menukar akaun `DISABLED` kepada `ACTIVE`.
- Menukar akaun `SUSPENDED` kepada `ACTIVE`.
- Membatalkan tindakan DISABLE atau SUSPEND.
- Memberikan semula role.
- Memberikan semula access level.
- Meluluskan pendaftaran yang belum diluluskan.
- Memulihkan keahlian atau penyertaan yang telah ditamatkan.
- Memintas proses rayuan atau semakan.
- Mengaktifkan semula hubungan organisasi secara automatik.

Pengguna yang berjaya menetapkan kata laluan baharu masih tertakluk kepada status akaun semasa.

### 5.5 Account Reactivation

**Status: SEPARATE PROCESS**

Pengaktifan semula akaun `DISABLED` atau `SUSPENDED` mesti melalui proses pengurusan status akaun yang berasingan.

Prinsip:

1. Tindakan hanya boleh dibuat oleh Admin yang mempunyai kuasa.
2. Admin mesti mempunyai skop authorization yang sah.
3. Sebab dan justifikasi tindakan mesti direkodkan mengikut keperluan.
4. Keputusan mesti direkodkan dalam audit.
5. Ahbab menerima notifikasi keputusan.
6. Pengaktifan semula tidak memulihkan role atau hubungan organisasi yang telah ditamatkan tanpa proses authorization yang sah.
7. Tiada pengaktifan semula automatik melalui OTP, Password Reset atau perubahan identiti.

Perincian kuasa dan proses pengaktifan semula dirujuk kepada `AUTH.md` dan UAC Matrix.

## 6. Admin Account Management

Admin yang mempunyai kuasa mengikut skop boleh melakukan tindakan pengurusan akaun seperti:

- `DISABLE`
- `REACTIVATE`
- Tindakan pengurusan lain yang diluluskan.

Tindakan mesti tertakluk kepada UAC Matrix dan bidang kuasa organisasi.

Admin tidak boleh menggunakan fungsi pengurusan akaun untuk memintas kawalan authentication atau authorization.

### 6.1 DISABLE

Apabila akaun di-`DISABLE`:

1. Akaun tidak boleh digunakan untuk log masuk.
2. Semua sesi aktif ditamatkan serta-merta.
3. Semua authentication token aktif dibatalkan.
4. Data Ahbab tidak dipadam.
5. Ahbab menerima notifikasi.
6. Sebab tindakan dan justifikasi direkodkan mengikut keperluan.
7. Admin, tarikh, masa dan sebab tindakan direkodkan.
8. Ahbab boleh mengemukakan rayuan mengikut Seksyen 8.
9. Akaun tidak boleh diaktifkan semula secara automatik melalui OTP, Password Reset atau perubahan e-mel.
10. Role dan sejarah organisasi tidak boleh dipadam hanya kerana akaun di-`DISABLE`.

Status `DISABLED` tidak boleh dianggap sama dengan `LIMITED`.

`DISABLED` menyekat login mengikut polisi akaun.

`LIMITED` ialah keadaan akses terhad dan bukan status yang membenarkan pengguna memintas sekatan akaun.

### 6.2 SUSPENDED

`SUSPENDED` ialah status akaun yang berasingan daripada `DISABLED`.

Prinsip:

- Akaun `SUSPENDED` tertakluk kepada sekatan login dan akses yang ditetapkan oleh polisi keselamatan.
- Password Reset tidak boleh mengubah status `SUSPENDED`.
- OTP tidak boleh mengubah status `SUSPENDED`.
- Perubahan identiti tidak boleh mengubah status `SUSPENDED`.
- Pengaktifan semula memerlukan proses berasingan.
- Sebab, pihak yang bertindak, masa dan keputusan mesti direkodkan.

Perincian sebab, kuasa, tempoh dan proses rayuan bagi `SUSPENDED` perlu diselaraskan dengan keputusan pengurusan akaun dan UAC.

### 6.3 REACTIVATE

Apabila akaun di-`REACTIVATE`:

1. Admin yang mempunyai kuasa boleh mengaktifkan akaun.
2. Ahbab menerima notifikasi.
3. Ahbab wajib menetapkan kata laluan baharu jika diwajibkan oleh proses keselamatan berkaitan.
4. Kata laluan lama tidak boleh digunakan semula jika proses tersebut menetapkan syarat demikian.
5. Sesi lama kekal dibatalkan.
6. Akaun boleh digunakan selepas proses pengaktifan dan credential yang diwajibkan selesai.
7. Sebab tindakan dan justifikasi direkodkan mengikut keperluan.
8. Semua tindakan direkodkan.
9. REACTIVATE tidak boleh memulihkan role atau hubungan organisasi yang telah ditamatkan tanpa proses authorization yang sah.
10. REACTIVATE tidak boleh digunakan untuk memadam sejarah DISABLE atau SUSPEND.

Proses REACTIVATE tidak boleh berlaku hanya kerana pengguna berjaya melakukan Password Reset.

### 6.4 Account Status dan Organization Participation

Status akaun dan status penyertaan organisasi mesti diuruskan secara berasingan.

Contoh:

- Akaun `ACTIVE` tidak semestinya mempunyai keahlian aktif.
- Akaun `DISABLED` tidak semestinya bermaksud rekod keahlian dipadam.
- Pengaktifan semula akaun tidak secara automatik mengaktifkan semula penyertaan yang telah ditamatkan.
- Perubahan alamat tidak boleh memadam sejarah keahlian.
- Password Reset tidak memberikan semula kelayakan penyertaan.

Peraturan keahlian dan penyertaan dirujuk kepada dokumen modul organisasi dan keputusan yang berkaitan.

## 7. Account Activity History

Ahbab boleh melihat sejarah aktiviti akaunnya sendiri.

Antara rekod yang boleh dipaparkan:

- Perubahan profil.
- Perubahan alamat.
- Pertukaran Mohallah.
- Pengesahan e-mel dan telefon.
- Permohonan Password Reset.
- Keputusan Password Reset yang sesuai dipaparkan.
- Permohonan pemulihan akaun.
- Tindakan `DISABLE` dan `REACTIVATE`.
- Tindakan `SUSPEND` dan perubahan status berkaitan.
- Rayuan dan keputusan rayuan.
- Penamatan sesi berkaitan keselamatan.
- Tarikh dan masa tindakan.
- Sebab tindakan jika diberikan.

### 7.1 Akses kepada Sejarah

- Ahbab hanya boleh melihat sejarah akaunnya sendiri.
- Admin boleh melihat rekod mengikut bidang kuasa dan authorization.
- Pengguna tidak boleh mengubah atau memadam sejarah.
- Paparan sejarah tidak boleh mendedahkan data rahsia.

### 7.2 Maklumat yang Tidak Boleh Dipaparkan

Maklumat berikut tidak boleh dipaparkan dalam Account Activity History:

- Password plaintext.
- Password hash.
- OTP plaintext.
- Session token.
- Refresh token.
- Credential rahsia lain.

Paparan sejarah mesti menggunakan maklumat yang mencukupi untuk membantu pengguna memahami tindakan tanpa mendedahkan rahsia keselamatan.

## 8. Account Disable Appeal

Ahbab boleh membuat rayuan jika akaunnya di-`DISABLE`.

Peraturan:

1. Satu rayuan sahaja dibenarkan bagi setiap tindakan `DISABLE`.
2. Rayuan dinilai oleh Admin pada peringkat organisasi yang lebih tinggi daripada Admin yang melakukan `DISABLE`.
3. Admin yang melakukan tindakan asal tidak boleh menjadi penilai rayuan tersebut.
4. Penghantaran rayuan tidak mengaktifkan akaun secara automatik.
5. Keputusan rayuan:
   - `APPROVED`
   - `REJECTED`
6. Jika diluluskan, proses `REACTIVATE` boleh diteruskan mengikut kuasa Admin.
7. Jika ditolak, akaun kekal `DISABLED`.
8. Tiada rayuan kedua bagi tindakan `DISABLE` yang sama.
9. Tindakan `DISABLE` baharu memberikan satu peluang rayuan baharu.
10. Ahbab menerima notifikasi keputusan.
11. Semua permohonan, keputusan, alasan, Admin dan masa tindakan direkodkan.

Rayuan dan proses Account Recovery ialah dua proses berasingan.

Password Reset tidak boleh digunakan untuk memintas keputusan rayuan atau mengaktifkan akaun `DISABLED`.

Butiran rayuan bagi status `SUSPENDED` perlu mengikut polisi yang diluluskan secara berasingan dan tidak boleh dianggap sama secara automatik dengan rayuan `DISABLED`.

## 9. My Active Sessions

Ahbab boleh melihat sesi log masuk aktif miliknya.

Maklumat yang boleh dipaparkan:

- Peranti.
- Browser.
- Masa log masuk terakhir.
- Lokasi anggaran jika tersedia.

Ahbab boleh:

- Menamatkan sesi tertentu.
- Menamatkan semua sesi lain kecuali sesi semasa.

### 9.1 Polisi Sesi

| Tetapan | Nilai |
|---|---|
| Idle timeout | 30 minit |
| Maximum session lifetime | 12 jam |

### 9.2 Apabila Kata Laluan Ditukar

- Sesi lain ditamatkan mengikut polisi keselamatan.
- Token lama dibatalkan mengikut skop perubahan credential.
- Sesi semasa mungkin memerlukan login semula.
- Tindakan direkodkan dalam Audit Log.

### 9.3 Apabila Password Reset Berjaya

- Semua sesi aktif dibatalkan.
- Semua refresh token dan token berkaitan dibatalkan.
- Pengguna mesti login semula.
- Tindakan direkodkan dalam Audit Log.
- Notifikasi keselamatan dihantar.

### 9.4 Apabila Akaun DISABLED atau SUSPENDED

- Sesi aktif ditamatkan mengikut polisi keselamatan.
- Token authentication aktif dibatalkan.
- Login dan akses disekat mengikut status akaun.
- Password Reset tidak boleh membatalkan sekatan tersebut.

### 9.5 Akses Sesi oleh Admin

Pengguna hanya boleh mengurus sesi akaunnya sendiri.

SUPER_ADMIN boleh mempunyai akses khas untuk penyiasatan keselamatan jika dibenarkan oleh UAC.

Akses tersebut mesti mempunyai audit trail dan tidak boleh digunakan untuk melihat atau mendapatkan semula token rahsia pengguna.

## 10. Keselamatan dan Audit

Semua tindakan penting mesti direkodkan.

Audit sekurang-kurangnya mengandungi:

- Pengguna atau Admin yang melakukan tindakan.
- Jenis tindakan.
- Rekod yang terlibat.
- Nilai lama dan baharu jika berkaitan.
- Tarikh dan masa.
- Sebab jika diberikan.
- Keputusan dan status selepas tindakan.
- Skop organisasi yang berkaitan jika diperlukan.

Audit Log tidak boleh diubah atau dipadam melalui operasi biasa.

Data sensitif hanya boleh dilihat oleh pengguna yang mempunyai authorization.

Maklumat berikut tidak boleh disimpan dalam audit log plaintext:

- Password.
- OTP.
- Session token.
- Refresh token.
- Credential rahsia lain.

Tindakan Password Reset mesti menghasilkan audit event tanpa mendedahkan OTP atau kata laluan.

Tindakan DISABLE, SUSPEND, REACTIVATE, rayuan dan perubahan identiti juga mesti mempunyai rekod audit yang sesuai.

Audit perlu membezakan antara:

- Permohonan pengguna.
- Pengesahan sistem.
- Tindakan Admin.
- Keputusan Admin.
- Perubahan status sebenar.

Permohonan yang belum diluluskan tidak boleh direkodkan seolah-olah keputusan telah dibuat.

## 11. Perkara di Luar Skop Fasa 1

Tidak termasuk dalam pembangunan fasa ini melainkan diluluskan secara berasingan:

- 2FA.
- CMS.
- Eksport PDF, Excel dan CSV.
- Pengurusan struktur organisasi.
- Pengurusan Syukbah.
- Modul laporan organisasi.

Seni bina perlu mengambil kira kemungkinan integrasi pada fasa akan datang.

Password Reset ialah keperluan wajib V2 walaupun pelaksanaannya belum tersedia.

Admin-Assisted Account Recovery juga diperlukan sebagai proses berasingan, tetapi butiran penuh masih memerlukan spesifikasi dan keputusan lanjut.

Pengurusan status akaun tidak boleh dianggap selesai hanya kerana fungsi DISABLE atau REACTIVATE tersedia. Proses rayuan, audit, notifikasi, pembatalan sesi dan kawalan authorization juga perlu disahkan.

## 12. Status Pembangunan

Dokumen ini menetapkan keperluan Fasa 1.

Status pelaksanaan hendaklah disahkan berdasarkan kod, API, database, ujian dan bukti operasi sebenar.

| Komponen | Status |
|---|---|
| Ahbab Profile foundation | NEEDS VERIFICATION |
| Profile update | NEEDS VERIFICATION |
| Address management | NEEDS VERIFICATION |
| Mohallah assignment | NEEDS VERIFICATION |
| Email verification | PARTIALLY IMPLEMENTED / NEEDS VERIFICATION |
| Email change | NEEDS VERIFICATION |
| Phone / WhatsApp verification | NEEDS VERIFICATION |
| DISABLE account | NEEDS VERIFICATION |
| SUSPENDED account handling | NEEDS VERIFICATION |
| REACTIVATE account | NEEDS VERIFICATION |
| Account Disable Appeal | NEEDS VERIFICATION |
| Active Sessions | PARTIALLY IMPLEMENTED / NEEDS VERIFICATION |
| Password Change | NEEDS VERIFICATION |
| Password Reset / Forgot Password | REQUIRED — NOT IMPLEMENTED |
| Password Reset OTP | NOT IMPLEMENTED |
| Revoke all sessions and tokens after reset | REQUIRED — NOT IMPLEMENTED FOR RESET FLOW |
| Password Reset audit event | REQUIRED — NOT IMPLEMENTED FOR RESET FLOW |
| Password Reset security notification | REQUIRED — NOT IMPLEMENTED FOR RESET FLOW |
| Password Reset account-status preservation | REQUIRED |
| Admin-Assisted Account Recovery | PENDING |
| Recovery without email | PENDING |
| Account Reactivation workflow | SEPARATE PROCESS — NEEDS VERIFICATION |

Status di atas ialah status dokumentasi dan bukan pengesahan bahawa fungsi telah diuji atau tersedia di production.

Status teknikal hendaklah diselaraskan dengan `V2_IMPLEMENTATION_STATUS.md`.

Tiada fungsi boleh dinaik taraf kepada `IMPLEMENTED` hanya berdasarkan kewujudan spesifikasi atau endpoint.

Pengesahan perlu dibuat melalui:

1. Pemeriksaan kod.
2. Pemeriksaan database schema dan migration.
3. Ujian API.
4. Ujian authorization.
5. Ujian keselamatan.
6. Pengesahan audit dan notifikasi.
7. Ujian aliran sebenar yang berkaitan.

## 13. Related Documents

Dokumen ini perlu dibaca bersama:

- `AUTH.md`
- `UAC_MATRIX.md`
- `V2_DESIGN_CHECKPOINT.md`
- `V2_IMPLEMENTATION_STATUS.md`
- `DASHBOARD_NAVIGATION_SPEC_V2.md`
- `MASTER_DECISION_REGISTER.md`
- `OPEN_DECISIONS_REGISTER.md`

Jika terdapat percanggahan:

1. Keputusan terkini yang telah dipersetujui menjadi rujukan.
2. UAC Matrix menjadi rujukan authorization.
3. `AUTH.md` menjadi rujukan polisi authentication dan credential.
4. Dokumen ini menjadi rujukan keperluan Ahbab Profile dan Account Management.
5. Dokumen modul organisasi menjadi rujukan keahlian dan penyertaan.
6. Perkara yang belum diputuskan hendaklah kekal sebagai `PENDING` dan tidak boleh dianggap telah diluluskan.

Dokumen ini tidak boleh mengubah keputusan organisasi yang telah diluluskan melalui daftar keputusan rasmi.

## 14. Working Rules

- Jangan menganggap semua jenis identiti mempunyai kaedah login yang sama.
- Jangan menganggap WhatsApp OTP sudah lengkap.
- Jangan menganggap Password Reset sudah tersedia sebelum pelaksanaan dan pengujian lengkap.
- Jangan mencampurkan Password Reset kendiri dengan Admin-Assisted Account Recovery.
- Jangan membenarkan Password Reset mengaktifkan akaun `DISABLED` atau `SUSPENDED`.
- Jangan menyamakan `DISABLED` dengan `LIMITED`.
- Jangan menyamakan status akaun dengan status keahlian atau penyertaan organisasi.
- Jangan membenarkan perubahan profil mengubah role atau authorization secara automatik.
- Jangan menganggap pengesahan identiti memberikan role atau penyertaan Takaza.
- Jangan membina semula jadual yang sudah wujud tanpa audit schema.
- Jangan mengubah polisi OTP tanpa keputusan yang diluluskan.
- Jangan menggunakan OTP pendaftaran sebagai pengganti automatik kepada OTP Password Reset.
- Jangan menandakan Password Reset berjaya jika pembatalan sesi/token, audit atau notifikasi keselamatan yang diwajibkan gagal.
- Jangan menyatakan fungsi sebagai `IMPLEMENTED` tanpa bukti kod dan ujian.
- Jangan mengaktifkan semula akaun melalui perubahan e-mel, perubahan telefon atau OTP.
- Jangan memadam sejarah identiti, alamat, keahlian atau tindakan akaun.
- Jangan memberikan kuasa Admin di luar skop authorization.
- Semua perubahan penting mesti mempunyai sejarah dan audit trail.
- Perkara yang masih belum diputuskan mesti kekal sebagai `PENDING`.

---

**Document Status:** REQUIREMENTS BASELINE — FOR REVIEW  
**Version:** 1.2  
**Last Updated:** 28 November 2026  
**Next Review:** Verification of Ahbab Profile, Address Management, Account Status, Account Recovery and Account Disable Appeal implementation.

**Tamat — Fasa 1: Ahbab Profile & Account Management**
