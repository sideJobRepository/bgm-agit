'use client';

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { withBasePath } from '@/lib/path';
import { useEffect, useState } from 'react';
import { CaretDown, Check, Plus, X } from 'phosphor-react';
import { useFetchSeasons } from '@/services/season.service';
import { useSeasonStore } from '@/store/season';

type RankSetting = {
  id: number;
  gifUrl: string;
  minRating: number;
  rankName: string;
  color: string;
};

type SeasonSetting = {
  id: number;
  seasonName: string;
  startDate: string;
  endDate: string;
  baseRating: number;
  minGames: number;
  resetType: 'HARD' | 'SOFT' | 'CONTINUOUS';
  carryRatio: number;
};

const INITIAL_RANK_SETTINGS: RankSetting[] = [
  { id: 1, gifUrl: '/rankGif/6.gif', minRating: 2000, rankName: '천봉', color: '#4A90E2' },
  { id: 2, gifUrl: '/rankGif/5.gif', minRating: 1800, rankName: '왕자', color: '#D9625E' },
  { id: 3, gifUrl: '/rankGif/4.gif', minRating: 1600, rankName: '호걸', color: '#6DAE81' },
  { id: 4, gifUrl: '/rankGif/3.gif', minRating: 1400, rankName: '현무', color: '#E38B29' },
  { id: 5, gifUrl: '/rankGif/2.gif', minRating: 1200, rankName: '초심', color: '#415B9C' },
  { id: 6, gifUrl: '/rankGif/1.gif', minRating: 0, rankName: '입문', color: '#8E6FB5' },
];

const EMPTY_SEASON_FORM: Omit<SeasonSetting, 'id'> = {
  seasonName: '',
  startDate: '',
  endDate: '',
  baseRating: 1500,
  minGames: 20,
  resetType: 'SOFT',
  carryRatio: 60,
};

