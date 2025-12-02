import { forwardRef, type ButtonHTMLAttributes } from "react";
import { useEditableContext } from "./EditableContext.js";

/**
 * Button to enter edit mode.
 * Useful when activationMode is 'none' or 'dblclick'.
 */
export interface EditableEditTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const EditableEditTrigger = forwardRef<HTMLButtonElement, EditableEditTriggerProps>(
  function EditableEditTrigger({ onClick, disabled, ...props }, ref) {
    const ctx = useEditableContext();

    const isDisabled = disabled ?? ctx.disabled ?? ctx.readOnly;

    return (
      <button
        ref={ref}
        type="button"
        aria-label="edit"
        disabled={isDisabled}
        data-disabled={isDisabled ? "" : undefined}
        onClick={(e) => {
          ctx.edit();
          onClick?.(e);
        }}
        {...props}
      />
    );
  },
);
