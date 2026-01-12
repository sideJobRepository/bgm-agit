import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import type { WithTheme } from '../../styles/styled-props';
import type { ClassKey } from '../../pages/Academy';
import {useInsertPost, useUpdatePost} from "../../recoil/fetch.ts";
import {useAcademyClassFetch, useAcademyFetch} from "../../recoil/academyFetch.ts";
import {useRecoilValue, useSetRecoilState} from "recoil";
import {academyClassDataState, academyDataState} from "../../recoil/state/academy.ts";
import {toast} from "react-toastify";

type ProgressItem = {
  classKey: ClassKey;
  curriculumProgressId: null | number; // 진도구분의 id
  inputsClasses: string; //반
  inputsDate: string; //일시
  inputsTeacher: string; //강사
  inputsSubjects: string; //과목
  inputsProgress: string; //진도
  inputsTests: string; // 테스트
  inputsHomework: string; //과제

  rows:
    {
      textbook: string; //교재명
      inputsUnit: string; //단원
      inputsPages: string; //페이지
    }[]

};


function fmtDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export default function AcademyInput() {

  const { insert } = useInsertPost();
  const { update } = useUpdatePost();

  const fetchAcademy = useAcademyFetch();
  const academyData = useRecoilValue(academyDataState);
  const setAcademyData = useSetRecoilState(academyDataState)

  const fetchAcademyClass = useAcademyClassFetch();
  const academyClassData = useRecoilValue(academyClassDataState);
  console.log("academyClassData", academyClassData);

  const [selectedProgressId, setSelectedProgressId] = useState<number | null>(null);

  const categoryOptions = [
    { value: '3g', label: '3g' },
    { value: '3k', label: '3k' },
    { value: '4g1', label: '4g1' },
  ];
  const [classKey, setClassKey] = useState(categoryOptions[0].value);

  const today = useMemo(() => new Date(), []);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const dateStr = fmtDate(selectedDate);


  const [form, setForm] = useState<Omit<ProgressItem, 'id' | 'classKey' | 'date'>>({
    curriculumProgressId: null, // 진도구분의 id
    inputsClasses: '', //반
    inputsDate: '', //일시
    inputsTeacher: '', //강사
    inputsSubjects: '', //과목
    inputsProgress: '', //진도
    inputsTests: '', // 테스트
    inputsHomework: '', //과제
    rows:[
      {
        textbook: '', //교재명
        inputsUnit: '', //단원
        inputsPages: '', //페이지
      }
    ]
  });

  const setField = (k: keyof typeof form, v: string | number) => setForm(prev => ({ ...prev, [k]: v }));

  const moveDay = (delta: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + delta);
    setSelectedDate(next);
  };

  //새로운 행 추가
  const updateRow = (
      index: number,
      key: keyof ProgressItem['rows'][number],
      value: string
  ) => {
    setForm(prev => {
      const rows = [...prev.rows];
      rows[index] = { ...rows[index], [key]: value };
      return { ...prev, rows };
    });
  };

  const addRow = () => {
    setForm(prev => ({
      ...prev,
      rows: [
        ...prev.rows,
        { textbook: '', inputsUnit: '', inputsPages: '' }
      ],
    }));
  };

  const removeRow = (index: number) => {
    setForm(prev => {
      const rows = [...prev.rows];
      rows.splice(index, 1);
      return { ...prev, rows };
    });
  };

  const submitSave = () => {
    const dateStr = fmtDate(selectedDate); // 여전히 사용됨
    console.log("curriculumProgressId", form)

    const requestFn = academyData?.id ? update : insert;
    const progressId = selectedProgressId ?? academyClassData[0]?.id ?? null;

    if(!progressId) {
      toast.error("진도 구분 값을 먼저 선택해주세요.")
      return;
    }
    const confirmed = window.confirm('저장하시겠습니까?');

    if(confirmed) {
      const body = academyData?.id ? {
        ...form,
        id: academyData?.id,
        curriculumProgressId: progressId,
        inputsDate: dateStr,
        inputsClasses: classKey,
        progressItems: form.rows.map(row => ({
          textbook: row.textbook,
          unit: row.inputsUnit,
          pages: row.inputsPages,
        })),
      } : {
        ...form,
        curriculumProgressId: progressId,
        inputsDate: dateStr,
        inputsClasses: classKey,
        progressInputsRequests: form.rows.map(row => ({
          textbook: row.textbook,
          inputsUnit: row.inputsUnit,
          inputsPages: row.inputsPages,
        })),
      }

      requestFn({
        url: '/bgm-agit/inputs',
        body,
        ignoreHttpError: true,
        onSuccess: () => {
          toast.success('저장되었습니다.');
          fetchAcademy({ year: dateStr, className: classKey, curriculumProgressId: progressId});
        },
      });
    }
  };

  //초기 랜더
  useEffect(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    console.log("날짜 바뀌면 실행")
    setSelectedProgressId(null);
    fetchAcademyClass({ className: classKey, year, month });
  }, [classKey, selectedDate]);

  useEffect(() => {
    if (selectedProgressId === null) {

      if(academyClassData.length > 0 ){
        setSelectedProgressId(academyClassData[0].id);
      }else {
        //진도 구분이 존재하지 않을 경우
        setAcademyData(null);
      }
    }
  }, [academyClassData]);


  useEffect(() => {
    if (selectedProgressId) {
      console.log("세번쨰실행")
      const yearStr = fmtDate(selectedDate);
      fetchAcademy({
        className: classKey,
        year: yearStr,
        curriculumProgressId: selectedProgressId,
      });
    }
  }, [selectedProgressId]);


  useEffect(() => {

    setForm({
      curriculumProgressId: academyData?.curriculumProgressId ?? null,
      inputsClasses: academyData?.classesName ?? '',
      inputsDate: academyData?.inputsDate ?? '',
      inputsTeacher: academyData?.teacher ?? '',
      inputsSubjects: academyData?.subjects ?? '',
      inputsProgress: academyData?.progress ?? '',
      inputsTests: academyData?.tests ?? '',
      inputsHomework: academyData?.homework ?? '',
      rows:
          (academyData?.progressItems && academyData.progressItems.length > 0)
              ? academyData.progressItems.map((item: any) => ({
                textbook: item?.textBook ?? '',
                inputsUnit: item?.unit ?? '',
                inputsPages: item?.pages ?? '',
              }))
              : [
                {
                  textbook: '',
                  inputsUnit: '',
                  inputsPages: '',
                },
              ],
    });

  }, [academyData]);


  return (
    <Wrap>
      <TopBar>
        <DateNav>
          <IconBtn type="button" onClick={() => moveDay(-1)}>
            ◀
          </IconBtn>
          <DateText onClick={() => setCalendarOpen(v => !v)}>{dateStr}</DateText>
          <IconBtn type="button" onClick={() => moveDay(1)}>
            ▶
          </IconBtn>

          {calendarOpen && (
            <CalendarPopover>
              <Calendar
                value={selectedDate}
                onChange={(v: any) => {
                  const d = Array.isArray(v) ? v[0] : v;
                  setSelectedDate(d);
                  setCalendarOpen(false);
                }}
              />
            </CalendarPopover>
          )}
        </DateNav>

        <PrimaryBtn  color="#222" onClick={submitSave}>
          저장
        </PrimaryBtn>
      </TopBar>

      <Body>
        <LeftPane>
          <ClassList>
            {categoryOptions.map(({ value, label }) => (
                <ClassRow key={value}>
                  <input
                      type="radio"
                      name="classKey"
                      value={value}
                      checked={classKey === value}
                      onChange={() => setClassKey(value)}
                  />
                  <span>{label.toUpperCase()}</span>
                </ClassRow>
            ))}
          </ClassList>
        </LeftPane>

        {/* 우측: 입력 폼 */}
        <RightPane>
          <Grid2>
            <FieldBox>
              <Field>
                <Label>반목록</Label>
                <ReadOnly>{classKey.toUpperCase()}</ReadOnly>
              </Field>
              <Field>
                <Label>수업일</Label>
                <ReadOnly>{dateStr}</ReadOnly>
              </Field>
            </FieldBox>

            <FieldBox>
              <Field>
                <Label>강사</Label>
                <Input value={form.inputsTeacher} onChange={e => setField('inputsTeacher', e.target.value)} />
              </Field>
              <Field>
                <Label>과목</Label>
                <Input value={form.inputsSubjects} onChange={e => setField('inputsSubjects', e.target.value)} />
              </Field>
              <Field>
                <Label>진도구분</Label>
                <Select
                    value={selectedProgressId ?? ''}
                    onChange={e => setSelectedProgressId(Number(e.target.value))}
                >
                  {academyClassData.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {opt.progressType}
                      </option>
                  ))}
                </Select>
              </Field>
            </FieldBox>

            <AddBox>
            {form.rows.map((row, idx) => (
                <FieldBox key={idx}>
                  <Field>
                    <Label>교재명</Label>
                    <Input
                        value={row.textbook}
                        onChange={e => updateRow(idx, 'textbook', e.target.value)}
                    />
                  </Field>
                  <Field>
                    <Label>단원</Label>
                    <Input
                        value={row.inputsUnit}
                        onChange={e => updateRow(idx, 'inputsUnit', e.target.value)}
                    />
                  </Field>
                  <Field>
                    <Label>페이지</Label>
                    <Input
                        value={row.inputsPages}
                        onChange={e => updateRow(idx, 'inputsPages', e.target.value)}
                    />
                  </Field>
                  <DeleteBtn  color="#222" onClick={() => {removeRow(idx)}}>
                    삭제
                  </DeleteBtn>
                </FieldBox>
            ))}
            </AddBox>

            <AddbtnBox>
              <AddBtn  color="#2E2E2E" onClick={addRow}>
                + 새로운 행 추가
              </AddBtn>
            </AddbtnBox>

            <FieldBox>
              <Field>
                <Label>진도</Label>
                <Textarea value={form.inputsProgress} onChange={e => setField('inputsProgress', e.target.value)} />
              </Field>
            </FieldBox>

            <FieldBox>
              <Field>
                <Label>테스트</Label>
                <Textarea value={form.inputsTests} onChange={e => setField('inputsTests', e.target.value)} />
              </Field>
            </FieldBox>

            <FieldBox>
              <Field>
                <Label>과제</Label>
                <Textarea
                    value={form.inputsHomework}
                    onChange={e => setField('inputsHomework', e.target.value)}
                />
              </Field>
            </FieldBox>

       
          </Grid2>
        </RightPane>
      </Body>
    </Wrap>
  );
}

