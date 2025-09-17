import React, { useState, useCallback } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  Box,
  Tooltip,
  Button,
  Stack,
} from '@mui/material';
import {
  ViewColumn as ViewColumnIcon,
  SelectAll as SelectAllIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  required?: boolean;
  order?: number;
}

export interface ColumnToggleProps {
  columns: ColumnConfig[];
  onColumnToggle: (columnId: string, visible: boolean) => void;
  onSelectAll?: () => void;
  onSelectNone?: () => void;
  onResetToDefault?: () => void;
  showSelectAll?: boolean;
  showReset?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'button' | 'text';
  tooltip?: string;
  disabled?: boolean;
}

const ColumnToggle: React.FC<ColumnToggleProps> = ({
  columns,
  onColumnToggle,
  onSelectAll,
  onSelectNone,
  onResetToDefault,
  showSelectAll = true,
  showReset = true,
  size = 'medium',
  variant = 'icon',
  tooltip = 'Toggle columns',
  disabled = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const open = Boolean(anchorEl);

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleColumnToggle = useCallback((columnId: string, visible: boolean) => {
    onColumnToggle(columnId, visible);
  }, [onColumnToggle]);

  const handleSelectAll = useCallback(() => {
    onSelectAll?.();
  }, [onSelectAll]);

  const handleSelectNone = useCallback(() => {
    onSelectNone?.();
  }, [onSelectNone]);

  const handleReset = useCallback(() => {
    onResetToDefault?.();
    handleClose();
  }, [onResetToDefault, handleClose]);

  const visibleColumnsCount = columns.filter(col => col.visible).length;
  const totalColumnsCount = columns.length;
  const requiredColumnsCount = columns.filter(col => col.required).length;

  const renderTrigger = () => {
    const commonProps = {
      onClick: handleClick,
      disabled,
      size: size === 'small' ? 'small' as const : 'medium' as const,
    };

    switch (variant) {
      case 'button':
        return (
          <Button
            {...commonProps}
            startIcon={<ViewColumnIcon />}
            variant="outlined"
            sx={{
              minWidth: 'auto',
              px: 2,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Columns ({visibleColumnsCount}/{totalColumnsCount})
          </Button>
        );
      
      case 'text':
        return (
          <Button
            {...commonProps}
            startIcon={<ViewColumnIcon />}
            variant="text"
            sx={{
              minWidth: 'auto',
              px: 1,
              py: 0.5,
              textTransform: 'none',
              fontWeight: 500,
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            Columns
          </Button>
        );
      
      default:
        return (
          <Tooltip title={tooltip}>
            <IconButton
              {...commonProps}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  color: 'text.primary',
                },
              }}
            >
              <ViewColumnIcon />
            </IconButton>
          </Tooltip>
        );
    }
  };

  return (
    <>
      {renderTrigger()}
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: 280,
            maxHeight: 400,
            overflow: 'auto',
            mt: 1,
            borderRadius: 2,
            boxShadow: theme.shadows[8],
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
            Column Visibility
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {visibleColumnsCount} of {totalColumnsCount} columns visible
          </Typography>
        </Box>

        <Divider />

        {(showSelectAll || showReset) && (
          <>
            <Box sx={{ p: 1 }}>
              <Stack direction="row" spacing={1} justifyContent="space-between">
                {showSelectAll && (
                  <>
                    <Button
                      size="small"
                      startIcon={<SelectAllIcon />}
                      onClick={handleSelectAll}
                      disabled={visibleColumnsCount === totalColumnsCount}
                      sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      All
                    </Button>
                    <Button
                      size="small"
                      startIcon={<ClearIcon />}
                      onClick={handleSelectNone}
                      disabled={visibleColumnsCount === requiredColumnsCount}
                      sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                    >
                      None
                    </Button>
                  </>
                )}
                {showReset && onResetToDefault && (
                  <Button
                    size="small"
                    onClick={handleReset}
                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    Reset
                  </Button>
                )}
              </Stack>
            </Box>
            <Divider />
          </>
        )}

        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
          {columns
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((column) => (
              <MenuItem
                key={column.id}
                onClick={() => handleColumnToggle(column.id, !column.visible)}
                disabled={column.required}
                sx={{
                  py: 0.5,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '&.Mui-disabled': {
                    opacity: 0.6,
                  },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={column.visible}
                      disabled={column.required}
                      size="small"
                      sx={{
                        p: 0.5,
                        '&.Mui-checked': {
                          color: 'primary.main',
                        },
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: column.required ? 600 : 400,
                          color: column.required ? 'text.primary' : 'text.secondary',
                        }}
                      >
                        {column.label}
                      </Typography>
                      {column.required && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.disabled',
                            fontSize: '0.65rem',
                            fontWeight: 500,
                          }}
                        >
                          (Required)
                        </Typography>
                      )}
                    </Box>
                  }
                  sx={{
                    margin: 0,
                    width: '100%',
                    '& .MuiFormControlLabel-label': {
                      width: '100%',
                    },
                  }}
                />
              </MenuItem>
            ))}
        </Box>

        <Divider />
        <Box sx={{ p: 1.5, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Click outside to close
          </Typography>
        </Box>
      </Menu>
    </>
  );
};

export default ColumnToggle;
