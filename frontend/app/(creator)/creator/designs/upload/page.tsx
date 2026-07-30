"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import CreatorSidebar from "@/components/layout/CreatorSidebar";
import SidebarPageShell from "@/components/layout/SidebarPageShell";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import TagInput from "@/components/ui/TagInput";
import { createDesign } from "@/services/creator";
import { getErrorMessage } from "@/lib/api";
import { useProducts } from "@/hooks/useProducts";

export default function UploadDesainPage() {
  const t = useTranslations("creator.uploadDesign");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { data: productsData } = useProducts("all", { per_page: 100 });
  const products = productsData?.data ?? [];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleProduct(id: number) {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError(t("noFileError"));
      return;
    }
    if (selectedProducts.length === 0) {
      setError(t("noApparelError"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data: design } = await createDesign({
        title,
        description: description || undefined,
        file,
        product_ids: selectedProducts,
        tags,
      });
      router.push(`/creator/designs/${design.id}`);
    } catch (err) {
      setError(getErrorMessage(err, tCommon("errorGeneric")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SidebarPageShell sidebar={<CreatorSidebar />}>
      <div className="flex max-w-2xl flex-col gap-6">
        <h1 className="font-heading text-h3 font-semibold text-text-primary">{t("title")}</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-md border border-border bg-surface p-5">
          <Input label={t("fields.title")} value={title} onChange={(e) => setTitle(e.target.value)} required />
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-xs font-medium text-text-secondary">{t("fields.description")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-sm border border-border bg-surface px-3 py-2.5 font-body text-sm text-text-primary outline-none"
            />
          </div>

          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-sm border border-dashed border-border py-6 text-center">
            <Upload className="size-5 text-text-secondary" />
            <span className="font-body text-xs text-text-secondary">
              {file ? file.name : t("fileDropzone")}
            </span>
            <input
              type="file"
              accept="image/png,image/svg+xml"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>

          <div className="flex flex-col gap-2">
            <p className="font-body text-sm font-medium text-text-primary">{t("chooseApparel")}</p>
            <div className="flex flex-wrap gap-2">
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggleProduct(product.id)}
                  className={
                    selectedProducts.includes(product.id)
                      ? "rounded-full border border-accent bg-accent/10 px-3 py-1.5 font-body text-xs font-medium text-accent"
                      : "rounded-full border border-border px-3 py-1.5 font-body text-xs font-medium text-text-secondary"
                  }
                >
                  {product.name}
                </button>
              ))}
            </div>
          </div>

          <TagInput value={tags} onChange={setTags} />

          {error && <p className="font-body text-xs text-danger">{error}</p>}
          <Button type="submit" loading={loading}>
            {t("title")}
          </Button>
        </form>
      </div>
    </SidebarPageShell>
  );
}
