"use client";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FormDialog } from "@/components/ui/form-dialog";
import { TransactionForm, TransactionType } from "./TransactionForm";
export function EditTransactionDialog({
  item,
  close,
}: {
  item: TransactionType | null;
  close: () => void;
}) {
  return (
    <FormDialog
      open={Boolean(item)}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar movimiento</DialogTitle>
          <DialogDescription>
            Revisá los datos antes de guardar.
          </DialogDescription>
        </DialogHeader>
        {item && (
          <TransactionForm
            key={item.id}
            isOpen
            initialData={item}
            closeForm={close}
          />
        )}
      </DialogContent>
    </FormDialog>
  );
}
