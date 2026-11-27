JUHUDMANAGER V2

Fasa 1 — Ahbab Profile & Account Management

Document ID: JMV2-001
Version: 1.1 — Consolidated Working Baseline
Status: REQUIREMENTS BASELINE — FOR REVIEW
Tarikh: 27 November 2026

Repository Path: "v2/docs/JMV2001-Ahbab-Profile-Account-Management.md"

---

1. Objektif

Menyediakan pengurusan profil dan akaun Ahbab yang membolehkan Ahbab mengurus maklumat peribadi sendiri, sementara Admin mempunyai kuasa pemantauan dan pengurusan akaun mengikut bidang kuasa.

Semua perubahan penting mesti mempunyai rekod sejarah dan audit.

Pengurusan profil, authentication, account status dan authorization hendaklah dianggap sebagai tanggungjawab berasingan tetapi saling berkaitan.

2. Pengurusan Profil Ahbab

Ahbab boleh mengemas kini sendiri:

- Nama penuh.
- Tarikh lahir.
- Alamat kediaman.
- Nombor telefon.
- E-mel.
- Gambar profil.
- Maklumat peribadi lain yang dibenarkan.

Peraturan:

1. Nama penuh dan tarikh lahir boleh diubah terus tanpa kelulusan Admin, tertakluk kepada validasi.
2. National ID dan negara pengeluar National ID tidak boleh diubah sendiri.
3. Nombor telefon dan e-mel baharu mesti disahkan melalui kaedah pengesahan yang diluluskan.
4. Maklumat hubungan baharu hanya digunakan untuk login dan pemulihan akaun selepas pengesahan berjaya.
5. Gambar profil boleh ditukar tanpa kelulusan Admin.
6. Perubahan maklumat disimpan dalam sejarah, termasuk nilai lama, nilai baharu, pengguna dan masa perubahan.
7. Admin yang mempunyai kuasa boleh menyemak sejarah perubahan.
8. Perubahan profil tidak boleh mengubah "user_id" atau memadam sejarah identiti.
9. Perubahan maklumat profil tidak secara automatik mengubah role, status akaun atau penyertaan Takaza.

3. Pengurusan Alamat Kediaman

3.1 Pendaftaran Alamat

- Ahbab boleh mendaftarkan beberapa alamat kediaman.
- Hanya satu alamat boleh berstatus "ACTIVE" pada satu-satu masa.
- Ahbab sendiri memilih alamat yang aktif.
- Alamat lain kekal sebagai rekod tidak aktif.

3.2 Pertukaran Alamat Aktif

Apabila Ahbab memilih alamat lain sebagai alamat aktif:

1. Alamat baharu terus diaktifkan.
2. Sistem menentukan Mohallah berdasarkan alamat baharu.
3. Keahlian aktif di Mohallah lama ditamatkan mengikut proses pertukaran penempatan.
4. Keahlian aktif di Mohallah baharu diwujudkan mengikut proses yang ditetapkan.
5. Penempatan Halqah mengikuti Mohallah baharu.
6. Ahbab menerima notifikasi.
7. Admin Mohallah berkaitan menerima notifikasi.
8. Semua sejarah alamat dan keahlian dikekalkan.

Tiada kelulusan Admin diperlukan bagi pertukaran alamat biasa apabila sistem dapat menentukan Mohallah dengan yakin.

Perubahan alamat tidak boleh memadam rekod keahlian terdahulu.

3.3 Mohallah Belum Dikenal Pasti

Jika sistem tidak dapat menentukan Mohallah dengan yakin:

- Ahbab masih boleh mengaktifkan alamat.
- Alamat kekal "ACTIVE".
- Status pentadbiran menjadi "PENDING MOHALLAH ASSIGNMENT".
- Admin dimaklumkan untuk tindakan susulan.
- Apabila Mohallah dikenal pasti, sistem mengemas kini penempatan dan merekodkan sejarahnya.

3.4 Pemadaman Alamat

