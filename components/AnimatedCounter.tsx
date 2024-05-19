"use client";
import CountUp from "react-countup";

const AnimatedCounter = ({ end }: { end: number }) => {
  return (
    <div className="w-full">
      <CountUp start={end / 2} end={end} decimal="." decimals={2} prefix="$" />
    </div>
  );
};

export default AnimatedCounter;
