import { Dialog } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "~/lib/util";
import { AnimatePresence, motion } from "motion/react";

export function Modal({ children, ...props }: ComponentProps<typeof Dialog.Root>) {
  return (
    <Dialog.Root {...props}>
      {children}
    </Dialog.Root>
  )
}

export function ModalContent({ children }: { children: ReactNode }) {
  return (
    <AnimatePresence>
      <Dialog.Portal>
        <Dialog.Overlay asChild className="fixed inset-0 bg-black/10 backdrop-blur-[2px] transition-all">
          <motion.div />
        </Dialog.Overlay>
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] flex flex-col gap-4 bg-white/80 backdrop-blur-2xl p-6 shadow-lg rounded-2xl">
          {children}
        </Dialog.Content>
      </Dialog.Portal >
    </AnimatePresence>
  )
}

export const ModalTrigger = Dialog.Trigger;

export const ModalTitle = ({ className, ...props }: ComponentProps<typeof Dialog.Title>) => <Dialog.Title {...props} className={cn("font-bold text-2xl text-slate-700", className)} />

export const ModalClose = Dialog.Close;
export const ModalDescription = Dialog.Description;