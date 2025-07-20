import React from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Eyebtn = ({ showEye, eyeToggle }) => {
  return (
    <>
      <button
        className="absolute right-4 top-1/3 hover:opacity-50"
        onClick={eyeToggle}
      >
        {showEye ? <FaEyeSlash /> : <FaEye />}
      </button>
    </>
  );
};

export default Eyebtn;