import { useMemo, useRef } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.css";

registerAllModules();

type Props = {
    academyViewData: any;
};

export default function HandsontableBase2({ academyViewData }: Props) {
    const hotRef = useRef<any>(null);

    /** =========================
     *  1. 월 데이터 (1월 고정)
     *  ========================= */
    const monthData = academyViewData.headers[0];
    const { weekGroups, rows } = monthData;

    /** =========================
     *  2. 헤더 (❗ 1줄만)
     *  ========================= */
    const colHeaders = useMemo(() => {
        return [
            "반명",
            "담임",
            "진도구분",
            ...weekGroups.map((w: any) => w.label), // ex) 1/12 ~ 1/13
        ];
    }, [weekGroups]);

    /** =========================
     *  3. 데이터 + 병합
     *  ========================= */
    const { tableData, mergeCells } = useMemo(() => {
        const data: any[][] = [];
        const merges: any[] = [];

        let rowCursor = 0;

        rows.forEach((classGroup: any) => {
            const groupStartRow = rowCursor;

            classGroup.rows.forEach((row: any) => {
                const rowData: any[] = [
                    row.className,     // 반명
                    row.teacher,       // 담임
                    row.progressGubun, // 진도구분
                ];

                // 🔥 week 단위 셀 (start + end 합쳐서)
                weekGroups.forEach((_: any, i: number) => {
                    const week = row.weeks?.[i];

                    const contents: string[] = [];

                    if (week?.startItem?.content) {
                        contents.push(week.startItem.content);
                    }

                    if (week?.endItem?.content) {
                        contents.push(week.endItem.content);
                    }

                    rowData.push(contents.join("\n"));
                });

                data.push(rowData);
                rowCursor++;
            });

            const rowCount = rowCursor - groupStartRow;

            // 반명 / 담임 병합
            if (rowCount > 1) {
                merges.push(
                    {
                        row: groupStartRow,
                        col: 0,
                        rowspan: rowCount,
                        colspan: 1,
                    },
                    {
                        row: groupStartRow,
                        col: 1,
                        rowspan: rowCount,
                        colspan: 1,
                    }
                );
            }
        });

        return { tableData: data, mergeCells: merges };
    }, [rows, weekGroups]);

    /** =========================
     *  4. 렌더
     *  ========================= */
    return (
        <HotTable
            ref={hotRef}
            data={tableData}
            colHeaders={colHeaders}   // ✅ 헤더 1줄
            mergeCells={mergeCells}
            rowHeaders
            readOnly
            stretchH="all"
            width="100%"
            height="600"
            rowHeights={32}
            colWidths={120}
            licenseKey="non-commercial-and-evaluation"
            cells={(row, col) => {
                const cellProps: any = {};

                if (col === 0) cellProps.className = "cell-class";
                if (col === 2) cellProps.className = "cell-curriculum";

                cellProps.renderer = (instance, td, row, col, prop, value) => {
                    td.innerHTML = String(value ?? "").replace(/\n/g, "<br/>");
                    return td;
                };

                return cellProps;
            }}
        />
    );
}
