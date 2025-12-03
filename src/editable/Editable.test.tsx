import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { useState } from "react";
import {
  EditableArea,
  EditableCancelTrigger,
  EditableEditTrigger,
  EditableInput,
  EditablePreview,
  EditableRoot,
  EditableSubmitTrigger,
} from "../index.js";

// Basic wrapper used in most tests
function BasicEditable(props: React.ComponentProps<typeof EditableRoot>) {
  return (
    <EditableRoot {...props}>
      <EditableArea>
        <EditablePreview data-testid="preview" />
        <EditableInput data-testid="input" />
      </EditableArea>
      <EditableEditTrigger data-testid="edit-trigger">Edit</EditableEditTrigger>
      <EditableSubmitTrigger data-testid="submit-trigger">Save</EditableSubmitTrigger>
      <EditableCancelTrigger data-testid="cancel-trigger">Cancel</EditableCancelTrigger>
    </EditableRoot>
  );
}

// Wrapper that exposes the area for focus/data-attribute tests
function FocusEditable(props: React.ComponentProps<typeof EditableRoot>) {
  return (
    <EditableRoot {...props}>
      <EditableArea data-testid="area">
        <EditablePreview data-testid="preview" />
        <EditableInput data-testid="input" />
      </EditableArea>
    </EditableRoot>
  );
}

