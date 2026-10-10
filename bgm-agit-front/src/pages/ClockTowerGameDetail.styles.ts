import styled from 'styled-components';
import type { WithTheme } from '../styles/styled-props.ts';
import { theme } from '../styles/theme.ts';
import { buttonStyle, cardStyle, focusRing, inputStyle, type ButtonVariant } from '../styles/mixins.ts';

const c = theme.colors;

// 상세·등록 화면 전체를 카드 한 장으로 감싼다
export const Box = styled.div`
  ${cardStyle};
  max-width: 760px;
  margin: ${theme.space.xl} auto ${theme.space.xxl};
  padding: ${theme.space.xxl};

  @media ${theme.device.mobile} {
    margin: ${theme.space.lg} 0 ${theme.space.xl};
    padding: ${theme.space.lg};
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: ${theme.space.sm};
  margin-bottom: ${theme.space.xl};

  /* 등록·수정 폼 아래쪽 버튼 줄 */
  &:last-child {
    margin: ${theme.space.xl} 0 0;
    padding-top: ${theme.space.xl};
    border-top: 1px solid ${c.border};
  }

  @media ${theme.device.mobile} {
    > button {
      flex: 1;
    }
  }
`;

// color 는 예전 호출부 호환용으로만 받는다. 색은 $variant 가 정한다
export const Button = styled.button.withConfig({ shouldForwardProp: p => p !== 'color' })<
  { color?: string; $variant?: ButtonVariant } & WithTheme
>`
  ${({ $variant = 'primary' }) => buttonStyle($variant, 'md')};
`;

export const Cover = styled.div`
  width: 100%;
  max-width: 280px;
  aspect-ratio: 3 / 4;
  margin: 0 auto;
  background: ${c.surfaceAlt};
  border-radius: ${theme.radius.md};
  overflow: hidden;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media ${theme.device.mobile} {
    max-width: 220px;
  }
`;

export const NoImage = styled.div<WithTheme>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${c.textSubtle};
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
`;

export const DetailTitle = styled.h2<WithTheme>`
  margin-top: ${theme.space.xl};
  color: ${c.textStrong};
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-align: center;
  word-break: keep-all;

  @media ${theme.device.mobile} {
    font-size: 22px;
  }
`;

export const DetailMeta = styled.div<WithTheme>`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: ${theme.space.sm};
  margin-top: ${theme.space.md};

  span {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: ${theme.radius.pill};
    background: ${c.surfaceAlt};
    color: ${c.textBody};
    font-size: 14px;
    font-weight: 600;
  }
`;

export const SectionTitle = styled.h3<WithTheme>`
  margin: ${theme.space.xxl} 0 ${theme.space.lg};
  padding-top: ${theme.space.xl};
  border-top: 1px solid ${c.border};
  color: ${c.textStrong};
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

export const CharViewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.space.sm};
`;

export const CharViewItem = styled.div<WithTheme>`
  padding: 14px ${theme.space.lg};
  border: 1px solid ${c.border};
  border-radius: ${theme.radius.md};
  background: ${c.surface};
`;

export const CharHead = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.space.sm};
`;

export const CharName = styled.span<WithTheme>`
  color: ${c.textStrong};
  font-size: 16px;
  font-weight: 700;
`;

// 캐릭터 진영 색(TYPE_COLOR)은 의미를 담은 데이터 색이라 그대로 받는다
export const TypeTag = styled.span.withConfig({ shouldForwardProp: p => p !== 'color' })<{ color: string }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: ${theme.radius.pill};
  background: ${({ color }) => color};
  color: ${c.onPrimary};
  font-size: 12px;
  font-weight: 700;
  line-height: 1.4;
`;

export const CharDesc = styled.div<WithTheme>`
  margin-top: ${theme.space.sm};
  color: ${c.textMuted};
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-line;
`;

export const FormTitle = styled.h2<WithTheme>`
  margin-bottom: ${theme.space.xl};
  padding-bottom: ${theme.space.lg};
  border-bottom: 1px solid ${c.border};
  color: ${c.textStrong};
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.02em;

  @media ${theme.device.mobile} {
    font-size: 22px;
  }
`;

export const Row = styled.div`
  display: flex;
  gap: ${theme.space.md};

  @media ${theme.device.mobile} {
    flex-wrap: wrap;
  }
`;

export const Field = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: ${theme.space.sm};
  flex: 1;
  min-width: 140px;
  margin-bottom: ${theme.space.xl};

  > label {
    color: ${c.textStrong};
    font-size: 14px;
    font-weight: 700;
  }

  input[type='text'],
  input[type='number'] {
    ${inputStyle};
  }
`;

export const FileRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.space.md};
  min-width: 0;
`;

// label 이라 키보드 포커스는 안 받지만 모양은 버튼과 맞춘다
export const FileButton = styled.label<WithTheme>`
  ${buttonStyle('secondary', 'md')};
  flex-shrink: 0;
`;

export const FileName = styled.span<WithTheme>`
  min-width: 0;
  color: ${c.textMuted};
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const PreviewBox = styled.div`
  margin-top: ${theme.space.sm};

  img {
    display: block;
    width: 100%;
    max-width: 220px;
    border: 1px solid ${c.border};
    border-radius: ${theme.radius.md};
  }
`;

export const CheckLine = styled.label<WithTheme>`
  display: inline-flex;
  align-items: center;
  gap: ${theme.space.sm};
  min-height: 44px;
  color: ${c.textBody};
  font-size: 14px;
  cursor: pointer;

  input {
    width: 18px;
    height: 18px;
    accent-color: ${c.primary};
    cursor: pointer;
    ${focusRing};
  }
`;

export const CharEditList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.space.md};
`;

export const CharEditRow = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  gap: ${theme.space.sm};
  padding: ${theme.space.md};
  border: 1px solid ${c.border};
  border-radius: ${theme.radius.md};
  background: ${c.surfaceSunken};

  textarea {
    ${inputStyle};
    line-height: 1.5;
    resize: vertical;
  }
`;

export const CharLineTop = styled.div`
  display: flex;
  gap: ${theme.space.sm};

  input {
    ${inputStyle};
    flex: 1;
    min-width: 0;
  }

  select {
    ${inputStyle};
    flex: 0 0 120px;
    width: 120px;
    padding: 0 10px;
    cursor: pointer;
  }

  @media ${theme.device.mobile} {
    flex-wrap: wrap;

    input {
      flex: 1 1 100%;
    }

    select {
      flex: 1;
      width: auto;
    }
  }
`;

export const RemoveBtn = styled.button`
  ${buttonStyle('danger', 'md')};
  flex: 0 0 auto;
  padding: 0 14px;
  font-size: 14px;
`;

export const AddBtn = styled.button<WithTheme>`
  ${buttonStyle('ghost', 'md')};
  align-self: flex-start;
  margin-top: ${theme.space.md};
  border: 1px dashed ${c.primary};

  @media ${theme.device.mobile} {
    align-self: stretch;
  }
`;

export const Empty = styled.div<WithTheme>`
  padding: ${theme.space.xl} 0;
  border-radius: ${theme.radius.md};
  background: ${c.surfaceSunken};
  color: ${c.textMuted};
  font-size: 15px;
  font-weight: 600;
  text-align: center;
`;
