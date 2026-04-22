# Design Tokens Explained (and How to Build a Design Token System)

**Source:** https://www.contentful.com/blog/design-token-system/
**Language:** English

---

## What are design tokens?

Design tokens are vital for capturing all the design decisions utilized within your design system. These decisions cover a variety of elements that define your product and brand, such as colors, text, borders, and animations.

Typically stored in JSON files due to their flexibility, these tokens can be transformed and integrated across various platforms through a multitude of existing transformation packages. With a robust foundation of reusable tokens encapsulated in JSON files, the entire design system is constructed.

Design tokens can generally be categorized into three types:

1. **Primitive Tokens:** The most basic form of tokens, reducing infinite possibilities to a select few most relevant to the brand. This could range from a couple of dozen to a couple of hundred. The goal is to create a robust palette that resonates with your brand identity.

2. **Semantic Tokens:** These tokens carry meaning and imply how and where they should be applied. They typically reference only the primitive tokens but include guidance on how colors should be used in text, the types of text to use, etc., embedding both meaning and guidance within.

3. **Component Tokens:** Specific to individual components and generally refer to semantic tokens. For example, a token defining the corner radius of a button applies exclusively to that button. Component tokens are valuable for theming scenarios where there is a need to alter not only primary colors but component-specific attributes that really empower themes to capture their unique look and feel.

## First Primitive Token

Let's begin by defining our first primitive token: your primary brand color. Selecting this color likely involved extensive discussions, considerations of contrast, and compliance with accessibility standards such as the WCAG, so it's important that we capture and store this value in a token.

We made a few important decisions while creating our design token. First, we prefixed the name with "color" to categorize it and distinguish it from other types of design decisions. This also helps maintain a clear structure as we expand our token system.

Next, we put this decision into our initial JSON representation, capturing not only the category ("color") but also specifying its type. By including the type, we indicate that this token represents a color, providing guidance on how it should be processed.

### Distributing Primitive Tokens

With a single design token in hand, it's a good opportunity to consider how we'll transform and distribute it to ensure it reaches all the necessary destinations. Transformations can be done with specific packages like Style Dictionary and Knapsack. While it might seem easy to create your own transformations, these packages help keep things abstract and manageable.

In all these transformations, we aimed to maintain consistent naming conventions across different exports. This consistency ensures that everyone, regardless of role or platform, can use the same Design Language and easily find what they need in each context.

### Expanding on Our Primitive Token

We've established our primary design token and created a simple way to export it into usable code. Now, let's build out our color palette. The primary color alone isn't enough; we need slightly darker and lighter variations, along with neutral colors like grays, to reduce the millions of possible color choices into a manageable set.

To create a more comprehensive palette, we can designate our primary color as "Primary 500," allowing us to define lighter and darker versions. When expanding the palette, consider accessibility guidelines such as WCAG contrast concerns.

To manage variations, we can use a 100-based stepping system and work to keep relative variations between the different colors as similar as possible. This allows users to easily intuit relative differences as well as allow room for subtle differences between levels.

## First Semantic Token

We now have a versatile array of colors at our disposal thanks to our primitive tokens. Next, let's construct a semantic layer with these tokens, which will provide clear guidance on how to apply these colors effectively, creating a meaningful set of design rules.

Many design systems stop at the primitive token point, achieving a basic level of consistency, which is certainly better than having no defined palette. However, there's still a lot of ambiguity.

There are a lot of design decisions that are still going to be decided socially. For example, if you've decided that the 500-step color should be accessibility compliant for use on a white background, that information isn't inherent in the token itself — it has to be communicated separately.

Semantic tokens can refer to other tokens and encapsulate specific uses or guidelines. This capability allows us to take our existing palette and define specific usage patterns, reducing ambiguity and formally capturing more design decisions.

### Building the Semantic System

