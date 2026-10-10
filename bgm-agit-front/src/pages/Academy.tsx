import { Wrapper, AcademyTabBox, ImgBox, TabButtonBox, TabButton } from './Academy.styles.ts';
import { useState } from 'react';
import Curriculum from '../components/academy/Curriculum.tsx';
import AcademyInput from '../components/academy/AcademyInput.tsx';
import AcademyView from '../components/academy/AcademyView.tsx';
import logo from "/acLogo.png"


type AcademyTabKey = 'curriculum' | 'input' | 'view';
export type ClassKey = '3g' | '3k' | '4g1';

export default function Academy() {
  const [activeTab, setActiveTab] = useState<AcademyTabKey>('curriculum');


  return (
    <Wrapper>
      <AcademyTabBox>
        <ImgBox>
          <img src={logo} alt="로고"/>
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
            />
        )}
    </Wrapper>
  );
}
