// components/SuccessOverlay.tsx
import Lottie from "lottie-react";
import successAnimation from "../assets/animations/success.json"; // Make sure this file exists

const SuccessOverlay = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-[9999]">
      <div className="w-[300px]">
        <Lottie animationData={successAnimation} loop={false} />
        <h2 className="text-center text-lg font-bold text-gray-800 mt-4">
          Submitted Successfully!
        </h2>
      </div>
    </div>
  );
};

export default SuccessOverlay;
