import styled from "styled-components";
import { useAcademyViewFetch } from "../../recoil/academyFetch";
import { useRecoilValue } from "recoil";
import { academyViewDataState } from "../../recoil/state/academy";
import { useEffect } from "react";

function makeWeekKey(w: any) {
  return `${w.startDate}~${w.endDate}`;
}

export default function AcademyView() {
  const fetchViewAcademy = useAcademyViewFetch();
  const academyViewData = useRecoilValue(academyViewDataState);

  useEffect(() => {
    fetchViewAcademy();
  }, []);

  if (!academyViewData) return null;

  return (
      <Wrap>
        {academyViewData.headers.map((monthData: any, mi: number) => {
          const { month, weekGroups, rows } = monthData;

          return (
              <MonthSection key={month}>
                <MonthTitle>{month}월</MonthTitle>

                <Table>
                  <thead>
                  <tr>
                    <th >반명</th>
                    <th>담임</th>
                    <th>진도구분</th>
                    {weekGroups.map((w: any, i: number) => (
                        <th key={i}>{w.label}</th>
                    ))}
                  </tr>
                  </thead>

                  <tbody>
                  {rows.map((classGroup: any, gi: number) => {
                    // row 하나당 2줄 → *2
                    const span = (classGroup.rows?.length ?? 0) * 2;

                    return (classGroup.rows ?? []).flatMap((row: any, ri: number) => {
                      const weekMap = new Map<string, any>();
                      (row.weeks ?? []).forEach((w: any) => {
                        weekMap.set(makeWeekKey(w), w);
                      });

                      // 커리큘럼 행
                      const curriculumRow = (
                          <tr key={`${month}-${gi}-${ri}-cur`} className="tr-curriculum">
                            {ri === 0 && (
                                <td rowSpan={span} className="td-fixed className">
                                  {row.className}
                                </td>
                            )}
                            {ri === 0 && (
                                <td rowSpan={span} className="td-fixed teacher">
                                  {row.teacher}
                                </td>
                            )}

                            <td rowSpan={2} className="td-progress">
                              {row.progressGubun}
                            </td>

                            {weekGroups.map((wg: any, wi: number) => {
                              const week = weekMap.get(makeWeekKey(wg));
                              return (
                                  <td key={wi} className="td-week td-curriculum">
                                    {week?.startItem?.curriculumContent && (
                                        <div>{week.startItem.curriculumContent}</div>
                                    )}
                                  </td>
                              );
                            })}
                          </tr>
                      );

                      // 2️⃣ 내용 행
                      const contentRow = (
                          <tr key={`${month}-${gi}-${ri}-con`} className="tr-content">
                            {weekGroups.map((wg: any, wi: number) => {
                              const week = weekMap.get(makeWeekKey(wg));
                              return (
                                  <td key={wi} className="td-week">
                                    {week?.startItem?.content && (
                                        <div>{week.startItem.content}</div>
                                    )}
                                    {week?.endItem?.content && (
                                        <div>{week.endItem.content}</div>
                                    )}
                                  </td>
                              );
                            })}
                          </tr>
                      );

                      return [curriculumRow, contentRow];
                    });
                  })}
                  </tbody>
                </Table>
              </MonthSection>
          );
        })}
      </Wrap>
  );
}
const Wrap = styled.div`
  padding: 24px;
  margin-top: 100px;
`;

const MonthSection = styled.section`
  margin-bottom: 48px;
`;

const MonthTitle = styled.h2`
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 700;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  //table-layout: fixed;

  th,
  td {
    border: 1px solid #d9d9d9;
    padding: 8px;
    vertical-align: top;
    font-size: 13px;
    white-space: nowrap;
  }

  th {
    background: #f3f4f6;
    text-align: center;
    font-weight: 600;
  }

  .td-fixed {
    text-align: center;
    vertical-align: middle;
  }
    
  .className {
    background: #093A6E;
    color: white;
    font-weight: 600;
  }
  
  .teacher {
    background: #2a7ecf;
    color: white;
    font-weight: 600;
  }

  .td-progress {
    background: #6098cf;
    color: white;
    font-weight: 600;
    vertical-align: middle;
  }

  .tr-curriculum td.td-week {
    background: #6098cf;
    font-weight: 600;
    color: white;
    text-align: center;
  }

  .tr-content td.td-week {
    background: #ffffff;
  }
`;
