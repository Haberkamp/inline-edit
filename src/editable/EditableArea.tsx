import { forwardRef, type HTMLAttributes } from "react";
import { useEditableContext } from "./EditableContext.js";

/**
 * Container for EditablePreview and EditableInput.
 * Applies data-* attributes for styling based on state.
 */
export interface EditableAreaProps extends HTMLAttributes<HTMLDivElement> {}

export const EditableArea = forwardRef<HTMLDivElement, EditableAreaProps>(function EditableArea(
  { style, ...props },
  ref,
) {
  const ctx = useEditableContext();

  // Mirror Vue implementation:
  // - `data-focus` / `data-focused` track *editing* state, not raw DOM focus
  // - placeholder-shown is tied to "not editing" (preview mode)
  const isActive = ctx.isEditing;

  return (
    <div
      ref={ref}
      data-disabled={ctx.disabled ? "" : undefined}
      data-readonly={ctx.readOnly ? "" : undefined}
      data-placeholder-shown={isActive ? undefined : ""}
      data-empty={ctx.isEmpty ? "" : undefined}
      data-focus={isActive ? "" : undefined}
      data-focused={isActive ? "" : undefined}
      style={ctx.autoResize ? { display: "inline-grid", ...style } : style}
      {...props}
    />
  );
});
