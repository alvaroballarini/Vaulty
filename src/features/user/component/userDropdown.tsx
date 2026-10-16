"use client";
import { useState } from "react";
import { logoutService } from "@/features/auth/service/auth.service";
import { LogOut, UserRound, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
export default function UserDropdown({
  user,
  onStartTour,
}: {
  user?: { name: string | null; email: string };
  onStartTour?: () => void;
}) {
  const router = useRouter();
  const cache = useQueryClient();
  const [leaving, setLeaving] = useState(false);
  async function logout() {
    setLeaving(true);
    try {
      await logoutService();
      cache.clear();
      router.replace("/login");
    } catch {
      toast.error("No se pudo cerrar la sesión. Intentá nuevamente.");
      setLeaving(false);
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label="Mi perfil"
            data-tour-profile
            variant="ghost"
            className="size-11 rounded-full border border-border bg-secondary p-0"
          >
            <UserRound className="size-5 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-64 p-2">
        <div className="px-3 py-2">
          <p className="font-medium">{user?.name || "Mi cuenta"}</p>
          <p className="mt-1 break-all text-xs text-muted-foreground">
            {user?.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={leaving || !onStartTour}
          onClick={onStartTour}
        >
          <CircleHelp className="size-4" />
          Ver recorrido guiado
        </DropdownMenuItem>
        <DropdownMenuItem disabled={leaving} onClick={logout}>
          <LogOut className="size-4" />
          {leaving ? "Cerrando sesión…" : "Cerrar sesión"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
