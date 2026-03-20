"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import type { ComponentPropsWithoutRef } from "react";

// motion.button est déjà typé comme un vrai <button>
// On récupère son type de props
type MotionButtonProps = ComponentPropsWithoutRef<typeof motion.button>;

type Props = {
  children: ReactNode;
  className?: string;
} & MotionButtonProps;

export default function Button({ children, className = "", ...props }: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={
        "rounded-full bg-blue-500 px-8 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-600 " +
        className
      }
      {...props}
    >
      {children}
    </motion.button>
  );
}
