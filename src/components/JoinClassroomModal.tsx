import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface JoinClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (accessCode: string) => void;
  primaryColor?: string;    
  accentColor?: string;
}

const overlayVariants = {
  hidden: { backdropFilter: "blur(0px)", backgroundColor: "rgba(0,0,0,0)" },
  visible: { backdropFilter: "blur(4px)", backgroundColor: "rgba(0,0,0,0.4)" },
  exit:    { backdropFilter: "blur(0px)", backgroundColor: "rgba(0,0,0,0)" },
};

const modalVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: 20 },
};

export const JoinClassroomModal: React.FC<JoinClassroomModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  primaryColor = '#0065ea',
  accentColor = '#df8300',
}) => {
  const [accessCode, setAccessCode] = useState("");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.div
            className="bg-white p-6 rounded-lg shadow-xl w-80 max-w-full"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <h2 className="text-xl font-semibold mb-4" >
              Join a Classroom
            </h2>
            <input
              type="text"
              placeholder="Enter Access Code"
              value={accessCode}
              onChange={e => setAccessCode(e.target.value)}
              className="w-full p-2 mb-4 border rounded-md focus:outline-none focus:ring-2"
              
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => onJoin(accessCode)}
                className="px-4 py-2 rounded-md text-white transition"
                style={{ backgroundColor: primaryColor }}
              >
                Join
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JoinClassroomModal;