/* styles */

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 12px;
  margin-top: 100px;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 100px;
  height: 50px;
  max-width: 1500px;
  padding: 0 48px 0 24px;
  width: 100%;
  background-color: white;
`;

const DateNav = styled.div<WithTheme>`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.sizes.small};
`;

const DateText = styled.div`
  font-weight: 700;
  cursor: pointer;
`;

const IconBtn = styled.button<WithTheme>`
  border: none;
  background: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  font-size: ${({ theme }) => theme.sizes.xxsmall};
`;

const CalendarPopover = styled.div`
  position: absolute;
  top: 44px;
  left: 0;
  z-index: 50;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
`;

const PrimaryBtn = styled.button<WithTheme & { color: string }>`
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

const DeleteBtn = styled.button<WithTheme & { color: string }>`
  width: 50px;
  background-color: transparent;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.redColor};
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
const AddbtnBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const AddBtn = styled.button<WithTheme & { color: string }>`
  padding: 6px 12px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.sizes.xsmall};
  border: none;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    opacity: 0.8;
  }

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.sizes.xsmall};
  }
`;

const Body = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 12px;
  margin-top: 32px;
`;

const LeftPane = styled.div<WithTheme>`
  border: 1px solid  ${({ theme }) => theme.colors.lineColor};
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.softColor};
  font-size: ${({ theme }) => theme.sizes.small};
`;

