'use client';
import { withBasePath } from '@/lib/path';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useFetchDayRecordList } from '@/services/dayRecord.service';
import { useDayRecordStore } from '@/store/dayRecord';
import { useEffect, useState } from 'react';
import { BaseCardTable } from '@/app/components/BaseCardTable';
import { MagnifyingGlass, PencilSimpleLine } from 'phosphor-react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

export default function DayRecord() {
  const fetchDayRecord = useFetchDayRecordList();
  const [page, setPage] = useState(0);
  const dayRecordData = useDayRecordStore((state) => state.dayReord);

  //검색
  const [nickName, setNickName] = useState('');

  const today = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(today.getMonth() - 1);

  const formatDate = (date: Date | null) => (date ? date.toISOString().split('T')[0] : null);

  const [startDate, setStartDate] = useState<Date | null>(oneMonthLater);
  const [endDate, setEndDate] = useState<Date | null>(today);

  const onPageChange = (newPage: number) => {
    setPage(newPage);
  };
  //
  const totalPages = dayRecordData?.totalPages ?? 0;

  useEffect(() => {
    fetchDayRecord({
      page,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      nickName,
    });
  }, [page]);

  return (
    <Wrapper>
      <Hero>
        <HeroBg>
          <img src={withBasePath('/dayHero.jpg')} alt="" />
        </HeroBg>
        <FixedDarkOverlay />
        <HeroOverlay
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{
            duration: 1.2,
            ease: [0.65, 0, 0.35, 1],
          }}
        />

        <HeroContent>
          <h1>Monthly Summary</h1>
          <span>이번 달의 기록과 변화 추이를 확인하세요.</span>
        </HeroContent>
      </Hero>
      <TableBox>
        <TopBox>
          <SearchGroup
            onSubmit={(e) => {
              e.preventDefault();
              fetchDayRecord({
                page,
                startDate: formatDate(startDate),
                endDate: formatDate(endDate),
                nickName,
              });
            }}
          >
            <FieldsWrapper>
              <Field>
                <label>닉네임</label>
                <input
                  type="text"
                  placeholder="검색어를 입력해주세요."
                  value={nickName ?? ''}
                  onChange={(e) => setNickName(e.target.value)}
                />
              </Field>
              <Field>
                <label>날짜</label>
                <DateRange>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="yyyy.MM.dd"
                    locale={ko}
                    portalId="root-portal"
                  />
                  <DateCenter>-</DateCenter>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    locale={ko}
                    dateFormat="yyyy.MM.dd"
                    portalId="root-portal"
                  />
                </DateRange>
              </Field>
            </FieldsWrapper>
            <SearchButton type="submit">
              <MagnifyingGlass weight="bold" />
              검색
            </SearchButton>
          </SearchGroup>
        </TopBox>
        {dayRecordData && <BaseCardTable page={page} onPageChange={setPage} data={dayRecordData} />}
      </TableBox>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: auto;
  flex-direction: column;
  gap: 36px;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

const Hero = styled.section`
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;

  @media ${({ theme }) => theme.device.mobile} {
    height: 120px;
  }
`;

const HeroBg = styled.div`
  position: absolute;
  inset: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;

    filter: blur(2px);
    transform: scale(1);
  }
`;

const FixedDarkOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  z-index: 0;
`;

const HeroOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;

  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;

  text-align: center;
  color: ${({ theme }) => theme.colors.whiteColor};

  h1 {
    font-size: ${({ theme }) => theme.desktop.sizes.titleSize};
    font-weight: 800;
    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.titleSize};
    }
  }

  span {
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 600;
    opacity: 0.8;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.xl};
    }
  }
`;

const TableBox = styled.div`
  width: 100%;
  overflow: hidden;
`;

const TopBox = styled.section`
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 20px;
  justify-content: space-between;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.writeBgColor};
  color: ${({ theme }) => theme.colors.whiteColor};
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  border: none;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);

  &:hover {
    opacity: 0.8;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SearchGroup = styled.form`
  display: flex;
  background-color: ${({ theme }) => theme.colors.white};
  flex: 1;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px 2px 20px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 4px;
  flex-wrap: nowrap;
  max-width: 520px;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }
`;

const FieldsWrapper = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  flex: 1;
  gap: 8px;
  overflow-x: auto;
  flex-wrap: nowrap;
  overflow-y: hidden;
  margin-right: 12px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(50% - 8px);
  flex-shrink: 0;

  @media ${({ theme }) => theme.device.mobile} {
    width: 180px;
  }

  label {
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    color: ${({ theme }) => theme.colors.blackColor};
    font-weight: 600;
    text-align: left;
  }

  input {
    border: none;
    width: 100%;
    padding: 4px 0;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    outline: none;
    color: ${({ theme }) => theme.colors.inputColor};
    background: transparent;
  }
`;

const SearchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #6dae81;
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  box-shadow: 2px 4px 2px rgba(0, 0, 0, 0.2);
  border: none;
  color: white;
  font-weight: 500;
  padding: 0 16px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    opacity: 0.8;
  }
`;

const DateRange = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.inputColor};

  input {
    width: 60px !important;
    cursor: pointer;
  }

  span {
    font-size: 14px;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.subColor};
  }
`;

const DateCenter = styled.div`
  display: flex;
`;
