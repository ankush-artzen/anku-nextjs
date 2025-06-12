"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/button";

export default function ConfirmDialog({ 
  open, 
  onConfirm, 
  onCancel = () => {},  
  onOpenChange, 
  title = "Are you sure?", 
  description = "Are you sure you want to proceed?", 
  confirmLabel = "Confirm" 
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/30" />
        <AlertDialog.Content className="fixed bg-white p-6 rounded-md shadow-xl top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[90%] max-w-md">
          <AlertDialog.Title className="text-lg font-semibold text-gray-800">
            {title}
          </AlertDialog.Title>

          <AlertDialog.Description className="text-sm text-gray-600 mt-2 mb-4">
            {description}
          </AlertDialog.Description>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => {
                onCancel();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>

            <AlertDialog.Action asChild>
              <Button
                className="bg-red-600 text-black hover:bg-red-700"
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
