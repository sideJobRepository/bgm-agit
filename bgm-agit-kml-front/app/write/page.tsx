'use client';

import { motion } from 'framer-motion';
import styled from 'styled-components';
import { withBasePath } from '@/lib/path';

import React, { useEffect, useState } from 'react';

import { useFetchRecordUser, useFetchYakuman } from '@/services/recordStore';
import { useRecordUserStore } from '@/store/user';
import { Check, Plus } from 'phosphor-react';
import { useYakumanStore } from '@/store/record';
import { useInsertPost } from '@/services/main.service';
import { alertDialog, confirmDialog } from '@/utils/alert';

const DIRECTIONS = [
  { key: 'EAST', label: '동', color: '#415B9C' },
  { key: 'SOUTH', label: '남', color: '#8E6FB5' },
  { key: 'WEST', label: '서', color: '#E38B29' },
  { key: 'NORTH', label: '북', color: '#6DAE81' },
] as const;

const LEADER_POSITIONS = ['동장', '남장', '서장', '북장'];

type DirectionKey = (typeof DIRECTIONS)[number]['key'];

type YakumanRow = {
  search: string;
  userId: number | null;
  yakumanId: number | null;
  file: File | null;
};

export default function Write() {
  const { insert } = useInsertPost();

  const inputRef = React.useRef<HTMLInputElement>(null);

  const fetchRecordUser = useFetchRecordUser();
  const fetchYakuman = useFetchYakuman();
  const recordUser = useRecordUserStore((state) => state.recordUser);
  const yakumanData = useYakumanStore((state) => state.yakuman);
  console.log('recordUser', recordUser);
  console.log('yakumanData', yakumanData);

  /** 장 선택 */
  const [leader, setLeader] = useState('');

  /** 각 방향 기록 */
  const [records, setRecords] = useState<
    Record<
      DirectionKey,
      {
        userId: number | null;
        score: number;
        search: string;
      }
    >
  >({
    EAST: { userId: null, score: 0, search: '' },
    SOUTH: { userId: null, score: 0, search: '' },
    WEST: { userId: null, score: 0, search: '' },
    NORTH: { userId: null, score: 0, search: '' },
  });

  const [yakumanRows, setYakumanRows] = useState<YakumanRow[]>([]);
  const [memo, setMemo] = useState('');

  const rankedRecords = Object.entries(records)
    .map(([seat, data]) => ({
      seat,
      ...data,
    }))
    .sort((a, b) => b.score - a.score)
    .map((r, idx) => ({
      memberId: r.userId,
      recordScore: r.score,
      recordRank: idx + 1,
      recordSeat: r.seat, // EAST | SOUTH | WEST | NORTH
    }));

  const yakumans = yakumanRows
    .filter((r) => r.userId && r.yakumanId)
    .map((r) => {
      const yakuman = yakumanData.find((y) => y.id === r.yakumanId);
      return {
        memberId: r.userId,
        yakumanName: yakuman?.yakumanName,
      };
    });

  useEffect(() => {
    fetchRecordUser();
    fetchYakuman();
  }, []);

  /** 닉네임 검색 필터 */
  const filteredUsers = (search: string) => {
    if (!search) return recordUser;
    return recordUser.filter((u) => u.nickName.toLowerCase().includes(search.toLowerCase()));
  };

  const handleSubmit = async () => {
    const result = await confirmDialog('저장 하시겠습니까?', 'warning');
    if (!result.isConfirmed) return;

    // records → rank 계산
    const rankedRecords = Object.entries(records)
      .map(([seat, data]) => ({
        seat,
        ...data,
      }))
      .sort((a, b) => b.score - a.score)
      .map((r, idx) => ({
        memberId: r.userId,
        recordScore: r.score,
        recordRank: idx + 1,
        recordSeat: r.seat, // EAST | SOUTH | WEST | NORTH
      }));

    // yakumans
    const yakumans = yakumanRows
      .filter((r) => r.userId && r.yakumanId)
      .map((r) => {
        const yakuman = yakumanData.find((y) => y.id === r.yakumanId);
        return {
          memberId: r.userId,
          yakumanName: yakuman?.yakumanName,
        };
      });

    //body 완성
    const body = {
      wind: leader,
      tournamentStatus: 'N',
      records: rankedRecords,
      yakumans,
    };

    insert({
      url: '/bgm-agit/record',
      body,
      ignoreErrorRedirect: true,
      onSuccess: async () => {
        await alertDialog('기록이 작성되었습니다.', 'success');
      },
    });
  };

  return (
    <Wrapper>
      <Hero>
        <HeroBg>
          <img src={withBasePath('/write.jpg')} alt="" />
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
          <h1>Record Entry</h1>
          <span>플레이 결과를 입력하고 랭킹에 반영하세요.</span>
        </HeroContent>
      </Hero>
      <TableBox>
        {/* 장 선택 */}
        <Top>
          <TopGroup>
            <FieldsWrapper>
              <Field className="top">
                <label>장</label>
                <select value={leader} onChange={(e) => setLeader(e.target.value)}>
                  {LEADER_POSITIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
            </FieldsWrapper>
          </TopGroup>
          <Button onClick={handleSubmit}>
            <Check weight="bold" />
          </Button>
        </Top>

        {/* 동서남북 입력 */}
        {DIRECTIONS.map(({ key, label, color }) => {
          const row = records[key];
          const users = filteredUsers(row.search);

          return (
            <Center key={key} $color={color}>
              <h4>{label}</h4>
              <WriteCroup>
                <FieldsWrapper>
                  <Field className="search">
                    <label>닉네임 검색</label>
                    <input
                      value={row.search}
                      onChange={(e) =>
                        setRecords((prev) => ({
                          ...prev,
                          [key]: { ...prev[key], search: e.target.value },
                        }))
                      }
                    />
                  </Field>
                  <Field className="user">
                    <label>닉네임</label>
                    <select
                      value={row.userId ?? ''}
                      onChange={(e) =>
                        setRecords((prev) => ({
                          ...prev,
                          [key]: {
                            ...prev[key],
                            userId: e.target.value ? Number(e.target.value) : null,
                          },
                        }))
                      }
                    >
                      <option value="">선택</option>
                      {users?.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nickName}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field className="score">
                    <label>점수</label>
                    <input
                      type="number"
                      value={row.score}
                      onChange={(e) =>
                        setRecords((prev) => ({
                          ...prev,
                          [key]: {
                            ...prev[key],
                            score: Number(e.target.value),
                          },
                        }))
                      }
                    />
                  </Field>
                </FieldsWrapper>
              </WriteCroup>
            </Center>
          );
        })}

        <PlusButton
          onClick={() =>
            setYakumanRows((prev) => [
              ...prev,
              { search: '', userId: null, yakumanId: null, file: null },
            ])
          }
        >
          <Plus weight="bold" />
          역만 추가
        </PlusButton>
        {yakumanRows.map((row, idx) => {
          const users = !row.search
            ? recordUser
            : recordUser.filter((u) => u.nickName.toLowerCase().includes(row.search.toLowerCase()));

          return (
            <Center key={`yakuman-${idx}`} $color="#f3f3f3">
              <WriteCroup>
                <FieldsWrapper>
                  {/* 닉네임 검색 */}
                  <Field className="search">
                    <label>닉네임 검색</label>
                    <input
                      value={row.search}
                      onChange={(e) =>
                        setYakumanRows((prev) =>
                          prev.map((r, i) => (i === idx ? { ...r, search: e.target.value } : r))
                        )
                      }
                      placeholder="검색"
                    />
                  </Field>

                  {/* 닉네임 */}
                  <Field className="user">
                    <label>닉네임</label>
                    <select
                      value={row.userId ?? ''}
                      onChange={(e) =>
                        setYakumanRows((prev) =>
                          prev.map((r, i) =>
                            i === idx
                              ? { ...r, userId: e.target.value ? Number(e.target.value) : null }
                              : r
                          )
                        )
                      }
                    >
                      <option value="">선택</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nickName}
                        </option>
                      ))}
                    </select>
                  </Field>

                  {/* 역만 */}
                  <Field className="user">
                    <label>역만</label>
                    <select
                      value={row.yakumanId ?? ''}
                      onChange={(e) =>
                        setYakumanRows((prev) =>
                          prev.map((r, i) =>
                            i === idx
                              ? { ...r, yakumanId: e.target.value ? Number(e.target.value) : null }
                              : r
                          )
                        )
                      }
                    >
                      <option value="">선택</option>
                      {[...yakumanData]
                        .sort((a, b) => a.orders - b.orders)
                        .map((y) => (
                          <option key={y.id} value={y.id}>
                            {y.yakumanName}
                          </option>
                        ))}
                    </select>
                  </Field>
                </FieldsWrapper>
              </WriteCroup>
              <ImageOverlay>
                <UploadButton onClick={() => inputRef.current?.click()}>
                  <h5>이미지 첨부</h5>
                  <span>드래그하거나 클릭하세요.</span>
                </UploadButton>
                <HiddenInput
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setYakumanRows((prev) =>
                      prev.map((r, i) =>
                        i === idx ? { ...r, file: e.target.files?.[0] ?? null } : r
                      )
                    )
                  }
                />
              </ImageOverlay>

              {/*<label>증빙 파일</label>*/}
              {/*<input*/}
              {/*  type="file"*/}
              {/*  accept="image/*,.pdf"*/}
              {/*  onChange={(e) =>*/}
              {/*    setYakumanRows(prev =>*/}
              {/*      prev.map((r, i) =>*/}
              {/*        i === idx*/}
              {/*          ? { ...r, file: e.target.files?.[0] ?? null }*/}
              {/*          : r*/}
              {/*      )*/}
              {/*    )*/}
              {/*  }*/}
              {/*/>*/}
            </Center>
          );
        })}
        {yakumanRows.length > 0 && (
          <WriteCroup>
            <FieldsWrapper>
              <Field className="memo">
                <label>비고</label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="예) 동 1국 진하친 이지금 사암각 단기 론 오름 -진하쏘임"
                  rows={5}
                />
              </Field>
            </FieldsWrapper>
          </WriteCroup>
        )}
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

    filter: blur(3px);
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
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 24px;
  padding: 24px 8px;

  select {
    border: none;
    width: 100%;
    padding: 8px 4px;
    text-align: center;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    outline: none;
    color: ${({ theme }) => theme.colors.inputColor};
    background: ${({ theme }) => theme.colors.whiteColor};
    border-radius: 4px;
    cursor: pointer;
  }
