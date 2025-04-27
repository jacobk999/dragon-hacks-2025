import { Dialog } from "radix-ui";
import { createContext, useContext, type ComponentProps, type ReactNode } from "react";
import { cn } from "~/lib/util";
import { AnimatePresence, motion } from "motion/react";
import { useControlled } from "~/lib/hooks";

const ModalContext = createContext({
  open: false
})

export function Modal({
  children,
  open: controlledOpen,
  onOpenChange: controlledOpenChange,
  defaultOpen = false,
  ...props }: ComponentProps<typeof Dialog.Root>) {
  const [open, onOpenChange] = useControlled({
    controlled: controlledOpen,
    onChange: controlledOpenChange,
    defaultValue: defaultOpen,
  });

  return (
    <Dialog.Root {...props} onOpenChange={onOpenChange}>
      <ModalContext value={{ open }}>
        {children}
      </ModalContext>
    </Dialog.Root>
  )
}

export function ModalContent({ children, className }: { children: ReactNode; className?: string }) {
  const { open } = useContext(ModalContext);
  const animationDuration = 0.1;

  return (
    <AnimatePresence propagate>
      {open && <Dialog.Portal forceMount>
        <Dialog.Overlay asChild>
          <motion.div
            className="fixed inset-0 bg-black/10 z-30"
            variants={{
              open: {
                opacity: 1,
                backdropFilter: "blur(2px)",
              },
              closed: {
                opacity: 0,
                backdropFilter: "blur(0px)",
              },
            }}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ duration: animationDuration }}
          />
        </Dialog.Overlay>
        <Dialog.Content forceMount asChild>
          <motion.div
            variants={{
              open: { opacity: 1, backdropFilter: "blur(40px)" },
              closed: { opacity: 0, backdropFilter: "blur(0px)" },
            }}
            initial="closed"
            animate="open"
            exit="closed"
            className={cn("fixed left-1/2 top-1/2 -translate-x-[50%] -translate-y-[50%] z-50 w-full max-w-lg flex flex-col gap-4 bg-white/80 p-6 shadow-lg rounded-2xl", className)}
            transition={{ duration: animationDuration }}
          >
            {children}
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal >
      }
    </AnimatePresence>
  )
}

export const ModalTrigger = Dialog.Trigger;

export const ModalTitle = ({ className, ...props }: ComponentProps<typeof Dialog.Title>) => <Dialog.Title {...props} className={cn("font-bold text-2xl text-slate-700", className)} />

export const ModalClose = Dialog.Close;
export const ModalDescription = Dialog.Description;