const RightPane = styled.div<WithTheme>`
  border: 1px solid  ${({ theme }) => theme.colors.lineColor};
  padding: 12px 24px;
  font-size: ${({ theme }) => theme.sizes.small};
`;


const ClassList = styled.div`
  display: grid;
  gap: 8px;
`;

const ClassRow = styled.label<WithTheme>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 4px;
  background-color: white;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  border: 1px solid  ${({ theme }) => theme.colors.lineColor};
`;

const Grid2 = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  //display: grid;
  //grid-template-columns: 1fr 1fr;
  //gap: 10px 12px;
`;

const AddBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid  ${({ theme }) => theme.colors.lineColor};
  background: ${({theme}) => theme.colors.softColor};
  padding: 16px 24px;
`

const FieldBox = styled.div`
    display: flex;
    gap: 16px;
`

const Field = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1;
`;

const Label = styled.div<WithTheme>`
  font-weight: 600;
  width: 60px;
  font-size: ${({ theme }) => theme.sizes.small};
  color: ${({ theme }) => theme.colors.menuColor};
`;

const ReadOnly = styled.div<WithTheme>`
  height: 32px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: ${({ theme }) => theme.colors.subColor};
  border: 1px solid  ${({theme}) => theme.colors.lineColor};
  background: ${({theme}) => theme.colors.border};
  flex: 1;
`;

const Input = styled.input<WithTheme>`

  height: 32px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  border-radius: 4px;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: ${({ theme }) => theme.colors.subColor};
  border: 1px solid  ${({theme}) => theme.colors.lineColor};
  flex: 1;
`;

const Select = styled.select<WithTheme>`
  height: 32px;
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: ${({ theme }) => theme.colors.subColor};
  border: 1px solid  ${({theme}) => theme.colors.lineColor};
  flex: 1;
  border-radius: 4px;
  padding: 0 10px;

  /* 화살표 위치 조정 */
  appearance: none;
  background-image: url('data:image/svg+xml;utf8,<svg fill="black" height="20" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>');
  background-repeat: no-repeat;
  background-position: right 4px center;
  background-size: 16px;
`;

const Textarea = styled.textarea<WithTheme>`
  min-height: 32px;
  border: 1px solid  ${({theme}) => theme.colors.lineColor};
  font-size: ${({ theme }) => theme.sizes.xsmall};
  color: ${({ theme }) => theme.colors.subColor};
  border-radius: 4px;
  padding: 10px;
  resize: vertical;
  flex: 1;
`;
