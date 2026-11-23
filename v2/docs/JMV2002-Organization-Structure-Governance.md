JMV2002 — Struktur Organisasi & Tadbir Urus

Project: JuhudManager V2
Document ID: JMV2002
Suggested filename: "JMV2002-Organization-Structure-Governance.md"
Status: REQUIREMENTS BASELINE — FOR REVIEW
Scope: Struktur organisasi, pentadbiran, pelantikan kepimpinan dan proses membuat keputusan.

---

1. Tujuan

Dokumen ini menetapkan struktur organisasi dan prinsip tadbir urus JuhudManager V2, daripada peringkat Mohallah sehingga Markaz Negara.

Sistem perlu merekodkan struktur organisasi, hubungan pentadbiran, pelantikan, kuasa membuat keputusan dan sejarah perubahan.

2. Hierarki Organisasi

Struktur organisasi adalah seperti berikut:

1. Individu / Ahbab
2. Mohallah
3. Halqah
4. Zone
5. Markaz Negeri
6. Markaz Negara

Hubungan organisasi dibentuk secara bottom-up.

3. Peraturan Keahlian dan Penempatan

3.1 Ahbab dan Mohallah

- Seorang Ahbab hanya boleh mempunyai satu Mohallah aktif pada satu-satu masa.
- Ahbab boleh berpindah ke Mohallah lain.
- Perpindahan boleh dimulakan sendiri oleh Ahbab tanpa kelulusan Admin.
- Sistem perlu menamatkan keahlian Mohallah lama dan merekodkan keahlian baharu.
- Semua sejarah keahlian, tarikh kuat kuasa dan rekod perpindahan mesti dikekalkan.
- Rekod aktiviti terdahulu kekal terikat kepada Mohallah tempat aktiviti itu berlaku.

3.2 Alamat Kediaman

- Ahbab boleh mendaftarkan lebih daripada satu alamat kediaman.
- Hanya satu alamat boleh berstatus aktif pada satu-satu masa.
- Ahbab sendiri memilih alamat aktif.
- Perubahan alamat aktif akan mengubah penempatan pentadbiran/Mohallah jika sistem dapat mengenal pasti Mohallah berkenaan.
- Sistem perlu memaklumkan Ahbab selepas perubahan.
- Sejarah alamat dan sejarah keahlian Mohallah mesti dikekalkan.

Jika sistem tidak dapat mengenal pasti Mohallah dengan yakin:

- Alamat masih boleh diaktifkan.
- Status penempatan menjadi "PENDING MOHALLAH ASSIGNMENT".
- Admin berkaitan dimaklumkan.
- Admin boleh menyelesaikan penempatan kemudian.
- Sistem merekodkan tarikh, pihak yang menyelesaikan dan sejarah perubahan.

3.3 Mohallah dan Halqah

- Setiap Mohallah hanya boleh berada di bawah satu Halqah aktif pada satu-satu masa.
- Hanya Admin mempunyai kuasa menukar penempatan Mohallah.
- Penempatan boleh berubah pada masa hadapan.
- Sistem mesti menyimpan sejarah penempatan, tarikh kuat kuasa, Admin yang membuat perubahan dan sebab perubahan.

Apabila Ahbab berpindah Mohallah, konteks Halqah Ahbab akan mengikuti Halqah yang ditetapkan kepada Mohallah baharu.

3.4 Halqah dan Zone

- Setiap Halqah boleh berada di bawah satu Zone atau tidak mempunyai Zone.
- Admin menentukan penempatan Halqah.
- Admin boleh menukar Zone atau menetapkan Halqah tanpa Zone.
- Semua perubahan mesti mempunyai sejarah, tarikh kuat kuasa, Admin dan sebab.

3.5 Zone dan Markaz Negeri

- Setiap Zone mesti berada di bawah satu Markaz Negeri.
- Zone tidak boleh wujud tanpa Markaz Negeri.
- Admin boleh memindahkan Zone ke Markaz Negeri lain.
- Sejarah perpindahan mesti dikekalkan.

3.6 Markaz Negeri dan Markaz Negara

- Setiap Markaz Negeri mesti berada di bawah satu Markaz Negara pada satu-satu masa.
- Markaz Negeri boleh mempunyai Halqah secara langsung tanpa Zone.
- Setiap negara mempunyai satu Markaz Negara rasmi.
- Jika sesebuah negara belum mempunyai Markaz Negara sendiri, negara tersebut boleh bernaung atau berafiliasi di bawah Markaz Negara negara lain.
- Negara yang bernaung masih merupakan negara berasingan dalam sistem.
- Negara naungan boleh berpindah kepada Markaz Negara lain.
- Sejarah hubungan, tarikh kuat kuasa, Admin yang meluluskan dan sebab perubahan mesti direkodkan.

