import {useRef} from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";

import "handsontable/dist/handsontable.full.css";
import "handsontable/plugins/contextMenu";
import "handsontable/plugins/mergeCells";

// 우클릭 메뉴
registerAllModules();

type Props = {
    data: any[][];
    colHeaders?: string[] | boolean;
    rowHeaders?: boolean;
    readOnly?: boolean;
    mergeCells?: boolean | any[];
    onChange?: (data: any[][], merges: any[]) => void;
};

export default function HandsontableBase({
                                             data,
                                             colHeaders = true,
                                             rowHeaders = true,
                                             readOnly = false,
                                             mergeCells = true,
                                             onChange,
                                         }: Props) {
    const hotRef = useRef<any>(null);


    return (
        <HotTable
            ref={hotRef}
            data={data}
            colHeaders={colHeaders}
            rowHeaders={rowHeaders}
            readOnly={readOnly}
            contextMenu={{
                items: [
                    'remove_row',
                    'row_above',
                    'row_below',
                    'undo',
                    'redo',
                    {
                        key: 'mergeCells',
                        name: 'Merge cells',
                        disabled: () => {
                            const hot = hotRef.current?.hotInstance;
                            const selected = hot?.getSelectedLast();
                            if (!selected) return true;

                            const [startRow, startCol, endRow, endCol] = selected;

                            // 진도구분(0번째 행)이 포함되면 비활성화
                            if (startCol === 0 || endCol === 0) return true;

                            const isHorizontal = startRow === endRow && startCol !== endCol;
                            return !isHorizontal;
                        },
                        callback: () => {
                            const hot = hotRef.current?.hotInstance;
                            const plugin = hot?.getPlugin("mergeCells");
                            if (!hot) return;

                            const selected = hot.getSelectedLast();
                            if (!selected) return;

                            const [startRow, startCol, endRow, endCol] = selected;


                            console.log("startCol", startCol, "endCol", endCol)

                            plugin.unmerge(startRow, startCol, endRow, endCol);

                            hot.getPlugin('mergeCells').merge(startRow, startCol, endRow, endCol);
                            hot.render(); // 병합 후 리렌더링
                        },
                    },
                    {
                        key: "unmergeCells",
                        name: 'Unmerge cells',
                        disabled: () => {
                            const hot = hotRef.current?.hotInstance;
                            const plugin = hot?.getPlugin("mergeCells");
                            const selected = hot?.getSelectedLast();

                            if (!selected || !plugin) return true;

                            const [startRow, startCol] = selected;

                            // 현재 셀이 병합되어 있지 않으면 disabled
                            const merged = plugin.mergedCellsCollection.get(startRow, startCol);
                            return !merged;
                        },
                        callback: () => {
                            const hot = hotRef.current?.hotInstance;
                            const plugin = hot?.getPlugin("mergeCells");
                            const selected = hot?.getSelectedLast();
                            if (!selected || !plugin) return;

                            const [startRow, startCol, endRow, endCol] = selected;

                            console.log("확인",startRow, startCol, endRow, endCol)

                            plugin.unmerge(startRow, startCol, endRow, endCol);
                            hot.render();
                        },
                    },

                ] as any,
            }}
            mergeCells={mergeCells}
            width="100%"
            height="400"
            stretchH="all"
            licenseKey="non-commercial-and-evaluation"
            afterChange={(_changes, source) => {
                if (!onChange) return;
                if (source === 'loadData') return;

                const hot = hotRef.current?.hotInstance;
                if (!hot) return;

                const plugin = hot.getPlugin("mergeCells");
                const merges = plugin?.mergedCellsCollection?.mergedCells ?? [];

                onChange(hot.getData(), merges);
            }}
            afterRemoveRow={() => {
                const hot = hotRef.current?.hotInstance;
                if (!hot || !onChange) return;

                const plugin = hot.getPlugin("mergeCells");
                const merges = plugin?.mergedCellsCollection?.mergedCells ?? [];
                const data = hot.getData();

                onChange(data, merges);
            }}


        />
    );
}
