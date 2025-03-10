import { type HTMLAttributes, forwardRef } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { 
      children, 
      className = "", 
      variant = "default", 
      padding = "md",
      rounded = "md",
      ...props 
    }, 
    ref
  ) => {
    // バリアントスタイル
    const variantStyles = {
      default: "bg-white dark:bg-gray-800",
      elevated: "bg-white dark:bg-gray-800 shadow-md",
      outlined: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    };

    // パディングスタイル
    const paddingStyles = {
      none: "p-0",
      sm: "p-2",
      md: "p-4",
      lg: "p-6",
    };

    // 角丸スタイル
    const roundedStyles = {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      full: "rounded-full",
    };

    return (
      <div
        ref={ref}
        className={`${variantStyles[variant]} ${paddingStyles[padding]} ${roundedStyles[rounded]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
