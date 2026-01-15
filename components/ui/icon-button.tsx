import { cn } from "@/lib/utils";
import { MouseEventHandler } from "react";

interface IconButtonProps {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  icon: React.ReactElement;
  className?: string;
}

const IconButton = (props: IconButtonProps) => {
  const { onClick, icon, className } = props;

  return (
    <button
      onClick={onClick}
      className={cn(
        "ronded-full flex items-center bg-white border shadow-md p-2 hover:scale-110 transition",
        className
      )}
    >
      {icon}
    </button>
  );
};

export default IconButton;
