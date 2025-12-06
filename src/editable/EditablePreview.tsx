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

    // When autoResize + editing, show inputValue so grid sizes correctly
    const displayValue = ctx.autoResize && ctx.isEditing ? ctx.inputValue : (ctx.value ?? "");
    const showPlaceholder = ctx.autoResize && ctx.isEditing ? !ctx.inputValue : ctx.isEmpty;
    const hidden = ctx.isEditing;

    // Zero-width space prevents layout collapse when content is empty (autoResize only)
    const ZWSP = "\u200B";
    const contentToRender = showPlaceholder
      ? placeholder || (ctx.autoResize ? ZWSP : undefined)
      : displayValue || (ctx.autoResize ? ZWSP : undefined);

    const handleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
      if (ctx.activationMode === "focus" && !ctx.disabled && !ctx.readOnly) {
        ctx.edit("click");
      }
      onClick?.(e);
    };

    const handleDoubleClick = (e: React.MouseEvent<HTMLSpanElement>) => {
      if (ctx.activationMode === "dblclick" && !ctx.disabled && !ctx.readOnly) {
        ctx.edit("dblclick");
      }
      onDoubleClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
      if (ctx.disabled || ctx.readOnly) return;
      if (e.key === "Enter" || e.key === " ") {
        if (ctx.activationMode === "focus" || ctx.activationMode === "dblclick") {
          ctx.edit("trigger"); // keyboard activation = select all
          e.preventDefault();
        }
      }
    };

    const isInteractive = ctx.activationMode !== "none" && !ctx.disabled && !ctx.readOnly;

    // Vue parity: when autoResize, use grid overlay technique
    // Preview stays in layout (visibility:hidden) so input can size to it
    const autoResizeStyles: React.CSSProperties | undefined = ctx.autoResize
      ? {
          whiteSpace: "pre",
          userSelect: "none",
          gridArea: "1 / 1 / auto / auto",
          visibility: hidden ? "hidden" : undefined,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }
      : undefined;

    const hiddenStyles: React.CSSProperties | undefined =
      !ctx.autoResize && hidden ? { display: "none" } : undefined;

    return (
      <span
        ref={ref}
        tabIndex={isInteractive ? 0 : undefined}
        role={isInteractive ? "button" : undefined}
        data-placeholder-shown={showPlaceholder ? "" : undefined}
        data-empty={ctx.isEmpty ? "" : undefined}
        style={{
          ...style,
          ...autoResizeStyles,
          ...hiddenStyles,
        }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {contentToRender}
      </span>
    );
  },
);
