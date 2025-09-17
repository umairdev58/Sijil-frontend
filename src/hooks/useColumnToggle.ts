import { useState, useCallback, useMemo } from 'react';
import { ColumnConfig } from '../components/ColumnToggle';

export interface UseColumnToggleOptions {
  defaultColumns: ColumnConfig[];
  storageKey?: string;
  requiredColumns?: string[];
}

export const useColumnToggle = ({
  defaultColumns,
  storageKey,
  requiredColumns = [],
}: UseColumnToggleOptions) => {
  const initializeColumns = useCallback(() => {
    return defaultColumns.map(col => ({
      ...col,
      required: requiredColumns.includes(col.id),
    }));
  }, [defaultColumns, requiredColumns]);

  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsedColumns = JSON.parse(saved);
          return parsedColumns.map((col: ColumnConfig) => ({
            ...col,
            required: requiredColumns.includes(col.id),
          }));
        }
      } catch (error) {
        console.warn('Failed to load column preferences:', error);
      }
    }
    return initializeColumns();
  });

  const saveColumns = useCallback((newColumns: ColumnConfig[]) => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newColumns));
      } catch (error) {
        console.warn('Failed to save column preferences:', error);
      }
    }
  }, [storageKey]);

  const toggleColumn = useCallback((columnId: string, visible: boolean) => {
    setColumns(prev => {
      const newColumns = prev.map(col => 
        col.id === columnId ? { ...col, visible } : col
      );
      saveColumns(newColumns);
      return newColumns;
    });
  }, [saveColumns]);

  const selectAllColumns = useCallback(() => {
    setColumns(prev => {
      const newColumns = prev.map(col => ({ ...col, visible: true }));
      saveColumns(newColumns);
      return newColumns;
    });
  }, [saveColumns]);

  const selectNoneColumns = useCallback(() => {
    setColumns(prev => {
      const newColumns = prev.map(col => 
        col.required ? col : { ...col, visible: false }
      );
      saveColumns(newColumns);
      return newColumns;
    });
  }, [saveColumns]);

  const resetToDefault = useCallback(() => {
    const defaultCols = initializeColumns();
    setColumns(defaultCols);
    saveColumns(defaultCols);
  }, [initializeColumns, saveColumns]);

  const visibleColumns = useMemo(() => 
    columns.filter(col => col.visible), 
    [columns]
  );

  const hiddenColumns = useMemo(() => 
    columns.filter(col => !col.visible), 
    [columns]
  );

  return {
    columns,
    visibleColumns,
    hiddenColumns,
    toggleColumn,
    selectAllColumns,
    selectNoneColumns,
    resetToDefault,
  };
};

export {};