`;

const PlusButton = styled.button`
  display: flex;
  width: 100px;
  gap: 6px;
  justify-content: center;
  align-items: center;
  margin-left: auto;
  padding: 8px;
  background-color: #415b9c;
  color: ${({ theme }) => theme.colors.whiteColor};
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Top = styled.section`
  display: flex;
  width: 100%;
  position: relative;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.lineColor};
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 32px;
    height: 2px;
    background: ${({ theme }) => theme.colors.blackColor};
  }
`;

const TopGroup = styled.div`
  display: flex;
  background-color: transparent;
  flex: 1;
  align-items: center;
  padding: 4px 6px;
  border: none;
  border-radius: 4px;
  flex-wrap: nowrap;
  max-width: 100px;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }

  label {
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    color: ${({ theme }) => theme.colors.inputColor};
    font-weight: 600;
    padding: 4px;
    text-align: left;
  }

  select {
    text-align: left;
    border: 1px solid ${({ theme }) => theme.colors.lineColor};
  }
`;

const Center = styled.section<{ $color: string }>`
  display: inline-flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  text-align: center;
  align-items: center;
  background-color: #f3f3f3;
  border-radius: 4px;

  h4 {
    display: inline-flex;
    font-size: ${({ theme }) => theme.desktop.sizes.h4Size};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.blackColor};
    padding: 20px 8px;
    border-radius: 50%;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h4Size};
    }
  }
`;
const FieldsWrapper = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  align-items: center;
  flex: 1;
  overflow-x: auto;
  flex-wrap: nowrap;
  overflow-y: hidden;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;

  &.memo {
    width: 100%;
  }

  &.top {
    width: 100%;
  }

  &.search {
    flex: 2;
  }

  &.user {
    flex: 2;
  }

  &.score {
    flex: 1;
  }
