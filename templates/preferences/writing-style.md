---
name: "Coding Style Guide"
description: "Defines TypeScript/React coding conventions and patterns"
ai_instructions: |
  When writing code:
  1. Use arrow functions for components and callbacks
  2. Let TypeScript infer types when obvious
  3. Use interfaces for object shapes, types for unions/aliases
  4. Follow the exact naming conventions specified
  5. Prefer functional patterns and immutability
---

# Coding Style Guide

<ai-context>
This document defines HOW to write TypeScript/React code. These are strict conventions that must be
followed exactly. The style emphasizes readability, TypeScript inference, and functional patterns.
AI must follow these patterns precisely when generating code.
</ai-context>

This document defines HOW I write TypeScript/React code. Follow these patterns exactly.

## Core Principles

<ai-rules>
- USE arrow functions for components and most functions
- LET TypeScript infer types when obvious
- PREFER functional patterns over imperative
- DOCUMENT complex logic and public APIs with JSDoc
- AVOID unnecessary type annotations
</ai-rules>

1. **Strategic Documentation** - Code should be self-explanatory, but document complex logic and public APIs
2. **TypeScript Inference** - Let TypeScript infer types when possible
3. **Functional Style** - Prefer functional patterns and immutability
4. **Minimal JSDoc** - Use JSDoc sparingly for complex functions and public APIs

## Naming Conventions

### Variables

<validation-schema>
Variable Naming:
- ✅ userName, isActive, hasPermission (camelCase)
- ✅ users, files (plural for arrays)
- ✅ MAX_FILE_SIZE (UPPER_SNAKE for constants)
- ❌ user_name (no snake_case)
- ❌ UserName (PascalCase for variables)
- ❌ USERS (uppercase for regular arrays)
</validation-schema>
```typescript
// camelCase for regular variables
const userName = 'John';
const isActive = true;
const hasPermission = false;
const canEdit = false;
const shouldRender = true;

// Plural for collections
const users = [];
const files = [];

// UPPER_SNAKE_CASE for environment variables and enum-like objects
const API_KEY = process.env.API_KEY;
const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB

export const ActivityTypes = {
    CLIENT_CREATE: 40,
    FLIGHT_CREATE: 30
};
```

### Functions
```typescript
// camelCase, verb-based, descriptive
const fetchUserData = async () => {};
const calculateTotal = (items) => {};
const formatBytes = (bytes: number, decimals: number = 2) => {};

// Event handlers with 'on' prefix
const onChange = () => {};
const onMouseOver = useCallback(() => {}, []);

// Hooks with 'use' prefix
const useAuth = () => {};
const useConfig = () => {};
```

### Types and Interfaces
```typescript
// PascalCase, no prefixes
// Use interface for object shapes
interface UserData {
    id: string;
    name: string;
}

interface Props {
    title: string;
    isActive?: boolean;
}

// Use type for unions, intersections, and aliases
type Status = "active" | "inactive" | "pending";
type ID = string | number;
type PartialUser = Partial<UserData>;
```

### Components
```typescript
// PascalCase with arrow functions
export const UserProfile: React.FC<Props> = ({ name, email }) => {
    return <div>{name}</div>;
};

// B-prefix only when extending library components
export const BTextField = (props: Props) => {
    // Extends @mui/TextField
};
```

## Function Patterns

### Component Style

<code-template name="react-component">
```typescript
// Arrow function with const
export const HomePage = ({ title, content }: Props) => {
    // Hooks first
    const [state, setState] = useState('');
    const mounted = useRef(false);
    
    // Callbacks with useCallback
    const handleClick = useCallback(() => {
        // handler logic
    }, []);
    
    // Effects
    useEffect(() => {
        // effect logic
    }, []);
    
    // Early returns
    if (!title) return null;
    
    // Main render
    return <div>{content}</div>;
};
```
</code-template>

### Utility Functions
```typescript
// Named function with export
export function filterUnique(val: any, index: number, array: any[]) {
    return array.indexOf(val) === index;
}

// Parameters on one line
export function processData(id: string, config: Config, options: Options) {}

// Default values inline
const formatBytes = (bytes: number, decimals: number = 2) => {};
```

### Return Patterns
```typescript
// Early returns without braces
if (!session) return;
if (typeof window === "undefined") return null;

// Multi-line conditions without braces
if (!origin || origin === 'center') 
    return defaults;

// No explicit return types (let TypeScript infer)
function calculateSum(a: number, b: number) {
    return a + b;
}
```

## TypeScript Usage

### Type Inference

<ai-decision-tree>
Should I add a type annotation?

1. Is the type obvious from the value?
   → YES: Don't add type (let TypeScript infer)
   → NO: Continue to 2

2. Is it a function parameter?
   → YES: Add type annotation
   → NO: Continue to 3

3. Is it a complex object or union?
   → YES: Add type annotation
   → NO: Continue to 4

4. Would the inferred type be 'any'?
   → YES: Add type annotation
   → NO: Let TypeScript infer
</ai-decision-tree>
```typescript
// Let TypeScript infer when obvious
const [loading, setLoading] = useState(false);  // NOT useState<boolean>(false)
const [name, setName] = useState('');           // NOT useState<string>('')

// Add types only when necessary
const [user, setUser] = useState<User | null>(null);  // Type needed here

// Use @ts-ignore over casting
// @ts-ignore
element.style.webkitClipPath = clipPath;
// NOT: (element.style as any).webkitClipPath = clipPath;
```

### Interface vs Type Usage
```typescript
// Interfaces for object shapes and contracts
interface UserData {
    id: string;
    name: string;
    email?: string;
}

interface Props {
    readonly label?: string;
    readonly onChange: (val: string) => void;
}

// Types for everything else
type Status = "active" | "inactive" | "pending";
type ID = string | number;
type UserWithStatus = UserData & { status: Status };
```

## State Management

<code-template name="state-update-pattern">
```typescript
// Functional updates when using previous state
setState(prev => ({
    ...prev,
    layers: prev.layers.map(layer => {
        if (layer.id !== targetId) return layer;
        return { ...layer, ...updates };
    })
}));

// Direct updates otherwise
setLoading(false);
setName('John');
```
</code-template>

## Import Organization

<ai-rules>
- GROUP imports by type (external, internal, types)
- ORDER: React first, then external libs, then internal
- USE absolute imports with @ alias
- AVOID default exports except for pages/components
- PREFER named exports for better refactoring
</ai-rules>

## Summary

<ai-decision-tree>
Which pattern should I use?

1. Defining a component?
   → Arrow function with const

2. Defining a type?
   → Object shape: interface
   → Union/alias: type

3. Naming something?
   → Component: PascalCase
   → Function: camelCase
   → Constant: UPPER_SNAKE_CASE
   → File: camelCase.ts or PascalCase.tsx

4. Adding types?
   → Obvious from value: No
   → Complex/unclear: Yes
</ai-decision-tree>