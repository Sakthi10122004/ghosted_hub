import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const useAlert = () => {
  const [promise, setPromise] = useState<{ resolve: () => void } | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const alert = (title: string, message: string) => {
    setTitle(title);
    setMessage(message);
    return new Promise<void>((resolve) => {
      setPromise({ resolve });
    });
  };

  const handleClose = () => {
    if (promise) {
      promise.resolve();
      setPromise(null);
    }
  };

  const AlertDialogComponent = () => (
    <AlertDialog open={promise !== null} onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-xl">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-[14px]">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogAction onClick={handleClose} className="font-mono uppercase tracking-widest text-[11px] bg-primary text-primary-foreground hover:bg-primary/90">
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return [AlertDialogComponent, alert] as const;
};
