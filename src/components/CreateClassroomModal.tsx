import React, { useState, useCallback } from "react";
import { Dialog } from "../components/Dialog";
import Button from "../components/Button";
import Input from "../components/Input";
import { Toast } from "../components/Toast";
import { AnimatePresence, motion } from "framer-motion";

interface CreateClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { title: string; description: string; capacity: number }) => Promise<void>;
  primaryColor?: string;
  dangerColor?: string;
}

// Motion variants for overlay and modal
const overlayVariants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: { opacity: 1, backdropFilter: "blur(6px)" },
  exit: { opacity: 0, backdropFilter: "blur(0px)" },
};
const modalVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const CreateClassroomModal: React.FC<CreateClassroomModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  primaryColor = '#0065ea',
  dangerColor = '#dc2626',
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      setToast({ message: "Class title is required", type: "error" });
      return;
    }
    if (title.length > 30) {
      setToast({ message: "Title cannot exceed 30 characters", type: "error" });
      return;
    }
    if (!capacity || isNaN(Number(capacity))) {
      setToast({ message: "Capacity must be a valid number", type: "error" });
      return;
    }
    try {
      await onCreate({ title: title.trim(), description: description.trim(), capacity: Number(capacity) });
      setToast({ message: "Classroom created successfully!", type: "success" });
      setTimeout(() => {
        setToast(null);
        onClose();
        setTitle("");
        setDescription("");
        setCapacity("");
      }, 1000);
    } catch (error) {
      console.error("Error creating classroom:", error);
      setToast({ message: "Failed to create classroom", type: "error" });
    }
  }, [title, description, capacity, onCreate, onClose]);

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            onClick={onClose}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-xl w-96 max-w-full"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-4">Create Classroom</h2>

              <Input
                label="Title"
                value={title}
                onChange={e => setTitle(e.target.value.slice(0, 30))}
                placeholder="Enter class title"
                type="text"
                name="title"
                maxLength={30}
              />

              <textarea
                placeholder="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-2 mb-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                rows={4}
              />

              <Input
                label="Capacity"
                value={capacity}
                onChange={e => setCapacity(e.target.value)}
                placeholder="Enter class capacity"
                type="number"
                name="capacity"
              />

              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  onClick={onClose}
                  className="px-4 py-2 rounded-md transition"
                  style={{ backgroundColor: dangerColor, color: '#fff' }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded-md transition"
                  style={{ backgroundColor: primaryColor, color: '#fff' }}
                >
                  Create
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