export default function SeasonPage() {
  const fetchSeasons = useFetchSeasons();
  const seasons = useSeasonStore((state) => state.seasons);
  const [pageIndex, setPageIndex] = useState<0 | 1>(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [rankSettings, setRankSettings] = useState(INITIAL_RANK_SETTINGS);
  const [isAddingSeason, setIsAddingSeason] = useState(false);
  const [seasonForm, setSeasonForm] = useState(EMPTY_SEASON_FORM);

  useEffect(() => {
    fetchSeasons();
  }, []);

  const currentSeasonId = selectedSeasonId || (seasons[0] ? String(seasons[0].id) : '');

  const updateRank = <K extends keyof RankSetting>(id: number, key: K, value: RankSetting[K]) => {
    setRankSettings((prev) =>
      prev.map((rank) => (rank.id === id ? { ...rank, [key]: value } : rank))
    );
  };

  const updateSeasonForm = <K extends keyof typeof seasonForm>(
    key: K,
    value: (typeof seasonForm)[K]
  ) => {
    setSeasonForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveSeason = () => {
    setSeasonForm(EMPTY_SEASON_FORM);
    setIsAddingSeason(false);
  };

  const cancelSeason = () => {
    setSeasonForm(EMPTY_SEASON_FORM);
    setIsAddingSeason(false);
  };

  return (
    <>
      <IntroOverlay />
      <Wrapper>
        <SlideViewport>
          <TabBar>
            <TabButton
              type="button"
              $active={pageIndex === 0}
              onClick={() => {
                setDirection(-1);
                setPageIndex(0);
              }}
            >
              랭크 설정
            </TabButton>
            <TabButton
              type="button"
              $active={pageIndex === 1}
              onClick={() => {
                setDirection(1);
                setPageIndex(1);
              }}
            >
              시즌 설정
            </TabButton>
          </TabBar>

          <MotionBox
            key={pageIndex}
            initial={{ x: `${direction * 100}%`, opacity: 0 }}
            animate={{ x: '0%', opacity: 1 }}
            exit={{ x: `${direction * -100}%`, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          >
            <Title>
              <h1>{pageIndex === 0 ? 'Rank Setting' : 'Season Setting'}</h1>
              <span>
                {pageIndex === 0
                  ? '등급 기준과 표시 정보를 관리합니다.'
                  : '시즌 기간과 레이팅 적용 방식을 정리합니다.'}
              </span>
            </Title>

            <Content>
              {pageIndex === 0 ? (
                <>
                  <SeasonPanel>
                    <PanelHeader>
                      <div>
                        <strong>대상 시즌</strong>
                        <span>랭크를 설정할 시즌을 선택하세요.</span>
                      </div>
                    </PanelHeader>

                    <SeasonField>
                      <SelectShell>
                        <select
                          value={currentSeasonId}
                          onChange={(e) => setSelectedSeasonId(e.target.value)}
                        >
                          {seasons.length === 0 && <option value="">등록된 시즌이 없습니다</option>}
                          {seasons.map((season) => (
                            <option key={season.id} value={season.id}>
                              {season.name}
                            </option>
                          ))}
                        </select>
                        <CaretDown weight="bold" />
                      </SelectShell>
                    </SeasonField>
                  </SeasonPanel>

                  <RankPanel>
                    <PanelHeader>
                      <div>
                        <strong>랭크 설정</strong>
                        <span>등급 이름, 기준 점수, 색상과 이미지를 맞춥니다.</span>
                      </div>
                    </PanelHeader>

                    <RankGrid>
                      {rankSettings.map((rank) => (
                        <RankCard key={rank.id} $color={rank.color}>
                          <RankImage>
                            <img src={withBasePath(rank.gifUrl)} alt="" />
                          </RankImage>

                          <RankFields>
                            <Field>
                              <label>하한 레이팅</label>
                              <input
                                type="number"
                                min="0"
                                value={rank.minRating}
                                onChange={(e) =>
                                  updateRank(rank.id, 'minRating', Number(e.target.value))
                                }
                              />
                            </Field>

                            <Field>
                              <label>등급 이름</label>
                              <input
                                value={rank.rankName}
                                onChange={(e) => updateRank(rank.id, 'rankName', e.target.value)}
                              />
                            </Field>

                            <Field>
                              <label>색상</label>
                              <ColorPicker>
                                <input
                                  type="color"
                                  value={rank.color}
                                  onChange={(e) => updateRank(rank.id, 'color', e.target.value)}
                                  aria-label={`${rank.rankName} 색상 선택`}
                                />
                                <ColorValue>{rank.color}</ColorValue>
                              </ColorPicker>
                            </Field>
                          </RankFields>
                        </RankCard>
                      ))}
                    </RankGrid>
                  </RankPanel>
                </>
              ) : (
                <SeasonManagePanel>
                  <PanelHeader>
                    <div>
                      <strong>시즌 설정</strong>
                      <span>새 시즌의 기간과 레이팅 기준을 추가합니다.</span>
                    </div>
                  </PanelHeader>

                  <SeasonList>
                    {seasons.map((season) => (
                      <SeasonItem key={season.id}>
                        <div>
                          <strong>{season.name}</strong>
                          <span>
                            {season.startDate} - {season.endDate}
                          </span>
                        </div>
                        <SeasonMeta>
                          <span>기준 {season.baseRating}</span>
                          <span>최소 -</span>
                          <span>{season.resetType}</span>
                          <span>계승 {season.carryRate}%</span>
                        </SeasonMeta>
                      </SeasonItem>
                    ))}
                    {seasons.length === 0 && <EmptyText>등록된 시즌이 없습니다.</EmptyText>}
                  </SeasonList>

                  <AddSeasonRow>
                    <AddSeasonButton type="button" onClick={() => setIsAddingSeason(true)}>
                      <Plus weight="bold" />
                      시즌 추가
                    </AddSeasonButton>
                  </AddSeasonRow>

                  {isAddingSeason && (
                    <SeasonForm>
                      <FormGrid>
                        <Field>
                          <label>시즌 이름</label>
                          <input
                            value={seasonForm.seasonName}
                            onChange={(e) => updateSeasonForm('seasonName', e.target.value)}
                          />
                        </Field>
                        <Field>
                          <label>시작일</label>
                          <input
                            type="date"
                            value={seasonForm.startDate}
                            onChange={(e) => updateSeasonForm('startDate', e.target.value)}
                          />
                        </Field>
                        <Field>
                          <label>종료일</label>
                          <input
                            type="date"
                            value={seasonForm.endDate}
                            onChange={(e) => updateSeasonForm('endDate', e.target.value)}
                          />
                        </Field>
                        <Field>
                          <label>기준 레이팅</label>
                          <input
                            type="number"
                            min="0"
                            value={seasonForm.baseRating}
                            onChange={(e) => updateSeasonForm('baseRating', Number(e.target.value))}
                          />
                        </Field>
                        <Field>
                          <label>최소 판수</label>
                          <input
                            type="number"
                            min="0"
                            value={seasonForm.minGames}
                            onChange={(e) => updateSeasonForm('minGames', Number(e.target.value))}
                          />
                        </Field>
                        <Field>
                          <label>리셋 방식</label>
                          <select
                            value={seasonForm.resetType}
                            onChange={(e) =>
                              updateSeasonForm(
                                'resetType',
                                e.target.value as SeasonSetting['resetType']
                              )
                            }
                          >
                            <option value="HARD">하드</option>
                            <option value="SOFT">소프트</option>
                            <option value="CONTINUOUS">콘티뉴스</option>
                          </select>
                        </Field>
                        <Field>
                          <label>계승 비율</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={seasonForm.carryRatio}
                            onChange={(e) => updateSeasonForm('carryRatio', Number(e.target.value))}
                          />
                        </Field>
                      </FormGrid>
                      <FormActions>
                        <SecondaryButton type="button" onClick={cancelSeason}>
                          <X weight="bold" />
                          취소
                        </SecondaryButton>
                        <PrimaryButton type="button" onClick={saveSeason}>
                          <Check weight="bold" />
                          저장
                        </PrimaryButton>
                      </FormActions>
                    </SeasonForm>
                  )}
                </SeasonManagePanel>
              )}
            </Content>
          </MotionBox>
        </SlideViewport>
      </Wrapper>
    </>
  );
}

const IntroOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(circle at 18% 12%, rgba(74, 144, 226, 0.18), transparent 34%),
    radial-gradient(circle at 86% 18%, rgba(141, 111, 181, 0.14), transparent 30%),
    linear-gradient(145deg, #191c22, #111318 58%, #20232a);
  pointer-events: none;
`;

const Wrapper = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  max-width: 1500px;
  min-width: 1280px;
  min-height: 600px;
  height: 100%;
  margin: 0 auto;
  flex-direction: column;
  padding-bottom: 32px;

  @media ${({ theme }) => theme.device.tablet} {
    width: 100vw;
    max-width: 100%;
    min-width: 100%;
    min-height: unset;
  }
`;

const SlideViewport = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  width: 100%;
  padding-top: 32px;
`;

const MotionBox = styled(motion.div)`
  display: flex;
  flex-direction: column;
`;

const Title = styled.div`
  display: flex;
  flex-direction: column;
  width: 90%;
  align-self: center;
  text-align: center;
  gap: 8px;
  margin-top: 12px;
  padding: 24px 0;

  h1 {
    font-size: ${({ theme }) => theme.desktop.sizes.titleSize};
    font-weight: 800;
    color: ${({ theme }) => theme.colors.whiteColor};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.titleSize};
    }
  }

  span {
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.lineColor};

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.xl};
    }
  }