- Ahbab boleh memadam alamat yang tidak aktif daripada senarai alamat semasa.
- Alamat tidak dihapuskan secara fizikal.
- Rekod dipindahkan kepada status sejarah/arkib.
- Alamat aktif mesti ditukar terlebih dahulu sebelum boleh dipadam.
- Rekod sejarah tidak boleh hilang.

4. Pengesahan Nombor Telefon dan E-mel

Apabila Ahbab menukar nombor telefon atau e-mel:

1. Sistem menghantar OTP kepada maklumat baharu melalui kaedah yang disokong.
2. Ahbab memasukkan OTP.
3. Sistem mengesahkan OTP.
4. Maklumat baharu diaktifkan selepas pengesahan berjaya.
5. Perubahan direkodkan dalam sejarah.

Maklumat baharu tidak boleh digunakan untuk log masuk atau pemulihan akaun sebelum disahkan.

4.1 Email Change

- E-mel baharu mesti unik secara global.
- E-mel baharu mesti disahkan menggunakan OTP.
- E-mel lama kekal sebagai identiti aktif sehingga pengesahan e-mel baharu berjaya.
- Perubahan mesti direkodkan dalam audit.
- Perubahan e-mel tidak mengubah "user_id".

Permohonan perubahan e-mel boleh diproses bagi akaun berstatus "ACTIVE", "LIMITED" atau "DISABLED", tertakluk kepada pengesahan identiti dan kawalan yang berkaitan.

Kebenaran menukar e-mel tidak bermaksud akaun "DISABLED" boleh login atau mendapat akses operasi.

4.2 Phone / WhatsApp Change

- Nombor baharu mesti disahkan sebelum digunakan.
- Nombor mesti dinormalisasi kepada format yang ditetapkan.
- Nombor yang telah digunakan oleh akaun lain tidak boleh dikaitkan kepada akaun baharu tanpa proses penyelesaian identiti yang sah.
- Pelaksanaan WhatsApp OTP perlu disahkan secara berasingan.

5. Forgot Password dan Account Recovery

5.1 Password Reset / Forgot Password

Status: REQUIRED — NOT IMPLEMENTED

Password Reset / Forgot Password ialah fungsi wajib dalam JuhudManager V2 tetapi belum dilaksanakan.

Ahbab boleh memulakan proses Password Reset menggunakan e-mel yang telah didaftarkan dan disahkan.

Password Reset hendaklah menggunakan polisi berikut:

Tetapan| Keperluan
Kaedah pengesahan| Email OTP
Panjang OTP| 6 digit
Tempoh sah| 5 minit
Percubaan maksimum| 5
Cooldown resend| 60 saat
Kata laluan baharu| Minimum 12 aksara

Peraturan:

1. Pengguna mesti mempunyai e-mel berdaftar yang berstatus "VERIFIED".
2. Sistem menghantar OTP kepada e-mel tersebut.
3. OTP hanya sah untuk transaksi Password Reset yang berkaitan.
4. OTP pendaftaran atau OTP bagi proses lain tidak boleh digunakan untuk Password Reset.
5. OTP yang telah digunakan, tamat tempoh atau dibatalkan tidak boleh digunakan semula.
6. OTP baharu membatalkan OTP terdahulu bagi transaksi reset yang sama.
7. Sistem mesti menguatkuasakan had percubaan dan resend cooldown.
8. Selepas OTP disahkan, pengguna boleh menetapkan kata laluan baharu.
9. Kata laluan baharu mesti mematuhi polisi minimum 12 aksara.
10. Password Reset hanya dianggap berjaya selepas password hash baharu berjaya disimpan.

5.2 Tindakan Keselamatan Selepas Password Reset

Selepas Password Reset berjaya, sistem mesti:

1. Membatalkan semua sesi aktif pengguna.
2. Membatalkan semua refresh token dan token berkaitan yang masih sah.
3. Memastikan token lama tidak boleh digunakan untuk mendapatkan sesi baharu.
4. Merekodkan audit event Password Reset.
5. Menghantar notifikasi keselamatan kepada e-mel berdaftar pengguna.
6. Tidak memasukkan OTP atau kata laluan dalam audit log atau notifikasi.

