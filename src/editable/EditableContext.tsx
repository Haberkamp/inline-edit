import { createContext, useContext, type ReactNode } from "react";
import type { UseEditableReturn } from "./useEditable.js";

const EditableContext = createContext<UseEditableReturn | null>(null);

export interface EditableProviderProps {
  value: UseEditableReturn;
  children: ReactNode;
}

export function EditableProvider({ value, children }: EditableProviderProps) {
  return <EditableContext.Provider value={value}>{children}</EditableContext.Provider>;
}

export function useEditableContext(): UseEditableReturn {
  const context = useContext(EditableContext);
  if (!context) {
    throw new Error("useEditableContext must be used within an EditableProvider");
  }
  return context;
}
