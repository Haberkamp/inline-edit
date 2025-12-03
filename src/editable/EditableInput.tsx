import { forwardRef, useEffect, useLayoutEffect, type InputHTMLAttributes } from "react";
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
          if (ctx.selectOnFocus) {
            input.select();
          }
        }
      }
    }, [ctx.isEditing, ctx.selectOnFocus, ctx.inputRef]);

    // Auto-resize
    useLayoutEffect(() => {
      if (!ctx.autoResize) return;
      const input = ctx.inputRef.current;
      if (!input) return;
      input.style.width = "0";
      input.style.width = `${input.scrollWidth}px`;
      // eslint-disable-next-line react-hooks/exhaustive-deps -- ref.current is stable
    }, [ctx.autoResize, ctx.inputValue]);

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
        data-disabled={ctx.disabled ? "" : undefined}
        data-readonly={ctx.readOnly ? "" : undefined}
        onChange={(e) => ctx.setInputValue(e.target.value)}
        onFocus={(e) => {
          if (ctx.activationMode === "focus" && !ctx.isEditing) {
            ctx.edit();
          }
          if (ctx.selectOnFocus && ctx.isEditing) {
            e.currentTarget.select();
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
            ctx.edit();
          }
        }}
        {...props}
      />
    );
  },
);
