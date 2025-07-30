import styled from 'styled-components';
import { FiSearch } from 'react-icons/fi';
import type { WithTheme } from '../styles/styled-props.ts';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface SearchBarProps {
  color: string;
  label: string;
  onSearch: (keyword: string) => void;
}

export default function SearchBar({ color, label, onSearch }: SearchBarProps) {
  const location = useLocation();
  const key = location.pathname.split('/').filter(Boolean).pop();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [keyword, setKeyword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key === 'ReservationList') {
      onSearch([startDate, endDate]); // 배열 또는 객체 전달
    } else {
      onSearch(keyword);
    }
  };

  useEffect(() => {
    setKeyword('');
    onSearch('');
  }, [location]);

  return (
    <Wrapper>
      <SearchGroup color={color} onSubmit={handleSubmit}>
        <FieldsWrapper>
          {key !== 'ReservationList' ? (
            <Field color={color}>
              <label>{label}</label>
              <input
                type="text"
                placeholder="검색어를 입력해주세요."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
            </Field>
          ) : (
            <Field color={color}>
              <label>집행일자</label>
              <DateRange>
                <DatePicker
                  selected={startDate}
                  onChange={date => setStartDate(date)}
                  dateFormat="yyyy.MM.dd"
                  portalId="root-portal"
                />
                <DateCenter>-</DateCenter>
                <DatePicker
                  selected={endDate}
                  onChange={date => setEndDate(date)}
                  dateFormat="yyyy.MM.dd"
                  portalId="root-portal"
                />
              </DateRange>
            </Field>
          )}
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

const DateRange = styled.div<WithTheme>`
  display: flex;
  align-items: center;
  gap: 6px;

  span {
    font-size: 14px;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.subColor};
  }
`;

const DateCenter = styled.div`
  display: flex;
  margin-right: 12px;
`;
