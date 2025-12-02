import { forwardRef, useEffect, type HTMLAttributes, type ReactNode } from "react";
import { EditableProvider } from "./EditableContext.js";
import { useEditable, type UseEditableOptions, type UseEditableReturn } from "./useEditable.js";

/** Props passed to render-prop children. */
export type EditableRenderProps = Pick<
  UseEditableReturn,
  "value" | "isEditing" | "isEmpty" | "submit" | "cancel" | "edit"
>;

/**
 * Root container for the Editable component suite.
 * Manages state and provides context to child components.
 *
 * @example
 * ```tsx
 * <EditableRoot defaultValue="Click to edit">
 *   <EditableArea>
 *     <EditablePreview />
 *     <EditableInput />
 *   </EditableArea>
 * </EditableRoot>
 * ```
 */
export interface EditableRootProps
  extends
    UseEditableOptions,
    Omit<
      HTMLAttributes<HTMLDivElement>,
      "onChange" | "children" | "placeholder" | "defaultValue" | "dir" | "onSubmit"
    > {
  /** React children or render-prop receiving state. */
  children?: ReactNode | ((props: EditableRenderProps) => ReactNode);
}

export const EditableRoot = forwardRef<HTMLDivElement, EditableRootProps>(function EditableRoot(
  {
    // UseEditableOptions
    value,
    defaultValue,
    onChange,
    onSubmit,
    onStateChange,
    activationMode,
    submitMode,
    placeholder,
    disabled,
    readOnly,
    selectOnFocus,
    startWithEditMode,
    maxLength,
    autoResize,
    dir,
    name,
    required,
    // Rest
    children,
    ...divProps
  },
  ref,
) {
  const editable = useEditable({
    value,
    defaultValue,
    onChange,
    onSubmit,
    onStateChange,
    activationMode,
    submitMode,
    placeholder,
    disabled,
    readOnly,
    selectOnFocus,
    startWithEditMode,
    maxLength,
    autoResize,
    dir,
    name,
    required,
  });

  // Wire outside click/blur similar to Vue's handleDismiss:
  // - if submitMode is 'blur' or 'both' → submit()
  // - otherwise → cancel()
  useEffect(() => {
    if (!editable.isEditing) return;
    const handlePointerDown = (e: PointerEvent) => {
      const root = editable.rootRef.current;
      if (!root) return;
      if (!root.contains(e.target as Node)) {
        if (editable.submitMode === "blur" || editable.submitMode === "both") {
          editable.submit();
        } else {
          editable.cancel();
        }
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally picking stable values
  }, [editable.isEditing, editable.submitMode, editable.submit, editable.rootRef]);

  const renderProps: EditableRenderProps = {
    value: editable.value,
    isEditing: editable.isEditing,
    isEmpty: editable.isEmpty,
    submit: editable.submit,
    cancel: editable.cancel,
    edit: editable.edit,
  };

  return (
    <EditableProvider value={editable}>
      <div
        ref={(node) => {
          editable.rootRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        dir={editable.dir}
        data-disabled={editable.disabled ? "" : undefined}
        data-readonly={editable.readOnly ? "" : undefined}
        {...divProps}
      >
        {typeof children === "function" ? children(renderProps) : children}
        {name && (
          <input
            type="text"
            name={name}
            value={editable.value ?? ""}
            required={required}
            disabled={disabled}
            readOnly
            hidden
            aria-hidden
            tabIndex={-1}
            data-testid="editable-hidden-input"
          />
        )}
      </div>
    </EditableProvider>
  );
});
