import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface LottieAnimationProps {
  src: string;
  autoplay?: boolean;
  loop?: boolean;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

const LottieAnimation = ({
  src,
  autoplay = true,
  loop = true,
  speed = 1,
  className = "",
  style,
}: LottieAnimationProps) => {
  return (
    <DotLottieReact
      autoplay={autoplay}
      loop={loop}
      speed={speed}
      src={src}
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    />
  );
};

export default LottieAnimation;
