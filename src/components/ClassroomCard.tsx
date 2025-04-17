import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiChevronRight } from "react-icons/fi";

// Utility to generate a consistent pastel color per id
const generateColor = (seed: number) => {
  const hue = (seed * 137.508) % 360; // golden angle
  return `hsl(${hue}, 50%, 70%)`;
};

interface ClassroomCardProps {
  id: number;
  title: string;
  description: string;
  avatarUrl?: string;
  avatarColor?: string;
}

const MAX_DESC_LENGTH = 35; // max chars before truncation


const ClassroomCard: React.FC<ClassroomCardProps> = ({
  id,
  title,
  description,
  avatarUrl,
  avatarColor,
}) => {
  const navigate = useNavigate();

  // Compute initials for fallback avatar
  const initials = useMemo(() => {
    const matches = title.match(/\b\w/g) || [];
    return (matches[0] || "").toUpperCase() + (matches[1] || "").toUpperCase();
  }, [title]);

  // Determine avatar background
  const bgColor = avatarColor || generateColor(id);

  // Truncate description if it's too long
  const truncatedDesc = useMemo(() => {
    if (description.length <= MAX_DESC_LENGTH) return description;
    return description.slice(0, MAX_DESC_LENGTH).trimEnd() + "...";
  }, [description]);

  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg cursor-pointer flex flex-col h-full overflow-hidden"
      whileHover={{ scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
      transition={{ type: "spring", stiffness: 300 }}
      onClick={() => navigate(`/classroom/${id}`)}
      role="button"
      tabIndex={0}
      onKeyPress={e => { if (e.key === 'Enter') navigate(`/classroom/${id}`); }}
    >
      {/* Avatar + Title */}
      <div className="flex items-center p-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`${title} avatar`}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-12 h-12 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ backgroundColor: bgColor }}
          >
            <span className="text-lg font-semibold text-white">{initials}</span>
          </div>
        )}
        <h3
          className="ml-4 text-ml font-semibold text-gray-800 truncate"
          title={title}
        >
          {title}
        </h3>
      </div>

      {/* Truncated Description */}
      <div className="px-4 pb-4 flex-1">
        <p className="text-gray-600 text-sm leading-relaxed" title={description}>
          {truncatedDesc}
        </p>
      </div>

      {/* Action Footer */}
      <div className="bg-gray-100 px-4 py-2 flex justify-end">
        <FiChevronRight size={20} className="text-gray-500" aria-label="View details" />
      </div>
    </motion.div>
  );
};

export default ClassroomCard;