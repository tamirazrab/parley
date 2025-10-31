import { Button } from "@/components/ui/button";
import { useCallback } from "react";

interface DataPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const DataPagination = ({
  page,
  totalPages,
  onPageChange,
}: DataPaginationProps) => {
  const canGoPrev = page > 1;
  const canGoNext = totalPages > 0 && page < totalPages;

  const handlePrev = useCallback(() => {
    if (canGoPrev) onPageChange(page - 1);
  }, [canGoPrev, page, onPageChange]);

  const handleNext = useCallback(() => {
    if (canGoNext) onPageChange(page + 1);
  }, [canGoNext, page, onPageChange]);

  return (
    <div className="flex items-center justify-between py-2">
      <span className="flex-1 text-sm text-muted-foreground">
        Page {Math.min(page, totalPages || 1)} of {totalPages || 1}
      </span>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!canGoPrev}
          onClick={handlePrev}
          aria-label="Go to previous page"
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!canGoNext}
          onClick={handleNext}
          aria-label="Go to next page"
        >
          Next
        </Button>
      </div>
    </div>
  );
};
