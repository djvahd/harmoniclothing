const ROWS = [
  ["S", "46", "66"],
  ["M", "49", "69"],
  ["L", "52", "72"],
  ["XL", "55", "75"],
  ["XXL", "58", "78"],
];

export default function SizeChartTable() {
  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full font-body text-sm">
        <thead>
          <tr className="border-b border-border bg-surface text-left text-text-secondary">
            <th className="px-3 py-2 font-medium">Ukuran</th>
            <th className="px-3 py-2 font-medium">Lebar Dada (cm)</th>
            <th className="px-3 py-2 font-medium">Panjang (cm)</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map(([s, chest, length]) => (
            <tr key={s} className="border-b border-border last:border-0">
              <td className="px-3 py-2 text-text-primary">{s}</td>
              <td className="px-3 py-2 text-text-secondary">{chest}</td>
              <td className="px-3 py-2 text-text-secondary">{length}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-border bg-surface px-3 py-2 font-body text-xs text-text-secondary">
        Ukuran umum, dapat berbeda tipis tergantung jenis produk.
      </p>
    </div>
  );
}