In our system, we prefer not to use black as the default text color. Instead, we opt for an off-gray or gray 200, which should be the primary text color in most cases. To enforce this, we created a new semantic token called "text-default," with gray 200 as its value. This new token conveys more information than a primitive token — it defines the role and proper application of the color.

With semantic tokens, we can now encapsulate design decisions within the system, providing clear guidance to those using the design system. By defining tokens like "text-default," we start to build an API for our design system — a framework through which people can interact with our model.

### Distributing Semantic Tokens

Looking at the code, you can see that in the tokens and in each output format, there's a way for one token to reference another or for one CSS variable to reference another. This is called an **alias** in design tokens.

This functionality is powerful because it allows you to establish relationships between tokens and create more meaningful connections. This capability enables you to express design guidelines in a more conversational way, guiding developers and designers on how to use primitive tokens.

### Expanding on Our Semantic Token

Striking the right balance is a critical reason for creating your own design system. It allows you to establish a unique understanding and approach to expressing your brand while maintaining consistency.

Building upon the concept of focusing on what is meaningful while explicitly ignoring what is not, you can design a simple **two-dimensional grid for organizing design tokens** as a starting point. The main structure involves placing simpler, more straightforward tokens along the x-axis, and the more complex tokens along the y-axis.

This grid approach allows for clear visualization of how tokens interrelate and where simplifications can be made.

## First Component Token

Now that we have established a simple system of primitives and semantic tokens, let's explore our first component token. Component tokens serve several purposes:

- Act as a form of documentation between designers and developers
- Clarify and coordinate the parts of a component that need to be developed
- Enable a multi-themed token system — a single button in code reusable for different, unique brands

However, component tokens introduce another level of abstraction that requires careful management. A design system with a single theme might be more manageable if it only utilizes semantic tokens. In a scenario with two distinct brands, component tokens allow each brand to customize specific attributes without breaking the overall token structure.

## Modes, Token Collections, and Themes

### Mode

A mode represents variations in a token's values that apply across multiple tokens. A simple example is light and dark modes. A single token can have multiple values under different modes, allowing for adaptive designs.

In CSS, the light value can be set as the default within the root scope. To introduce support for dark mode, we can create an additional class that changes the reference whenever this class is applied. This approach lets you switch between light and dark themes by adjusting the class applied to a parent element.

### Token Collection

A token collection groups together tokens based on how modes are applied. For example, a dark and light theme might only pertain to color tokens. You would assemble a collection comprising only color tokens, isolated from typography and spacing.

### Theme

A theme encompasses the entire set of token collections. Creating a new theme involves duplicating all existing tokens and collections but with altered values that can be uniformly applied across a suite of components. This allows for comprehensive and cohesive theme variations across an entire application.

> Note: "Theme" is sometimes used to refer to a "mode," so it's important to qualify what you mean by "theme."

## Overall Architecture

After walking through the process of building a basic token system into semantic tokens and primitives, and adding modes, we've developed a structured grid. Alongside this, we've designed a basic code architecture that can be captured in JSON, transformed using tools like Style Dictionary, and exported to formats like CSS and Swift, with synchronization in Figma.

```
Tokens (JSON) → Style Dictionary transformer → CSS / Swift / XML / Figma Variables
```

The tokens sit in the center of this architecture, serving as the foundational data. The transformer wraps around them, generating various outputs and ensuring consistency across different platforms from a single source.

## Key Takeaways

- **Design tokens are not just CSS variables** — they are named design decisions with semantics and transformable to any platform
- **Three-tier architecture:** Primitive → Semantic → Component
- **Semantic layer** removes ambiguity by encoding "how" and "where" to use a color, not just "what" the color is
- **Modes** enable dark/light switching at the token level — components stay untouched
- **Component tokens** enable multi-brand theming from a single component implementation
- **Consistency in naming** across design and code is the foundation of the shared design language
- AI will amplify whatever design token foundation you provide — a solid system is increasingly a competitive advantage
