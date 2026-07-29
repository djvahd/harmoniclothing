import TestimonialCard from "@/components/ui/TestimonialCard";
import Reveal from "@/components/ui/Reveal";

const TESTIMONIALS = [
  {
    quote: "Kualitas produknya keren, sablonnya rapi dan bahannya nyaman dipakai.",
    name: "Dimas Alfarizi",
    role: "Founder Local Brand",
    rating: 5,
  },
  {
    quote: "Proses custom desainnya gampang banget, hasilnya sesuai ekspektasi.",
    name: "Sarah Amelia",
    role: "Mahasiswa",
    rating: 5,
  },
  {
    quote: "Pengiriman cepat dan tim CS-nya responsif kalau ada kendala.",
    name: "Rizky Ramadhan",
    role: "Pemilik Toko Online",
    rating: 4,
  },
  {
    quote: "Beli desain dari Lapak Desain terus tinggal cetak ke produk, praktis banget.",
    name: "Nadia Kirana",
    role: "Content Creator",
    rating: 5,
  },
  {
    quote: "Order bulk buat acara komunitas lancar, harga per pcs jadi jauh lebih murah.",
    name: "Fajar Nugroho",
    role: "Ketua Komunitas Motor",
    rating: 5,
  },
  {
    quote: "Sebagai kreator, royalti dari desain yang kejual kelihatan jelas di dashboard.",
    name: "Bella Anastasya",
    role: "Kreator Desain",
    rating: 4,
  },
  {
    quote: "Bahan hoodie-nya tebal dan sablonnya awet, udah dicuci berkali-kali masih bagus.",
    name: "Yoga Pratama",
    role: "Pemilik Clothing Line",
    rating: 5,
  },
  {
    quote: "Revisi desain gampang lewat editor, nggak perlu bolak-balik chat admin.",
    name: "Putri Wulandari",
    role: "Event Organizer",
    rating: 4,
  },
];

/** The auto-scrolling social-proof marquee. */
export default function TestimonialsSection() {
  return (
    <section className="py-16">
      <Reveal className="flex w-full flex-col items-center gap-2">
        <p className="font-body text-caption font-bold uppercase tracking-[0.6px] text-primary">
          Apa Kata Mereka
        </p>
        <h2 className="text-center font-heading text-h3 font-semibold text-text-primary md:text-h2">
          Dipercaya Banyak Kreator & Brand
        </h2>
        <div className="mx-auto w-full max-w-[1440px] overflow-hidden px-4 [mask-image:linear-gradient(to_right,transparent_0%,black_5%,black_95%,transparent_100%)] md:px-20">
          <div className="flex w-max animate-marquee gap-6 hover:[animation-play-state:paused]">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <TestimonialCard key={`${t.name}-${i}`} {...t} />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
