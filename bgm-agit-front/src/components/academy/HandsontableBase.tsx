import  {useRef} from "react";
import {HotTable} from "@handsontable/react";
import 'handsontable/dist/handsontable.full.css';

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
            mergeCells={mergeCells}
            contextMenu={!readOnly}
            width="100%"
            height="600"
            stretchH="all"
            licenseKey="non-commercial-and-evaluation"
            afterChange={() => {
                if (!onChange) return;
                const hot = hotRef.current?.hotInstance;
                if (!hot) return;

                const merges =
                    hot.getPlugin('mergeCells').mergedCellsCollection.mergedCells;

                onChange(hot.getData(), merges);
            }}
        />
    );
}
