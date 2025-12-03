# @inline-edit/react

<!-- ![CI passing](https://github.com/Haberkamp/editable/actions/workflows/ci.yml/badge.svg?event=push&branch=main) -->
![Created by](https://img.shields.io/badge/created%20by-@n__haberkamp-065afa.svg)
![NPM License](https://img.shields.io/npm/l/%40editable%2Freact)
[![Changelog](https://img.shields.io/badge/changelog-blue)](./CHANGELOG.md)

## Highlights

- Easy to use API
- Fully controlled or uncontrolled
- customizable activation modes (focus, double-click)
- Auto-resizing input
- 100% TypeScript

## Overview

Sometimes you want your users to double click on a text, so they can edit it. This is what this packages does.

### Author

Hey, I'm Nils. In my spare time [I write about things I learned](https://www.haberkamp.dev/) or I [create open source packages](https://github.com/Haberkamp), that help me (and hopefully you) to build better apps.

## Installation

You can install this package with any package manager you like.

```bash
pnpm install @inline-edit/react
```

## Usage

You need a few components to get started:

- `EditableRoot`
- `EditableArea`
- `EditablePreview`
- `EditableInput`

```tsx
import { EditableRoot, EditableArea, EditablePreview, EditableInput } from "@inline-edit/react";

<EditableRoot defaultValue="Click to edit">
  <EditableArea>
    <EditablePreview />
    <EditableInput />
  </EditableArea>
</EditableRoot>
```

### Examples

#### Activation Mode

You can change how users can edit the text.

**Double Click**

```tsx
<EditableRoot activationMode="dblclick" defaultValue="Double click to edit">
  <EditableArea>
    <EditablePreview />
    <EditableInput />
  </EditableArea>
</EditableRoot>
```

**Focus** (Default)

```tsx
<EditableRoot activationMode="focus" defaultValue="Focus to edit">
  <EditableArea>
    <EditablePreview />
    <EditableInput />
  </EditableArea>
</EditableRoot>
```

#### Submit Mode

You can control when to submit changes.

**Enter Key and Blur** (Default)

```tsx
<EditableRoot submitMode="both" onSubmit={(value) => console.log(value)}>
  <EditableArea>
    <EditablePreview />
    <EditableInput />
  </EditableArea>
</EditableRoot>
```

**Enter Key Only**

```tsx
<EditableRoot submitMode="enter">
  <EditableArea>
    <EditablePreview />
    <EditableInput />
  </EditableArea>
</EditableRoot>
```

#### Auto Resize

The input can automatically resize to fit its content.

```tsx
<EditableRoot autoResize defaultValue="I will grow as you type">
  <EditableArea>
    <EditablePreview />
    <EditableInput />
  </EditableArea>
</EditableRoot>
```

### Anatomy

#### EditableRoot

The root container that manages state and context.

Props:
- `value`: `string` - Controlled value.
- `defaultValue`: `string` - Initial value.
- `onChange`: `(value: string) => void` - Called when value changes.
- `onSubmit`: `(value: string) => void` - Called when editing is submitted.
- `activationMode`: `"focus" | "dblclick" | "none"` - How to activate edit mode. Default: `"focus"`.
- `submitMode`: `"enter" | "blur" | "both" | "none"` - How to submit changes. Default: `"both"`.
- `placeholder`: `string | { preview: string; edit: string }` - Placeholder text.
- `disabled`: `boolean` - Disables interaction.
- `readOnly`: `boolean` - readonly state.
- `autoResize`: `boolean` - Whether input should auto-resize.
- `selectOnFocus`: `boolean` - Whether to select text when entering edit mode.

#### EditableArea

Container for the preview and input components.

Data attributes:
- `data-focused`: Present when editing.
- `data-disabled`: Present when disabled.
- `data-readonly`: Present when readonly.
- `data-empty`: Present when value is empty.

#### EditablePreview

Displays the value when not editing.

#### EditableInput

The input field shown when editing.

#### EditableEditTrigger, EditableSubmitTrigger, EditableCancelTrigger

Buttons to trigger actions programmatically.

## Feedback and Contributing

I highly appreciate your feedback! Please create an [issue](https://github.com/Haberkamp/editable/issues/new), if you've found any bugs or want to request a feature.

