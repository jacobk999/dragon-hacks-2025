import { Dialog } from "radix-ui";
import { ReactNode } from "react";

export function Modal({ children }: { children: ReactNode }) {
  return (
    <Dialog.Root>
      {children}
    </Dialog.Root>
  )
}

export function ModalContent({ children }: { children: ReactNode }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/40" />
      <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg sm:rounded-lg">
        {children}
      </Dialog.Content>
    </Dialog.Portal >
  )
}

export const ModalTrigger = Dialog.Trigger;
export const ModalTitle = Dialog.Title;
export const ModalClose = Dialog.Close;
export const ModalDescription = Dialog.Description;