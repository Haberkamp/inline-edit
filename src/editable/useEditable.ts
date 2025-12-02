import { useCallback, useMemo, useRef, useState } from "react";

/** How editing is activated: focus, double-click, or only via trigger button. */
export type ActivationMode = "focus" | "dblclick" | "none";

/** When value is submitted: on blur, Enter key, both, or only via trigger. */
export type SubmitMode = "blur" | "enter" | "none" | "both";

/** State transitions emitted via onStateChange. */
export type EditableState = "edit" | "submit" | "cancel";

/** Placeholder can be a string or separate values for edit and preview modes. */
export type Placeholder = string | { edit: string; preview: string };

export interface UseEditableOptions {
  /** Controlled value. */
  value?: string | null;
  /** Initial value for uncontrolled mode. */
  defaultValue?: string;
  /** Called when value changes (on submit). */
  onChange?: (value: string | null) => void;
  /** Called when value is submitted. */
  onSubmit?: (value: string | null) => void;
  /** Called on state transitions: 'edit', 'submit', 'cancel'. */
  onStateChange?: (state: EditableState) => void;
  /** How editing is activated. @default 'focus' */
  activationMode?: ActivationMode;
  /** When value is submitted. @default 'blur' */
  submitMode?: SubmitMode;
  /** Placeholder text shown when empty. */
  placeholder?: Placeholder;
  /** Disable all interactions. */
  disabled?: boolean;
  /** Prevent editing but allow focus. */
  readOnly?: boolean;
  /** Select all text when input receives focus. */
  selectOnFocus?: boolean;
  /** Start in edit mode on mount. */
  startWithEditMode?: boolean;
  /** Maximum character length. */
  maxLength?: number;
  /** Auto-resize input width to fit content. */
  autoResize?: boolean;
  /** Text direction. @default 'ltr' */
  dir?: "ltr" | "rtl";
  /** Form field name (renders hidden input). */
  name?: string;
  /** Mark form field as required. */
  required?: boolean;
}

export interface UseEditableReturn {
  // State
  value: string | null;
  inputValue: string;
  isEditing: boolean;
  isEmpty: boolean;
  // Config
  activationMode: ActivationMode;
  submitMode: SubmitMode;
  placeholder: Placeholder | undefined;
  disabled: boolean;
  readOnly: boolean;
  selectOnFocus: boolean;
  maxLength: number | undefined;
  autoResize: boolean;
  dir: "ltr" | "rtl";
  name: string | undefined;
  required: boolean;
  // Actions
  edit: () => void;
  cancel: () => void;
  submit: () => void;
  setInputValue: (value: string) => void;
  // Refs for outside-click/focus logic
  rootRef: React.MutableRefObject<HTMLElement | null>;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
}

export function useEditable(options: UseEditableOptions = {}): UseEditableReturn {
  const {
    value: controlledValue,
    defaultValue = "",
    onChange,
    onSubmit,
    onStateChange,
    activationMode = "focus",
    submitMode = "blur",
    placeholder,
    disabled = false,
    readOnly = false,
    selectOnFocus = false,
    startWithEditMode = false,
    maxLength,
    autoResize = false,
    dir = "ltr",
    name,
    required = false,
  } = options;

  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(defaultValue);

  const value = isControlled ? controlledValue : uncontrolledValue;

  const [isEditing, setIsEditing] = useState(startWithEditMode);
  const [inputValue, setInputValueInternal] = useState(value ?? "");

  const rootRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Value before editing started - for cancel
  const previousValueRef = useRef<string | null>(value);

  const isEmpty = useMemo(() => {
    const displayValue = isEditing ? inputValue : value;
    return displayValue === null || displayValue === "";
  }, [isEditing, inputValue, value]);

  const edit = useCallback(() => {
    if (disabled || readOnly) return;
    previousValueRef.current = value;
    setInputValueInternal(value ?? "");
    setIsEditing(true);
    onStateChange?.("edit");
  }, [disabled, readOnly, value, onStateChange]);

  const cancel = useCallback(() => {
    setInputValueInternal(previousValueRef.current ?? "");
    setIsEditing(false);
    onStateChange?.("cancel");
  }, [onStateChange]);

  const submit = useCallback(() => {
    const newValue = inputValue;
    if (!isControlled) {
      setUncontrolledValue(newValue);
    }
    setIsEditing(false);
    onChange?.(newValue);
    onSubmit?.(newValue);
    onStateChange?.("submit");
  }, [inputValue, isControlled, onChange, onSubmit, onStateChange]);

  const setInputValue = useCallback(
    (newValue: string) => {
      if (maxLength !== undefined && newValue.length > maxLength) {
        newValue = newValue.slice(0, maxLength);
      }
      setInputValueInternal(newValue);
    },
    [maxLength],
  );

  return {
    // State
    value,
    inputValue,
    isEditing,
    isEmpty,
    // Config
    activationMode,
    submitMode,
    placeholder,
    disabled,
    readOnly,
    selectOnFocus,
    maxLength,
    autoResize,
    dir,
    name,
    required,
    // Actions
    edit,
    cancel,
    submit,
    setInputValue,
    // Refs
    rootRef,
    inputRef,
  };
}
