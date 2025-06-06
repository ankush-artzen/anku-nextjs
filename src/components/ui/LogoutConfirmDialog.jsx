"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/button";

export default function DeleteConfirm({ open, onConfirm, onCancel, onOpenChange }) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/30" />
        <AlertDialog.Content className="fixed bg-white p-6 rounded-md shadow-xl top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[90%] max-w-md">
          <AlertDialog.Title className="text-lg font-semibold text-gray-800">
            Wanna Logout?
          </AlertDialog.Title>

          <AlertDialog.Description className="text-sm text-gray-600 mt-2 mb-4">
            Are you sure you want to Logout?
          </AlertDialog.Description>

          <div className="flex justify-end gap-4">
            {/* Cancel button closes the dialog */}
            <Button
              variant="outline"
              onClick={() => {
                onCancel();
                onOpenChange(false);  // <---- CLOSE THE DIALOG HERE
              }}
            >
              Cancel
            </Button>

            {/* Confirm (Delete) button */}
            <AlertDialog.Action asChild>
              <Button
                className="bg-red-600 text-black hover:bg-red-700"
                onClick={onConfirm}
              >
                Logout
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
