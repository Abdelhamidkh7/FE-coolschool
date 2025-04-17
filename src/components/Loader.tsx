import React from "react";

interface LoaderProps {
  size?: number;     
  color?: string;   
}

export const Loader: React.FC<LoaderProps> = ({
  size = 40,
  color = "#0065ea",
}) => {
  const border = Math.max(2, Math.floor(size * 0.1));
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `${border}px solid #e5e7eb`,
        borderTop: `${border}px solid ${color}`,
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
      }}
    />
  );
};
