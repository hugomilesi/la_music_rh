import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
  sortable?: boolean;
  width?: string;
  mobileHidden?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

interface ResponsiveTableProps {
  data: any[];
  columns: Column[];
  keyField?: string;
  className?: string;
  showMobileCards?: boolean;
  expandable?: boolean;
  onRowClick?: (row: any) => void;
  loading?: boolean;
  emptyMessage?: string;
  mobileCardRender?: (row: any, index: number) => React.ReactNode;
}

export function ResponsiveTable({
  data,
  columns,
  keyField = 'id',
  className,
  showMobileCards = true,
  expandable = false,
  onRowClick,
  loading = false,
  emptyMessage = 'Nenhum dado encontrado',
  mobileCardRender
}: ResponsiveTableProps) {
  const isMobile = useIsMobile();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map(col => col.key))
  );

  const toggleRowExpansion = (rowKey: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowKey)) {
      newExpanded.delete(rowKey);
    } else {
      newExpanded.add(rowKey);
    }
    setExpandedRows(newExpanded);
  };

  const toggleColumnVisibility = (columnKey: string) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(columnKey)) {
      newVisible.delete(columnKey);
    } else {
      newVisible.add(columnKey);
    }
    setVisibleColumns(newVisible);
  };

  const getVisibleColumns = () => {
    if (isMobile) {
      return columns.filter(col => 
        col.priority === 'high' && visibleColumns.has(col.key)
      ).slice(0, 3); // Máximo 3 colunas em mobile
    }
    return columns.filter(col => visibleColumns.has(col.key));
  };

  const getHiddenColumns = () => {
    if (isMobile) {
      return columns.filter(col => 
        col.priority !== 'high' || !visibleColumns.has(col.key)
      );
    }
    return columns.filter(col => !visibleColumns.has(col.key));
  };

  // Mobile Card Component
  const MobileCard = ({ row, index }: { row: any; index: number }) => {
    if (mobileCardRender) {
      return mobileCardRender(row, index);
    }

    const isExpanded = expandedRows.has(row[keyField]);
    const visibleCols = getVisibleColumns();
    const hiddenCols = getHiddenColumns();

    return (
      <Card className="smart-card mb-4 touch-optimized">
        <CardContent className="p-4">
          {/* Main visible data */}
          <div className="space-y-3">
            {visibleCols.map((column) => {
              const value = row[column.key];
              return (
                <div key={column.key} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    {column.label}
                  </span>
                  <div className="text-sm font-semibold">
                    {column.render ? column.render(value, row) : value}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expandable section */}
          {hiddenCols.length > 0 && expandable && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleRowExpansion(row[keyField])}
                className="w-full mt-3 h-8 text-xs"
              >
                {isExpanded ? (
                  <>
                    <ChevronDown className="w-3 h-3 mr-1" />
                    Menos detalhes
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-3 h-3 mr-1" />
                    Mais detalhes ({hiddenCols.length})
                  </>
                )}
              </Button>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  {hiddenCols.map((column) => {
                    const value = row[column.key];
                    return (
                      <div key={column.key} className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {column.label}
                        </span>
                        <div className="text-xs">
                          {column.render ? column.render(value, row) : value}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Action button */}
          {onRowClick && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRowClick(row)}
              className="w-full mt-3 h-8"
            >
              Ver detalhes
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  // Desktop Table Component
  const DesktopTable = () => {
    const visibleCols = getVisibleColumns();

    return (
      <div className={cn(
        "border rounded-lg overflow-hidden",
        isFullscreen && "fixed inset-4 z-50 bg-white shadow-2xl"
      )}>
        {/* Table Controls */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {data.length} registros
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Scrollable Table */}
        <ScrollArea className={cn(
          "w-full",
          isFullscreen ? "h-[calc(100vh-8rem)]" : "max-h-96"
        )}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  {visibleCols.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                        column.className,
                        column.width && `w-${column.width}`
                      )}
                      style={{ minWidth: column.width }}
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((row, index) => (
                  <tr
                    key={row[keyField] || index}
                    className={cn(
                      "hover:bg-gray-50 transition-colors",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {visibleCols.map((column) => {
                      const value = row[column.key];
                      return (
                        <td
                          key={column.key}
                          className={cn(
                            "px-4 py-3 text-sm",
                            column.className
                          )}
                        >
                          {column.render ? column.render(value, row) : value}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Mobile View */}
      {isMobile && showMobileCards ? (
        <div className="space-y-4">
          {data.map((row, index) => (
            <MobileCard key={row[keyField] || index} row={row} index={index} />
          ))}
        </div>
      ) : (
        /* Desktop View */
        <DesktopTable />
      )}
    </div>
  );
}