`;

const TabBar = styled.div`
  align-self: center;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  width: min(420px, calc(100% - 32px));
  padding: 4px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
`;

const TabButton = styled.button<{ $active: boolean }>`
  height: 36px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.18)' : 'transparent')};
  border-radius: 4px;
  cursor: pointer;
  background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.08)' : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.colors.whiteColor : theme.colors.lineColor)};
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  font-weight: 800;
  box-shadow: ${({ $active }) => ($active ? 'inset 0 1px 0 rgba(255, 255, 255, 0.12)' : 'none')};
  transition:
    background 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
`;

const Content = styled.section`
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
  padding: 0 0 32px;
`;

const BasePanel = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  background:
    linear-gradient(
      135deg,
      rgba(74, 144, 226, 0.1),
      rgba(141, 111, 181, 0.08) 42%,
      rgba(255, 255, 255, 0.94)
    ),
    ${({ theme }) => theme.colors.recordBgColor};
  border: 1px solid rgba(29, 29, 31, 0.06);
  border-radius: 6px;
  overflow: hidden;
`;

const RankPanel = styled(BasePanel)`
  background:
    radial-gradient(circle at 12% 0%, rgba(74, 144, 226, 0.18), transparent 34%),
    radial-gradient(circle at 88% 12%, rgba(141, 111, 181, 0.14), transparent 32%),
    linear-gradient(145deg, #252a32, #191c22 58%, #14161b);
  border-color: rgba(255, 255, 255, 0.1);

  > div:first-child {
    border-bottom-color: rgba(255, 255, 255, 0.12);

    strong {
      color: ${({ theme }) => theme.colors.whiteColor};
    }

    span {
      color: rgba(255, 255, 255, 0.62);
    }
  }
`;

const SeasonPanel = styled(BasePanel)`
  background:
    radial-gradient(circle at 8% 0%, rgba(255, 255, 255, 0.12), transparent 30%),
    linear-gradient(
      145deg,
      rgba(45, 51, 61, 0.96),
      rgba(28, 32, 39, 0.94) 58%,
      rgba(22, 25, 31, 0.96)
    );
  border-color: rgba(255, 255, 255, 0.1);

  > div:first-child {
    border-bottom-color: rgba(255, 255, 255, 0.12);

    strong {
      color: ${({ theme }) => theme.colors.whiteColor};
    }

    span {
      color: rgba(255, 255, 255, 0.62);
    }
  }
`;