`;

const WriteCroup = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 4px;
  flex-wrap: nowrap;

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
  }

  label {
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    color: ${({ theme }) => theme.colors.grayColor};
    font-weight: 600;
    padding: 4px 4px;
    text-align: left;
  }

  input {
    border: none;
    width: 100%;
    padding: 8px 4px;
    text-align: center;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    outline: none;
    color: ${({ theme }) => theme.colors.inputColor};
    background: ${({ theme }) => theme.colors.whiteColor};
    border-radius: 4px;

    &::placeholder {
      color: ${({ theme }) => theme.colors.softColor};
    }
  }

  textarea {
    border: 1px solid ${({ theme }) => theme.colors.lineColor};
    width: 100%;
    resize: none;
    padding: 8px 12px;
    text-align: left;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    outline: none;
    color: ${({ theme }) => theme.colors.inputColor};
    background: ${({ theme }) => theme.colors.whiteColor};
    border-radius: 4px;

    &::placeholder {
      color: ${({ theme }) => theme.colors.grayColor};
    }
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  width: 32px;
  height: 32px;
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

const ImageOverlay = styled.div`
  display: flex;
  width: 95%;
  margin: 12px 0 24px 0;
  height: 200px;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.border};
  transition: background 0.25s ease;
  border-radius: 4px;
`;

const UploadButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px;
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.9);
  background: rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(6px);
  cursor: pointer;
  font-size: ${({ theme }) => theme.desktop.sizes.xl};

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.xl};
  }

  h5 {
    color: ${({ theme }) => theme.colors.whiteColor};
    font-size: ${({ theme }) => theme.desktop.sizes.h5Size};
    font-weight: 500;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h5Size};
    }
  }

  span {
    color: ${({ theme }) => theme.colors.whiteColor};
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 400;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.xl};
    }
  }

  &:hover {
    background: rgba(0, 0, 0, 0.2);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;
