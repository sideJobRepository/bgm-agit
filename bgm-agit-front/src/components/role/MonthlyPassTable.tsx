import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance.ts';
import { useRequest } from '../../recoil/useRequest.ts';
import { useUpdatePost } from '../../recoil/fetch.ts';
import { showConfirmModal } from '../confirmAlert.tsx';
import { toast } from '../../utils/toast';
import Pagination from '../Pagination.tsx';
import type { PageMonthlyPass } from '../../types/role.ts';
import {
  LinkBadge,
  TableWrapper,
  Table,
  Th,
  Td,
  PaginationWrapper,
  NoSearchBox,
  ButtonBox,
} from '../../pages/Role.styles.ts';

// 로그인 타입 코드 → 한글 라벨 (Role.tsx 와 같은 값)
const LOGIN_TYPE_LABEL: Record<string, string> = {
  KAKAO: '카카오',
  NAVER: '네이버',
  GOOGLE: '구글',
  MAHJONG: '자체로그인',
};

const EMPTY: PageMonthlyPass = {
  content: [],
  totalPages: 0,
  totalElements: 0,
  number: 0,
  size: 10,
  first: true,
  last: true,
  empty: true,
};

/**
 * 권한관리 "월간패스" 탭 (관리자 전용).
 *
 * 패스 회원이 직접 예약하면 결제 시 본인 1명분이 빠진다(이번 달 이용분만). 일행 중 다른 패스 회원은 현장 환불.
 * 패스는 1일~말일 요금제라 매월 1일 0시에 서버가 전원 해제한다 — 다음 달 회원은 여기서 다시 켠다.
 * 소셜·자체로그인 구분 없이 전체 회원이 대상이다.
 */
export default function MonthlyPassTable({ keyword }: { keyword: string }) {
  const { request } = useRequest();
  const { update } = useUpdatePost();
  const [page, setPage] = useState(0);
  const [onlyPass, setOnlyPass] = useState(false);
  const [items, setItems] = useState<PageMonthlyPass>(EMPTY);

  const fetchList = (nextPage = page) => {
    request(
      () =>
        api
          .get('/bgm-agit/role/monthly-pass', {
            params: { page: nextPage, res: keyword, onlyPass },
          })
          .then(res => res.data),
      setItems,
      { ignoreHttpError: true }
    ).catch(() => {});
  };

  // 검색어·필터가 바뀌면 첫 페이지부터
  useEffect(() => {
    setPage(0);
  }, [keyword, onlyPass]);

  useEffect(() => {
    fetchList(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, keyword, onlyPass]);

  function togglePass(memberId: number, currentlyPass: boolean, label: string) {
    const next = !currentlyPass;
    showConfirmModal({
      message: next
        ? `${label} 회원을 이번 달 월간패스 회원으로 등록하시겠습니까?`
        : `${label} 회원의 월간패스를 해제하시겠습니까?`,
      onConfirm: () => {
        update({
          url: '/bgm-agit/role/monthly-pass',
          body: { memberId, pass: next },
          ignoreHttpError: true,
          onSuccess: () => {
            toast.success(
              next ? '월간패스 회원으로 등록되었습니다.' : '월간패스가 해제되었습니다.'
            );
            fetchList(page);
          },
        });
      },
    });
  }

  return (
    <TableWrapper>
      <ButtonBox>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
          <input type="checkbox" checked={onlyPass} onChange={e => setOnlyPass(e.target.checked)} />
          패스 회원만 보기
        </label>
      </ButtonBox>
      <p style={{ margin: '0 0 12px', fontSize: 13, lineHeight: 1.6 }}>
        ※ 월간패스는 매월 1일 0시에 전원 자동 해제됩니다. 다음 달 회원은 다시 등록해 주세요.
        <br />※ 패스 회원이 직접 예약하면 결제 시 본인 1명분이 할인됩니다(이번 달 이용분만).
      </p>
      <Table>
        <thead>
          <tr>
            <Th>번호</Th>
            <Th>이름</Th>
            <Th>닉네임</Th>
            <Th>연락처</Th>
            <Th>로그인 타입</Th>
            <Th>월간패스</Th>
          </tr>
        </thead>
        <tbody>
          {items.content.map((item, index) => {
            const isPass = item.monthlyPassStatus === 'Y';
            const label = item.memberName || item.memberNickname;
            return (
              <tr key={item.memberId}>
                <Td>{page * items.size + index + 1}</Td>
                <Td>{item.memberName || '-'}</Td>
                <Td>{item.memberNickname || '-'}</Td>
                <Td>{item.memberPhoneNo || '-'}</Td>
                <Td>{LOGIN_TYPE_LABEL[item.memberLoginType] ?? item.memberLoginType}</Td>
                <Td>
                  <LinkBadge
                    as="button"
                    type="button"
                    $linked={isPass}
                    $clickable
                    title="클릭하여 등록/해제"
                    onClick={() => togglePass(item.memberId, isPass, label)}
                  >
                    {isPass ? '이용중' : '미등록'}
                  </LinkBadge>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      {items.content.length === 0 && <NoSearchBox>검색된 결과가 없습니다.</NoSearchBox>}
      <PaginationWrapper>
        <Pagination current={page} totalPages={items.totalPages} onChange={setPage} />
      </PaginationWrapper>
    </TableWrapper>
  );
}
