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
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function Curriculum() {

    const categoryOptions = [
        { value: '3g', label: '3g' },
        { value: '3k', label: '3k' },
        { value: '4g1', label: '4g1' },
    ];


    const [classKey, setClassKey] = useState(categoryOptions[0].value);

    const [title, setTitle] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [showCalendar, setShowCalendar] = useState(false);


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
            id: curriculumData?.id ?? undefined,
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
            year,
            classKey,
            title
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
                        fetchCurriculum({ year: year, className: classKey });
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
            const emptyData = createEmptyTable(1);
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
        setTitle(curriculumData?.title);

        tableDataRef.current = data;
        tableMergesRef.current = merges;
    }, [curriculumData]);



    //반 기준
    useEffect(() => {
        fetchCurriculum({ year: year, className: classKey });
    }, [classKey, year]);

    return (
        <div>
            <TopBox>
                <div>
                    <YearBox>
                        <YearButton  color="#222" onClick={() => setShowCalendar(prev => !prev)}>
                            {year}
                        </YearButton>

                        {showCalendar && (
                            <div style={{position: 'absolute', zIndex: 100}}>
                                <Calendar
                                    onClickYear={(value) => {
                                        setYear(value.getFullYear());
                                        setShowCalendar(false);
                                    }}
                                    value={new Date(year, 0)}
                                    view="decade"
                                    maxDetail="decade"
                                    showNavigation={false}
                                />
                            </div>
                        )}
                    </YearBox>

                    <SelectBox value={classKey} onChange={e => setClassKey(e.target.value)}>
                        {categoryOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </SelectBox>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="커리큘럼 제목 입력"
                    />
                </div>

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

const TopBox = styled.div<WithTheme>`
    display: inline-flex;
    width: 100%;
    margin-bottom: 16px;
    justify-content: space-between;
    > div {
        display: inline-flex;
        gap: 8px;
        input {
            border: none;
            width: 100%;
            padding: 4px 8px;
            font-size: ${({ theme }) => theme.sizes.small};
            outline: none;
            color: ${({ theme }) => theme.colors.subColor};
            background: transparent;
        }
    }
`

const YearBox = styled.div`
 position: relative;
    height: 100%;
    z-index: 10000;
`

const YearButton = styled.button<WithTheme & { color: string }>`
  padding: 4px 8px;
    width: 60px;
    height: 100%;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.xsmall};
  border: none;
  cursor: pointer;
    
    &:hover {
        opacity: 0.8;
    }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

const Button = styled.button<WithTheme & { color: string }>`
  padding: 4px 8px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.xsmall};
  border: none;
  cursor: pointer;
    
    &:hover {
        opacity: 0.8;
    }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

const SelectBox = styled.select<WithTheme>`
    width: 72px;
    border: 1px solid  ${({theme}) => theme.colors.navColor};
    color: ${({theme}) => theme.colors.subColor};
    padding: 4px 8px;
    font-size: ${({theme}) => theme.sizes.xsmall};
    cursor: pointer;
    background-color: #F8F9FA;

    /* 화살표 위치 조정 */
    appearance: none;
    background-image: url('data:image/svg+xml;utf8,<svg fill="black" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
    background-repeat: no-repeat;
    background-position: right 4px center;
    background-size: 16px;

    &:focus {
        border-color: ${({theme}) => theme.colors.subColor};
        outline: none;
    }
`;