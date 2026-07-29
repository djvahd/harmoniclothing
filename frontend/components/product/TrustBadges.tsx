import { Award, ShieldCheck, Zap } from "lucide-react";

export default function TrustBadges() {
  return (
    <div className="flex flex-wrap gap-5 border-t border-border pt-4">
      <div className="flex items-center gap-2 font-body text-xs text-text-secondary">
        <Zap className="size-4 text-primary" />
        Produksi Cepat
      </div>
      <div className="flex items-center gap-2 font-body text-xs text-text-secondary">
        <Award className="size-4 text-primary" />
        Kualitas Premium
      </div>
      <div className="flex items-center gap-2 font-body text-xs text-text-secondary">
        <ShieldCheck className="size-4 text-primary" />
        Garansi Kepuasan
      </div>
    </div>
  );
}
