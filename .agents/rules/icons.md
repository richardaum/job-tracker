# Icon Conventions

## Library

All icons come from `@phosphor-icons/react`. Named imports, PascalCase with `Icon` suffix.

## Global concept map

A canonical map lives at `packages/ui/src/icons/concept-map.ts` (`conceptIcon`). When a semantic concept is already mapped there, import from the map instead of reaching for a Phosphor icon directly.

```ts
import { conceptIcon } from "@job-tracker/ui";

// ✓ GOOD
conceptIcon.edit, conceptIcon.delete

// ✗ BAD — concept already mapped
PencilSimpleIcon, TrashIcon
```

If a concept is missing, add it to `conceptIcon` first.

## Size and weight

| Context | `size` | `weight` |
|---|---|---|
| Inline controls (buttons, dropdowns, fields) | `14` | `"regular"` |
| Navigation (sidebar, tabs) | `16` | `"regular"` |
| Compact card variant | `13` | `"regular"` |
| Primary action buttons | `14` | `"bold"` |
| Toast, Alert | `18` | `"regular"` |
| Status/fill icons | `14` / `16` | `"fill"` |
| Hero / decorative | `20` – `28` | `"duotone"` |

## Domain-specific icon configs

When a domain has a set of related concepts that map to icons (e.g. blocked-keyword scopes), create a centralized config object in the domain's `shared/` directory:

```
apps/web/src/modules/profile/blocked-keywords/shared/blocked-keywords.config.ts
```

Structure: `Record<Key, { label, icon: ComponentType, colorClass? }>`. Import `icon` as component and render with size/weight/className at the call site. Both the list items and the tab bar consume the same config — never duplicate icon/color decisions.

## Color

Concept icons may use colors to differentiate categories. Use Tailwind color utilities. Prefer darker shades (`-700` range) for better contrast. Avoid hardcoded hex colors in component files — keep color classes in the config alongside the icon mapping.