const SeasonManagePanel = styled(SeasonPanel)``;

const SeasonField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 420px;
`;

const SelectShell = styled.div`
  position: relative;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 6px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.08)),
    rgba(255, 255, 255, 0.06);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);

  select {
    width: 100%;
    height: 100%;
    padding: 0 42px 0 14px;
    border: none;
    outline: none;
    appearance: none;
    background: transparent;
    color: ${({ theme }) => theme.colors.whiteColor};
    font-size: ${({ theme }) => theme.desktop.sizes.md};
    font-weight: 800;
    cursor: pointer;
  }

  option {
    color: ${({ theme }) => theme.colors.inputColor};
  }

  svg {
    position: absolute;
    top: 50%;
    right: 14px;
    width: 14px;
    height: 14px;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.72);
    pointer-events: none;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};

  strong {
    display: block;
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    font-weight: 800;
    color: ${({ theme }) => theme.colors.blackColor};
  }

  span {
    display: block;
    margin-top: 4px;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    color: ${({ theme }) => theme.colors.grayColor};
  }
`;

const RankGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;
  }
`;

const RankCard = styled.article<{ $color: string }>`
  position: relative;
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 6px;
  background:
    radial-gradient(circle at 14% 0%, rgba(255, 255, 255, 0.12), transparent 32%),
    linear-gradient(145deg, #2b2f36, #1d1f24 58%, #17191d);
  box-shadow:
    0 10px 28px rgba(29, 29, 31, 0.07),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 6px;
    background: ${({ $color }) => $color};
  }

  &::after {
    content: '';
    position: absolute;
    left: 16px;
    right: 16px;
    top: 0;
    height: 3px;
    background: ${({ $color }) => $color};
    opacity: 0.72;
  }

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;
  }
`;

const RankImage = styled.div`
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.86);
  box-shadow: inset 0 0 0 1px rgba(29, 29, 31, 0.04);

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const RankFields = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  min-width: 0;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);

  > div:last-child {
    grid-column: 1 / -1;
  }

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;

  label {
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    font-weight: 700;
    color: ${({ theme }) => theme.colors.grayColor};
  }

  input,
  select {
    width: 100%;
    height: 40px;
    padding: 0 10px;
    border: 1px solid ${({ theme }) => theme.colors.lineColor};
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.whiteColor};
    color: ${({ theme }) => theme.colors.inputColor};
    font-size: ${({ theme }) => theme.desktop.sizes.md};
  }
`;

const ColorPicker = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  input {
    width: 44px;
    height: 36px;
    padding: 2px;
    border: 1px solid ${({ theme }) => theme.colors.lineColor};
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.whiteColor};
    cursor: pointer;
  }
`;

const ColorValue = styled.span`
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  font-weight: 700;
  color: rgba(255, 255, 255, 0.88);
`;

const SeasonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const EmptyText = styled.div`
  padding: 24px 16px;
  border: 1px dashed rgba(29, 29, 31, 0.16);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.54);
  text-align: center;
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.grayColor};
`;

const SeasonItem = styled.article`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);

  strong {
    display: block;
    font-size: ${({ theme }) => theme.desktop.sizes.lg};
    color: ${({ theme }) => theme.colors.whiteColor};
  }

  span {
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    color: rgba(255, 255, 255, 0.68);
  }

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
  }
`;

const SeasonMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;

  span {
    padding: 8px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.08);
    font-weight: 700;
    color: rgba(255, 255, 255, 0.82);
  }
`;

const AddSeasonRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const AddSeasonButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 14px;
  border: none;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.inputColor};
  color: ${({ theme }) => theme.colors.whiteColor};
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  font-weight: 800;
  cursor: pointer;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SeasonForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 6px;
  background:
    radial-gradient(circle at 12% 0%, rgba(255, 255, 255, 0.14), transparent 34%),
    linear-gradient(145deg, #2b2f36, #1d1f24 58%, #17191d);
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 14px;
  border: none;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.writeBgColor};
  color: ${({ theme }) => theme.colors.whiteColor};
  font-weight: 800;
  cursor: pointer;
`;

const SecondaryButton = styled(PrimaryButton)`
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  background: ${({ theme }) => theme.colors.whiteColor};
  color: ${({ theme }) => theme.colors.inputColor};
`;
