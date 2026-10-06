import CategoryForm from "@/features/categories/components/CategoryForm";
import { Button, buttonVariants } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
interface CategoryDialogProps {
  buttonVariant?: VariantProps<typeof buttonVariants>["variant"];
  type: "INCOME" | "EXPENSE";
}
function CategoryFormPopover({
  buttonVariant = "default",
  type,
}: CategoryDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            aria-label="Crear categoría"
            variant={buttonVariant}
            className="flex min-h-11 items-center gap-1 rounded-lg border border-dashed border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Nueva</span>
          </Button>
        }
      />
      <PopoverContent className="w-64" align="center">
        <CategoryForm type={type} close={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}

export default CategoryFormPopover;
