import { forwardRef, useEffect, type InputHTMLAttributes } from "react";
import { useEditableContext } from "./EditableContext.js";

/**
 * Input element for the editable component.
 * Automatically binds to context state and handles keyboard events.
 */
export interface EditableInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> {}

export const EditableInput = forwardRef<HTMLInputElement, EditableInputProps>(
  function EditableInput({ onFocus, onBlur, onKeyDown, ...props }, ref) {
    const ctx = useEditableContext();

    const placeholder =
      typeof ctx.placeholder === "string" ? ctx.placeholder : ctx.placeholder?.edit;

    // Auto-focus when entering edit mode
    useEffect(() => {
      if (ctx.isEditing) {
        const input = ctx.inputRef.current;
        if (input) {
          input.focus({ preventScroll: true });
          // Selection behavior based on activation source:
          // - click: cursor at end
          // - dblclick/trigger: select all
          const shouldSelectAll =
            ctx.selectOnFocus ||
            ctx.activationSource === "dblclick" ||
            ctx.activationSource === "trigger";
          if (shouldSelectAll) {
            input.select();
          } else {
            // Move cursor to end
            const len = input.value.length;
            input.setSelectionRange(len, len);
          }
        }
      }
    }, [ctx.isEditing, ctx.selectOnFocus, ctx.activationSource, ctx.inputRef]);

    // Vue parity: when autoResize, use grid overlay technique
    // width: 0 prevents input's intrinsic size from affecting grid column width
    // (only the preview's content should determine the cell size)
    const autoResizeStyles: React.CSSProperties | undefined = ctx.autoResize
      ? {
          gridArea: "1 / 1 / auto / auto",
          width: 0,
          minWidth: "100%",
          visibility: ctx.isEditing ? undefined : "hidden",
        }
      : undefined;

    return (
      <input
        ref={(node) => {
          ctx.inputRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        type="text"
        value={ctx.inputValue}
        placeholder={placeholder}
        disabled={ctx.disabled}
        readOnly={ctx.readOnly}
        maxLength={ctx.maxLength}
        hidden={ctx.autoResize ? undefined : !ctx.isEditing || undefined}
        style={autoResizeStyles}
        data-disabled={ctx.disabled ? "" : undefined}
        data-readonly={ctx.readOnly ? "" : undefined}
        onChange={(e) => ctx.setInputValue(e.target.value)}
        onFocus={(e) => {
          if (ctx.activationMode === "focus" && !ctx.isEditing) {
            ctx.edit("click");
          }
          onFocus?.(e);
        }}
        onBlur={(e) => {
          // Blur submit handled by root's outside click listener
          onBlur?.(e);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            ctx.cancel();
            e.preventDefault();
          } else if (e.key === "Enter") {
            if (ctx.submitMode === "enter" || ctx.submitMode === "both") {
              ctx.submit();
              e.preventDefault();
            }
          }
          onKeyDown?.(e);
        }}
        onDoubleClick={() => {
          if (ctx.activationMode === "dblclick" && !ctx.isEditing) {
            ctx.edit("dblclick");
          }
        }}
        {...props}
      />
    );
  },
);
