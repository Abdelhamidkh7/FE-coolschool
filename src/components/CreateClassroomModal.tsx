import { useState, useCallback } from "react";
import { Dialog } from "../components/Dialog";
import Button from "../components/Button";
import Input from "../components/Input";
import { Toast } from "../components/Toast";

export const CreateClassroomModal = ({ isOpen, onClose, onCreate }: any) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      setToast({ message: "Class title is required", type: "error" });
      return;
    }

    if (!capacity || isNaN(Number(capacity))) {
      setToast({ message: "Capacity must be a valid number", type: "error" });
      return;
    }

    try {
      console.log("Creating classroom with:", { title, description, capacity: Number(capacity) });
      await onCreate({ title, description, capacity: Number(capacity) });

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
      <Dialog open={isOpen} onOpenChange={onClose}>
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-lg font-semibold mb-4">Create Classroom</h2>

            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter class title"
              type="text"
              name="title"
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 mb-3 border rounded-md"
            />

            <Input
              label="Capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Enter class capacity"
              type="number"
              name="capacity"
            />

            <div className="flex justify-end space-x-2 mt-4">
              <Button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded-md">
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded-md">
                Create
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};
