"use client";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";

interface NairaInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  value: number | null;
  onChange: (value: number | null) => void;
}

const formatThousands = (n: number) => n.toLocaleString("en-NG");

export const NairaInput = forwardRef<HTMLInputElement, NairaInputProps>(
  ({ value, onChange, placeholder, className, ...rest }, ref) => {
    const display = value == null || isNaN(value) ? "" : formatThousands(value);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, "");
      if (raw === "") {
        onChange(null);
        return;
      }
      const num = parseInt(raw, 10);
      onChange(isNaN(num) ? null : num);
    };

    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          ₦
        </span>
        <Input
          {...rest}
          ref={ref}
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          placeholder={placeholder ?? "0"}
          className={`pl-8 ${className ?? ""}`}
        />
      </div>
    );
  }
);

NairaInput.displayName = "NairaInput";
