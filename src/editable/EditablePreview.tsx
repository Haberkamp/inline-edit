import { forwardRef, type HTMLAttributes } from "react";
import { useEditableContext } from "./EditableContext.js";

/**
 * Displays the current value when not editing.
 * Hidden when in edit mode. Shows placeholder when empty.
 */
export interface EditablePreviewProps extends HTMLAttributes<HTMLSpanElement> {}

export const EditablePreview = forwardRef<HTMLSpanElement, EditablePreviewProps>(
  function EditablePreview({ style, onClick, onDoubleClick, ...props }, ref) {
    const ctx = useEditableContext();

    const placeholder =
      typeof ctx.placeholder === "string" ? ctx.placeholder : ctx.placeholder?.preview;

    const displayValue = ctx.value ?? "";
    const showPlaceholder = ctx.isEmpty;
    const hidden = ctx.isEditing;

    const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
      if (ctx.activationMode === "focus" && !ctx.disabled && !ctx.readOnly) {
        ctx.edit();
      }
      onClick?.(e);
    };

    const handleDoubleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
      if (ctx.activationMode === "dblclick" && !ctx.disabled && !ctx.readOnly) {
        ctx.edit();
      }
      onDoubleClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
      if (ctx.disabled || ctx.readOnly) return;
      if (e.key === "Enter" || e.key === " ") {
        if (ctx.activationMode === "focus" || ctx.activationMode === "dblclick") {
          ctx.edit();
          e.preventDefault();
        }
      }
    };

    const isInteractive = ctx.activationMode !== "none" && !ctx.disabled && !ctx.readOnly;

    return (
      <span
        ref={ref}
        tabIndex={isInteractive ? 0 : undefined}
        role={isInteractive ? "button" : undefined}
        data-placeholder-shown={showPlaceholder ? "" : undefined}
        data-empty={ctx.isEmpty ? "" : undefined}
        style={{
          ...style,
          ...(hidden ? { display: "none" } : {}),
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {showPlaceholder ? placeholder : displayValue}
      </span>
    );
  },
);
