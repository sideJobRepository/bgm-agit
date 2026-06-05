'use client';

import { motion } from 'framer-motion';
import styled from 'styled-components';
import { withBasePath } from '@/lib/path';

import React, { useEffect, useState } from 'react';

import {
  useFetchDetailWrite,
  useFetchRecordUser,
  useFetchYakuman,
} from '@/services/record.service';
import { useRecordUserStore, useUserStore } from '@/store/user';
import { Check, Plus, TrashSimple } from 'phosphor-react';
import { useDetailRecordStore, useYakumanStore } from '@/store/record';
import { useInsertPost, useUpdatePost } from '@/services/main.service';
import { alertDialog, confirmDialog } from '@/utils/alert';
import Swal from 'sweetalert2';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFetchSettingRefund } from '@/services/setting.service';
import { useSettingRefundStore } from '@/store/setting';
import {
  uploadYakumanFile,
  fetchFileViewUrls,
} from '@/services/yakumanFile.service';
import api from '@/lib/axiosInstance';

const DIRECTIONS = [
  { key: 'EAST', label: '동', color: '#415B9C' },
  { key: 'SOUTH', label: '남', color: '#8E6FB5' },
  { key: 'WEST', label: '서', color: '#E38B29' },
  { key: 'NORTH', label: '북', color: '#6DAE81' },
] as const;

const LEADER_POSITIONS = [
  { label: '동장', value: 'EAST' },
  { label: '남장', value: 'SOUTH' },
  { label: '서장', value: 'WEST' },
  { label: '북장', value: 'NORTH' },
];

const TOURNAMENT_OPTIONS = [
  { label: '예', value: 'Y' },
  { label: '아니오', value: 'N' },
];

type DirectionKey = (typeof DIRECTIONS)[number]['key'];

type YakumanRow = {
  search: string;
  userId: number | null;
  yakumanId: number | null;
  // 현재 행에 연결된 BgmAgitFile id (업로드 직후 또는 기존 데이터 로드 시 채워짐)
  fileId: number | null;
  // detail 로드 시 받은 원본 fileId (변경 감지용)
  originalFileId: number | null;
  uploadStatus: 'idle' | 'uploading' | 'failed';
};

