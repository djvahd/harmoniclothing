import Logo from "./Logo";

const FOOTER_COLUMNS = [
  {
    title: "PRODUK",
    links: [
      { href: "/catalog?kategori=t-shirt", label: "T-Shirt" },
      { href: "/catalog?kategori=hoodie", label: "Hoodie" },
      { href: "/catalog?kategori=jacket", label: "Jacket" },
    ],
  },
  {
    title: "BANTUAN",
    links: [
      { href: "/faq", label: "FAQ" },
      { href: "/pusat-bantuan", label: "Pusat Bantuan" },
      { href: "/kontak", label: "Kontak" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="flex w-full flex-col gap-6 bg-primary px-4 py-6 md:px-20">
      <div className="flex flex-col gap-10 md:flex-row md:gap-16">
        <div className="flex flex-col gap-1.5">
          <Logo variant="white" />
          <p className="w-[200px] font-body text-xs text-text-on-accent">
            Platform konveksi modern untuk kreator dan brand.
          </p>
        </div>
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title} className="flex flex-col gap-2">
            <p className="font-body text-xs font-bold text-text-on-accent">{column.title}</p>
            {column.links.map((link) => (
              <a key={link.href} href={link.href} className="font-body text-xs text-text-on-accent">
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="h-px w-full bg-text-on-accent/40" />
      <p className="font-body text-caption text-text-on-accent">
        © 2026 Harmoni Clothing. All rights reserved.
      </p>
    </footer>
  );
}
