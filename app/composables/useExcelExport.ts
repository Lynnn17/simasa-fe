/**
 * Composable for exporting data to Excel
 */

interface ExportColumn {
    header: string;
    key: string;
    width?: number;
    formatter?: (value: any, row: any) => any;
}

interface ExportOptions {
    data: any[];
    columns: ExportColumn[];
    filename: string;
    sheetName?: string;
}

export function useExcelExport() {
    const isExporting = ref(false);

    async function exportToExcel(options: ExportOptions) {
        const { data, columns, filename, sheetName = 'Data' } = options;
        if (data.length === 0) {
            return { success: false, message: 'No data to export' };
        }

        isExporting.value = true;
        try {
            // Dynamic import of exceljs for client-side only
            const ExcelJS = (await import('exceljs')).default;
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(sheetName);

            // Add 'No' column at the beginning
            const allColumns = [
                { header: 'No', key: 'no', width: 5 },
                ...columns.map(col => ({
                    header: col.header,
                    key: col.key,
                    width: col.width || 15,
                })),
            ];

            worksheet.columns = allColumns;

            // Style header row - bold only
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true };

            // Add data rows with numbering
            data.forEach((item: any, index: number) => {
                const rowData: Record<string, any> = { no: index + 1 };
                columns.forEach(col => {
                    if (col.formatter) {
                        rowData[col.key] = col.formatter(item[col.key], item);
                    } else {
                        rowData[col.key] = item[col.key] ?? '';
                    }
                });

                worksheet.addRow(rowData);
            });

            // Add borders to all cells
            worksheet.eachRow((row, rowNumber) => {
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' },
                    };
                    if (rowNumber > 1) {
                        cell.alignment = { vertical: 'middle' };
                    }
                });
            });

            // Generate buffer
            const buffer = await workbook.xlsx.writeBuffer();

            // Small delay to show loading
            await new Promise(resolve => setTimeout(resolve, 500));

            // Create download
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
            link.click();
            URL.revokeObjectURL(url);

            return { success: true };
        } catch (err: any) {
            console.error('Export failed:', err);
            return { success: false, message: err.message };
        } finally {
            isExporting.value = false;
        }
    }

    return {
        isExporting,
        exportToExcel,
    };
}
