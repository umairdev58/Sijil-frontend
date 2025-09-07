# Grid to Box Conversion Guide for Material-UI v7

## Old Grid Syntax (v4/v5) → New Box Syntax (v7)

### 1. Basic Grid Container
**Old:**
```jsx
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={4}>
    Content
  </Grid>
</Grid>
```

**New:**
```jsx
<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
  Content
</Box>
```

### 2. Common Grid Patterns

#### 2x2 Grid
**Old:**
```jsx
<Grid container spacing={2}>
  <Grid item xs={12} sm={6}>
    Item 1
  </Grid>
  <Grid item xs={12} sm={6}>
    Item 2
  </Grid>
  <Grid item xs={12} sm={6}>
    Item 3
  </Grid>
  <Grid item xs={12} sm={6}>
    Item 4
  </Grid>
</Grid>
```

**New:**
```jsx
<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
  <Box>Item 1</Box>
  <Box>Item 2</Box>
  <Box>Item 3</Box>
  <Box>Item 4</Box>
</Box>
```

#### 4 Column Grid
**Old:**
```jsx
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={3}>
    Item 1
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    Item 2
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    Item 3
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    Item 4
  </Grid>
</Grid>
```

**New:**
```jsx
<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3 }}>
  <Box>Item 1</Box>
  <Box>Item 2</Box>
  <Box>Item 3</Box>
  <Box>Item 4</Box>
</Box>
```

#### 3 Column Grid
**Old:**
```jsx
<Grid container spacing={2}>
  <Grid item xs={12} sm={6} md={4}>
    Item 1
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    Item 2
  </Grid>
  <Grid item xs={12} sm={6} md={4}>
    Item 3
  </Grid>
</Grid>
```

**New:**
```jsx
<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
  <Box>Item 1</Box>
  <Box>Item 2</Box>
  <Box>Item 3</Box>
</Box>
```

### 3. Responsive Breakpoints Mapping

| Old Grid | New CSS Grid | Description |
|----------|--------------|-------------|
| `xs={12}` | `xs: '1fr'` | Full width on mobile |
| `xs={6}` | `xs: 'repeat(2, 1fr)'` | 2 columns on mobile |
| `sm={6}` | `sm: 'repeat(2, 1fr)'` | 2 columns on small screens |
| `md={4}` | `md: 'repeat(3, 1fr)'` | 3 columns on medium screens |
| `lg={3}` | `lg: 'repeat(4, 1fr)'` | 4 columns on large screens |

### 4. Spacing Conversion

**Old:**
```jsx
<Grid container spacing={3}>
```

**New:**
```jsx
<Box sx={{ display: 'grid', gap: 3 }}>
```

### 5. Common Patterns

#### Form Fields (2 columns)
```jsx
<Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
  <TextField label="First Name" fullWidth />
  <TextField label="Last Name" fullWidth />
</Box>
```

#### Form Fields (4 columns)
```jsx
<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
  <TextField label="Field 1" fullWidth />
  <TextField label="Field 2" fullWidth />
  <TextField label="Field 3" fullWidth />
  <TextField label="Field 4" fullWidth />
</Box>
```

#### Cards Layout
```jsx
<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
  <Card>Card 4</Card>
</Box>
```

### 6. Quick Reference

**Remove from imports:**
```jsx
import { Grid } from '@mui/material'; // Remove this
```

**Add to imports (if not already there):**
```jsx
import { Box } from '@mui/material'; // Make sure this is imported
```

### 7. Benefits of New Approach

1. **Better Performance**: CSS Grid is more performant than the old Grid system
2. **More Flexible**: Direct access to CSS Grid features
3. **Smaller Bundle**: No need for Grid component overhead
4. **Better Responsive Control**: More granular control over breakpoints
5. **Future Proof**: Aligns with modern CSS standards

### 8. Migration Checklist

- [ ] Replace `Grid container` with `Box sx={{ display: 'grid' }}`
- [ ] Replace `Grid item` with direct children
- [ ] Convert `spacing` prop to `gap` in sx
- [ ] Convert `xs`, `sm`, `md`, `lg` props to `gridTemplateColumns` responsive object
- [ ] Remove `Grid` from imports
- [ ] Test responsive behavior
- [ ] Update any custom styling that depends on Grid classes
