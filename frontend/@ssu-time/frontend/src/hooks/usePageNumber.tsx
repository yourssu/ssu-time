import { useState, useCallback } from 'react';

interface UsePageNumberProps {
  totalPages: number;
  initialPage?: number;
}

interface UsePageNumberReturn {
  currentPage: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export function usePageNumber({ 
  totalPages, 
  initialPage = 1 
}: UsePageNumberProps): UsePageNumberReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const previousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const canGoNext = currentPage < totalPages;
  const canGoPrevious = currentPage > 1;

  return {
    currentPage,
    goToPage,
    nextPage,
    previousPage,
    canGoNext,
    canGoPrevious,
  };
} 