export default function Write() {
  const { insert } = useInsertPost();
  const { update } = useUpdatePost();

  const user = useUserStore((state) => state.user);
  const router = useRouter();

  const [detailId, setDetailId] = useState<string | null>(null);
  const [tournamentStatus, setTournamentStatus] = useState<string | null>(null);
  const [title, setTitle] = useState({ title: '', content: '' });

  const fetchDetailWrite = useFetchDetailWrite();
  const detailData = useDetailRecordStore((state) => state.detailRecord);

  const [changeReason, setChangeReason] = useState('');

  const inputRef = React.useRef<HTMLInputElement>(null);

  //이미지
  const [heroImages, setHeroImages] = useState<string[]>([]);

  const handleImageChange = async (idx: number, file: File) => {
    const url = URL.createObjectURL(file);
    setHeroImages((prev) => {
      const next = [...prev];
      next[idx] = url;
      return next;
    });

    // 즉시 S3 업로드 시작
    setYakumanRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, uploadStatus: 'uploading' } : r))
    );

    try {
      const res = await uploadYakumanFile(file);
      setYakumanRows((prev) =>
        prev.map((r, i) =>
          i === idx ? { ...r, fileId: res.fileId, uploadStatus: 'idle' } : r
        )
      );
    } catch (e) {
      console.error('[yakuman-file] upload 실패', e);
      setYakumanRows((prev) =>
        prev.map((r, i) => (i === idx ? { ...r, uploadStatus: 'failed' } : r))
      );
      await alertDialog('이미지 업로드에 실패했습니다. 다시 시도해주세요.', 'error');
    }
  };

  const fetchRecordUser = useFetchRecordUser();
  const fetchYakuman = useFetchYakuman();
  const recordUser = useRecordUserStore((state) => state.recordUser);
  const yakumanData = useYakumanStore((state) => state.yakuman);

  //점수
  const fetchSettingRefund = useFetchSettingRefund();
  const refundData = useSettingRefundStore((state) => state.refund);

  /** 대회 진행 중일 때 active 대회의 반환점 (없으면 일반 반환점으로 fallback) */
  const [tournamentTurning, setTournamentTurning] = useState<number | null>(null);

  /** 장 선택 */
  const [leader, setLeader] = useState('SOUTH');

  /** 토너먼트 여부 선택 */
  const [tournament, setTournament] = useState('');

  /** 각 방향 기록 */
  const [records, setRecords] = useState<
    Record<
      DirectionKey,
      {
        recordId?: number | null;
        userId: number | null;
        score: string;
        search: string;
      }
    >
  >({
    EAST: { recordId: null, userId: null, score: '', search: '' },
    SOUTH: { recordId: null, userId: null, score: '', search: '' },
    WEST: { recordId: null, userId: null, score: '', search: '' },
    NORTH: { recordId: null, userId: null, score: '', search: '' },
  });

  const [yakumanRows, setYakumanRows] = useState<YakumanRow[]>([]);
  const [memo, setMemo] = useState('');

  /** 각 자리 점수의 사용자 수정 시각. 0 = 사용자가 직접 안 만짐(자동계산 후보) */
  const [scoreEditTime, setScoreEditTime] = useState<Record<DirectionKey, number>>({
    EAST: 0,
    SOUTH: 0,
    WEST: 0,
    NORTH: 0,
  });

  /** 점수 비면 0으로(자동계산 후보), 값 있으면 현재 시각으로 마킹 */
  const markScoreEdited = (key: DirectionKey, newScore: string) => {
    setScoreEditTime((prev) => ({
      ...prev,
      [key]: newScore === '' ? 0 : Date.now(),
    }));
  };

  const rankedRecords = Object.entries(records)
    .map(([seat, data]) => ({
      seat,
      ...data,
      score: Number(data.score), // 숫자로 변환
    }))
    .sort((a, b) => b.score - a.score)
    .map((r, idx) => ({
      recordId: r.recordId,
      memberId: r.userId,
      recordScore: r.score, // 이미 숫자
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
    fetchSettingRefund();
  }, []);

  /** 닉네임 검색 필터 */
  const filteredUsers = (search: string) => {
    if (!search) return recordUser;
    return recordUser.filter((u) => u.nickName.toLowerCase().includes(search.toLowerCase()));
  };

  /** 본인 닉네임 자동 입력 - 동/남/서/북 */
  const handleSelfFillRecord = async (key: DirectionKey) => {
    if (!user) {
      await alertDialog('로그인이 필요합니다.', 'error');
      return;
    }
    const meId = Number(user.id);
    if (!recordUser.some((u) => u.id === meId)) {
      await alertDialog('회원 목록에서 본인 정보를 찾을 수 없습니다.', 'error');
      return;
    }
    setRecords((prev) => ({
      ...prev,
      [key]: { ...prev[key], userId: meId, search: '' },
    }));
  };

  /** 본인 닉네임 자동 입력 - 역만 행 */
  const handleSelfFillYakuman = async (idx: number) => {
    if (!user) {
      await alertDialog('로그인이 필요합니다.', 'error');
      return;
    }
    const meId = Number(user.id);
    if (!recordUser.some((u) => u.id === meId)) {
      await alertDialog('회원 목록에서 본인 정보를 찾을 수 없습니다.', 'error');
      return;
    }
    setYakumanRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, userId: meId, search: '' } : r))
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      await alertDialog('유저 정보가 없습니다. \n 로그인 후 이용해주세요.', 'error');
      router.push('/login');
      return;
    }

    const message = detailId ? '수정 하시겠습니까?' : '등록 하시겠습니까?';
    const method = detailId ? update : insert;

    const result = await confirmDialog(message, 'warning');
    if (!result.isConfirmed) return;

    if (!validateForm()) return;

    // 업로드 진행 중인 행이 있으면 막기
    if (yakumanRows.some((r) => r.uploadStatus === 'uploading')) {
      await alertDialog('이미지 업로드가 끝나길 기다려주세요.', 'warning');
      return;
    }
    if (yakumanRows.some((r) => r.uploadStatus === 'failed')) {
      await alertDialog('업로드 실패한 이미지가 있습니다. 다시 선택해주세요.', 'error');
      return;
    }

    const yakumansBody = yakumanRows
      .filter((row) => row.userId && row.yakumanId)
      .map((row) => {
        const yakuman = yakumanData.find((y) => y.id === row.yakumanId);
        const files: { id: number; fileProcessStatus: 'CREATE' | 'DELETE' | 'NORMAL' }[] = [];
        // 기존 파일이 있었는데 새 파일로 교체된 경우 → 기존 DELETE
        if (row.originalFileId && row.fileId !== row.originalFileId) {
          files.push({ id: row.originalFileId, fileProcessStatus: 'DELETE' });
        }
        // 새로 추가된 파일 → CREATE
        if (row.fileId && row.fileId !== row.originalFileId) {
          files.push({ id: row.fileId, fileProcessStatus: 'CREATE' });
        }
        // 변경 없음 → NORMAL (서버 측 no-op)
        if (row.fileId && row.fileId === row.originalFileId) {
          files.push({ id: row.fileId, fileProcessStatus: 'NORMAL' });
        }
        // 기존 파일이 있었는데 사용자가 지운 경우 → DELETE
        if (!row.fileId && row.originalFileId) {
          files.push({ id: row.originalFileId, fileProcessStatus: 'DELETE' });
        }

        return {
          ...(detailId && row.originalFileId ? {} : {}),
          memberId: row.userId,
          yakumanName: yakuman?.yakumanName,
          yakumanCont: memo || `${yakuman?.yakumanName} 역만`,
          files: { fileType: 'YAKUMAN', files },
        };
      });

    const passwordResult = await Swal.fire({
      title: '점수 입력 비밀번호',
      input: 'password',
      inputLabel: '관리자가 설정한 비밀번호를 입력해주세요.',
      inputAttributes: {
        autocomplete: 'current-password',
      },
      showCancelButton: true,
      confirmButtonText: detailId ? '수정' : '등록',
      cancelButtonText: '취소',
      reverseButtons: true,
      confirmButtonColor: '#4A90E2',
      cancelButtonColor: '#757575',
    });

    if (!passwordResult.isConfirmed) return;
    const password = passwordResult.value ?? '';

    const body: Record<string, unknown> = {
      wind: leader,
      tournamentStatus,
      password,
      records: rankedRecords
        .filter((r) => r.memberId)
        .map((r) => {
          const record = records[r.recordSeat as DirectionKey];
          return {
            ...(detailId && record.recordId ? { recordId: record.recordId } : {}),
            memberId: r.memberId,
            recordScore: r.recordScore,
            recordRank: r.recordRank,
            recordSeat: r.recordSeat,
          };
        }),
      yakumans: yakumansBody,
    };

    if (detailId) {
      body.matchsId = Number(detailId);
      body.changeReason = changeReason;
    }

    method({
      url: '/bgm-agit/record',
      body,
      ignoreErrorRedirect: true,
      onSuccess: async () => {
        await alertDialog('기록이 저장되었습니다.', 'success');
        router.push('/day-record');
      },
    });
  };

  const validateForm = () => {
    if (
      detailId &&
      !user?.roles.includes('ROLE_ADMIN') &&
      !user?.roles.includes('ROLE_MENTOR')
    ) {
      alertDialog('수정은 관리자 또는 멘토만 가능합니다.', 'error');
      router.push('/');
      return false;
    }
    // 국길이 선택
    if (!leader) {
      alertDialog('국 길이를 선택해주세요.', 'error');
      return false;
    }

    // records: 4명 전부 선택됐는지
    const selectedUsers = Object.values(records).filter((r) => r.userId);
    if (selectedUsers.length !== 4) {
      alertDialog('동·서·남·북 모든 플레이어를 선택해주세요.', 'error');
      return false;
    }

    // yakuman 검증
    if (yakumanRows.length > 0) {
      for (let i = 0; i < yakumanRows.length; i++) {
        const row = yakumanRows[i];

        if (!row.userId) {
          alertDialog(`역만 ${i + 1}번: 닉네임을 선택해주세요.`, 'error');
          return false;
        }

        if (!row.yakumanId) {
          alertDialog(`역만 ${i + 1}번: 역만을 선택해주세요.`, 'error');
          return false;
        }

        if (!memo.trim()) {
          alertDialog('역만이 있을 경우 비고(내용)는 필수입니다.', 'error');
          return false;
        }
      }
    }

    return true;
  };

  const setTournamentTitle = () => {
    setTitle({
      title: 'Tournament Entry',
      content: '대회 경기 결과를 입력하고 공식 기록으로 관리하세요.',
    });
  };

  const setRecordTitle = () => {
    setTitle({
      title: 'Record Entry',
      content: '플레이 결과를 입력하고 나만의 기록을 쌓아보세요.',
    });
  };

  //detail 로직 + 진입 시 오늘 대회 자동 감지
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    setDetailId(id);

    // 수정 모드: detailData가 도착하면 그쪽에서 tournamentStatus를 세팅하니 여기선 패스
    if (id) return;

    // 신규 입력: active 대회의 [start, end] 시간 범위 안이면 자동으로 대회 모드 전환
    api
      .get('/bgm-agit/tournaments/active')
      .then((res) => {
        const active = res.data;
        const inSchedule =
          !!active &&
          active.startDate &&
          active.endDate &&
          active.startTime &&
          active.endTime &&
          (() => {
            const start = new Date(`${active.startDate}T${active.startTime}`);
            const end = new Date(`${active.endDate}T${active.endTime}`);
            const now = new Date();
            return now >= start && now <= end;
          })();

        if (inSchedule) {
          setTournamentStatus('Y');
          const turning = active.tournamentSettingTurning;
          setTournamentTurning(typeof turning === 'number' ? turning : null);
          setTournamentTitle();
        } else {
          setTournamentStatus('N');
          setTournamentTurning(null);
          setRecordTitle();
        }
      })
      .catch(() => {
        setTournamentStatus('N');
        setTournamentTurning(null);
        setRecordTitle();
      });
  }, []);

  useEffect(() => {
    //권한 없을경우 메인으로
    if (detailId) {
      fetchDetailWrite(detailId);
    }
  }, [detailId]);

  useEffect(() => {
    if (!detailId || !detailData) return;

    // 국 길이
    setLeader(detailData.wind);
    setTournamentStatus(detailData.tournamentStatus);

    // 대회 기록이면 detail 응답의 tournamentTurning을 사용 (종료된 대회도 정확하게 자동계산됨)
    if (detailData.tournamentStatus === 'Y') {
      setTournamentTurning(
        typeof detailData.tournamentTurning === 'number' ? detailData.tournamentTurning : null
      );
      setTournamentTitle();
    } else {
      setTournamentTurning(null);
      setRecordTitle();
    }

    // records
    const nextRecords = {
      EAST: { recordId: null, userId: null, score: '', search: '' },
      SOUTH: { recordId: null, userId: null, score: '', search: '' },
      WEST: { recordId: null, userId: null, score: '', search: '' },
      NORTH: { recordId: null, userId: null, score: '', search: '' },
    };

    detailData.records.forEach((r) => {
      nextRecords[r.recordSeat] = {
        recordId: r.recordId,
        userId: r.memberId,
        score: String(r.recordScore),
        search: '',
      };
    });

    setRecords(nextRecords);

    // detail 로드된 점수는 이미 확정값이므로 자동계산이 덮어쓰지 않도록 4자리 모두 edited 마킹.
    // 사용자가 점수를 비우거나 직접 수정하면 markScoreEdited가 다시 0으로 리셋해 후보 복귀.
    const now = Date.now();
    setScoreEditTime({
      EAST: now,
      SOUTH: now,
      WEST: now,
      NORTH: now,
    });

    // yakuman
    if (detailData.yakumans) {
      const rows: YakumanRow[] = detailData.yakumans.map((y) => ({
        search: '',
        userId: y.memberId,
        yakumanId: yakumanData.find((yk) => yk.yakumanName === y.yakumanName)?.id ?? null,
        fileId: y.fileId ?? null,
        originalFileId: y.fileId ?? null,
        uploadStatus: 'idle',
      }));

      setYakumanRows(rows);

      setMemo(detailData.yakumans[0]?.yakumanCont ?? '');

      // 기존 미리보기: 새 흐름(fileId)이면 /file-view 로 presigned URL, 옛 흐름은 imageUrl 그대로
      const newFileIds = detailData.yakumans
        .map((y) => y.fileId)
        .filter((id): id is number => !!id);
      const legacyUrls = detailData.yakumans.map((y) => y.imageUrl ?? '');

      if (newFileIds.length > 0) {
        fetchFileViewUrls(newFileIds)
          .then((views) => {
            const urlByFileId = new Map(views.map((v) => [v.fileId, v.url]));
            setHeroImages(
              detailData.yakumans.map((y, i) => {
                if (y.fileId && urlByFileId.has(y.fileId)) {
                  return urlByFileId.get(y.fileId) ?? '';
                }
                return legacyUrls[i];
              })
            );
          })
          .catch(() => setHeroImages(legacyUrls));
      } else {
        setHeroImages(legacyUrls);
      }
    }
  }, [detailData, yakumanData]);

  //3자리 입력시 나머지 자리 자동계산 (사용자가 직접 안 만진 자리가 대상)
  useEffect(() => {
    const keys: DirectionKey[] = ['EAST', 'SOUTH', 'WEST', 'NORTH'];

    // 자동계산 대상 = scoreEditTime이 0인 자리 (NORTH 우선, 그다음 E→S→W)
    let autoTarget: DirectionKey | null = null;
    if (scoreEditTime.NORTH === 0) {
      autoTarget = 'NORTH';
    } else {
      for (const k of ['EAST', 'SOUTH', 'WEST'] as DirectionKey[]) {
        if (scoreEditTime[k] === 0) {
          autoTarget = k;
          break;
        }
      }
    }
    if (!autoTarget) return; // 4자리 모두 사용자 지정 → 자동계산 안 함

    // 나머지 3자리가 모두 유효한 숫자인지
    const others = keys.filter((k) => k !== autoTarget);
    for (const k of others) {
      const v = records[k].score;
      if (v === '' || v === '-') return;
      if (Number.isNaN(Number(v))) return;
    }

    const total = others.reduce((sum, k) => sum + Number(records[k].score), 0);
    // refundData는 이미 `turning * 4` (합계 기준) 값이고, tournamentTurning은 단일 turning 값이라 ×4 해야 함
    const refund =
      tournamentStatus === 'Y' && tournamentTurning != null
        ? tournamentTurning * 4
        : Number(refundData) || 0;
    const computed = String(refund - total);

    if (records[autoTarget].score !== computed) {
      const target = autoTarget;
      setRecords((prev) => ({
        ...prev,
        [target]: { ...prev[target], score: computed },
      }));
    }
  }, [
    records.EAST.score,
    records.SOUTH.score,
    records.WEST.score,
    records.NORTH.score,
    refundData,
    tournamentStatus,
    tournamentTurning,
    scoreEditTime,
  ]);

  //닉네임 검색시 닉네임선택
  useEffect(() => {
    let updated = false;

    const newRecords = { ...records };

    (['EAST', 'SOUTH', 'WEST', 'NORTH'] as const).forEach((key) => {
      const row = records[key];
      const users = filteredUsers(row.search);

      if (row.search && users.length > 0) {
        newRecords[key] = {
          ...row,
          userId: users[0].id,
        };
        updated = true;
      }
    });

    if (updated) {
      setRecords(newRecords);
    }
  }, [records.EAST.search, records.SOUTH.search, records.WEST.search, records.NORTH.search]);

  //역만 닉네임 검색시 닉네임선택
  const yakumanSearchKey = yakumanRows.map((r) => r.search).join('|');
  useEffect(() => {
    let updated = false;
    const newRows = yakumanRows.map((row) => {
      const users = filteredUsers(row.search);
      if (row.search && users.length > 0) {
        updated = true;
        return { ...row, userId: users[0].id };
      }
      return row;
    });
    if (updated) {
      setYakumanRows(newRows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yakumanSearchKey]);

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
          <>
            <h1>{title.title}</h1>
            <span>{title.content}</span>
          </>
        </HeroContent>
      </Hero>
      <TableBox>
        {/* 장 선택 */}
        <Top>
          <TopGroup>
            <FieldsWrapper>
              <Field className="top">
                <label>국 길이</label>
                <select value={leader} onChange={(e) => setLeader(e.target.value)}>
                  <option value="">선택</option>
                  {LEADER_POSITIONS.map((pos) => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              </Field>
            </FieldsWrapper>
          </TopGroup>
        </Top>
        {detailId && (
          <WriteCroup>
            <FieldsWrapper>
              <Field className="memo">
                <label>수정사유</label>
                <textarea
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="수정사유를 입력해주세요."
                  rows={5}
                />
              </Field>
            </FieldsWrapper>
          </WriteCroup>
        )}

        {/* 동서남북 입력 */}
        {DIRECTIONS.map(({ key, label, color }) => {
          const row = records[key];
          const users = filteredUsers(row.search);

          return (
            <Center key={key} $color={color}>
              <h4>{label}</h4>
              <ActionsRow>
                <MeButton
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                  onClick={() => handleSelfFillRecord(key)}
                >
                  내 닉네임
                </MeButton>
              </ActionsRow>
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
                    <ScoreLabelRow>
                      <label>점수</label>
                      <SignButton
                        type="button"
                        aria-label="부호 변경"
                        tabIndex={-1}
                        onMouseDown={(e) => e.preventDefault()}
                        onTouchStart={(e) => e.preventDefault()}
                        onClick={() => {
                          const v = records[key].score;
                          if (v === '0') return;
                          const next = v === ''
                            ? '-'
                            : v.startsWith('-')
                            ? v.slice(1)
                            : '-' + v;
                          setRecords((prev) => ({
                            ...prev,
                            [key]: { ...prev[key], score: next },
                          }));
                          markScoreEdited(key, next);
                        }}
                      >
                        ±
                      </SignButton>
                    </ScoreLabelRow>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={row.score}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (!/^-?\d*$/.test(v)) return;
                        setRecords((prev) => ({
                          ...prev,
                          [key]: {
                            ...prev[key],
                            score: v,
                          },
                        }));
                        markScoreEdited(key, v);
                      }}
                    />
                  </Field>
                </FieldsWrapper>
              </WriteCroup>
            </Center>
          );
        })}

        <BottomActions>
          <PlusButton
            onClick={() =>
              setYakumanRows((prev) => [
                ...prev,
                {
                  search: '',
                  userId: null,
                  yakumanId: null,
                  fileId: null,
                  originalFileId: null,
                  uploadStatus: 'idle',
                },
              ])
            }
          >
            <Plus weight="bold" />
            역만 추가
          </PlusButton>
          <SaveButton onClick={handleSubmit}>
            <Check weight="bold" />
            저장
          </SaveButton>
        </BottomActions>
        {yakumanRows.map((row, idx) => {
          const users = !row.search
            ? recordUser
            : recordUser.filter((u) => u.nickName.toLowerCase().includes(row.search.toLowerCase()));

          const inputId = `yakuman-file-${idx}`;

          return (
            <Center key={`yakuman-${idx}`} $color="#f3f3f3">
              <ActionsRow>
                <MeButton
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                  onClick={() => handleSelfFillYakuman(idx)}
                >
                  내 닉네임
                </MeButton>
                <Button
                  onClick={() => {
                    setYakumanRows((prev) => prev.filter((_, i) => i !== idx));
                    setHeroImages((prev) => prev.filter((_, i) => i !== idx));
                  }}
                >
                  <TrashSimple weight="bold" />
                </Button>
              </ActionsRow>
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
                {heroImages[idx] && <Img src={heroImages[idx]} alt="상단 이미지" />}

                <UploadLabel htmlFor={inputId}>
                  <h5>이미지 첨부</h5>
                  <span>드래그하거나 클릭하세요.</span>
                </UploadLabel>

                <HiddenInput
                  id={inputId}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    if (file) handleImageChange(idx, file);
                  }}
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
  margin: 0 auto;
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
  max-width: 800px;
  margin: 0 auto;

  @media ${({ theme }) => theme.device.mobile} {
    gap: 10px;
    padding: 12px 4px;
  }

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

    @media ${({ theme }) => theme.device.mobile} {
      font-size: 16px;
      padding: 8px 6px;
    }
  }
`;

const BottomActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
`;

const SaveButton = styled.button`
  display: flex;
  width: 100px;
  gap: 6px;
  justify-content: center;
  align-items: center;
  padding: 8px;
  background-color: ${({ theme }) => theme.colors.writeBgColor};
  color: ${({ theme }) => theme.colors.whiteColor};
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    opacity: 0.85;
  }

  svg {
    width: 14px;
    height: 14px;
  }

  @media ${({ theme }) => theme.device.mobile} {
    width: auto;
    padding: 8px 14px;
    font-size: ${({ theme }) => theme.mobile.sizes.md};
  }
`;

const PlusButton = styled.button`
  display: flex;
  width: 100px;
  gap: 6px;
  justify-content: center;
  align-items: center;
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

  @media ${({ theme }) => theme.device.mobile} {
    width: auto;
    padding: 8px 14px;
    font-size: ${({ theme }) => theme.mobile.sizes.md};
  }
`;

const Top = styled.section`
  display: flex;
  width: 100%;
  position: relative;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;

  @media ${({ theme }) => theme.device.mobile} {
    padding: 12px 4px;
  }

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
  gap: 8px;
  align-items: center;
  padding: 4px 6px;
  border: none;
  border-radius: 4px;
  flex-wrap: nowrap;
  max-width: 240px;

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
  background-color: ${({ theme }) => theme.colors.recordBgColor};
  border-radius: 4px;

  button {
    background-color: #d9625e;
    margin: 24px 24px 24px auto;

    @media ${({ theme }) => theme.device.mobile} {
      margin: 12px 12px 12px auto;
    }
  }

  h4 {
    display: inline-flex;
    font-size: ${({ theme }) => theme.desktop.sizes.h4Size};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.blackColor};
    padding: 20px 8px;
    border-radius: 50%;

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.h4Size};
      padding: 6px 8px;
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

  @media ${({ theme }) => theme.device.mobile} {
    flex-wrap: wrap;
    overflow-x: visible;
    gap: 8px;
  }
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

  @media ${({ theme }) => theme.device.mobile} {
    &.search,
    &.user {
      flex: 1 1 calc(50% - 4px);
      min-width: 0;
    }

    &.score {
      flex: 1 1 100%;
    }
  }
`;

const ScoreLabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SignButton = styled.button`
  display: none;

  @media ${({ theme }) => theme.device.mobile} {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    min-width: 28px;
    padding: 0 8px;
    background-color: ${({ theme }) => theme.colors.writeBgColor};
    border: none;
    border-radius: 4px;
    font-weight: 600;
    font-size: 12px;
    line-height: 1;
    color: ${({ theme }) => theme.colors.whiteColor};
    cursor: pointer;

    &:hover {
      opacity: 0.85;
    }
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
    padding: 4px 8px;
    flex-wrap: wrap;
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

    @media ${({ theme }) => theme.device.mobile} {
      font-size: 16px;
      padding: 8px 6px;
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

const MeButton = styled.button`
  && {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: #4f7cac;
    color: ${({ theme }) => theme.colors.whiteColor};
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: ${({ theme }) => theme.desktop.sizes.xs};
    font-weight: 600;
    cursor: pointer;
    box-shadow: 1px 2px 4px rgba(0, 0, 0, 0.15);

    @media ${({ theme }) => theme.device.mobile} {
      font-size: ${({ theme }) => theme.mobile.sizes.xs};
      padding: 6px 10px;
    }
  }

  &&:hover {
    opacity: 0.85;
  }
`;

const ActionsRow = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 0;

  @media ${({ theme }) => theme.device.mobile} {
    padding: 4px 12px 0;
  }

  && > button {
    margin: 0;
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

  @media ${({ theme }) => theme.device.mobile} {
    height: 140px;
    margin: 8px 0 16px 0;
  }
`;

const UploadLabel = styled.label`
  position: absolute;
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

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
