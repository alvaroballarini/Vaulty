"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DashboardType } from "@/features/dashboard/type";
import { markProductTourSeen } from "../service/markProductTourSeen";
import { readTourReceipt, writeTourReceipt } from "../tour-storage";
import { tourSteps } from "../tour-steps";
import { getTourLayout } from "../tour-layout";

export function ProductTour({
  user,
  replayRequest,
}: {
  user: DashboardType["user"];
  replayRequest: number;
}) {
  const pathname = usePathname();
  const cache = useQueryClient();
  const initialized = useRef(false);
  const handledReplay = useRef(replayRequest);
  const syncing = useRef(false);
  const restoreFocus = useRef(true);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    let frame = 0;
    async function acknowledge() {
      if (syncing.current) return;
      syncing.current = true;
      try {
        const result = await markProductTourSeen();
        if (!result.ok) return;
        writeTourReceipt(user.id, "synced");
        cache.setQueryData<DashboardType>(["dashboard"], (data) =>
          data?.user.id === user.id
            ? {
                ...data,
                user: { ...data.user, productTourSeenAt: result.seenAt },
              }
            : data,
        );
      } catch {
        // A network failure must not interrupt the tour or reopen it on reload.
      } finally {
        syncing.current = false;
      }
    }
    function start(afterStart?: () => void) {
      frame = requestAnimationFrame(() => {
        restoreFocus.current = true;
        setStep(0);
        setOpen(true);
        afterStart?.();
      });
    }
    if (pathname !== "/") {
      frame = requestAnimationFrame(() => setOpen(false));
    } else if (replayRequest !== handledReplay.current) {
      start(() => {
        handledReplay.current = replayRequest;
      });
    } else if (!initialized.current) {
      const receipt = readTourReceipt(user.id);
      if (!user.productTourSeenAt && !receipt) {
        start(() => {
          initialized.current = true;
          writeTourReceipt(user.id, "pending");
          void acknowledge();
        });
      } else {
        initialized.current = true;
        if (user.productTourSeenAt) writeTourReceipt(user.id, "synced");
        else void acknowledge();
      }
    }
    return () => cancelAnimationFrame(frame);
  }, [pathname, replayRequest, user.id, user.productTourSeenAt, cache]);

  return (
    <>
      {open && pathname === "/" && <div aria-hidden="true" className="h-dvh" />}
      <Dialog.Root
        open={open && pathname === "/"}
        modal={false}
        onOpenChange={(nextOpen, details) => {
          restoreFocus.current =
            details.reason !== "outside-press" &&
            details.reason !== "focus-out";
          setOpen(nextOpen);
        }}
      >
        <Dialog.Portal>
          {open && pathname === "/" && (
            <TourStep
              step={step}
              onStep={setStep}
              onFinish={() => setOpen(false)}
              restoreFocus={() => restoreFocus.current}
            />
          )}
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function TourStep({
  step,
  onStep,
  onFinish,
  restoreFocus,
}: {
  step: number;
  onStep: (step: number) => void;
  onFinish: () => void;
  restoreFocus: () => boolean;
}) {
  const item = tourSteps[step];
  const last = step === tourSteps.length - 1;
  const maskId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [layout, setLayout] = useState<ReturnType<typeof getTourLayout> | null>(
    null,
  );

  useLayoutEffect(() => {
    if (copyRef.current) copyRef.current.scrollTop = 0;
    const target = document.querySelector<HTMLElement>(
      `[data-tour="${item.target}"]`,
    );
    let frame = 0;
    let first = true;
    function measure() {
      const card = cardRef.current;
      if (!card) return;
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      if (first && target) {
        first = false;
        const bounds = target.getBoundingClientRect();
        const offset =
          viewport.width < 1100
            ? 24
            : Math.max(24, (viewport.height - bounds.height) / 3);
        window.scrollTo({
          top: Math.max(0, window.scrollY + bounds.top - offset),
          behavior: "instant",
        });
      }
      const bounds = target?.getBoundingClientRect();
      setLayout(
        getTourLayout(
          bounds && bounds.width && bounds.height ? bounds : null,
          viewport,
          card.offsetHeight,
        ),
      );
    }
    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    }
    const observer = new ResizeObserver(schedule);
    if (target) observer.observe(target);
    if (cardRef.current) observer.observe(cardRef.current);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    schedule();
    titleRef.current?.focus({ preventScroll: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
    };
  }, [item.target]);

  const spotlight = layout?.spotlight;
  return (
    <>
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
      >
        <defs>
          <mask id={maskId}>
            <rect width="100%" height="100%" fill="white" />
            {spotlight && (
              <rect
                x={spotlight.left}
                y={spotlight.top}
                width={spotlight.width}
                height={spotlight.height}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgb(3 9 6 / 0.72)"
          mask={`url(#${maskId})`}
        />
        {spotlight && (
          <rect
            data-tour-spotlight
            x={spotlight.left}
            y={spotlight.top}
            width={spotlight.width}
            height={spotlight.height}
            rx="12"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
          />
        )}
      </svg>
      <Dialog.Popup
        ref={cardRef}
        data-product-tour
        data-tour-target={item.target}
        className="vaulty-tour-card"
        style={layout?.card}
        initialFocus={titleRef}
        finalFocus={() =>
          restoreFocus()
            ? document.querySelector<HTMLElement>("[data-tour-profile]")
            : false
        }
      >
        <Dialog.Close
          render={
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 text-muted-foreground"
            />
          }
          aria-label="Cerrar recorrido"
        >
          <X className="size-4" />
        </Dialog.Close>
        <div
          aria-live="polite"
          aria-atomic="true"
          className="flex min-h-0 flex-col"
        >
          <Dialog.Title
            ref={titleRef}
            tabIndex={-1}
            className="shrink-0 pr-8 text-xl font-semibold leading-snug tracking-tight outline-none"
          >
            {item.title}
          </Dialog.Title>
          <div
            ref={copyRef}
            tabIndex={0}
            role="region"
            aria-label="Instrucciones del paso"
            className="mt-3 min-h-0 overflow-y-auto rounded-sm"
          >
            <Dialog.Description className="text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </Dialog.Description>
            <p className="mt-3 text-xs leading-relaxed text-primary">
              {item.hint}
            </p>
          </div>
          <p className="sr-only">
            Paso {step + 1} de {tourSteps.length}
          </p>
        </div>
        <div
          aria-hidden="true"
          className="mt-4 flex shrink-0 items-center gap-3"
        >
          <div className="flex flex-1 gap-1.5">
            {tourSteps.map((_, index) => (
              <span
                key={index}
                className={`h-1 flex-1 rounded-full ${index <= step ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">
            {step + 1} / {tourSteps.length}
          </span>
        </div>
        <div className="mt-3 flex shrink-0 items-center gap-2">
          <Dialog.Close
            aria-label="Omitir recorrido"
            render={
              <Button variant="ghost" className="px-2 text-muted-foreground" />
            }
          >
            Omitir
          </Dialog.Close>
          <div className="ml-auto flex gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                size="icon"
                aria-label="Atrás"
                onClick={() => onStep(step - 1)}
              >
                <ArrowLeft />
              </Button>
            )}
            <Button onClick={() => (last ? onFinish() : onStep(step + 1))}>
              {last ? "Empezar" : "Siguiente"}
              {last ? <Check /> : <ArrowRight />}
            </Button>
          </div>
        </div>
      </Dialog.Popup>
    </>
  );
}
