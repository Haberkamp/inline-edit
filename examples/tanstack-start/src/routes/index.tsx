import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Pencil, X } from "lucide-react";
import {
  EditableRoot,
  EditableArea,
  EditableInput,
  EditablePreview,
  EditableEditTrigger,
  EditableSubmitTrigger,
  EditableCancelTrigger,
} from "@inline-edit/react";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const [basicValue, setBasicValue] = useState("Click to edit me");
  const [controlledValue, setControlledValue] = useState("Controlled value");
  const [submittedValues, setSubmittedValues] = useState<string[]>([]);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="pt-16" />
      <div className="max-w-4xl mx-auto py-16">
        <header className="mb-16">
          <h1 className="text-5xl font-light tracking-tight text-stone-50 mb-4">
            @inline-edit/react
          </h1>
          <p className="text-xl text-stone-400 max-w-2xl">
            Headless, composable editable text components for React. Full keyboard support,
            accessible, and infinitely customizable.
          </p>
        </header>

        <div className="space-y-16">
          {/* Basic Example */}
          <section>
            <h2 className="text-sm font-medium uppercase tracking-widest text-amber-500 mb-6">
              Basic Usage
            </h2>
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-8">
              <EditableRoot
                defaultValue={basicValue}
                onChange={(v) => setBasicValue(v ?? "")}
                submitMode="both"
                className="editable-root"
              >
                <EditableArea className="editable-area">
                  <EditablePreview className="editable-preview" />
                  <EditableInput className="editable-input" />
                </EditableArea>
              </EditableRoot>
              <p className="text-sm text-stone-500 mt-4">
                Click to edit · Press Enter or click outside to save · Escape to cancel
              </p>
            </div>
          </section>

          {/* With Triggers */}
          <section>
            <h2 className="text-sm font-medium uppercase tracking-widest text-amber-500 mb-6">
              With Edit/Submit/Cancel Buttons
            </h2>
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-8">
              <EditableRoot
                defaultValue="Edit me with buttons"
                activationMode="none"
                submitMode="none"
                className="editable-root"
              >
                {({ isEditing }) => (
                  <div className="flex items-center gap-3">
                    <EditableArea className="editable-area flex-1">
                      <EditablePreview className="editable-preview" />
                      <EditableInput className="editable-input" />
                    </EditableArea>
                    {!isEditing && (
                      <EditableEditTrigger className="trigger-btn">
                        <Pencil size={16} />
                      </EditableEditTrigger>
                    )}
                    <EditableSubmitTrigger className="trigger-btn trigger-submit">
                      <Check size={16} />
                    </EditableSubmitTrigger>
                    <EditableCancelTrigger className="trigger-btn trigger-cancel">
                      <X size={16} />
                    </EditableCancelTrigger>
                  </div>
                )}
              </EditableRoot>
              <p className="text-sm text-stone-500 mt-4">
                activationMode="none" · submitMode="none" · Uses trigger buttons
              </p>
            </div>
          </section>

          {/* Placeholder */}
          <section>
            <h2 className="text-sm font-medium uppercase tracking-widest text-amber-500 mb-6">
              Placeholder
            </h2>
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-8">
              <EditableRoot
                defaultValue=""
                placeholder={{
                  edit: "Type something...",
                  preview: "Empty — click to add",
                }}
                submitMode="both"
                className="editable-root"
              >
                <EditableArea className="editable-area">
                  <EditablePreview className="editable-preview" />
                  <EditableInput className="editable-input" />
                </EditableArea>
              </EditableRoot>
              <p className="text-sm text-stone-500 mt-4">
                Shows different placeholders for edit and preview modes
              </p>
            </div>
          </section>

          {/* Controlled */}
          <section>
            <h2 className="text-sm font-medium uppercase tracking-widest text-amber-500 mb-6">
              Controlled
            </h2>
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-8">
              <EditableRoot
                value={controlledValue}
                onChange={(v) => setControlledValue(v ?? "")}
                submitMode="both"
                className="editable-root"
              >
                <EditableArea className="editable-area">
                  <EditablePreview className="editable-preview" />
                  <EditableInput className="editable-input" />
                </EditableArea>
              </EditableRoot>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setControlledValue("Reset!")}
                  className="px-3 py-1.5 text-sm bg-stone-800 hover:bg-stone-700 rounded transition-colors"
                >
                  Reset externally
                </button>
                <span className="text-sm text-stone-500 self-center">
                  Current: "{controlledValue}"
                </span>
              </div>
            </div>
          </section>

          {/* Double Click */}
          <section>
            <h2 className="text-sm font-medium uppercase tracking-widest text-amber-500 mb-6">
              Double-Click Activation
            </h2>
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-8">
              <EditableRoot
                defaultValue="Double-click me to edit"
                activationMode="dblclick"
                submitMode="both"
                className="editable-root"
              >
                <EditableArea className="editable-area">
                  <EditablePreview className="editable-preview" />
                  <EditableInput className="editable-input" />
                </EditableArea>
              </EditableRoot>
              <p className="text-sm text-stone-500 mt-4">
                activationMode="dblclick" · Double-click to enter edit mode
              </p>
            </div>
          </section>

          {/* With onSubmit callback */}
          <section>
            <h2 className="text-sm font-medium uppercase tracking-widest text-amber-500 mb-6">
              onSubmit Callback
            </h2>
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-8">
              <EditableRoot
                defaultValue="Edit and submit me"
                submitMode="both"
                onSubmit={(v) => setSubmittedValues((prev) => [...prev, v ?? ""])}
                className="editable-root"
              >
                <EditableArea className="editable-area">
                  <EditablePreview className="editable-preview" />
                  <EditableInput className="editable-input" />
                </EditableArea>
              </EditableRoot>
              {submittedValues.length > 0 && (
                <div className="mt-4 text-sm">
                  <span className="text-stone-500">Submitted values: </span>
                  <span className="text-stone-300">
                    {submittedValues.map((v, i) => (
                      <span key={i}>
                        "{v}"{i < submittedValues.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Disabled & ReadOnly */}
          <section>
            <h2 className="text-sm font-medium uppercase tracking-widest text-amber-500 mb-6">
              Disabled & Read-Only
            </h2>
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-8 space-y-6">
              <div>
                <EditableRoot defaultValue="I'm disabled" disabled className="editable-root">
                  <EditableArea className="editable-area">
                    <EditablePreview className="editable-preview" />
                    <EditableInput className="editable-input" />
                  </EditableArea>
                </EditableRoot>
                <p className="text-sm text-stone-500 mt-2">disabled=true</p>
              </div>
              <div>
                <EditableRoot defaultValue="I'm read-only" readOnly className="editable-root">
                  <EditableArea className="editable-area">
                    <EditablePreview className="editable-preview" />
                    <EditableInput className="editable-input" />
                  </EditableArea>
                </EditableRoot>
                <p className="text-sm text-stone-500 mt-2">readOnly=true</p>
              </div>
            </div>
          </section>

          {/* Max Length */}
          <section>
            <h2 className="text-sm font-medium uppercase tracking-widest text-amber-500 mb-6">
              Max Length
            </h2>
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-8">
              <EditableRoot
                defaultValue="Max 20 chars"
                maxLength={20}
                submitMode="both"
                className="editable-root"
              >
                <EditableArea className="editable-area">
                  <EditablePreview className="editable-preview" />
                  <EditableInput className="editable-input" />
                </EditableArea>
              </EditableRoot>
              <p className="text-sm text-stone-500 mt-4">
                maxLength=20 · Try typing more than 20 characters
              </p>
            </div>
          </section>

          {/* Auto Resize */}
          <section>
            <h2 className="text-sm font-medium uppercase tracking-widest text-amber-500 mb-6">
              Auto Resize
            </h2>
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-8">
              <p className="text-stone-400 mb-4">
                The input automatically grows to match content width using CSS grid overlay:
              </p>
              <div className="flex items-center gap-2 text-lg">
                <span className="text-stone-500">Hello, my name is</span>
                <EditableRoot
                  defaultValue="Jane"
                  autoResize
                  submitMode="both"
                  className="editable-root-inline"
                >
                  <EditableArea className="editable-area-autoresize">
                    <EditablePreview className="editable-preview-autoresize" />
                    <EditableInput className="editable-input-autoresize" />
                  </EditableArea>
                </EditableRoot>
                <span className="text-stone-500">and I like</span>
                <EditableRoot
                  defaultValue="coding"
                  autoResize
                  submitMode="both"
                  className="editable-root-inline"
                >
                  <EditableArea className="editable-area-autoresize">
                    <EditablePreview className="editable-preview-autoresize" />
                    <EditableInput className="editable-input-autoresize" />
                  </EditableArea>
                </EditableRoot>
              </div>
              <p className="text-sm text-stone-500 mt-4">
                autoResize=true · Input width matches preview content · Uses CSS grid stacking
              </p>
            </div>
          </section>
        </div>

        <footer className="mt-20 pt-8 border-t border-stone-800 text-center text-stone-500 text-sm">
          <p>@inline-edit/react — Headless editable components</p>
        </footer>
      </div>
    </div>
  );
}
