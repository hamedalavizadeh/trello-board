"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import styles from "./IconButton.module.scss";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "ghost" | "solid";
  size?: "sm" | "md";
};

export const IconButton = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "ghost", size = "md", ...rest }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(styles.btn, styles[variant], styles[size], className)}
        {...rest}
      />
    );
  }
);

IconButton.displayName = "IconButton";