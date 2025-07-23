import styled from 'styled-components';
import { FiSearch } from 'react-icons/fi';
import type { WithTheme } from '../styles/styled-props.ts';

interface SearchBarProps {
  color: string;
  label: string;
}

export default function SearchBar({ color, label }: SearchBarProps) {
  return (
    <Wrapper>
      <SearchGroup
        color={color}
        // onSubmit={e => {
        //   e.preventDefault();
        // }}
      >
        <FieldsWrapper>
          <Field color={color}>
            <label>{label}</label>
            <input type="text" placeholder="원하는 검색어를 입력해주세요." />
          </Field>
        </FieldsWrapper>
        <SearchButton color={color} type="submit">
          <SearchIcon size={22} />
          검색
        </SearchButton>
      </SearchGroup>
    </Wrapper>
  );
}
const Wrapper = styled.section`
  display: flex;
  width: 100%;
`;
const SearchGroup = styled.form<{ color: string } & WithTheme>`
  display: flex;
  background-color: ${({ theme }) => theme.colors.white};
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px 2px 20px;
  border: 2px solid ${({ color }) => color};
  border-radius: 999px;
  flex-wrap: nowrap;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

const FieldsWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  flex: 1;
  overflow-x: auto;
  flex-wrap: nowrap;
  overflow-y: hidden;
`;

const Field = styled.div<{ color: string } & WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-shrink: 0;

  label {
    font-size: ${({ theme }) => theme.sizes.xsmall};
    color: ${({ color }) => color};
    font-weight: bold;
    text-align: left;
    margin-left: 6px;
  }

  input {
    border: none;
    width: 100%;
    padding: 4px 4px;
    font-size: ${({ theme }) => theme.sizes.small};
    outline: none;
    color: ${({ theme }) => theme.colors.subColor};
    background: transparent;
  }

  @media ${({ theme }) => theme.device.mobile} {
    label {
      font-size: ${({ theme }) => theme.sizes.xxsmall};
    }
    input {
      font-size: ${({ theme }) => theme.sizes.xsmall};
    }
  }
`;

const SearchButton = styled.button<{ color: string }>`
  display: flex;
  align-items: center;
  background: ${({ color }) => color};
  box-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);
  border: none;
  color: white;
  font-weight: bold;
  padding: 10px 18px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
`;

const SearchIcon = styled(FiSearch)`
  margin-right: 4px;
`;