Pengguna mesti log masuk semula menggunakan kata laluan baharu.

Kegagalan pembatalan sesi/token, audit atau notifikasi keselamatan wajib mesti direkodkan dan tidak boleh dilaporkan sebagai proses reset lengkap yang berjaya.

5.3 Tiada Akses kepada E-mel

Status: PENDING — ADMIN-ASSISTED ACCOUNT RECOVERY

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
4. Pemulihan akaun tidak secara automatik mengaktifkan akaun "DISABLED" atau "SUSPENDED".
5. Pemulihan akaun tidak memberikan role atau akses tambahan.
6. Semua keputusan dan tindakan Admin mesti direkodkan.

Proses terperinci Admin-Assisted Account Recovery masih memerlukan keputusan dan spesifikasi lanjut.

6. Admin Account Management

Admin yang mempunyai kuasa mengikut skop boleh melakukan:

- "DISABLE"
- "REACTIVATE"

Tindakan mesti tertakluk kepada UAC Matrix dan bidang kuasa organisasi.

6.1 DISABLE

Apabila akaun di-"DISABLE":

1. Akaun tidak boleh digunakan untuk log masuk.
2. Semua sesi aktif ditamatkan serta-merta.
3. Semua authentication token aktif dibatalkan.
4. Data Ahbab tidak dipadam.
5. Ahbab menerima notifikasi.
6. Sebab tindakan dan justifikasi direkodkan mengikut keperluan tindakan.
7. Admin, tarikh, masa dan sebab tindakan direkodkan.
8. Ahbab boleh mengemukakan rayuan mengikut Seksyen 8.
9. Akaun tidak boleh diaktifkan semula secara automatik melalui OTP, Password Reset atau perubahan e-mel.

Status "DISABLED" tidak boleh dianggap sama dengan "LIMITED".

6.2 REACTIVATE

Apabila akaun di-"REACTIVATE":

1. Admin yang mempunyai kuasa boleh mengaktifkan akaun.
2. Ahbab menerima notifikasi.
3. Ahbab wajib menetapkan kata laluan baharu jika diwajibkan oleh proses keselamatan berkaitan.
4. Kata laluan lama tidak boleh digunakan semula jika proses tersebut menetapkan syarat demikian.
5. Sesi lama kekal dibatalkan.
6. Akaun boleh digunakan selepas proses pengaktifan dan credential yang diwajibkan selesai.
7. Sebab tindakan dan justifikasi direkodkan mengikut keperluan.
8. Semua tindakan direkodkan.
9. REACTIVATE tidak boleh memulihkan role atau hubungan organisasi yang telah ditamatkan tanpa proses authorization yang sah.

7. Account Activity History

Ahbab boleh melihat sejarah aktiviti akaunnya sendiri.

Antara rekod yang dipaparkan:

- Perubahan profil.
- Perubahan alamat.
- Pertukaran Mohallah.
- Pengesahan e-mel dan telefon.
- Permohonan Password Reset.
- Permohonan pemulihan akaun.
- Tindakan "DISABLE" dan "REACTIVATE".
- Rayuan dan keputusan rayuan.
- Penamatan sesi berkaitan keselamatan.
- Tarikh dan masa tindakan.
- Sebab tindakan jika diberikan.

Ahbab hanya boleh melihat sejarah akaunnya sendiri.

Admin boleh melihat rekod mengikut bidang kuasa dan kebenaran masing-masing.

Maklumat sensitif seperti password hash, OTP dan token tidak boleh dipaparkan dalam Account Activity History.

8. Account Disable Appeal

Ahbab boleh membuat rayuan jika akaunnya di-"DISABLE".

Peraturan:

1. Satu rayuan sahaja dibenarkan bagi setiap tindakan "DISABLE".
2. Rayuan dinilai oleh Admin pada peringkat organisasi yang lebih tinggi daripada Admin yang melakukan "DISABLE".
3. Admin yang melakukan tindakan asal tidak boleh menjadi penilai rayuan tersebut.
4. Penghantaran rayuan tidak mengaktifkan akaun secara automatik.
5. Keputusan rayuan:
   - "APPROVED"
   - "REJECTED"
6. Jika diluluskan, proses "REACTIVATE" boleh diteruskan mengikut kuasa Admin.
7. Jika ditolak, akaun kekal "DISABLED".
8. Tiada rayuan kedua bagi tindakan "DISABLE" yang sama.
9. Tindakan "DISABLE" baharu memberikan satu peluang rayuan baharu.
10. Ahbab menerima notifikasi keputusan.
11. Semua permohonan, keputusan, alasan, Admin dan masa tindakan direkodkan.

Rayuan dan proses Account Recovery ialah dua proses berasingan.

Password Reset tidak boleh digunakan untuk memintas keputusan rayuan atau mengaktifkan akaun "DISABLED".

9. My Active Sessions

Ahbab boleh melihat sesi log masuk aktif miliknya.

Maklumat yang dipaparkan:

- Peranti.
- Browser.
- Masa log masuk terakhir.
- Lokasi anggaran jika tersedia.

Ahbab boleh:

- Menamatkan sesi tertentu.
- Menamatkan semua sesi lain kecuali sesi semasa.

Polisi sesi asas:

Tetapan| Nilai
Idle timeout| 30 minit
Maximum session lifetime| 12 jam

Apabila kata laluan ditukar:

- Sesi lain ditamatkan mengikut polisi keselamatan.
- Token lama dibatalkan mengikut skop perubahan credential.
- Sesi semasa mungkin memerlukan log masuk semula.
- Tindakan direkodkan dalam Audit Log.

Apabila Password Reset berjaya:

- Semua sesi aktif dibatalkan.
- Semua refresh token dan token berkaitan dibatalkan.
- Pengguna mesti log masuk semula.
- Tindakan direkodkan dalam Audit Log.
- Notifikasi keselamatan dihantar.

Apabila akaun "DISABLED":

- Semua sesi aktif ditamatkan.
- Semua authentication token aktif dibatalkan.
- Login disekat.

Pengguna hanya boleh mengurus sesi akaunnya sendiri.

SUPER_ADMIN boleh mempunyai akses khas untuk penyiasatan keselamatan, tertakluk kepada audit dan UAC.

10. Keselamatan dan Audit

Semua tindakan penting mesti direkodkan.

Audit sekurang-kurangnya mengandungi:

- Pengguna atau Admin yang melakukan tindakan.
- Jenis tindakan.
- Rekod yang terlibat.
- Nilai lama dan baharu jika berkaitan.
- Tarikh dan masa.
- Sebab jika diberikan.
- Keputusan dan status selepas tindakan.

Audit Log tidak boleh diubah atau dipadam melalui operasi biasa.

Data sensitif hanya boleh dilihat oleh pengguna yang mempunyai kebenaran.

Maklumat berikut tidak boleh disimpan dalam audit log plaintext:

- Password.
- OTP.
- Session token.
- Refresh token.
- Credential rahsia lain.

Tindakan Password Reset mesti menghasilkan audit event tanpa mendedahkan OTP atau kata laluan.

11. Perkara di Luar Skop Fasa 1

Tidak termasuk dalam pembangunan fasa ini:

- 2FA.
- CMS.
- Eksport PDF, Excel dan CSV.
- Pengurusan struktur organisasi.
- Pengurusan Syukbah.
- Modul laporan organisasi.

Seni bina perlu mengambil kira kemungkinan integrasi pada fasa akan datang.

Password Reset ialah keperluan wajib V2 walaupun pelaksanaannya belum tersedia.

12. Status Pembangunan

