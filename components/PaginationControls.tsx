'use client';

interface PaginationControlsProps {
  page: number;
  onPrev: () => void;
  onNext: () => void;
  disablePrev: boolean;
  disableNext: boolean;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export default function PaginationControls({
  page,
  onPrev,
  onNext,
  disablePrev,
  disableNext,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [25, 50, 100],
  className,
}: PaginationControlsProps) {
  return (
    <div
      className={`pagination-controls${className ? ` ${className}` : ''}`}
    >
      <button className="btn btn-secondary btn-sm" disabled={disablePrev} onClick={onPrev}>
        Previous
      </button>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Page {page}</span>
      <button className="btn btn-secondary btn-sm" disabled={disableNext} onClick={onNext}>
        Next
      </button>
      {typeof pageSize === 'number' && onPageSizeChange && (
        <select
          className="form-control"
          style={{ width: 110, marginLeft: 8 }}
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
