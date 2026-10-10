import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { useMediaQuery } from 'react-responsive';
import type { StylesConfig } from 'react-select';
import { useSetRecoilState } from 'recoil';
import { searchState } from '../recoil';
import { Wrapper, SearchGroup, FieldsWrapper, Field, GameField, SearchButton, SearchIcon, DateRange, DateCenter, SortSelect } from './SearchBar.styles.ts';
import { theme } from '../styles/theme.ts';

interface SearchBarProps<T> {
  color: string;
  label: string;
  onSearch: (keyword: T) => void;
  onCategory?: (category: T) => void;
}

type OptionType = {
  label: string;
  value: string;
};

export default function SearchBar<T = string>({ color, label, onSearch }: SearchBarProps<T>) {
  const isMobile = useMediaQuery({ query: theme.device.mobile });
  const location = useLocation();
  const key = location.pathname.split('/').filter(Boolean).pop()!;

  const today = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(today.getMonth() + 1);

  const [startDate, setStartDate] = useState<Date | null>(today);
  const [endDate, setEndDate] = useState<Date | null>(oneMonthLater);

  const setSearch = useSetRecoilState(searchState);

  const [keyword, setKeyword] = useState('');
  const categoryOptions = [
    { value: '', label: '전체' },
    { value: 'MURDER', label: '머더 미스터리' },
    { value: 'STRATEGY', label: '전략' },
    { value: 'PARTY', label: '파티(가족)' },
  ];

  //게임의 경우 카테고리 추가
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (key === 'reservationList') {
      onSearch([startDate, endDate] as T);
    } else if (['room', 'role', 'notice', 'free', 'inquiry', 'service-request'].includes(key)) {
      onSearch(keyword as T);
    } else {
      setSearch(() => ({
        name: keyword,
        category: category,
        page: 0, // 여기만 업데이트
        gb: key,
      }));
    }
  };

  const searchSelect: StylesConfig<OptionType, false> = {
    control: provided => ({
      ...provided,
      width: '100%',
      height: 24,
      minHeight: 20,
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      boxShadow: 'none',
      outline: 'none',
      '&:hover': {
        borderColor: '#093A6E',
        outline: 'none',
      },
    }),
    valueContainer: provided => ({
      ...provided,
      paddingTop: 0, // 내부 값 컨테이너 패딩 제거
      paddingLeft: 2,
    }),
    singleValue: provided => ({
      ...provided,
      color: '#424548',
      fontSize: isMobile ? '12px' : '14px',
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: '14px',
      color: state.isSelected ? '#fff' : '#424548',
      backgroundColor: state.isSelected ? color : '#fff',
      cursor: 'pointer',
    }),
    indicatorsContainer: provided => ({
      ...provided,
      display: 'none',
    }),
    menu: provided => ({
      ...provided,
      width: 110,
      zIndex: 9999,
    }),
  };

  useEffect(() => {
    setKeyword('');
    setCategory('');
    setSearch(prev => ({
      ...prev,
      name: '',
      category: '',
      page: 0,
      gb: '',
    }));

    // 현재 페이지에 따라 초기 검색값 분기
    if (key === 'reservationList') {
      onSearch([null, null] as T);
    } else {
      onSearch('' as T);
    }
  }, [location]);

  return (
    <Wrapper>
      <SearchGroup color={color} onSubmit={handleSubmit}>
        <FieldsWrapper>
          {key === 'reservationList' && (
            <Field color={color}>
              <label>{label}</label>
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
          {key === 'game' && (
            <>
              <GameField color={color}>
                <label>분류</label>
                <SortSelect>
                  <Select
                    value={categoryOptions.find(opt => opt.value === category)}
                    onChange={selectedOption => setCategory(selectedOption?.value ?? '')}
                    options={categoryOptions}
                    styles={searchSelect}
                    isSearchable={false}
                    menuPortalTarget={document.body}
                  />
                </SortSelect>
              </GameField>
              <GameField color={color}>
                <label>{label}</label>
                <input
                  type="text"
                  placeholder="검색어를 입력해주세요."
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                />
              </GameField>
            </>
          )}
          {!['reservationList', 'game'].includes(key) && (
            <Field color={color}>
              <label>{label}</label>
              <input
                type="text"
                placeholder="검색어를 입력해주세요."
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
              />
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