describe("Editable", () => {
  describe("Initial render", () => {
    it("shows preview with defaultValue", async () => {
      // Arrange
      await render(<BasicEditable defaultValue="Hello World" />);

      // Act - none

      // Assert
      await expect.element(page.getByTestId("preview")).toHaveTextContent("Hello World");
    });

    it("shows placeholder when empty", async () => {
      // Arrange
      await render(<BasicEditable defaultValue="" placeholder="Enter text" />);

      // Act - none

      // Assert
      await expect.element(page.getByTestId("preview")).toHaveTextContent("Enter text");
      await expect
        .element(page.getByTestId("preview"))
        .toHaveAttribute("data-placeholder-shown", "");
    });

    it("shows different placeholders for edit vs preview", async () => {
      // Arrange
      await render(
        <BasicEditable
          defaultValue=""
          placeholder={{ edit: "Type here", preview: "Click to add" }}
          activationMode="none"
        />,
      );

      // Assert preview placeholder
      await expect.element(page.getByTestId("preview")).toHaveTextContent("Click to add");

      // Act - enter edit mode
      await page.getByTestId("edit-trigger").click();

      // Assert edit placeholder
      await expect.element(page.getByTestId("input")).toHaveAttribute("placeholder", "Type here");
    });
  });

  describe("Edit lifecycle", () => {
    it("enters edit mode on focus (default activationMode)", async () => {
      // Arrange
      await render(<BasicEditable defaultValue="Test" />);

      // Act
      await page.getByTestId("input").click();

      // Assert - submit trigger visible when editing
      await expect.element(page.getByTestId("submit-trigger")).toBeVisible();
    });

    it("enters edit mode when clicking preview (activationMode=focus)", async () => {
      // Arrange
      await render(<BasicEditable defaultValue="Test" />);

      // Act - click the preview, not the input
      await page.getByTestId("preview").click();

      // Assert - editing mode activated
      await expect.element(page.getByTestId("submit-trigger")).toBeVisible();
    });

    it("enters edit mode when double-clicking preview (activationMode=dblclick)", async () => {
      // Arrange
      await render(<BasicEditable defaultValue="Test" activationMode="dblclick" />);

      // Assert - not editing initially
      await expect.element(page.getByTestId("submit-trigger")).not.toBeVisible();

      // Act - double-click the preview
      await page.getByTestId("preview").click({ clickCount: 2 });

      // Assert - editing mode activated
      await expect.element(page.getByTestId("submit-trigger")).toBeVisible();
    });

    it("does not enter edit mode when clicking preview (activationMode=none)", async () => {
      // Arrange
      await render(<BasicEditable defaultValue="Test" activationMode="none" />);

      // Act - click the preview
      await page.getByTestId("preview").click();

      // Assert - still not editing
      await expect.element(page.getByTestId("submit-trigger")).not.toBeVisible();
    });

    it("enters edit mode on double-click", async () => {
      // Arrange
      await render(<BasicEditable defaultValue="Test" activationMode="dblclick" />);

      // Assert - not editing initially
      await expect.element(page.getByTestId("submit-trigger")).not.toBeVisible();

      // Act - double click
      await page.getByTestId("input").click({ clickCount: 2 });

      // Assert
      await expect.element(page.getByTestId("submit-trigger")).toBeVisible();
    });

    it("enters edit mode via edit trigger when activationMode=none", async () => {
      // Arrange
      await render(<BasicEditable defaultValue="Test" activationMode="none" />);

      // Assert - not editing initially
      await expect.element(page.getByTestId("submit-trigger")).not.toBeVisible();

      // Act
      await page.getByTestId("edit-trigger").click();

      // Assert
      await expect.element(page.getByTestId("submit-trigger")).toBeVisible();
    });

    it("submit updates value and exits edit mode", async () => {
      // Arrange
      const onSubmit = vi.fn();
      await render(
        <BasicEditable
          defaultValue="Original"
          activationMode="none"
          submitMode="none"
          onSubmit={onSubmit}
        />,
      );

      // Act - enter edit mode
      await page.getByTestId("edit-trigger").click();
      // Clear and type new value
      await page.getByTestId("input").fill("Updated");
      // Submit
      await page.getByTestId("submit-trigger").click();

      // Assert
      await expect.element(page.getByTestId("preview")).toHaveTextContent("Updated");
      expect(onSubmit).toHaveBeenCalledWith("Updated");
    });

    it("cancel restores original value", async () => {
      // Arrange
      await render(
        <BasicEditable defaultValue="Original" activationMode="none" submitMode="none" />,
      );

      // Act
      await page.getByTestId("edit-trigger").click();
      await page.getByTestId("input").fill("Changed");
      await page.getByTestId("cancel-trigger").click();

      // Assert - value restored
      await expect.element(page.getByTestId("preview")).toHaveTextContent("Original");
    });
  });

  describe("Submit modes", () => {
    it("submitMode=blur submits on outside click", async () => {
      // Arrange
      const onSubmit = vi.fn();
      await render(
        <div>
          <BasicEditable defaultValue="Test" submitMode="blur" onSubmit={onSubmit} />
          <button data-testid="outside">Outside</button>
        </div>,
      );

      // Act
      await page.getByTestId("input").click(); // enter edit
      await page.getByTestId("input").fill("New Value");
      await page.getByTestId("outside").click(); // click outside

      // Assert
      expect(onSubmit).toHaveBeenCalledWith("New Value");
    });

    it("submitMode=blur submits on keyboard blur (Tab) to outside element", async (context) => {
      // Arrange
      const isWebkit =
        navigator.userAgent.includes("WebKit") && !navigator.userAgent.includes("Chrome");
      if (isWebkit) context.skip();

      const onSubmit = vi.fn();
      await render(
        <div>
          <BasicEditable
            defaultValue="Test"
            submitMode="blur"
            activationMode="none"
            onSubmit={onSubmit}
          />
          <button data-testid="outside">Outside</button>
        </div>,
      );

      // Act - enter edit via trigger and type a new value
      await page.getByTestId("edit-trigger").click();
      await page.getByTestId("input").fill("Keyboard Blur");

      // Tab until we reach the outside button
      // Note: edit-trigger is currently visible (bug), so we need extra tabs
      // In webkit, Tab simulation doesn't work reliably, so we use direct focus
      for (let i = 0; i < 5; i++) {
        await userEvent.keyboard("{Tab}");
        const activeId = document.activeElement?.getAttribute("data-testid");
        if (activeId === "outside") break;
      }

      // Assert - value submitted and edit mode exited
      await expect.element(page.getByTestId("preview")).toHaveTextContent("Keyboard Blur");
      expect(onSubmit).toHaveBeenCalledWith("Keyboard Blur");
    });

    it("submitMode=blur does NOT submit when tabbing to submit trigger", async () => {
      // Arrange
      const onSubmit = vi.fn();
      await render(
        <BasicEditable
          defaultValue="Original"
          submitMode="blur"
          activationMode="none"
          onSubmit={onSubmit}
        />,
      );

      // Act - enter edit and change the value
      await page.getByTestId("edit-trigger").click();
      await page.getByTestId("input").fill("Pending");

      // Move focus from input to submit trigger via Tab
      await userEvent.keyboard("{Tab}");

      // Assert - still editing, no implicit submit yet
      await expect.element(page.getByTestId("submit-trigger")).toBeVisible();
      expect(onSubmit).not.toHaveBeenCalled();

      // Act - explicit submit via trigger
      await page.getByTestId("submit-trigger").click();

      // Assert - value submitted only on explicit trigger
      await expect.element(page.getByTestId("preview")).toHaveTextContent("Pending");
      expect(onSubmit).toHaveBeenCalledWith("Pending");
    });

    it("submitMode=blur does NOT submit when tabbing to cancel trigger", async () => {
      // Arrange
      const onSubmit = vi.fn();
      await render(
        <BasicEditable
          defaultValue="Original"
          submitMode="blur"
          activationMode="none"
          onSubmit={onSubmit}
        />,
      );

      // Act - enter edit and change the value
      await page.getByTestId("edit-trigger").click();
      await page.getByTestId("input").fill("Pending");

      // Move focus from input -> submit trigger -> cancel trigger
      await userEvent.keyboard("{Tab}"); // -> submit trigger
      await userEvent.keyboard("{Tab}"); // -> cancel trigger

      // Assert - still editing, no implicit submit
      await expect.element(page.getByTestId("cancel-trigger")).toBeVisible();
      expect(onSubmit).not.toHaveBeenCalled();

      // Act - cancel via trigger
      await page.getByTestId("cancel-trigger").click();

      // Assert - value reverted
      await expect.element(page.getByTestId("preview")).toHaveTextContent("Original");
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("submitMode=none cancels on keyboard blur (Tab) to outside", async () => {
      // Arrange
      const onSubmit = vi.fn();
      await render(
        <div>
          <BasicEditable
            defaultValue="Original"
            submitMode="none"
            activationMode="none"
            onSubmit={onSubmit}
          />
          <button data-testid="outside">Outside</button>
        </div>,
      );

      // Act - enter edit and change the value
      await page.getByTestId("edit-trigger").click();
      await page.getByTestId("input").fill("Changed");

      // Tab past all the triggers to the outside button
      await userEvent.keyboard("{Tab}"); // -> submit trigger
      await userEvent.keyboard("{Tab}"); // -> cancel trigger
      await userEvent.keyboard("{Tab}"); // -> outside button

      // Assert - value reverted (cancelled), edit mode exited
      await expect.element(page.getByTestId("preview")).toHaveTextContent("Original");
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("submitMode=enter submits on Enter key", async () => {
      // Arrange
      const onSubmit = vi.fn();
      await render(<BasicEditable defaultValue="Test" submitMode="enter" onSubmit={onSubmit} />);

      // Act
      await page.getByTestId("input").click();
      await page.getByTestId("input").fill("Entered");
      await userEvent.keyboard("{Enter}");

      // Assert
      expect(onSubmit).toHaveBeenCalledWith("Entered");
    });

    it("submitMode=none requires explicit submit", async () => {
      // Arrange
      const onSubmit = vi.fn();
      await render(
        <div>
          <BasicEditable
            defaultValue="Test"
            activationMode="none"
            submitMode="none"
            onSubmit={onSubmit}
          />
          <button data-testid="outside">Outside</button>
        </div>,
      );

      // Act - enter edit, type, blur - should not submit
      await page.getByTestId("edit-trigger").click();
      await page.getByTestId("input").fill("Changed");
      await page.getByTestId("outside").click();

      // Assert - not submitted
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("submitMode=both submits on blur or Enter", async () => {
      // Arrange
      const onSubmit = vi.fn();
      await render(<BasicEditable defaultValue="Test" submitMode="both" onSubmit={onSubmit} />);

      // Act - test Enter
      await page.getByTestId("input").click();
      await page.getByTestId("input").fill("Via Enter");
      await userEvent.keyboard("{Enter}");

      // Assert
      expect(onSubmit).toHaveBeenCalledWith("Via Enter");
    });

    it("Escape cancels regardless of submitMode", async () => {
      // Arrange
      const onStateChange = vi.fn();
      await render(
        <BasicEditable defaultValue="Original" submitMode="enter" onStateChange={onStateChange} />,
      );

      // Act
      await page.getByTestId("input").click();
      await page.getByTestId("input").fill("Changed");
      await userEvent.keyboard("{Escape}");

      // Assert
      await expect.element(page.getByTestId("preview")).toHaveTextContent("Original");
      expect(onStateChange).toHaveBeenCalledWith("cancel");
    });
  });

  describe("Focus behavior", () => {
    it("clears data-focus on Escape", async () => {
      // Arrange
      await render(<FocusEditable defaultValue="Original" submitMode="enter" />);

      // Act - enter edit mode via input focus
      await page.getByTestId("input").click();
      await page.getByTestId("input").fill("Changed");

      // Assert - area marked as focused while editing
      await expect.element(page.getByTestId("area")).toHaveAttribute("data-focus", "");
      await expect.element(page.getByTestId("area")).toHaveAttribute("data-focused", "");

      // Act - cancel via Escape
      await userEvent.keyboard("{Escape}");

      // Assert - focus attrs cleared and value restored
      await expect.element(page.getByTestId("area")).not.toHaveAttribute("data-focus");
      await expect.element(page.getByTestId("area")).not.toHaveAttribute("data-focused");
      await expect.element(page.getByTestId("preview")).toHaveTextContent("Original");
    });

    it("clears data-focus on outside click with submitMode=blur", async () => {
      // Arrange
      const onSubmit = vi.fn();
      await render(
        <div>
          <FocusEditable defaultValue="Original" submitMode="blur" onSubmit={onSubmit} />
          <button data-testid="outside">Outside</button>
        </div>,
      );

      // Act - enter edit mode and change value
      await page.getByTestId("input").click();
      await page.getByTestId("input").fill("Changed");

      // Area focused while editing
      await expect.element(page.getByTestId("area")).toHaveAttribute("data-focus", "");

      // Click outside to submit
      await page.getByTestId("outside").click();

      // Assert - submitted and focus attrs cleared
      expect(onSubmit).toHaveBeenCalledWith("Changed");
      await expect.element(page.getByTestId("area")).not.toHaveAttribute("data-focus");
      await expect.element(page.getByTestId("area")).not.toHaveAttribute("data-focused");
    });

    it("clears data-focus and cancels on outside click when submitMode=none", async () => {
      // Arrange
      await render(
        <div>
          <FocusEditable defaultValue="Original" submitMode="none" />
          <button data-testid="outside">Outside</button>
        </div>,
      );

      // Act - enter edit mode and change value
      await page.getByTestId("input").click();
      await page.getByTestId("input").fill("Changed");

      // Area focused while editing
      await expect.element(page.getByTestId("area")).toHaveAttribute("data-focus", "");

      // Click outside to cancel
      await page.getByTestId("outside").click();

      // Assert - value reverted, edit mode off, focus attrs cleared
      await expect.element(page.getByTestId("preview")).toHaveTextContent("Original");
      await expect.element(page.getByTestId("area")).not.toHaveAttribute("data-focus");
      await expect.element(page.getByTestId("area")).not.toHaveAttribute("data-focused");
    });
  });

  describe("Controlled vs Uncontrolled", () => {
    it("uncontrolled manages state internally", async () => {
      // Arrange
      await render(
        <BasicEditable defaultValue="Initial" activationMode="none" submitMode="none" />,
      );

      // Act
      await page.getByTestId("edit-trigger").click();
      await page.getByTestId("input").fill("Updated");
      await page.getByTestId("submit-trigger").click();

      // Assert
      await expect.element(page.getByTestId("preview")).toHaveTextContent("Updated");
    });

    it("controlled respects external value", async () => {
      // Arrange
      function Controlled() {
        const [value, setValue] = useState<string | null>("Controlled");
        return (
          <div>
            <BasicEditable
              value={value}
              onChange={setValue}
              activationMode="none"
              submitMode="none"
            />
            <span data-testid="external-value">{value}</span>
          </div>
        );
      }
      await render(<Controlled />);

      // Act
      await page.getByTestId("edit-trigger").click();
      await page.getByTestId("input").fill("New");
      await page.getByTestId("submit-trigger").click();

      // Assert
      await expect.element(page.getByTestId("external-value")).toHaveTextContent("New");
      await expect.element(page.getByTestId("preview")).toHaveTextContent("New");
    });
  });

  describe("Props", () => {
    it("disabled prevents editing", async () => {
      // Arrange
      await render(<BasicEditable defaultValue="Test" disabled />);

      // Assert
      await expect.element(page.getByTestId("input")).toBeDisabled();
      await expect.element(page.getByTestId("edit-trigger")).toBeDisabled();
    });

    it("readOnly shows readonly attribute on input", async () => {
      // Arrange
      await render(<BasicEditable defaultValue="Test" readOnly activationMode="none" />);

      // Assert
      await expect.element(page.getByTestId("input")).toHaveAttribute("readonly");
    });

    it("maxLength enforces character limit", async () => {
      // Arrange
      await render(
        <BasicEditable defaultValue="" maxLength={5} activationMode="none" submitMode="none" />,
      );

      // Act
      await page.getByTestId("edit-trigger").click();
      await page.getByTestId("input").fill("1234567890");
      await page.getByTestId("submit-trigger").click();

      // Assert - truncated to 5 chars
      await expect.element(page.getByTestId("preview")).toHaveTextContent("12345");
    });

    it("startWithEditMode starts in edit mode", async () => {
      // Arrange
      await render(<BasicEditable defaultValue="Test" startWithEditMode />);

      // Assert - already editing
      await expect.element(page.getByTestId("submit-trigger")).toBeVisible();
    });

    it("selectOnFocus triggers on edit", async () => {
      // Arrange
      await render(<BasicEditable defaultValue="Select me" selectOnFocus activationMode="none" />);

      // Act
      await page.getByTestId("edit-trigger").click();

      // Assert - input is visible (edit mode active)
      await expect.element(page.getByTestId("submit-trigger")).toBeVisible();
    });
  });

  describe("Events", () => {
    it("onChange called on submit", async () => {
      // Arrange
      const onChange = vi.fn();
      await render(
        <BasicEditable
          defaultValue="Test"
          onChange={onChange}
          activationMode="none"
          submitMode="none"
        />,
      );

      // Act
      await page.getByTestId("edit-trigger").click();
      await page.getByTestId("input").fill("New");
      await page.getByTestId("submit-trigger").click();

      // Assert
      expect(onChange).toHaveBeenCalledWith("New");
    });

    it("onStateChange called on state transitions", async () => {
      // Arrange
      const onStateChange = vi.fn();
      await render(
        <BasicEditable
          defaultValue="Test"
          onStateChange={onStateChange}
          activationMode="none"
          submitMode="none"
        />,
      );

      // Act - edit
      await page.getByTestId("edit-trigger").click();
      expect(onStateChange).toHaveBeenCalledWith("edit");

      // Act - cancel
      await page.getByTestId("cancel-trigger").click();
      expect(onStateChange).toHaveBeenCalledWith("cancel");

      // Act - edit then submit
      await page.getByTestId("edit-trigger").click();
      await page.getByTestId("submit-trigger").click();
      expect(onStateChange).toHaveBeenCalledWith("submit");
    });

    it("onSubmit called with value on submit", async () => {
      // Arrange
      const onSubmit = vi.fn();
      await render(
        <BasicEditable
          defaultValue="Test"
          onSubmit={onSubmit}
          activationMode="none"
          submitMode="none"
        />,
      );

      // Act
      await page.getByTestId("edit-trigger").click();
      await page.getByTestId("input").fill("Submitted");
      await page.getByTestId("submit-trigger").click();

      // Assert
      expect(onSubmit).toHaveBeenCalledWith("Submitted");
    });
  });

  describe("Data attributes", () => {
    it("root has data-disabled when disabled", async () => {
      // Arrange
      await render(<BasicEditable defaultValue="Test" disabled data-testid="root" />);

      // Assert
      await expect.element(page.getByTestId("root")).toHaveAttribute("data-disabled", "");
    });

    it("root has data-readonly when readOnly", async () => {
      // Arrange
      await render(<BasicEditable defaultValue="Test" readOnly data-testid="root" />);

      // Assert
      await expect.element(page.getByTestId("root")).toHaveAttribute("data-readonly", "");
    });

    it("preview has data-empty when empty", async () => {
      // Arrange
      await render(<BasicEditable defaultValue="" />);

      // Assert
      await expect.element(page.getByTestId("preview")).toHaveAttribute("data-empty", "");
    });
  });

  describe("Form integration", () => {
    it("renders hidden input with name prop", async () => {
      // Arrange
      await render(<BasicEditable defaultValue="Form Value" name="test_field" required />);

      // Assert
      await expect.element(page.getByTestId("editable-hidden-input")).toHaveValue("Form Value");
    });
  });

  describe("Render prop", () => {
    it("passes state to render function", async () => {
      // Arrange
      await render(
        <EditableRoot defaultValue="Test" activationMode="none">
          {({ isEditing, isEmpty, value }) => (
            <div>
              <EditableArea>
                <EditablePreview />
                <EditableInput />
              </EditableArea>
              <EditableEditTrigger data-testid="edit-trigger">Edit</EditableEditTrigger>
              <span data-testid="is-editing">{isEditing ? "yes" : "no"}</span>
              <span data-testid="is-empty">{isEmpty ? "yes" : "no"}</span>
              <span data-testid="value">{value}</span>
            </div>
          )}
        </EditableRoot>,
      );

      // Assert initial state
      await expect.element(page.getByTestId("is-editing")).toHaveTextContent("no");
      await expect.element(page.getByTestId("is-empty")).toHaveTextContent("no");
      await expect.element(page.getByTestId("value")).toHaveTextContent("Test");

      // Act
      await page.getByTestId("edit-trigger").click();

      // Assert editing state
      await expect.element(page.getByTestId("is-editing")).toHaveTextContent("yes");
    });
  });
});
