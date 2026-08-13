'use client';

import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CaretDown, Check, ImageSquare, Play, Plus, Trash } from 'phosphor-react';
import {
  useCloseSeason,
  useFetchSeasons,
  useFetchSeasonTiers,
  useSaveSeasonTiers,
  useStartSeason,
} from '@/services/season.service';
import { useDeletePost, useInsertPost, useUpdatePost } from '@/services/main.service';
import { useSeasonStore } from '@/store/season';
import type { Season } from '@/store/season';
import { useLoadingStore } from '@/store/loading';
import { alertDialog, confirmDialog } from '@/utils/alert';
import { useUserStore } from '@/store/user';
import { useRouter } from 'next/navigation';

type RankSetting = {
  id: number;
  imageBase64: string;
  minRating: string;
  rankName: string;
  color: string;
};

type SeasonSetting = {
  name: string;
  startDate: string;
  endDate: string;
  baseRating: number;
  firstScore: number;
  secondScore: number;
  thirdScore: number;
  fourthScore: number;
  eastMultiple: number;
  southMultiple: number;
  westMultiple: number;
  northMultiple: number;
};

const EMPTY_SEASON_FORM: SeasonSetting = {
  name: '',
  startDate: '',
  endDate: '',
  baseRating: 0,
  firstScore: 0,
  secondScore: 0,
  thirdScore: 0,
  fourthScore: 0,
  eastMultiple: 0,
  southMultiple: 0,
  westMultiple: 0,
  northMultiple: 0,
};

const PROGRESS_STATUS_LABEL = {
  SCHEDULED: '대기',
  ONGOING: '진행중',
  CLOSED: '종료',
} as const;

const SCORE_FIELDS = ['firstScore', 'secondScore', 'thirdScore', 'fourthScore'] as const;
const MULTIPLE_FIELDS = ['eastMultiple', 'southMultiple', 'westMultiple', 'northMultiple'] as const;

