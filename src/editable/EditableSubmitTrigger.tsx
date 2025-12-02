import { forwardRef, type ButtonHTMLAttributes } from "react";
import { useEditableContext } from "./EditableContext.js";

/**
 * Button to submit the current value.
 * Hidden when not in edit mode.
 */
export interface EditableSubmitTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const EditableSubmitTrigger = forwardRef<HTMLButtonElement, EditableSubmitTriggerProps>(
  function EditableSubmitTrigger({ onClick, disabled, style, ...props }, ref) {
    const ctx = useEditableContext();

    const isDisabled = disabled ?? ctx.disabled ?? ctx.readOnly;
    const hidden = !ctx.isEditing;

    return (
      <button
        ref={ref}
        type="button"
        aria-label="submit"
        disabled={isDisabled}
        data-disabled={isDisabled ? "" : undefined}
        style={{
          ...style,
          ...(hidden ? { display: "none" } : {}),
        }}
        onClick={(e) => {
          ctx.submit();
          onClick?.(e);
        }}
        {...props}
      />
    );
  },
);
