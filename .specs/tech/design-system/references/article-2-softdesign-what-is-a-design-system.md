# Design System: What It Is, Examples, and How to Create It Step by Step

**Source:** https://www.softdesign.com.br/blog/design-system-o-que-e-e-como-potencializa-produtos-digitais/
**Original language:** Portuguese (BR) — translated to English

---

## What is a Design System?

A Design System is a structured set of interconnected patterns, guidelines, and shared practices, organized coherently to guide the design and development of digital products in a consistent and scalable way.

According to experts on the subject, it is "a set of interconnected patterns and shared practices, organized coherently to achieve the purpose of digital products."

In practice, its main objective is to promote coherence, efficiency, and predictability in interface development, enabling teams to create high-quality solutions with greater agility. A widely known example is Bootstrap, developed by Twitter in 2010, which popularized the concept of reusable component libraries.

### Core Elements of a Design System

A Design System is composed of several elements that work together:

- **UI Kit:** A set of visual and interactive elements — such as buttons, icons, typography, and colors — used to build digital interfaces.
- **Design Tokens:** Named values that store design attributes, such as colors, spacing, and font sizes, functioning as reusable variables across design and code.
- **Component library:** A repository of reusable, modular, and documented UI components, such as buttons, forms, and cards.

### Design System vs Style Guide vs Pattern Library

| Concept             | What it is                                                                                                               | When to use                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| **Design System**   | A complete ecosystem combining principles, patterns, components, tokens, and documentation, integrating design and code. | Scalable digital products with multiple teams and continuous evolution. |
| **Style Guide**     | A visual guide with identity rules such as colors, typography, and brand usage.                                          | Simple projects focused only on visual consistency.                     |
| **Pattern Library** | A library of reusable UI components, without governance or strategic principles.                                         | Teams that need to accelerate delivery without a full system.           |

## Benefits of a Design System

1. **Increased development efficiency:** Reduces time spent on repetitive tasks, allowing teams to focus on innovation, accelerating time to market.
2. **Design consistency:** By maintaining unified visual and interaction standards, ensures all products share a cohesive identity, strengthening the brand and improving user experience.
3. **UX and UI improvements:** Ensures products are intuitive, accessible, and visually appealing, resulting in higher user satisfaction and engagement.

A notable example: IBM's Carbon Design System research revealed that the average time for a developer to create components from scratch is about 4.5 hours. Using Carbon, this period is reduced to two hours — a 47% improvement in speed.

## How to Create a Design System: Step by Step

### 1. Research and plan

Assess the company's needs, product maturity stage, and main consistency challenges. Define clear objectives and study consolidated references like Carbon Design System (IBM), Atlassian Design System, and Material Design (Google).

### 2. Develop fundamental components

Start with basic interface elements such as colors, typography, icons, and buttons, then gradually evolve to more complex components like forms, modals, and tables. This process often follows principles like **Atomic Design**, ensuring modularity, reuse, and easy maintenance.

### 3. Collect feedback and evolve continuously

A Design System is not a project with a defined end, but a living product. Establish continuous feedback cycles, encourage team suggestions, and constantly evaluate component adoption and efficiency.

### 4. Document the Design System

Documentation is one of the pillars of a successful Design System. Use tools to centralize principles, usage rules, tokens, components, and practical examples to reduce questions and accelerate onboarding.

## Atomic Design

Atomic Design, proposed by Brad Frost, is a methodology for creating modular and scalable design systems. It decomposes the user interface into five hierarchical levels:

- **Atoms:** The most basic building blocks, such as icons, typography, buttons, and input fields.
- **Molecules:** Combinations of atoms forming simple functional components, like a text input field with a label and submit button.
- **Organisms:** More complex components formed by combining molecules and atoms, such as navigation bars.
- **Templates:** Structures that combine organisms to form page layouts, providing an overview of how different components are organized.
- **Pages:** Specific instances of templates filled with content, representing the final interface the user will see.

## Design Tokens

Design Tokens are named values that store design attributes — colors, spacing, font sizes, shadows, and other parameters that define the appearance and behavior of an interface. They function as reusable variables across different contexts and platforms, ensuring visual consistency and facilitating maintenance.

## Integration and Tooling

- **Figma:** Supports multiple languages (CSS, Swift) and allows real-time collaboration.
- **Sketch:** Popular among UI/UX Designers, offers a robust environment for creating design components.
- **Adobe XD:** Offers advanced prototyping and collaboration features.
- **ZeroHeight / Storybook:** Used for centralizing documentation — principles, usage rules, tokens, components, and practical examples.

## Real-World Examples

- **Material Design (Google):** Clear layout, motion, typography, color, and accessibility guidelines; widely used for scalable products.
- **Atlassian (Jira/Confluence):** Focused on collaborative B2B products; notable for detailed documentation and strong design-code integration.
- **Carbon Design System (IBM):** Built for complex enterprise products, with a focus on accessibility, modularity, and governance.

## Key Takeaways

- A design system is a **living product**, not a finished project — it requires a roadmap, backlog, versioning, and ownership.
- **Tokens are the contract between design and code** — named tokens eliminate magic values spread across the codebase.
- **Atomic Design** provides a proven methodology for modular, reusable, and maintainable component structures.
- **Documentation is a first-class citizen** — without it, the system cannot be adopted or maintained.
- **Measuring efficiency** matters: track reuse rate, development speed, visual consistency, and team satisfaction.