export default function SeasonPage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const fetchSeasons = useFetchSeasons();
  const fetchSeasonTiers = useFetchSeasonTiers();
  const saveSeasonTiers = useSaveSeasonTiers();
  const { insert } = useInsertPost();
  const { update } = useUpdatePost();
  const { remove } = useDeletePost();
  const startSeasonById = useStartSeason();
  const closeSeasonById = useCloseSeason();
  const seasons = useSeasonStore((state) => state.seasons);
  const loading = useLoadingStore((state) => state.loading);
  const isAdmin = !!user?.roles?.includes('ROLE_ADMIN');
  const [pageIndex, setPageIndex] = useState<0 | 1>(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [rankSettings, setRankSettings] = useState<RankSetting[]>([]);
  const [isAddingSeason, setIsAddingSeason] = useState(false);
  const [editingSeasonId, setEditingSeasonId] = useState<number | null>(null);
  const [seasonForm, setSeasonForm] = useState(EMPTY_SEASON_FORM);

  useEffect(() => {
    if (!user || !isAdmin) return;
    fetchSeasons();
  }, [user, isAdmin]);

  useEffect(() => {
    if (!user || isAdmin) return;
    router.replace('/');
  }, [user, isAdmin, router]);

  const currentSeasonId = selectedSeasonId || (seasons[0] ? String(seasons[0].id) : '');
  const editingSeason = seasons.find((season) => season.id === editingSeasonId);

  useEffect(() => {
    if (!user || !isAdmin || !currentSeasonId) return;

    fetchSeasonTiers(currentSeasonId, (res) => {
      setRankSettings(
        res.map((tier) => ({
          id: tier.id,
          imageBase64: tier.image ?? '',
          minRating: String(tier.minRating ?? ''),
          rankName: tier.name ?? '',
          color: tier.color ?? '#ffffff',
        }))
      );
    }).catch(() => {
      setRankSettings([]);
    });
  }, [user, isAdmin, currentSeasonId]);

  const updateRank = <K extends keyof RankSetting>(id: number, key: K, value: RankSetting[K]) => {
    setRankSettings((prev) =>
      prev.map((rank) => (rank.id === id ? { ...rank, [key]: value } : rank))
    );
  };

  const addRank = () => {
    setRankSettings((prev) => [
      ...prev,
      {
        id: Date.now(),
        imageBase64: '',
        minRating: '',
        rankName: '',
        color: '#ffffff',
      },
    ]);
  };

  const removeRank = (id: number) => {
    setRankSettings((prev) => prev.filter((rank) => rank.id !== id));
  };

  const uploadRankImage = (id: number, file: File | null) => {
    if (!file) return;

    if (file.size > 1_000_000) {
      alertDialog('이미지는 1MB 이하로 업로드해주세요.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateRank(id, 'imageBase64', String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const saveRanks = async () => {
    if (!currentSeasonId) {
      await alertDialog('랭크를 저장할 시즌을 선택해주세요.', 'error');
      return;
    }

    if (rankSettings.length === 0) {
      await alertDialog('저장할 등급을 추가해주세요.', 'error');
      return;
    }

    const hasEmptyField = rankSettings.some(
      (rank) => !rank.rankName.trim() || !rank.imageBase64 || !rank.color || !rank.minRating
    );

    if (hasEmptyField) {
      await alertDialog('등급 이름, 이미지, 색상, 하한 레이팅을 모두 입력해주세요.', 'error');
      return;
    }

    const tiers = rankSettings.map((rank) => ({
      name: rank.rankName.trim(),
      imageBase64: rank.imageBase64,
      color: rank.color,
      minRating: Number(rank.minRating),
    }));

    if (tiers.some((tier) => !Number.isInteger(tier.minRating) || tier.minRating <= 0)) {
      await alertDialog('하한 레이팅은 1 이상의 정수로 입력해주세요.', 'error');
      return;
    }

    const savedTiers = await saveSeasonTiers(currentSeasonId, { tiers });
    await alertDialog('랭크 설정이 저장되었습니다.', 'success');

    const res = savedTiers ?? [];
    setRankSettings(
      res.map((tier) => ({
        id: tier.id,
        imageBase64: tier.image ?? '',
        minRating: String(tier.minRating ?? ''),
        rankName: tier.name ?? '',
        color: tier.color ?? '#ffffff',
      }))
    );
  };

  const updateSeasonForm = <K extends keyof typeof seasonForm>(
    key: K,
    value: (typeof seasonForm)[K]
  ) => {
    setSeasonForm((prev) => ({ ...prev, [key]: value }));
  };

  const saveSeason = async () => {
    if (!seasonForm.name.trim()) {
      await alertDialog('시즌 이름을 입력해주세요.', 'error');
      return;
    }

    if (!seasonForm.startDate || !seasonForm.endDate) {
      await alertDialog('시즌 기간을 입력해주세요.', 'error');
      return;
    }

    if (SCORE_FIELDS.some((field) => seasonForm[field] < -9999.99 || seasonForm[field] > 9999.99)) {
      await alertDialog('점수는 -9999.99부터 9999.99까지 입력할 수 있습니다.', 'error');
      return;
    }

    if (MULTIPLE_FIELDS.some((field) => seasonForm[field] < 0 || seasonForm[field] > 999.99)) {
      await alertDialog('배수는 0부터 999.99까지 입력할 수 있습니다.', 'error');
      return;
    }

    const payload = {
      ...seasonForm,
      name: seasonForm.name.trim(),
      resetType: editingSeason?.resetType ?? null,
      carryRate: editingSeason?.carryRate ?? null,
    };

    if (editingSeasonId) {
      update({
        url: `/bgm-agit/rating/seasons/${editingSeasonId}`,
        body: payload,
        ignoreErrorRedirect: true,
        onSuccess: async () => {
          await alertDialog('시즌이 저장되었습니다.', 'success');
          await fetchSeasons();
          setSeasonForm(EMPTY_SEASON_FORM);
          setIsAddingSeason(false);
          setEditingSeasonId(null);
        },
      });
    } else {
      insert({
        url: '/bgm-agit/rating/seasons',
        body: payload,
        ignoreErrorRedirect: true,
        onSuccess: async () => {
          await alertDialog('시즌이 추가되었습니다.', 'success');
          await fetchSeasons();
          setSeasonForm(EMPTY_SEASON_FORM);
          setIsAddingSeason(false);
          setEditingSeasonId(null);
        },
      });
    }
  };

  const openAddSeasonForm = () => {
    setEditingSeasonId(null);
    setSeasonForm(EMPTY_SEASON_FORM);
    setIsAddingSeason(true);
  };

  const openSeasonForm = (season: Season) => {
    setEditingSeasonId(season.id);
    setSeasonForm({
      name: season.name,
      startDate: season.startDate ?? '',
      endDate: season.endDate ?? '',
      baseRating: Number(season.baseRating ?? 1500),
      firstScore: Number(season.firstScore ?? 60),
      secondScore: Number(season.secondScore ?? 20),
      thirdScore: Number(season.thirdScore ?? -20),
      fourthScore: Number(season.fourthScore ?? -60),
      eastMultiple: Number(season.eastMultiple ?? 1),
      southMultiple: Number(season.southMultiple ?? 1),
      westMultiple: Number(season.westMultiple ?? 1),
      northMultiple: Number(season.northMultiple ?? 1),
    });
    setIsAddingSeason(true);
  };

  const deleteSeason = async () => {
    if (!editingSeason) return;

    const result = await confirmDialog(`${editingSeason.name} 시즌을 삭제할까요?`, 'warning');
    if (!result.isConfirmed) return;

    remove({
      url: `/bgm-agit/rating/seasons/${editingSeason.id}`,
      ignoreErrorRedirect: true,
      onSuccess: async () => {
        await alertDialog('시즌이 삭제되었습니다.', 'success');
        await fetchSeasons();
        setSeasonForm(EMPTY_SEASON_FORM);
        setIsAddingSeason(false);
        setEditingSeasonId(null);
      },
    });
  };

  const startSeason = async () => {
    if (!editingSeason) return;

    const result = await confirmDialog(`${editingSeason.name} 시즌을 시작할까요?`, 'warning');
    if (!result.isConfirmed) return;

    await startSeasonById(editingSeason.id);
    await alertDialog('시즌이 시작되었습니다.', 'success');
    await fetchSeasons();
  };

  const closeSeason = async () => {
    if (!editingSeason) return;

    const result = await confirmDialog(`${editingSeason.name} 시즌을 마감할까요?`, 'warning');
    if (!result.isConfirmed) return;

    await closeSeasonById(editingSeason.id);
    await alertDialog('시즌이 마감되었습니다.', 'success');
    await fetchSeasons();
  };

  if (user && !isAdmin) return null;

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
                        <span>각 랭크별 이미지, 레이팅, 이름, 색상을 설정해주세요.</span>
                      </div>
                      <AddRankButton type="button" onClick={addRank}>
                        <Plus weight="bold" />
                        등급 추가
                      </AddRankButton>
                    </PanelHeader>

                    {loading ? (
                      <RankSkeletonGrid>
                        {Array.from({ length: 4 }).map((_, index) => (
                          <RankSkeletonCard key={index}>
                            <SkeletonBox $width="118px" $height="118px" />
                            <SkeletonFields>
                              <SkeletonBox />
                              <SkeletonBox />
                              <SkeletonBox $width="100%" />
                            </SkeletonFields>
                          </RankSkeletonCard>
                        ))}
                      </RankSkeletonGrid>
                    ) : (
                      <RankGrid>
                        {rankSettings.map((rank) => (
                          <RankCard key={rank.id} $color={rank.color}>
                            <RankImage>
                              {rank.imageBase64 ? (
                                <img src={rank.imageBase64} alt="" />
                              ) : (
                                <ImagePlaceholder>
                                  <ImageSquare weight="duotone" />
                                  <span>이미지 선택</span>
                                </ImagePlaceholder>
                              )}
                              <input
                                type="file"
                                accept="image/gif,image/*"
                                onChange={(e) =>
                                  uploadRankImage(rank.id, e.target.files?.[0] ?? null)
                                }
                              />
                            </RankImage>

                            <RankFields>
                              <Field>
                                <label>하한 레이팅</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={rank.minRating}
                                  onChange={(e) =>
                                    updateRank(rank.id, 'minRating', e.target.value)
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
                                  <RankDeleteButton
                                    type="button"
                                    onClick={() => removeRank(rank.id)}
                                    aria-label={`${rank.rankName || '등급'} 삭제`}
                                  >
                                    <Trash weight="bold" />
                                  </RankDeleteButton>
                                </ColorPicker>
                              </Field>
                            </RankFields>
                          </RankCard>
                        ))}
                      </RankGrid>
                    )}

                    <RankActions>
                      <PrimaryButton type="button" onClick={saveRanks}>
                        <Check weight="bold" />
                        랭크 저장
                      </PrimaryButton>
                    </RankActions>
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
                    {loading
                      ? Array.from({ length: 3 }).map((_, index) => (
                          <SeasonSkeletonItem key={index}>
                            <div>
                              <SkeletonBox $width="140px" />
                              <SkeletonBox $width="220px" $height="12px" />
                            </div>
                            <SeasonMeta>
                              <SkeletonBox $width="72px" $height="30px" />
                              <SkeletonBox $width="58px" $height="30px" />
                            </SeasonMeta>
                          </SeasonSkeletonItem>
                        ))
                      : seasons.map((season) => (
                          <SeasonItem
                            key={season.id}
                            type="button"
                            $active={editingSeasonId === season.id}
                            onClick={() => openSeasonForm(season)}
                          >
                            <div>
                              <strong>{season.name}</strong>
                              <span>
                                {season.startDate} - {season.endDate}
                              </span>
                            </div>
                            <SeasonMeta>
                              <span>기준 {season.baseRating}</span>
                              <StatusChip $status={season.progressStatus}>
                                {PROGRESS_STATUS_LABEL[season.progressStatus] ??
                                  season.progressStatus}
                              </StatusChip>
                            </SeasonMeta>
                          </SeasonItem>
                        ))}
                    {!loading && seasons.length === 0 && (
                      <EmptyText>등록된 시즌이 없습니다.</EmptyText>
                    )}
                  </SeasonList>

                  <AddSeasonRow>
                    <AddSeasonButton type="button" onClick={openAddSeasonForm}>
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
                            value={seasonForm.name}
                            onChange={(e) => updateSeasonForm('name', e.target.value)}
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
                            value={seasonForm.baseRating}
                            onChange={(e) => updateSeasonForm('baseRating', Number(e.target.value))}
                          />
                        </Field>
                        <Field>
                          <label>1등 점수</label>
                          <input
                            type="number"
                            min="-9999.99"
                            max="9999.99"
                            step="0.01"
                            value={seasonForm.firstScore}
                            onChange={(e) => updateSeasonForm('firstScore', Number(e.target.value))}
                          />
                        </Field>
                        <Field>
                          <label>2등 점수</label>
                          <input
                            type="number"
                            min="-9999.99"
                            max="9999.99"
                            step="0.01"
                            value={seasonForm.secondScore}
                            onChange={(e) =>
                              updateSeasonForm('secondScore', Number(e.target.value))
                            }
                          />
                        </Field>
                        <Field>
                          <label>3등 점수</label>
                          <input
                            type="number"
                            min="-9999.99"
                            max="9999.99"
                            step="0.01"
                            value={seasonForm.thirdScore}
                            onChange={(e) => updateSeasonForm('thirdScore', Number(e.target.value))}
                          />
                        </Field>
                        <Field>
                          <label>4등 점수</label>
                          <input
                            type="number"
                            min="-9999.99"
                            max="9999.99"
                            step="0.01"
                            value={seasonForm.fourthScore}
                            onChange={(e) =>
                              updateSeasonForm('fourthScore', Number(e.target.value))
                            }
                          />
                        </Field>
                        <Field>
                          <label>동 배수</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="999.99"
                            value={seasonForm.eastMultiple}
                            onChange={(e) =>
                              updateSeasonForm('eastMultiple', Number(e.target.value))
                            }
                          />
                        </Field>
                        <Field>
                          <label>남 배수</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="999.99"
                            value={seasonForm.southMultiple}
                            onChange={(e) =>
                              updateSeasonForm('southMultiple', Number(e.target.value))
                            }
                          />
                        </Field>
                        <Field>
                          <label>서 배수</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="999.99"
                            value={seasonForm.westMultiple}
                            onChange={(e) =>
                              updateSeasonForm('westMultiple', Number(e.target.value))
                            }
                          />
                        </Field>
                        <Field>
                          <label>북 배수</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="999.99"
                            value={seasonForm.northMultiple}
                            onChange={(e) =>
                              updateSeasonForm('northMultiple', Number(e.target.value))
                            }
                          />
                        </Field>
                      </FormGrid>
                      {editingSeason && (
                        <StatusControl>
                          <div>
                            <span>진행 상태</span>
                            <strong>
                              {PROGRESS_STATUS_LABEL[editingSeason.progressStatus] ??
                                editingSeason.progressStatus}
                            </strong>
                          </div>
                          {editingSeason.progressStatus === 'SCHEDULED' && (
                            <PrimaryButton type="button" onClick={startSeason}>
                              <Play weight="bold" />
                              시작
                            </PrimaryButton>
                          )}
                          {editingSeason.progressStatus === 'ONGOING' && (
                            <DangerButton type="button" onClick={closeSeason}>
                              마감
                            </DangerButton>
                          )}
                        </StatusControl>
                      )}
                      <FormActions>
                        {editingSeasonId && (
                          <DangerButton type="button" onClick={deleteSeason}>
                            <Trash weight="bold" />
                            삭제
                          </DangerButton>
                        )}
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

  @media ${({ theme }) => theme.device.mobile} {
    align-items: stretch;
    flex-direction: column;
    gap: 10px;
  }
`;

const AddRankButton = styled.button`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: 6px;
  height: 38px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 4px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.08)),
    rgba(255, 255, 255, 0.06);
  color: ${({ theme }) => theme.colors.whiteColor};
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  font-weight: 800;
  cursor: pointer;
  transition:
    background 0.16s ease,
    border-color 0.16s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.28);
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1)),
      rgba(255, 255, 255, 0.08);
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: 100%;
    justify-content: center;
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

