import { ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        {children}
        <button
          onClick={() => onOpenChange(false)}
          className="mt-4 text-gray-600 hover:text-gray-800"
        >
          Close
        </button>
      </div>
    </div>
  );
};
