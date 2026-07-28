import LegalPageLayout from "@/components/layout/LegalPageLayout";

export default function SyaratKetentuanPage() {
  return (
    <LegalPageLayout
      title="Syarat & Ketentuan"
      updatedAt="1 Juli 2026"
      sections={[
        {
          id: "definisi",
          title: "1. Definisi",
          body: (
            <p>
              &quot;Harmoni Clothing&quot; adalah platform print-on-demand dan marketplace desain
              yang dioperasikan untuk menghubungkan Pelanggan, Kreator, dan layanan produksi
              konveksi.
            </p>
          ),
        },
        {
          id: "akun-pengguna",
          title: "2. Akun Pengguna",
          body: (
            <p>
              Kamu bertanggung jawab menjaga kerahasiaan kredensial akunmu. Harmoni berhak
              menangguhkan akun yang terindikasi melakukan pelanggaran atau aktivitas mencurigakan.
            </p>
          ),
        },
        {
          id: "pemesanan-pembayaran",
          title: "3. Pemesanan & Pembayaran",
          body: (
            <p>
              Pesanan dianggap sah setelah pembayaran terverifikasi melalui payment gateway kami.
              Harga yang tertera sudah termasuk kontribusi desainer untuk produk dari Lapak
              Desain, belum termasuk ongkos kirim.
            </p>
          ),
        },
        {
          id: "hak-kreator",
          title: "4. Hak & Kewajiban Kreator",
          body: (
            <p>
              Kreator menjamin bahwa desain yang diunggah adalah karya asli atau memiliki hak
              penuh untuk mendistribusikannya. Harmoni berhak menolak atau menurunkan desain yang
              melanggar hak cipta atau kebijakan konten.
            </p>
          ),
        },
        {
          id: "pembatalan-pengembalian",
          title: "5. Pembatalan & Pengembalian",
          body: (
            <p>
              Pesanan dapat dibatalkan selama masih berstatus menunggu approval. Setelah memasuki
              tahap produksi, pembatalan mengikuti kebijakan retur yang berlaku sesuai kondisi
              produk.
            </p>
          ),
        },
        {
          id: "batasan-tanggung-jawab",
          title: "6. Batasan Tanggung Jawab",
          body: (
            <p>
              Harmoni tidak bertanggung jawab atas keterlambatan yang disebabkan oleh pihak
              ketiga (mitra logistik) di luar kendali kami.
            </p>
          ),
        },
        {
          id: "perubahan-ketentuan",
          title: "7. Perubahan Ketentuan",
          body: (
            <p>
              Ketentuan ini dapat diperbarui sewaktu-waktu. Penggunaan layanan setelah perubahan
              berlaku dianggap sebagai persetujuan atas ketentuan yang baru.
            </p>
          ),
        },
      ]}
    />
  );
}
