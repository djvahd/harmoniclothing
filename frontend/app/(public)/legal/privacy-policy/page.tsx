import type { Metadata } from "next";
import LegalPageLayout from "@/components/layout/LegalPageLayout";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan privasi Harmoni Clothing: data yang kami kumpulkan dan cara kami menggunakannya.",
};

export default function KebijakanPrivasiPage() {
  return (
    <LegalPageLayout
      title="Kebijakan Privasi"
      updatedAt="1 Juli 2026"
      sections={[
        {
          id: "data-yang-dikumpulkan",
          title: "1. Data yang Kami Kumpulkan",
          body: (
            <>
              <p>
                Kami mengumpulkan data yang kamu berikan langsung saat mendaftar dan menggunakan
                layanan Harmoni Clothing, meliputi: nama, alamat email, nomor telepon, alamat
                pengiriman, dan data pembayaran yang diproses melalui mitra payment gateway kami.
              </p>
              <p>
                Untuk Kreator, kami juga mengumpulkan data verifikasi identitas (KTP dan swafoto)
                yang diperlukan untuk proses KYC (Know Your Customer) sebelum akun Kreator
                diaktifkan.
              </p>
            </>
          ),
        },
        {
          id: "penggunaan-data",
          title: "2. Penggunaan Data",
          body: (
            <p>
              Data yang kami kumpulkan digunakan untuk memproses pesanan, komunikasi terkait
              status pesanan, verifikasi akun Kreator, pencairan komisi, serta peningkatan
              layanan. Kami tidak menjual data pribadimu ke pihak ketiga untuk kepentingan
              pemasaran.
            </p>
          ),
        },
        {
          id: "berbagi-data",
          title: "3. Berbagi Data dengan Pihak Ketiga",
          body: (
            <p>
              Data pengiriman dibagikan kepada mitra logistik untuk keperluan pengantaran produk.
              Data pembayaran diproses melalui payment gateway terverifikasi (Midtrans) sesuai
              standar keamanan industri, kami tidak menyimpan detail kartu pembayaranmu.
            </p>
          ),
        },
        {
          id: "keamanan-data",
          title: "4. Keamanan Data",
          body: (
            <p>
              Kami menerapkan enkripsi, autentikasi berbasis sesi, dan pembatasan akses internal
              untuk melindungi data pribadimu dari akses yang tidak sah.
            </p>
          ),
        },
        {
          id: "hak-pengguna",
          title: "5. Hak Pengguna",
          body: (
            <p>
              Kamu berhak mengakses, memperbarui, atau meminta penghapusan data pribadimu dengan
              menghubungi tim dukungan kami melalui Pusat Bantuan.
            </p>
          ),
        },
        {
          id: "perubahan-kebijakan",
          title: "6. Perubahan Kebijakan",
          body: (
            <p>
              Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan signifikan akan
              diinformasikan melalui email atau notifikasi di dalam platform.
            </p>
          ),
        },
      ]}
    />
  );
}
