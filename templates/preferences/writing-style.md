# Coding Style Guide

This document defines HOW I write TypeScript/React code. Follow these patterns exactly.

## Core Principles

1. **Strategic Documentation** - Code should be self-explanatory, but document complex logic and public APIs
2. **TypeScript Inference** - Let TypeScript infer types when possible
3. **Functional Style** - Prefer functional patterns and immutability
4. **Minimal JSDoc** - Use JSDoc sparingly for complex functions and public APIs

## Naming Conventions

### Variables
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
setLoadi