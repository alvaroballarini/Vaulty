"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./dialog";
import { Button } from "./button";
const FormGuard = createContext<{
  update: (dirty: boolean, busy: boolean) => void;
  cancel: () => void;
} | null>(null);

export function FormDialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const status = useRef({ dirty: false, busy: false });
  const [confirm, setConfirm] = useState(false);
  const update = useCallback((dirty: boolean, busy: boolean) => {
    status.current = { dirty, busy };
  }, []);
  const cancel = useCallback(() => {
    if (status.current.busy) return;
    if (status.current.dirty) setConfirm(true);
    else onOpenChange(false);
  }, [onOpenChange]);
  return (
    <FormGuard.Provider value={{ update, cancel }}>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (next) onOpenChange(true);
          else cancel();
        }}
      >
        {children}
      </Dialog>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Descartar los cambios?</DialogTitle>
            <DialogDescription>
              Todavía no guardaste esta edición. Podés seguir revisándola o
              salir sin guardar.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirm(false)}>
              Seguir editando
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirm(false);
                status.current = { dirty: false, busy: false };
                onOpenChange(false);
              }}
            >
              Descartar cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </FormGuard.Provider>
  );
}
export function useFormGuard(dirty: boolean, busy: boolean) {
  const context = useContext(FormGuard);
  const update = context?.update;
  useEffect(() => {
    update?.(dirty, busy);
    return () => update?.(false, false);
  }, [update, dirty, busy]);
  useEffect(() => {
    if (!dirty && !busy) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, busy]);
  return context?.cancel;
}
