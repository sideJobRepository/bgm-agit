import HandsontableBase from './HandsontableBase';
import styled from "styled-components";
import type {WithTheme} from "../../styles/styled-props.ts";

type Props = {
    classKey: string;
    onChangeClassKey: (key: string) => void;
};

export default function Curriculum({ classKey, onChangeClassKey }: Props) {
    const headers = [
        '진도구분',
        ...Array.from({ length: 12 }, (_, i) => `${i + 1}월`),
    ];

    //저장 로직
    function transformDataToJSON(data: string[][], merges: any[], year: number, className: string, title: string) {
        const rows = data.map((row, rowIndex) => {
            const progressType = row[0];
            const ranges = [];

            for (let col = 1; col <= 12; col++) {
                const cellContent = row[col];
                if (!cellContent) continue;

                // merge info 확인
                const merge = merges.find(
                    m => m.row === rowIndex && m.col === col
                );

                const startMonth = col;
                const endMonth = merge ? col + merge.colspan - 1 : col;

                ranges.push({
                    startMonth,
                    endMonth,
                    content: cellContent,
                });
            }

            return { progressType, ranges };
        });

        return {
            year,
            className,
            title,
            rows,
        };
    }



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
                    onClick={() => {

                    }}
                >
                    저장
                </Button>
            </TopBox>

            <HandsontableBase
                data={[
                    ['', '', '', '', '', '', '', '', '', '', '', '', ''],
                    ['', '', '', '', '', '', '', '', '', '', '', '', ''],
                ]}
                colHeaders={headers}
                onChange={(data, merges) => {
                    console.log(data, merges);
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