Istilah "Negara Naungan" masih bersifat sementara dan belum dimuktamadkan.

4. Pentadbiran Negara dan Akses

4.1 SUPER_ADMIN

- Mempunyai akses global.
- Mengurus konfigurasi dan kawalan sistem global.
- Boleh melihat rekod seluruh negara.
- Semua tindakan pentadbiran direkodkan dalam audit log.

4.2 Markaz Negara Naungan

- Markaz Negara yang menaungi negara lain mempunyai akses penyeliaan terhadap negara naungan.
- Boleh melantik Admin tempatan bagi negara naungan.
- Boleh menjalankan fungsi penyeliaan mengikut kuasa yang ditetapkan.

4.3 Admin Negara Tempatan

- Mengurus pentadbiran negara sendiri.
- Tidak mempunyai kuasa pentadbiran terhadap negara lain.
- Akses terhad kepada negara yang ditugaskan kepadanya.
- Pelantikan dan penamatan tugas Admin direkodkan.

4.4 Negara sebagai Entiti Berasingan

- Setiap negara kekal sebagai entiti berasingan.
- Hubungan naungan tidak menggabungkan data negara.
- Rekod organisasi dan laporan negara mesti kekal boleh dikenal pasti mengikut negara masing-masing.

5. Struktur Kepimpinan dan Pentadbiran

Setiap peringkat daripada Markaz Negara hingga Mohallah mempunyai:

- Seorang Chief Admin.
- Seorang atau lebih Deputy Chief Admin.

Hanya seorang Chief Admin aktif dibenarkan bagi setiap peringkat organisasi pada satu-satu masa.

Bilangan Deputy Chief Admin tidak dihadkan kepada seorang.

5.1 Gelaran Kepimpinan

- Markaz Negeri: Chief Admin dikenali sebagai "Faisalah".
- Markaz Negara: boleh mempunyai "Amer Negara" atau struktur "Ahli Syura" dengan seorang "Faisalah".
- Zone, Halqah dan Mohallah: menggunakan prinsip Chief Admin dan Deputy Chief Admin.

5.2 Markaz Negara dengan Amer Negara

Jika sesebuah negara mempunyai Amer Negara:

- Amer Negara merupakan pihak yang membuat keputusan akhir.
- Tidak perlu mewujudkan Faisalah bagi fungsi keputusan akhir tersebut.

5.3 Markaz Negara dengan Ahli Syura

Jika sesebuah negara mempunyai beberapa Admin yang membentuk Ahli Syura:

- Salah seorang daripada mereka dipilih sebagai Faisalah.
- Ahli Syura memberikan pandangan, nasihat dan cadangan.
- Ahli Syura tidak mempunyai kuasa keputusan akhir secara individu.
- Faisalah membuat keputusan akhir.

6. Peranan Chief Admin

Chief Admin bertanggungjawab untuk:

- Menyelaras Admin Markaz dan Admin Syukbah.
- Memantau aktiviti dan laporan.
- Mengagihkan tugas pentadbiran.
- Memastikan keputusan yang diluluskan dilaksanakan.
- Memantau perkembangan organisasi.
- Menyediakan atau menyelaras laporan kepada peringkat lebih tinggi.

7. Peranan Deputy Chief Admin

- Membantu Chief Admin.
- Boleh menjalankan tugas sementara apabila Chief Admin tidak hadir, tidak aktif atau tidak dapat dihubungi.
- Chief Admin memilih Deputy yang akan memangku tugas.
- Jika Chief Admin tidak dapat membuat pilihan, Admin peringkat lebih tinggi menentukan pemangku.

Sistem perlu merekodkan:

- Deputy yang memangku.
- Tempoh pemangkuan.
- Skop kuasa.
- Pihak yang memberikan kuasa pemangkuan.
- Tarikh mula dan tamat.

8. Proses Cadangan dan Keputusan

Prinsip asas:

1. Cadangan dikemukakan kepada pihak kepimpinan berkaitan.
2. Ahli Syura memberikan pandangan atau nasihat jika berkenaan.
3. Amer Negara, Faisalah atau Chief Admin yang mempunyai kuasa membuat keputusan mengesahkan atau menolak cadangan.
4. Selepas keputusan disahkan, Admin Syukbah berkaitan menerima makluman.
5. Admin Syukbah mengurus pelaksanaan keputusan.