Dokumen ini menetapkan keperluan Fasa 1 dan status pelaksanaan hendaklah disahkan berdasarkan kod, API, database dan ujian sebenar.

Komponen| Status
Ahbab Profile foundation| NEEDS VERIFICATION
Profile update| NEEDS VERIFICATION
Address management| NEEDS VERIFICATION
Mohallah assignment| NEEDS VERIFICATION
Email verification| PARTIALLY IMPLEMENTED / NEEDS VERIFICATION
Phone / WhatsApp verification| NEEDS VERIFICATION
DISABLE account| NEEDS VERIFICATION
REACTIVATE account| NEEDS VERIFICATION
Account Disable Appeal| NEEDS VERIFICATION
Active Sessions| PARTIALLY IMPLEMENTED / NEEDS VERIFICATION
Password Change| NEEDS VERIFICATION
Password Reset / Forgot Password| REQUIRED — NOT IMPLEMENTED
Password Reset OTP| NOT IMPLEMENTED
Revoke all sessions and tokens after reset| REQUIRED — NOT IMPLEMENTED FOR RESET FLOW
Password Reset audit event| REQUIRED — NOT IMPLEMENTED FOR RESET FLOW
Password Reset security notification| REQUIRED — NOT IMPLEMENTED FOR RESET FLOW
Admin-Assisted Account Recovery| PENDING
Recovery without email| PENDING

Status di atas ialah status dokumentasi dan bukan pengesahan bahawa fungsi telah diuji atau tersedia di production.

Status teknikal hendaklah diselaraskan dengan "V2_IMPLEMENTATION_STATUS.md".

13. Related Documents

Dokumen ini perlu dibaca bersama:

- "Auth.md"
- "UAC_MATRIX.md"
- "V2_DESIGN_CHECKPOINT.md"
- "V2_IMPLEMENTATION_STATUS.md"
- "DASHBOARD_NAVIGATION_SPEC_V2.md"
- "MASTER_DECISION_REGISTER.md"
- "OPEN_DECISIONS_REGISTER.md"

Jika terdapat percanggahan:

1. Keputusan terkini yang telah dipersetujui menjadi rujukan.
2. UAC Matrix menjadi rujukan authorization.
3. Auth.md menjadi rujukan polisi authentication dan credential.
4. Dokumen ini menjadi rujukan keperluan Ahbab Profile dan Account Management.
5. Perkara yang belum diputuskan hendaklah kekal sebagai PENDING dan tidak boleh dianggap telah diluluskan.

14. Working Rules

- Jangan menganggap semua jenis identiti mempunyai kaedah login yang sama.
- Jangan menganggap WhatsApp OTP sudah lengkap.
- Jangan menganggap Password Reset sudah tersedia sebelum pelaksanaan dan pengujian lengkap.
- Jangan mencampurkan Password Reset kendiri dengan Admin-Assisted Account Recovery.
- Jangan membenarkan Password Reset mengaktifkan akaun "DISABLED" atau "SUSPENDED".
- Jangan menyamakan "DISABLED" dengan "LIMITED".
- Jangan membenarkan perubahan profil mengubah role atau authorization secara automatik.
- Jangan menganggap pengesahan identiti memberikan role atau penyertaan Takaza.
- Jangan membina semula jadual yang sudah wujud tanpa audit schema.
- Jangan mengubah polisi OTP tanpa keputusan yang diluluskan.
- Jangan menggunakan OTP pendaftaran sebagai pengganti automatik kepada OTP Password Reset.
- Jangan menandakan Password Reset berjaya jika pembatalan sesi/token, audit atau notifikasi keselamatan yang diwajibkan gagal.
- Jangan menyatakan fungsi sebagai IMPLEMENTED tanpa bukti kod dan ujian.
- Semua perubahan penting mesti mempunyai sejarah dan audit trail.

---

Document Status: REQUIREMENTS BASELINE — FOR REVIEW
Version: 1.1
Last Updated: 27 November 2026

Tamat — Fasa 1: Ahbab Profile & Account Management
