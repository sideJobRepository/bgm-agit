import { Wrapper } from '../styles';
import styled from 'styled-components';
import { useState } from 'react';
import type { WithTheme } from '../styles/styled-props';
import Curriculum from '../components/academy/Curriculum.tsx';
import AcademyInput from '../components/academy/AcademyInput.tsx';
import AcademyView from '../components/academy/AcademyView.tsx';

type AcademyTabKey = 'curriculum' | 'input' | 'view';
export type ClassKey = '3g' | '3k' | '4g1';

type CurriculumState = {
  // 반별로 rows 저장
  byClass: Record<ClassKey, any[]>;
  titleByClass: Record<ClassKey, string>;
};

type ProgressInputState = { rows: any[] }; // 일단 가라

export default function Academy() {
  const [activeTab, setActiveTab] = useState<AcademyTabKey>('curriculum');

  // 부모가 최상위 키 관리
  const [classKey, setClassKey] = useState<ClassKey>('3g');

  // 부모가 탭별 데이터도 관리
  const [curriculumState, setCurriculumState] = useState<CurriculumState>({
    byClass: {
      '3g': [],
      '3k': [],
      '4g1': [],
    },
    titleByClass: {
      '3g': '',
      '3k': '',
      '4g1': '',
    },
  });

  const [progressInputState, setProgressInputState] = useState<ProgressInputState>({ rows: [] });

  const saveCurriculum = () =>
    console.log('save curriculum', { classKey, rows: curriculumState.byClass[classKey] });

  const saveProgressInput = () =>
    console.log('save progressInput', { classKey, progressInputState });

  return (
    <Wrapper>
      <AcademyTabBox>
        <TabButton
          type="button"
          active={activeTab === 'curriculum'}
          onClick={() => setActiveTab('curriculum')}
        >
          커리큘럼
        </TabButton>

        <TabButton
          type="button"
          active={activeTab === 'input'}
          onClick={() => setActiveTab('input')}
        >
          진도표 입력
        </TabButton>

        <TabButton type="button" active={activeTab === 'view'} onClick={() => setActiveTab('view')}>
          진도표 확인
        </TabButton>
      </AcademyTabBox>

      <ContentBox>
        {activeTab === 'curriculum' && (
            <Curriculum
            />
        )}

        {activeTab === 'input' && (
            <AcademyInput
                classKey={classKey}
                onChangeClassKey={setClassKey}
                value={progressInputState}
                onChange={setProgressInputState}
                onSave={saveProgressInput}
                curriculumState={curriculumState}
            />
        )}

        {activeTab === 'view' && (
            <AcademyView
                classKey={classKey}
                onChangeClassKey={setClassKey}
                curriculumState={curriculumState}
                progressInputState={progressInputState}
                year={2025}
                month={12}
            />
        )}
      </ContentBox>
    </Wrapper>
  );
}

const AcademyTabBox = styled.section<WithTheme>`
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
`;

const TabButton = styled.button<{ active: boolean } & WithTheme>`
  background-color: ${({ active, theme }) => (active ? theme.colors.menuColor : 'transparent')};
  color: ${({ active, theme }) => (active ? theme.colors.white : theme.colors.text)};
  border: none;
  padding: 6px 10px;
  font-size: ${({ theme }) => theme.sizes.small};
  cursor: pointer;
`;

const ContentBox = styled.section<WithTheme>`
  padding: 24px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.lineColor};
`