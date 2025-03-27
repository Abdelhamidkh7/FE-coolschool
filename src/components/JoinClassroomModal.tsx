import React, { useState } from "react";

interface JoinClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (accessCode: string) => void;
}

const JoinClassroomModal: React.FC<JoinClassroomModalProps> = ({ isOpen, onClose, onJoin }) => {
  const [accessCode, setAccessCode] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-80">
        <h2 className="text-lg font-semibold mb-4">Join a Classroom</h2>
        <input
          type="text"
          placeholder="Enter Access Code"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          className="w-full p-2 mb-3 border rounded-md"
        />
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded-md">Cancel</button>
          <button onClick={() => onJoin(accessCode)} className="px-4 py-2 bg-green-600 text-white rounded-md">Join</button>
        </div>
      </div>
    </div>
  );
};

export default JoinClassroomModal;
