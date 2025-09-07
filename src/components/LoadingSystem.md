# Loading System Documentation

This document describes the comprehensive loading system implemented in the Sijil application.

## Components

### 1. LoadingSpinner

A versatile loading spinner component with multiple variants and sizes.

#### Props
- `size`: 'small' | 'medium' | 'large' | 'fullscreen' (default: 'medium')
- `variant`: 'spinner' | 'dots' | 'pulse' | 'shimmer' (default: 'spinner')
- `message`: string (default: 'Loading...')
- `showMessage`: boolean (default: true)
- `color`: 'primary' | 'secondary' | 'inherit' (default: 'primary')
- `thickness`: number (default: 4)

#### Usage Examples

```tsx
// Basic spinner
<LoadingSpinner />

// Large pulse animation
<LoadingSpinner size="large" variant="pulse" message="Processing data..." />

// Small dots for inline loading
<LoadingSpinner size="small" variant="dots" showMessage={false} />

// Fullscreen loading
<LoadingSpinner size="fullscreen" variant="spinner" message="Initializing..." />
```

### 2. LoadingOverlay

A loading overlay that can be applied over content or as a backdrop.

#### Props
- `loading`: boolean
- `message`: string (default: 'Loading...')
- `variant`: 'overlay' | 'backdrop' (default: 'overlay')
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `spinnerVariant`: 'spinner' | 'dots' | 'pulse' | 'shimmer' (default: 'spinner')
- `showMessage`: boolean (default: true)
- `color`: 'primary' | 'secondary' | 'inherit' (default: 'primary')
- `thickness`: number (default: 4)
- `children`: React.ReactNode

#### Usage Examples

```tsx
// Overlay on content
<LoadingOverlay loading={isLoading} message="Saving data...">
  <YourContent />
</LoadingOverlay>

// Backdrop loading
<LoadingOverlay 
  loading={isLoading} 
  variant="backdrop" 
  size="large" 
  spinnerVariant="pulse"
>
  <YourContent />
</LoadingOverlay>
```

### 3. SkeletonLoader

A skeleton loading component for content placeholders.

#### Props
- `variant`: 'table' | 'card' | 'list' | 'form' | 'chart' | 'custom'
- `rows`: number (default: 5)
- `columns`: number (default: 1)
- `height`: number | string (default: 60)
- `width`: number | string (default: '100%')
- `showHeader`: boolean (default: true)
- `showAvatar`: boolean (default: false)
- `showText`: boolean (default: true)
- `showImage`: boolean (default: false)
- `customLayout`: React.ReactNode

#### Usage Examples

```tsx
// Table skeleton
<SkeletonLoader variant="table" rows={10} columns={6} />

// Card skeleton
<SkeletonLoader variant="card" showAvatar={true} showText={true} />

// Form skeleton
<SkeletonLoader variant="form" rows={8} />

// Custom skeleton
<SkeletonLoader variant="custom" customLayout={<YourCustomSkeleton />} />
```

## Context

### LoadingContext

A global loading context for managing application-wide loading states.

#### Hook: useLoading

```tsx
const { isLoading, loadingMessage, showLoading, hideLoading, setLoadingMessage } = useLoading();

// Show loading
showLoading('Processing payment...');

// Update message
setLoadingMessage('Almost done...');

// Hide loading
hideLoading();
```

#### Hook: useApiWithLoading

A convenience hook for API calls with automatic loading state management.

```tsx
const { callWithLoading } = useApiWithLoading();

const handleSubmit = async () => {
  try {
    await callWithLoading(
      () => apiService.createInvoice(data),
      'Creating invoice...',
      'Invoice created successfully!',
      'Failed to create invoice'
    );
  } catch (error) {
    // Handle error
  }
};
```

## Best Practices

### 1. Choose the Right Component

- **LoadingSpinner**: For simple loading indicators
- **LoadingOverlay**: For loading over specific content areas
- **SkeletonLoader**: For content placeholders during data loading
- **LoadingContext**: For global loading states

### 2. Loading States

- Use `LoadingSpinner` with `size="fullscreen"` for initial app loading
- Use `LoadingOverlay` for form submissions and data operations
- Use `SkeletonLoader` for content that takes time to load
- Use `LoadingContext` for complex multi-step operations

### 3. User Experience

- Always provide meaningful loading messages
- Use appropriate animation variants for different contexts
- Keep loading times as short as possible
- Provide feedback for long-running operations

### 4. Performance

- Use skeleton loaders for better perceived performance
- Implement progressive loading for large datasets
- Cache data to reduce loading times
- Use loading states to prevent multiple simultaneous requests

## Examples

### Page Loading
```tsx
const MyPage = () => {
  const [loading, setLoading] = useState(true);
  
  if (loading) {
    return <LoadingSpinner size="large" variant="pulse" message="Loading page..." />;
  }
  
  return <YourContent />;
};
```

### Form Submission
```tsx
const MyForm = () => {
  const [submitting, setSubmitting] = useState(false);
  
  return (
    <LoadingOverlay loading={submitting} message="Submitting form...">
      <form onSubmit={handleSubmit}>
        {/* form fields */}
      </form>
    </LoadingOverlay>
  );
};
```

### Data Table
```tsx
const DataTable = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  
  if (loading) {
    return <SkeletonLoader variant="table" rows={10} columns={5} />;
  }
  
  return <Table data={data} />;
};
```

### Global Loading
```tsx
const MyComponent = () => {
  const { showLoading, hideLoading } = useLoading();
  
  const handleComplexOperation = async () => {
    showLoading('Starting operation...');
    
    try {
      // Step 1
      await step1();
      
      // Step 2
      showLoading('Processing data...');
      await step2();
      
      // Step 3
      showLoading('Finalizing...');
      await step3();
      
      hideLoading();
    } catch (error) {
      hideLoading();
      // Handle error
    }
  };
  
  return <button onClick={handleComplexOperation}>Start</button>;
};
```

## Migration Guide

### From Old Loading System

1. Replace `CircularProgress` with `LoadingSpinner`
2. Replace basic loading divs with appropriate loading components
3. Use `LoadingOverlay` for content overlays
4. Implement `SkeletonLoader` for better UX
5. Consider using `LoadingContext` for complex operations

### Example Migration

```tsx
// Old
if (loading) {
  return <CircularProgress />;
}

// New
if (loading) {
  return <LoadingSpinner size="medium" variant="spinner" message="Loading..." />;
}
```

This loading system provides a comprehensive solution for all loading scenarios in the application, improving user experience and providing consistent loading feedback across all components.
