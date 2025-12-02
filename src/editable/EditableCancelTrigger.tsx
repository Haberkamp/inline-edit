import { forwardRef, type ButtonHTMLAttributes } from "react";
import { useEditableContext } from "./EditableContext.js";

/**
 * Button to cancel editing and restore previous value.
 * Hidden when not in edit mode.
 */
export interface EditableCancelTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const EditableCancelTrigger = forwardRef<HTMLButtonElement, EditableCancelTriggerProps>(
  function EditableCancelTrigger({ onClick, disabled, style, ...props }, ref) {
    const ctx = useEditableContext();

    const isDisabled = disabled ?? ctx.disabled;
    const hidden = !ctx.isEditing;

    return (
      <button
        ref={ref}
        type="button"
        aria-label="cancel"
        disabled={isDisabled}
        data-disabled={isDisabled ? "" : undefined}
        style={{
          ...style,
          ...(hidden ? { display: "none" } : {}),
        }}
        onClick={(e) => {
          ctx.cancel();
          onClick?.(e);
        }}
        {...props}
      />
    );
  },
);
