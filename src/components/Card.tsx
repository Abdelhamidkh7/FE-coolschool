import { FC } from "react";

interface CardProps {
  title: string;
  description: string;
}

export const Card: FC<CardProps> = ({ title, description }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};