const RankSkeletonGrid = styled(RankGrid)``;

const RankActions = styled.div`
  display: flex;
  justify-content: flex-end;

  @media ${({ theme }) => theme.device.mobile} {
    button {
      width: 100%;
      justify-content: center;
    }
  }
`;

const RankCard = styled.article<{ $color: string }>`
  position: relative;
  display: grid;
  grid-template-columns: 118px minmax(0, 1fr);
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
    justify-items: center;
  }
`;

const RankSkeletonCard = styled.article`
  display: grid;
  grid-template-columns: 118px minmax(0, 1fr);
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background:
    radial-gradient(circle at 14% 0%, rgba(255, 255, 255, 0.1), transparent 32%),
    linear-gradient(145deg, #2b2f36, #1d1f24 58%, #17191d);

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;
    justify-items: center;
  }
`;

const SkeletonFields = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);

  > div:last-child {
    grid-column: 1 / -1;
  }

  @media ${({ theme }) => theme.device.mobile} {
    grid-template-columns: 1fr;
  }
`;

const RankDeleteButton = styled.button`
  display: inline-flex;
  width: 30px;
  height: 30px;
  margin-left: auto;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 4px;
  background: rgba(217, 98, 94, 0.16);
  color: #ffaaa7;
  cursor: pointer;
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;

  &:hover {
    border-color: rgba(255, 170, 167, 0.44);
    background: rgba(217, 98, 94, 0.28);
    color: #ffd1cf;
  }

  svg {
    width: 15px;
    height: 15px;
  }
