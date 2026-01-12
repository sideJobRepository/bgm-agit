import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import type { WithTheme } from '../../styles/styled-props';
import type { ClassKey } from '../../pages/Academy';
import { showConfirmModal } from '../confirmAlert.tsx';
import {useInsertPost, useUpdatePost} from "../../recoil/fetch.ts";
import {useAcademyClassFetch} from "../../recoil/academyFetch.ts";
import {useRecoilValue} from "recoil";
import {academyClassDataState} from "../../recoil/state/academy.ts";

type ProgressItem = {
  classKey: ClassKey;
  curriculumProgressId: string; // 진도구분의 id
  inputsClasses: string; //반
  inputsDate: string; //일시
  inputsTeacher: string; //강사
  inputsSubjects: string; //과목
  //진도구분, 교재명 추가 해야함
  inputsUnit: string; //단원
  inputsPages: string; //페이지
  inputsProgress: string; //진도
  inputsTests: string; // 테스트
  inputsHomework: string; //과제
};


type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

function fmtDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export default function AcademyInput() {

  const { insert } = useInsertPost();
  const { update } = useUpdatePost();

  const fetchAcademyClass = useAcademyClassFetch();
  const academyClassData = useRecoilValue(academyClassDataState);
  console.log("adacacac", academyClassData);


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
    curriculumProgressId: '', // 진도구분의 id
    inputsClasses: '', //반
    inputsDate: '', //일시
    inputsTeacher: '', //강사
    inputsSubjects: '', //과목
    //진도구분, 교재명 추가 해야함
    inputsUnit: '', //단원
    inputsPages: '', //페이지
    inputsProgress: '', //진도
    inputsTests: '', // 테스트
    inputsHomework: '', //과제
  });

  const setField = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const moveDay = (delta: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + delta);
    setSelectedDate(next);
  };



  const submitSave = () => {
    showConfirmModal({
      message: '진도표를 저장하시겠습니까?',
      onConfirm: () => {

      },
    });
  };

  //초기 랜더
  useEffect(() => {
    const year = selectedDate.getFullYear();
    console.log("selectedDate", selectedDate, "className",  year)
    fetchAcademyClass({className : classKey, year: year});

  }, [classKey, selectedDate]);

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
                <Select value={form.curriculumProgressId} onChange={e => setField('curriculumProgressId', e.target.value)}>
                  {academyClassData?.map(opt => (
                      <option key={opt.progressType} value={opt.progressType}>
                        {opt.progressType}
                      </option>

                  ))}
                </Select>
              </Field>
            </FieldBox>

            <FieldBox>
              <Field>
                <Label>교재명</Label>
                <Input value={form.teacher} onChange={e => setField('teacher', e.target.value)} />
              </Field>
              <Field>
                <Label>단원</Label>
                <Input value={form.inputsUnit} onChange={e => setField('inputsUnit', e.target.value)} />
              </Field>
              <Field>
                <Label>페이지</Label>
                <Input value={form.inputsPages} onChange={e => setField('inputsPages', e.target.value)} />
              </Field>
            </FieldBox>

            <AddbtnBox>
              <AddBtn  color="#2E2E2E" onClick={submitSave}>
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
  margin-top: 16px;
  display: grid;
  gap: 12px;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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
