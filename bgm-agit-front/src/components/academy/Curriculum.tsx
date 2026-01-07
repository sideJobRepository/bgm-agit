import HandsontableBase from './HandsontableBase';
import styled from "styled-components";
import type {WithTheme} from "../../styles/styled-props.ts";
import {useInsertPost, useUpdatePost} from "../../recoil/fetch.ts";
import {showConfirmModal} from "../confirmAlert.tsx";
import {toast} from "react-toastify";
import {useEffect, useRef, useState} from "react";
import {useCurriiculumFetch} from "../../recoil/academyFetch.ts";
import {useRecoilValue} from "recoil";
import {curriculumDataState} from "../../recoil/state/academy.ts";

type Props = {
    classKey: string;
    onChangeClassKey: (key: string) => void;
};

export default function Curriculum({ classKey, onChangeClassKey }: Props) {
    const headers = [
        '진도구분',
        ...Array.from({ length: 12 }, (_, i) => `${i + 1}월`),
    ];

    //기본
    function createEmptyTable(rowCount = 2): string[][] {
        return Array.from({ length: rowCount }, () =>
            Array(13).fill('') // 진도구분 + 12개월
        );
    }

    const { insert } = useInsertPost();
    const { update } = useUpdatePost();

    const fetchCurriculum = useCurriiculumFetch();

    const curriculumData = useRecoilValue(curriculumDataState);

    const tableDataRef = useRef<string[][]>([]);
    const tableMergesRef = useRef<any[]>([]);

    //바인딩 함수
    const [tableData, setTableData] = useState<string[][]>([]);
    const [tableMerges, setTableMerges] = useState<any[]>([]);

    //저장 로직
    function transformDataToJSON(
        data: string[][],
        merges: any[],
        year: number,
        className: string,
        title: string
    ) {
        const rows = data
            .map((row, rowIndex) => {
                const progressType = row[0];
                if (!progressType) return null;

                const months: {
                    startMonth: number;
                    endMonth: number;
                    content: string;
                }[] = [];

                for (let col = 1; col <= 12; col++) {
                    const cellContent = row[col];
                    if (!cellContent) continue;

                    const merge = merges.find(
                        m => m.row === rowIndex && m.col === col
                    );

                    const startMonth = col;
                    const endMonth = merge ? col + merge.colspan - 1 : col;

                    months.push({
                        startMonth,
                        endMonth,
                        content: cellContent,
                    });
                }

                return { progressType, months };
            })
            .filter(
                (row): row is { progressType: string; months: { startMonth: number; endMonth: number; content: string }[] } =>
                    row !== null
            );

        return {
            year,
            className,
            title,
            rows,
        };
    }

    //역변환 함수
    function transformJSONToTable(curriculumData: any) {
        if (!curriculumData?.rows) {
            return { data: [], merges: [] };
        }

        const data: string[][] = [];
        const merges: any[] = [];

        curriculumData.rows.forEach((row: any, rowIndex: number) => {
            const tableRow = Array(13).fill('');
            tableRow[0] = row.progressType;

            row.months.forEach((month: any) => {
                const startCol = month.startMonth;
                const endCol = month.endMonth;

                tableRow[startCol] = month.content;

                if (endCol > startCol) {
                    merges.push({
                        row: rowIndex,
                        col: startCol,
                        rowspan: 1,
                        colspan: endCol - startCol + 1,
                    });
                }
            });

            data.push(tableRow);
        });

        return { data, merges };
    }



    const handleSubmit = async () => {

        const requestFn = curriculumData?.id ? update : insert;

        const payload = transformDataToJSON(
            tableDataRef.current,
            tableMergesRef.current,
            2026,
            classKey,
            '커리큘럼 12월 예시'
        );

        showConfirmModal({
            message: '저장하시겠습니까?',
            onConfirm: () => {
                requestFn({
                    url: '/bgm-agit/curriculum',
                    body: payload,
                    ignoreHttpError: true,
                    onSuccess: () => {
                        toast.success('저장되었습니다.');
                        fetchCurriculum({ year: 2026, className: classKey });
                    },
                });
            },
        });
    };

    console.log("curriculumData", curriculumData)

    //바인딩
    useEffect(() => {
        // 1. 데이터 없음 → 기본 빈 테이블
        if (!curriculumData || !curriculumData.rows?.length) {
            const emptyData = createEmptyTable(2);
            const emptyMerges: any[] = [];

            setTableData(emptyData);
            setTableMerges(emptyMerges);

            tableDataRef.current = emptyData;
            tableMergesRef.current = emptyMerges;
            return;
        }

        // 2. 데이터 있음 → 서버 데이터 바인딩
        const { data, merges } = transformJSONToTable(curriculumData);

        setTableData(data);
        setTableMerges(merges);

        tableDataRef.current = data;
        tableMergesRef.current = merges;
    }, [curriculumData]);



    //검색
    useEffect(() => {
        fetchCurriculum({ year: 2026, className: classKey });
    }, [classKey]);

    return (
        <div style={{ padding: 16 }}>
            <TopBox>
                <select
                    value={classKey}
                    onChange={(e) => onChangeClassKey(e.target.value)}
                >
                    <option value="3g">3g</option>
                    <option value="3k">3k</option>
                </select>

                <Button
                    color="#222"
                    onClick={() => handleSubmit()}
                >
                    저장
                </Button>
            </TopBox>

            <HandsontableBase
                data={tableData}
                mergeCells={tableMerges}
                colHeaders={headers}
                onChange={(data, merges) => {
                    tableDataRef.current = data;
                    tableMergesRef.current = merges;
                }}
            />
        </div>
    );
}

const TopBox = styled.div`
    display: inline-flex;
    width: 100%;
    margin-bottom: 16px;
    justify-content: space-between;
`

const Button = styled.button<WithTheme & { color: string }>`
  padding: 4px 8px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.small};
  border: none;
  cursor: pointer;
    
    &:hover {
        opacity: 0.8;
    }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.small};
  }
`;