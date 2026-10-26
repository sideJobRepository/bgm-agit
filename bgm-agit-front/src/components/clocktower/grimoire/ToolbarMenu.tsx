import { useState, type ReactNode } from 'react';
import styled from 'styled-components';
import { Btn } from './grimoire.styles.ts';

/**
 * 마도서 툴바의 [더보기]. 버튼이 15개 넘게 두 줄로 늘어서 자주 쓰는 것만 밖에 두고 나머지를 묶었다.
 * 안의 버튼을 누르면 그 동작을 한 뒤 메뉴를 닫는다(onClickCapture). 바깥을 누르면 그냥 닫힌다.
 */
export default function ToolbarMenu({
  children,
  label = '더보기 ▾',
  active,
}: {
  children: ReactNode;
  label?: ReactNode;
  active?: boolean; // 메뉴가 닫혀 있어도 강조할 때(타이머가 도는 중 등)
}) {
  const [open, setOpen] = useState(false);
  return (
    <Wrap>
      <Btn type="button" $active={open || !!active} onClick={() => setOpen(v => !v)} aria-expanded={open}>
        {label}
      </Btn>
      {open && (
        <>
          <Backdrop onClick={() => setOpen(false)} />
          <Panel
            onClickCapture={e => {
              // 버튼을 눌렀을 때만 닫는다(묶음 제목 같은 빈 곳은 무시)
              if ((e.target as HTMLElement).closest('button')) window.setTimeout(() => setOpen(false), 0);
            }}
          >
            {children}
          </Panel>
        </>
      )}
    </Wrap>
  );
}

/** 메뉴 안 묶음 제목 */
export const MenuGroup = styled.div`
  margin: 8px 4px 2px;
  font-size: 12px;
  font-weight: 700;
  color: var(--ct-muted);

  &:first-child {
    margin-top: 0;
  }
`;

const Wrap = styled.div`
  position: relative;
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 19;
`;

const Panel = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 240px;
  max-height: 70dvh;
  padding: 10px;
  overflow-y: auto;
  border: 1px solid var(--ct-line);
  border-radius: 12px;
  background: var(--ct-surface);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);

  button {
    justify-content: flex-start;
    width: 100%;
    text-align: left;
  }
`;