`;

const RankImage = styled.label`
  position: relative;
  width: 100%;
  max-width: 118px;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background:
    radial-gradient(circle at 28% 18%, rgba(255, 255, 255, 0.14), transparent 34%),
    linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.04));
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.04),
    0 8px 22px rgba(0, 0, 0, 0.12);
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.24);
    opacity: 0;
    transition: opacity 0.16s ease;
    pointer-events: none;
  }

  &:hover::after {
    opacity: 1;
  }

  &:hover img {
    filter: brightness(0.78);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: filter 0.16s ease;
  }

  input {
    display: none;
  }

  @media ${({ theme }) => theme.device.mobile} {
    max-width: 132px;
  }
`;

const ImagePlaceholder = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  color: rgba(255, 255, 255, 0.72);
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  font-weight: 800;

  svg {
    width: 32px;
    height: 32px;
  }
`;

const RankFields = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
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

const SeasonItem = styled.button<{ $active: boolean }>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(8px);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background 0.16s ease;

  ${({ $active }) =>
    $active &&
    `
      border-color: rgba(255, 255, 255, 0.24);
      background: rgba(255, 255, 255, 0.12);
    `}

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.11);
  }

  strong {
    display: block;
    font-size: ${({ theme }) => theme.desktop.sizes.xl};
    color: ${({ theme }) => theme.colors.whiteColor};
  }

  span {
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    color: rgba(255, 255, 255, 0.68);
  }

  @media ${({ theme }) => theme.device.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;

    > div:first-child {
      align-self: flex-start;
    }
  }
