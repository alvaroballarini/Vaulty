import { cn } from "@/lib/utils";
import createCategoryService from "../service/createCategoryService";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  LucideIcon,
  ShoppingCart,
  Home,
  Car,
  Wallet,
  Gamepad2,
  Plane,
  Gift,
  Utensils,
  Heart,
  Laptop,
} from "lucide-react";
import { Button } from "@/components/ui/button";
interface CategoryFormProps {
  type: "INCOME" | "EXPENSE";
  close?: () => void;
}
function CategoryForm({ type, close }: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [form, setForm] = useState({
    name: "",
    color: "#10b981",
    icon: "Wallet",
  });
  const queryClient = useQueryClient();

  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (isLoading) return;
    if (!form.name.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    setIsLoading(true);
    try {
      await createCategoryService({
        ...form,
        type,
      });

      queryClient.invalidateQueries({
        queryKey: ["category"],
      });

      toast.success("Categoría creada");

      close?.();
    } catch {
      toast.error("Hubo un error al crear la categoría");
    }
    setIsLoading(false);
  };
  const isValid =
    form.name.length > 0 &&
    form.color.length > 0 &&
    form.icon.length > 0 &&
    !isLoading;
  return (
    <div className="mt-4 flex flex-col gap-4">
      <div>
        <label
          htmlFor="category-name"
          className="mb-1.5 block text-xs font-medium text-muted-foreground"
        >
          Nombre
        </label>
        <input
          id="category-name"
          ref={inputRef}
          value={form.name}
          onChange={(e) => {
            setForm((prev) => ({
              ...prev,
              name: e.target.value,
            }));
            setError(null);
          }}
          placeholder="Ej. Suscripciones"
          className="h-11 w-full rounded-xl border border-border bg-secondary px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary"
        />
        {error && <p className="mt-1.5 text-xs text-primary">{error}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium">Color</label>

        <input
          aria-label="Color de la categoría"
          type="color"
          value={form.color}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              color: e.target.value,
            }))
          }
          className="h-11 w-full cursor-pointer rounded-xl border"
        />
      </div>
      <div className="grid grid-cols-5 gap-1">
        {icons.map((icon) => (
          <button
            key={icon.name}
            aria-label={icon.name}
            aria-pressed={form.icon === icon.name}
            type="button"
            onClick={() =>
              setForm((prev) => ({
                ...prev,
                icon: icon.name,
              }))
            }
            className={cn(
              "flex h-10 w-full items-center justify-center rounded-lg border",
              form.icon === icon.name && "border-primary bg-primary/10",
            )}
          >
            <DynamicIcon name={icon.name} />
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
          className="h-11 flex-[1.5] rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Añadir categoría
        </Button>
      </div>
    </div>
  );
}

export default CategoryForm;
const icons = [
  { name: "ShoppingCart", Icon: ShoppingCart },
  { name: "Home", Icon: Home },
  { name: "Car", Icon: Car },
  { name: "Wallet", Icon: Wallet },
  { name: "Gamepad2", Icon: Gamepad2 },
  { name: "Plane", Icon: Plane },
  { name: "Gift", Icon: Gift },
  { name: "Utensils", Icon: Utensils },
  { name: "Heart", Icon: Heart },
  { name: "Laptop", Icon: Laptop },
] as const;

export type IconName = (typeof icons)[number]["name"];

interface DynamicIconProps {
  name: IconName;
  className?: string;
}

function DynamicIcon({ name, className }: DynamicIconProps) {
  const icon = icons.find((item) => item.name === name);
  if (!icon) return null;

  const Icon: LucideIcon = icon.Icon;

  return <Icon className={className} />;
}
