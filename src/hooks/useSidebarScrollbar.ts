import { useEffect } from 'react';
import { useSidebar } from '../contexts/SidebarContext';

export const useSidebarScrollbar = () => {
  const { sidebarCollapsed } = useSidebar();

  useEffect(() => {
    // Add or remove the sidebar-collapsed class from body
    if (sidebarCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }

    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('sidebar-collapsed');
    };
  }, [sidebarCollapsed]);
};
