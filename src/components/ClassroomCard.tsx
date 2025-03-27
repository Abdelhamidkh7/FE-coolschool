import { FC } from "react";
import { useNavigate } from "react-router-dom";

interface ClassroomCardProps {
  id: number;
  title: string;
  description: string;
}

const ClassroomCard: FC<ClassroomCardProps> = ({ id, title, description }) => {
  const navigate = useNavigate();

  console.log("classroomCard: " + id);
  return (
    <div
      className="bg-white p-5 rounded-lg shadow-md cursor-pointer hover:shadow-xl transition"
      
      onClick={() => navigate(`/classroom/${id}`)}
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

export default ClassroomCard;
