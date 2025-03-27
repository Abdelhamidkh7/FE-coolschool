import { useState } from "react";
import { generateAccessCode, leaveClassroom } from "../api/ClassroomApi";
import { Toast } from "./Toast";
import { useNavigate } from "react-router-dom";
import ClassMembers from "./ClassMembers";

interface ClassroomDropdownProps {
  classId: string;
  onClose: () => void;
}

const ClassroomDropdown: React.FC<ClassroomDropdownProps> = ({ classId, onClose }) => {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const navigate = useNavigate();

  const handleGenerateAccessCode = async () => {
    try {
      const accessCode = await generateAccessCode(classId);
      setToast({ message: `Access Code: ${accessCode}`, type: "success" });
    } catch (error) {
      setToast({ message: "Failed to generate access code", type: "error" });
    }
  };

  const confirmLeaveClassroom = async () => {
    try {
      await leaveClassroom(classId);
      setToast({ message: "Left the classroom successfully", type: "success" });
      setTimeout(() => navigate("/classes"), 1000);
    } catch (error) {
      setToast({ message: "Failed to leave classroom", type: "error" });
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="w-48 bg-white shadow-md rounded-lg py-2">
        <button
          onClick={handleGenerateAccessCode}
          className="block w-full text-left px-4 py-2 hover:bg-gray-200"
        >
          Generate Access Code
        </button>
        <button
          onClick={() => setShowStudents(true)}
          className="block w-full text-left px-4 py-2 hover:bg-gray-200"
        >
          View Students
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-200"
        >
          Leave Classroom
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold mb-4">Are you sure you want to leave this classroom?</p>
            <div className="flex justify-end space-x-4">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={confirmLeaveClassroom}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showStudents && <ClassMembers classId={classId} onClose={() => setShowStudents(false)} />}
    </>
  );
};

export default ClassroomDropdown;
