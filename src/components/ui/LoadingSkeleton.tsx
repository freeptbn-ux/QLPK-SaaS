import React from 'react';
import { Skeleton, TableRow, TableCell } from '@mui/material';

interface LoadingSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <TableRow>
      {Array.from({ length: columns }).map((_, i) => (
        <TableCell key={i}>
          <Skeleton variant="text" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export default function LoadingSkeleton({ rows = 5, columns = 5 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} columns={columns} />
      ))}
    </>
  );
}
