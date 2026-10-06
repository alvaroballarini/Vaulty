import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { VariantProps } from "class-variance-authority";
import { RecurringTransactionForm } from "./RecurringTransactionForm";
interface RecurringTransactionDialogProps {
  buttonVariant?: VariantProps<typeof buttonVariants>["variant"];
}
export function RecurringTransactionDialog({
  buttonVariant = "default",
}: RecurringTransactionDialogProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            variant={buttonVariant}
            className="flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground w-full"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Nueva</span>
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva actividad programada</DialogTitle>
        </DialogHeader>

        <RecurringTransactionForm
          isOpen={isOpen}
          closeForm={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
