JuhudManager V2 — Audit Handover

Tarikh: 24 November 2026
Branch: "develop" sahaja
Audit HEAD: "b49a3f3504200c95a0a9b82c60f4fc0aaf61e51e"
Status: Read-only audit; tiada perubahan kod, migration atau deployment dibuat.

1. Tujuan

Dokumen ini merekodkan hasil audit dan keputusan projek supaya kerja boleh disambung tanpa mengulangi audit dari awal atau kehilangan keputusan yang telah dipersetujui.

2. Peraturan wajib projek

- Gunakan branch "develop" sahaja sebagai source of truth.
- Jangan inspect, compare, merge, cherry-pick atau ubah branch "main".
- Audit dahulu sebelum membuat perubahan.
- Jangan ubah kod, migration atau deployment tanpa kebenaran yang jelas.
- Jangan jalankan production D1 migration atau operasi database tanpa kebenaran khusus.
- Kekalkan login, account recovery, LIMITED access dan fungsi yang telah disahkan.
- JuhudManager ialah projek berasingan; jangan gunakan nama atau andaian projek lain.

3. Keadaan repository semasa audit

HEAD yang diaudit:

"b49a3f3504200c95a0a9b82c60f4fc0aaf61e51e"

Dua workflow deployment pada commit tersebut dilaporkan berjaya:

- Worker deployment: "45268025877"
- GitHub Pages deployment: "45268025868"

Nota: Kejayaan deployment tidak membuktikan semua test lulus atau migration telah diaplikasikan. Audit ini tidak menjalankan production migration atau deployment.

4. Keputusan yang telah dipersetujui

4.1 Email Change — kuasa semakan

- "ADMIN" boleh menyemak permohonan Ahbab dalam negara yang ditugaskan kepadanya.
- "SUPER_ADMIN" mempunyai akses global.
- Setiap keputusan mesti merekodkan Admin ID, timestamp, keputusan dan sebab.
- Kelulusan Admin ialah semakan permohonan sahaja.
- Email baharu hanya boleh digunakan selepas OTP berjaya disahkan.

4.2 OTP email provider — Brevo

- Gunakan Brevo Transactional Email API melalui HTTP API.
- Jangan gunakan SMTP untuk integrasi Worker ini.
- Kekalkan keselamatan dan logik OTP sedia ada.
- Jadikan delivery adapter boleh ditukar.
- Kekalkan Resend buat sementara sebagai pilihan rollback sehingga ujian Brevo berjaya.
- Jangan buat automatic duplicate fallback yang boleh menghantar OTP berganda.
- Brevo API key mesti disimpan sebagai Cloudflare Worker Secret, bukan dalam source code atau frontend.
- Sender identity perlu disahkan mengikut syarat akaun Brevo. Jangan jadikan ketiadaan domain berbayar sebagai alasan untuk menghentikan audit.

4.3 Country Ahbab

Country Ahbab ditentukan berdasarkan alamat/tempat tinggal semasa yang diisytiharkan dan disimpan.

Bukan berdasarkan:

- Nationality
- National ID
- IP address
- Negara keahlian Jemaah

Keperluan yang telah dipersetujui:

- Profile perlu menyokong alamat semasa dan pilihan country.
- Perubahan alamat/country perlu mempunyai audit history.
- Email Change request perlu menyimpan snapshot country ketika permohonan dihantar.
- Perubahan alamat kemudian tidak boleh mengubah skop atau sejarah permohonan terdahulu.

Perhatian: Reka bentuk schema dan polisi terperinci untuk pengesahan alamat masih perlu diaudit dan dipersetujui sebelum implementasi.

5. Komponen sedia ada yang perlu dikekalkan

Authentication dan recovery

- "v2/src/auth/otp.js"
  
  - OTP registration sedia ada menggunakan email.
  - OTP registration mempunyai eligibility checks tersendiri.
  - Jangan ubah atau longgarkan syarat registration semata-mata untuk menyokong Email Change.

- "v2/src/auth/authorization.js"
  
  - Menyokong "ADMIN" dan "SUPER_ADMIN".
  - "getUserCountryScope()" menyediakan global scope untuk Super Admin dan country assignments untuk Admin.
  - "requireCountryAccess()" menyemak akses negara.

- "v2/src/routes/admin-registrations.js"
  
  - Fungsi registration review dan recovery sedia ada.
  - "requireAdminSession()" pada laluan tersebut memerlukan Super Admin.
  - Jangan anggap polisi itu secara automatik terpakai kepada Email Change.

Profile dan LIMITED access

- "v2/src/routes/profile.js"
- "v2/web/my-profile.html"
- "v2/web/assets/js/profile.js"

Profile sekarang menyokong maklumat asas dan belum mempunyai alamat/country.

Regression case yang wajib dikekalkan:

- Registration: "Waiting Verification"
- Account Status: "DISABLED"
- Access Level: "LIMITED"
- Profile boleh dilihat.
- Profile tidak boleh disimpan atau diubah ketika masih dalam keadaan tersebut.

Jangan longgarkan syarat LIMITED access.

Email delivery

- "v2/src/lib/resend-email.js"
- "v2/src/index.js"

Resend kini digunakan secara langsung oleh beberapa delivery flow. Perlu audit semua pemanggilan sebelum menggantikan atau mengabstrakkan provider.

WhatsApp Cloud integration yang sedia ada adalah untuk registration; jangan anggap ia sudah menyokong Email Change.

6. Isu migration — BLOCKER

Migration yang berkaitan:

- "0014_admin_reviewed_email_change.sql"
- "0017_email_change_otp_workflow.sql"
- "0018_email_change_schema_correction.sql"

Isu yang telah direproduksi menggunakan SQLite:

Migration 0014 membenarkan rekod "APPROVED" yang mempunyai "applied_at".

Migration 0018 menyalin nilai "applied_at" tersebut tetapi menetapkan "email_verified_at = NULL".

CHECK constraint baharu memerlukan:

"applied_at IS NULL OR email_verified_at IS NOT NULL"

Maka rekod lama yang mempunyai "applied_at" tetapi tiada "email_verified_at" boleh menyebabkan migration gagal dengan "IntegrityError".

Status data production D1 belum diperiksa. Tiada remote D1 query atau migration dijalankan dalam audit ini.

Tindakan seterusnya:

1. Baca keseluruhan SQL migration 0014, 0017 dan 0018.
2. Semak urutan rename/drop/create dan foreign key.
3. Uji migration chain dari database kosong.
4. Uji migration upgrade menggunakan data legacy termasuk rekod APPROVED.
5. Sediakan pembetulan yang selamat dan ujian sebelum meminta kebenaran untuk deployment.

Jangan jalankan migration production sehingga isu ini diselesaikan dan disahkan.

7. Perkara yang belum lengkap atau perlu dibangunkan

- Email Change backend.
- OTP workflow khusus untuk Email Change.
- Admin review dengan country scope.
- Admin-assisted OTP workflow.
- Brevo Transactional Email API adapter.
- Profile current address dan country.
- Address/country audit history.
- Country snapshot pada Email Change request.
- Email Change UI untuk Ahbab.
- Admin review UI.
- Ujian integrasi dan regression.

Email Change mesti mempunyai flow tersendiri dan tidak boleh bergantung pada registration OTP yang mempunyai tujuan serta eligibility berbeza.

8. Ujian yang diperlukan

Sekurang-kurangnya:

1. Registration OTP sedia ada masih berfungsi.
2. Login dan password recovery tidak terjejas.
3. LIMITED account tidak boleh mengubah Profile.
4. Email Change hanya boleh dimohon oleh akaun yang layak.
5. ADMIN hanya boleh melihat dan menyemak permohonan dalam country scope.
6. SUPER_ADMIN boleh melihat dan menyemak semua country.
7. Admin approval tidak terus menukar email.
8. Email hanya ditukar selepas OTP berjaya disahkan.
9. OTP salah, luput, digunakan semula atau melebihi had cubaan ditolak.
10. OTP delivery melalui Brevo berjaya.
11. Provider rollback tidak menyebabkan penghantaran OTP berganda.
12. Perubahan alamat/country mempunyai audit history.
13. Country snapshot permohonan kekal walaupun alamat Ahbab berubah.
14. Audit review merekodkan Admin ID, masa, keputusan dan sebab.
15. Existing login, recovery dan profile behaviour tidak mengalami regression.

9. Langkah kerja seterusnya

Fasa A — Lengkapkan audit

- Sahkan HEAD terkini pada "develop".
- Periksa keseluruhan migration chain.
- Semak semua route dispatch dan delivery adapter.
- Semak database constraints dan foreign keys.
- Semak test coverage.

Fasa B — Sediakan reka bentuk

- Tetapkan schema Email Change dan OTP.
- Tetapkan country scope enforcement.
- Tetapkan profile address/country structure.
- Tetapkan Brevo adapter dan rollback procedure.

Fasa C — Implementasi selepas kelulusan

- Backend dan migration.
- Admin review.
- Automatic dan Admin-assisted OTP.
- Brevo integration.
- Profile dan UI.
- Regression dan integration testing.

10. Status akhir audit

- Tiada source code diubah.
- Tiada migration dijalankan.
- Tiada production D1 data diubah.
- Tiada deployment dilakukan oleh audit ini.
- Migration 0018 mempunyai isu keserasian data legacy yang mesti diselesaikan.
- Email Change, Brevo dan current-address country masih memerlukan implementasi serta ujian.

Nota: Sasaran perancangan awal untuk milestone Ahbab Account Management ialah 8–10 hari bekerja. Sasaran ini perlu dinilai semula selepas audit migration, Brevo dan country/address selesai.
