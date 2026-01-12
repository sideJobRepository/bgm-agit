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

  return (
    <Wrapper>
      <AcademyTabBox>
        <ImgBox>
          <img src='http://www.yangyoung.com/images/logo.png' alt="로고"/>
        </ImgBox>
        <TabButtonBox>
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
        </TabButtonBox>
      </AcademyTabBox>

      {activeTab === 'curriculum' && (
            <Curriculum
            />
        )}

        {activeTab === 'input' && (
            <AcademyInput
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
    </Wrapper>
  );
}

export const Wrapper = styled.div<WithTheme>`
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: 0 auto;
  @media ${({ theme }) => theme.device.mobile} {
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

const AcademyTabBox = styled.section<WithTheme>`
  position: fixed;
  top: 0;
  height: 100px;
  width: 100%;
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
`;

const ImgBox = styled.div`
`
const TabButtonBox = styled.div`
    display: flex;
  gap: 8px;
`

const TabButton = styled.button<{ active: boolean } & WithTheme>`
  background-color: transparent;;
  color: ${({ active, theme }) => (active ? theme.colors.blueColor : theme.colors.text)};
  border: none;
  padding: 6px 10px;
  font-size: ${({ active, theme }) => (active ? theme.sizes.menu : theme.sizes.large)}; 
  font-weight: 600;
  cursor: pointer;
`;

export const TabWrap = styled.div`
    display: flex;
  flex-direction: column;
  padding: 24px;
  margin-top: 100px;
`