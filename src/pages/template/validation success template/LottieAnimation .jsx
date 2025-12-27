import React from 'react';
import Lottie from 'react-lottie';
import animationData from "./Animation - 1711391153181.json";

const LottieAnimation = () => {
    const defaultOptions = {
        loop: false,
        autoplay: true,
        animationData: animationData, 
        rendererSettings: {
          preserveAspectRatio: 'xMidYMid slice'
        }
      };
  return (
    <div>
      <Lottie style={{ width: "70%" }} options={defaultOptions} />
    </div>
  )
}

export default LottieAnimation 