`;

const SeasonSkeletonItem = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);

  > div:first-child {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  @media ${({ theme }) => theme.device.mobile} {
    align-items: stretch;
    flex-direction: column;
    gap: 10px;

    > div:first-child {
      align-self: flex-start;
    }
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

  @media ${({ theme }) => theme.device.mobile} {
    align-self: flex-end;
  }
`;

const shimmer = keyframes`
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
`;

const SkeletonBox = styled.div<{ $width?: string; $height?: string }>`
  width: ${({ $width }) => $width ?? '100%'};
  max-width: 100%;
  height: ${({ $height }) => $height ?? '16px'};
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.08) 25%,
    rgba(255, 255, 255, 0.16) 50%,
    rgba(255, 255, 255, 0.08) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const StatusChip = styled.span<{ $status: string }>`
  background: ${({ $status }) => {
    if ($status === 'ONGOING') return 'rgba(109, 174, 129, 0.24)';
    if ($status === 'CLOSED') return 'rgba(117, 117, 117, 0.28)';
    return 'rgba(227, 139, 41, 0.24)';
  }} !important;
  color: ${({ $status }) => {
    if ($status === 'ONGOING') return '#9EE3B1';
    if ($status === 'CLOSED') return 'rgba(255, 255, 255, 0.62)';
    return '#FFD08A';
  }} !important;
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

const StatusControl = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);

  span {
    display: block;
    margin-bottom: 4px;
    font-size: ${({ theme }) => theme.desktop.sizes.sm};
    font-weight: 700;
    color: rgba(255, 255, 255, 0.62);
  }

  strong {
    font-size: ${({ theme }) => theme.desktop.sizes.md};
    color: ${({ theme }) => theme.colors.whiteColor};
  }

  @media ${({ theme }) => theme.device.mobile} {
    align-items: stretch;
    flex-direction: column;
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

const DangerButton = styled(PrimaryButton)`
  background: #d9625e;
`;
