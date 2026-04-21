# Design System 102: How to Build a Design System

**Source:** https://www.figma.com/blog/design-systems-102-how-to-build-your-design-system/
**Language:** English

---

This comprehensive guide walks teams through creating a design system in three main phases: laying groundwork, defining foundations, and building in Figma. The article emphasizes that "a well-crafted design system is a powerful tool for teams looking to create cohesive, scalable, and efficient processes."

## Step 1: Lay the Groundwork

### Define Your Goals

Start by answering fundamental questions:

- Why build a design system?
- What problems will it solve?
- How will you measure success?

### Take Stock of What You Have

Conduct a thorough audit of existing UI across platforms, devices, and interactive states. Importantly, also inventory your codebase—engineers may have already created reusable components not documented in design files.

### Organize and Evaluate

Categorize your examples and identify inconsistencies, redundancies, and areas where the product feels disjointed. These signal opportunities for improvement through systematic design.

### Find Your Champions

Building a design system requires cross-functional collaboration. Seek passionate advocates from design, development, product management, and other stakeholder groups. Developers are particularly valuable for providing technical feasibility insights.

### Choose Your Approach

Two main strategies exist:

- **Build from scratch**: Tailored to unique requirements but requires more upfront time and resources
- **Adopt and adapt existing frameworks**: Faster implementation but may need customization

### Align with Company Goals

Ensure the initiative supports broader business objectives. Tie the system to tangible benefits like faster time-to-market or improved developer productivity to secure stakeholder buy-in and resources.

### Define Your Guiding Principles

Establish memorable, actionable statements serving as a north star. Principles should:

1. Start with "why"—articulate core beliefs driving them
2. Be specific with concrete examples
3. Translate into tangible practices for designers and developers

## Step 2: Define Your Foundations

### Make Design Accessible to Everyone

Accessibility should be a core principle. Consider font sizes, color contrast, component labeling, and clear guidelines for both designers and developers. The foundation enables more inclusive products.

### Choose Colors That Work Well Together

Select a balanced palette functioning across different modes (light/dark) and platforms. A useful rule suggests: 60% neutral colors, 30% primary colors, 10% secondary or accent colors.

### Pick Typography That's Easy to Read

Choose fonts matching brand personality and readability. Establish consistent font sizes and line heights through a **type scale**, commonly based on 16-pixel sizing.

### Use Elevation to Create Visual Hierarchy

Shadows, layers, and transparency create depth and order, helping users intuitively understand which elements are primary versus secondary.

### Create Consistent and Meaningful Icons

A well-designed icon system strengthens brand identity and improves usability. Use icon grids for consistent sizing and alignment, and provide descriptive names for easy discovery.

### Apply Tokens Using Variables and Styles

In Figma, use **variables** (storing single values like colors) and **styles** (holding complex information like gradients). Categorize into:

- **Primitives**: Basic building blocks (colors, spacing, sizing)
- **Semantic**: Meaningful context for usage (e.g., "color-background-warning")

Maintain shared naming conventions between design and code for seamless alignment.

### Use Layout Grids and Spacing

Spatial systems create structure and consistency:

- **Layouts**: Adapt to different screen sizes
- **Grids**: Column, baseline, and modular grids align elements consistently
- **Spacing**: Define consistent units controlling distances between elements

Note: "Eight is a recurring number in design systems" because most device breakpoints are divisible by eight, making it an ideal base unit.

**Responsive design** optimizes viewing across diverse devices. Pre-built layout components and templates with predefined breakpoints enable efficient creation while maintaining consistency.

## Step 3: Build Your Design System in Figma

### Take a Closer Look at Your Existing Designs

Revisit your initial audit alongside the code audit. Map design elements to existing code components wherever possible, ensuring you build on the developer foundation rather than creating parallel systems.

**Component properties** are changeable aspects tied to specific design properties, defining what others can modify.

### Choose Clear and Consistent Names

Use **semantic naming** reflecting function rather than appearance or coding implementation. For example, "color-warning" instead of a hex value. This approach creates "a shared language that bridges design and development."

Discuss naming conventions with development teams (hyphens like "primary-button" or camelCase like "primaryButton" are common).

### Organize Your Figma Library

Leverage Figma's ability to share libraries across files and projects. Consider whether to keep everything in a single file or split into multiple files for different components. Think about how both design and development teams will access the library.

**Code Connect** directly links design components to code implementation, surfacing code from your codebase within Figma for easier consistency maintenance between design and development.

## Key Takeaways

- Design systems aren't one-size-fits-all; they exist on a spectrum from simple component collections to enterprise systems
- Start with clear goals addressing specific problems your organization faces
- Involve cross-functional teams from the beginning, especially developers
- Build foundations systematically: accessibility, color, typography, elevation, icons, tokens, spacing
- Create semantic naming conventions shared between design and development
- Organize libraries thoughtfully for team access and usability
- Remember that "building a design system in Figma is an ongoing process that will grow and evolve along with your team"
