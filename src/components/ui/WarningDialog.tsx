import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

interface WarningDialogAction {
  label: string;
  onClick: () => void;
  color?: 'primary' | 'inherit' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  variant?: 'text' | 'outlined' | 'contained';
}

interface WarningDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: React.ReactNode;
  primaryAction?: WarningDialogAction;
  secondaryAction?: WarningDialogAction;
}

const WarningDialog: React.FC<WarningDialogProps> = ({
  open,
  onClose,
  title = 'Action required',
  description,
  primaryAction,
  secondaryAction,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WarningAmberRoundedIcon sx={{ color: 'warning.main' }} />
          <Typography variant="h6" fontWeight={700}>{title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pt: 0, pb: 2 }}>
        {typeof description === 'string' ? (
          <Typography variant="body2" color="text.secondary">{description}</Typography>
        ) : (
          description
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0, gap: 1.25 }}>
        {secondaryAction && (
          <Button onClick={secondaryAction.onClick} color={secondaryAction.color || 'inherit'} variant={secondaryAction.variant || 'text'}>
            {secondaryAction.label}
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} color="inherit">Close</Button>
        {primaryAction && (
          <Button onClick={primaryAction.onClick} color={primaryAction.color || 'warning'} variant={primaryAction.variant || 'contained'}>
            {primaryAction.label}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default WarningDialog;


