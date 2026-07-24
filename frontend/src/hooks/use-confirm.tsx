import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const useConfirm = () => {
  const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const confirm = (title: string, message: string) => {
    setTitle(title);
    setMessage(message);
    return new Promise<boolean>((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleClose = () => setPromise(null);

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    promise?.resolve(true);
    handleClose();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    promise?.resolve(false);
    handleClose();
  };

  const ConfirmationDialog = () => (
    <AlertDialog open={promise !== null} onOpenChange={(open) => {
      if (!open && promise) {
        promise.resolve(false);
        handleClose();
      }
    }}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-xl">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-[14px]">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel onClick={handleCancel} className="font-mono uppercase tracking-widest text-[11px]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono uppercase tracking-widest text-[11px]">
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return [ConfirmationDialog, confirm] as const;
};