Status keputusan sekurang-kurangnya merangkumi:

- "APPROVED"
- "REJECTED"
- "RETURNED"

Keputusan mesti menyimpan:

- Kandungan cadangan.
- Pandangan dan nasihat Ahli Syura jika berkenaan.
- Keputusan akhir.
- Sebab keputusan.
- Pihak yang membuat keputusan.
- Tarikh dan masa.
- Sejarah tindakan susulan.

8.1 Pindaan atau Pembatalan Keputusan

Keputusan yang telah disahkan boleh dipinda atau dibatalkan oleh Amer Negara, Faisalah atau Chief Admin yang mempunyai kuasa berkaitan.

Sistem mesti:

- Meminta sebab pindaan atau pembatalan.
- Mengekalkan keputusan asal.
- Menyimpan keputusan baharu.
- Merekodkan pihak yang membuat perubahan.
- Merekodkan tarikh dan masa.
- Mengekalkan keseluruhan sejarah keputusan.

9. Pelantikan Admin

- Local Chief Admin mempunyai kuasa mengurus pelantikan dan penamatan Admin Syukbah dalam pentadbiran sendiri.
- Tidak memerlukan kelulusan tambahan daripada Amer, Faisalah atau Chief Admin peringkat lebih tinggi.
- Pelantikan dan penamatan mesti mempunyai rekod sejarah.

Mekanisme khusus pelantikan Chief Admin dan Deputy Chief Admin akan ditentukan oleh SUPER_ADMIN melalui konfigurasi sistem.

BELUM DIPUTUSKAN: Pihak yang mempunyai kuasa mencalonkan, memilih atau melantik Chief Admin dan Deputy Chief Admin bagi setiap peringkat.

10. Pengasingan Admin Markaz dan Admin Syukbah

Setiap peringkat Markaz mempunyai dua fungsi pentadbiran yang berasingan:

1. Admin Markaz.
2. Admin Syukbah.

Chief Admin menyelaras kedua-dua fungsi tersebut.

Admin Markaz bertanggungjawab terhadap urusan pentadbiran organisasi.

Admin Syukbah bertanggungjawab terhadap urusan Syukbah masing-masing.

11. Bantuan Silang Peringkat

- Admin daripada organisasi lain boleh membantu organisasi lain.
- Bantuan silang memerlukan persetujuan kedua-dua Chief Admin yang terlibat.
- Skop, tugasan, tempoh dan kedua-dua persetujuan mesti direkodkan.
- Akses sistem yang diberikan mestilah terhad kepada tugasan yang diluluskan.
- Akses kepada data sensitif hanya dibenarkan jika benar-benar diperlukan.
- Akses sementara tamat secara automatik apabila tempoh atau tugasan berakhir.
- Semua akses dan tindakan mesti direkodkan dalam audit log.

12. Laporan Organisasi

Laporan bergerak secara bottom-up:

- Ahbab / Individu
- Mohallah
- Halqah
- Zone
- Markaz Negeri
- Markaz Negara

Markaz Negara ialah peringkat pelaporan kebangsaan tertinggi.

Peraturan terperinci laporan, pengesahan, tempoh edit, penutupan dan ranking akan dirujuk dalam dokumen pengurusan laporan yang berkaitan.

13. Rekod Audit

Sistem perlu merekodkan sekurang-kurangnya:

- Perubahan struktur organisasi.
- Perpindahan organisasi.
- Pelantikan dan penamatan jawatan.
- Pemangkuan.
- Perubahan kuasa.
- Cadangan dan keputusan.
- Pindaan atau pembatalan keputusan.
- Bantuan silang.
- Akses sementara.
- Tindakan Admin.

Rekod audit tidak boleh diubah atau dipadam melalui operasi biasa.

14. Perkara Belum Dimuktamadkan

1. Istilah rasmi bagi negara yang bernaung di bawah Markaz Negara lain.
2. Mekanisme pelantikan Chief Admin dan Deputy Chief Admin.
3. Kaedah pemilihan Faisalah jika struktur Ahli Syura digunakan.
4. Perincian kuasa setiap jawatan mengikut peringkat.
5. Perincian aliran laporan dan pengesahan yang akan diselaraskan dengan dokumen laporan.

---

Nota pembangunan: Dokumen ini ialah baseline keperluan. Jangan membina fungsi yang masih berstatus BELUM DIPUTUSKAN tanpa pengesahan lanjut.
