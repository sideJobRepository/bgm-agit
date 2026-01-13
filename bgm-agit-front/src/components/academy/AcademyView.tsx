import styled from "styled-components";
import { useAcademyViewFetch } from "../../recoil/academyFetch";
import { useRecoilValue } from "recoil";
import { academyViewDataState } from "../../recoil/state/academy";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import type {WithTheme} from "../../styles/styled-props.ts";

function makeWeekKey(w: any) {
  return `${w.startDate}~${w.endDate}`;
}

export default function AcademyView() {
  const fetchViewAcademy = useAcademyViewFetch();
  const academyViewData = useRecoilValue(academyViewDataState);
  console.log("academyViewData", academyViewData)
  const [selectedYearMonth, setSelectedYearMonth] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    fetchViewAcademy();
  }, []);

  if (!academyViewData) return null;

  // 연도-월 형식 문자열
  const selectedYear = selectedYearMonth.getFullYear();
  const selectedMonth = selectedYearMonth.getMonth() + 1;
  const dateYMStr = `${selectedYear}년 ${selectedMonth}월`;

  // 현재 선택된 월에 해당하는 데이터만 필터링
  const currentMonthData = academyViewData?.headers.find(
      (m: any) => Number(m.month) === selectedMonth
  );

  return (
      <Wrap>
        <TopBar>
          <DateNav>
            <IconBtn onClick={() => setCalendarOpen((v) => !v)}>{dateYMStr}</IconBtn>
            {calendarOpen && (
                <CalendarPopover>
                  <Calendar
                      value={selectedYearMonth}
                      onClickMonth={(date) => {
                        setSelectedYearMonth(date);
                        setCalendarOpen(false);
                      }}
                      view="year"
                      maxDetail="year"
                      // tileDisabled={() => true} // 일자 선택 방지
                  />
                </CalendarPopover>
            )}
          </DateNav>
        </TopBar>

        {/* 현재 선택된 월만 렌더링 */}
        {currentMonthData && (
            <MonthSection key={currentMonthData.month}>
              <Table>
                <thead>
                <tr>
                  <th>반명</th>
                  <th>담임</th>
                  <th>진도구분</th>
                  {currentMonthData.weekGroups.map((w: any, i: number) => (
                      <th key={i}>{w.label}</th>
                  ))}
                </tr>
                </thead>

                <tbody>
                {currentMonthData.rows.map((classGroup: any, gi: number) => {
                  return classGroup.teachers.flatMap((teacher: any, ti: number) => {
                    return teacher.progresses.map((progress: any, pi: number) => {
                      const weekMap = new Map<string, any>();
                      (progress.weeks ?? []).forEach((w: any) => {
                        weekMap.set(makeWeekKey(w), w);
                      });

                      const firstCurriculumContent =
                          progress.weeks.find((w: any) => w.startItem?.curriculumContent)?.startItem?.curriculumContent ??
                          progress.weeks.find((w: any) => w.endItem?.curriculumContent)?.endItem?.curriculumContent;

                      const curriculumRow = (
                          <tr key={`${gi}-${ti}-${pi}-cur`} className="tr-curriculum">
                            {/* 반명은 맨 처음만 출력 */}
                            {ti === 0 && pi === 0 && (
                                <td rowSpan={classGroup.teachers.length * teacher.progresses.length * 2}
                                    className="td-fixed className">
                                  {classGroup.className}
                                </td>
                            )}

                            {/* 강사명은 progresses 묶음별로 출력 */}
                            {pi === 0 && (
                                <td rowSpan={teacher.progresses.length * 2} className="td-fixed teacher">
                                  {teacher.teacher}
                                </td>
                            )}

                            <td rowSpan={2} className="td-progress">
                              {progress.progressGubun}
                            </td>

                            {currentMonthData.weekGroups.map((wg: any, wi: number) => {
                              return (
                                  <td key={wi} className="td-week td-curriculum">
                                    {firstCurriculumContent && <div>{firstCurriculumContent}</div>}
                                  </td>
                              );
                            })}
                          </tr>
                      );

                      const contentRow = (
                          <tr key={`${gi}-${ti}-${pi}-con`} className="tr-content">
                            {currentMonthData.weekGroups.map((wg: any, wi: number) => {
                              const week = weekMap.get(makeWeekKey(wg));
                              return (
                                  <td key={wi} className="td-week">
                                    {week?.startItem?.contents?.length > 0 &&
                                        week.startItem.contents.map((c: string, i: number) => (
                                            <div key={`start-${i}`}>{c}</div>
                                        ))}

                                    {week?.endItem?.contents?.length > 0 &&
                                        week.endItem.contents.map((c: string, i: number) => (
                                            <div key={`end-${i}`}>{c}</div>
                                        ))}

                                  </td>
                              );
                            })}
                          </tr>
                      );

                      return [curriculumRow, contentRow];
                    });
                  });
                })}
                </tbody>

              </Table>
            </MonthSection>
        )}
      </Wrap>
  );
}

const Wrap = styled.div`
  padding: 24px;
  margin-top: 100px;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 24px;
`;

const DateNav = styled.div`
  position: relative;
`;

const IconBtn = styled.button<WithTheme>`
  background: #222;
  color: white;
  padding: 6px 12px;
  border: none;
  cursor: pointer;
  font-size: ${({theme}) => theme.sizes.xsmall};
`;

const CalendarPopover = styled.div`
  position: absolute;
  top: 40px;
  left: 0;
  z-index: 100;
  background: white;
  border: 1px solid #d9d9d9;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const MonthSection = styled.section`
  margin-bottom: 48px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    border: 1px solid #d9d9d9;
    padding: 8px;
    vertical-align: top;
    font-size: 13px;
    white-space: nowrap;
  }

  th {
    background: #f8f9fa;
    text-align: center;
    font-weight: 500;
    color: #424548;
  }

  .td-fixed {
    text-align: center;
    vertical-align: middle;
  }

  .className {
    background: #c0d6ad;
    color: #424548;
    font-weight: 600;
  }

  .teacher {
    background: #dfead9;
    color: #2E2E2E;
    font-weight: 600;
  }

  .td-progress {
    background: #c3d9ef;
    color: #2E2E2E;
    font-weight: 600;
    vertical-align: middle;
    text-align: center;
  }

  .tr-curriculum td.td-week {
    background: #f3f6fd;
    font-weight: 500;
    color: #2E2E2E;
    text-align: center;
  }

  .tr-content td.td-week {
    background: #ffffff;
    color: #424548;
  }
`;
