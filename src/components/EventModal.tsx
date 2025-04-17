import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

interface EventModalProps {
  event: any;
  onClose: () => void;
  onSaved: () => void;
  isEdit: boolean;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose, onSaved, isEdit }) => {
  const [formData, setFormData] = useState({
    title: event?.title || "",
    description: event?.description || "",
    startTime: event?.startTime || "",
    endTime: event?.endTime || "",
  });

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (isEdit && event?.id) {
        await axios.put(`http://localhost:8080/api/calendar/events/${event.id}`, formData, { headers });
        toast.success("Event updated");
      } else {
        await axios.post("http://localhost:8080/api/calendar/events", formData, { headers });
        toast.success("Event created");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error("Error saving event");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">{isEdit ? "Edit Event" : "New Event"}</h2>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full mb-2 p-2 border rounded"
        />
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="datetime-local"
          name="startTime"
          value={formData.startTime}
          onChange={handleChange}
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="datetime-local"
          name="endTime"
          value={formData.endTime}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded">
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
