import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance.ts';
import { useRequest } from '../../recoil/useRequest.ts';
import { useDeletePost, useInsertPost } from '../../recoil/fetch.ts';
import { showConfirmModal, showMonthlyPassAddModal } from '../confirmAlert.tsx';
import { toast } from '../../utils/toast';
import Pagination from '../Pagination.tsx';
import type { PageMonthlyPass } from '../../types/role.ts';
import {
  LinkBadge,
  ActionButton,
  DeleteButton,
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

type ApiMessageResponse = { message?: string };

/**
 * 권한관리 "월간패스" 탭 (관리자 전용).
 *
 * 패스는 기간(시작월~끝월)으로 등록한다. 다음 달 패스를 미리 사거나 1년치를 한 번에 산 손님도 여기서 넣는다.
 * 예약의 이용일이 그 기간 안이면 결제 시 본인 1명분이 빠진다. 일행 중 다른 패스 회원은 현장 환불.
 * 기간이 지나면 저절로 끝나므로 매월 다시 켤 필요가 없다. 소셜·자체로그인 구분 없이 전체 회원이 대상이다.
 */
export default function MonthlyPassTable({ keyword }: { keyword: string }) {
  const { request } = useRequest();
  const { insert } = useInsertPost();
  const { remove } = useDeletePost();
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

  function addPass(memberId: number, label: string) {
    showMonthlyPassAddModal({
      label,
      onConfirm: (startMonth, months) => {
        // insert 는 요청·응답을 같은 타입 하나로 받는다
        insert<{ memberId: number; startMonth: string; months: number } & ApiMessageResponse>({
          url: '/bgm-agit/role/monthly-pass',
          body: { memberId, startMonth, months },
          ignoreHttpError: true,
          onSuccess: res => {
            toast.success(res?.message ?? '월간패스가 등록되었습니다.');
            fetchList(page);
          },
        });
      },
    });
  }

  function deletePass(passId: number, period: string, label: string) {
    showConfirmModal({
      message: `${label} 회원의 월간패스(${period})를 삭제하시겠습니까?`,
      onConfirm: () => {
        remove<ApiMessageResponse>({
          url: `/bgm-agit/role/monthly-pass/${passId}`,
          ignoreHttpError: true,
          onSuccess: res => {
            toast.success(res?.message ?? '월간패스가 삭제되었습니다.');
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
        ※ 월간패스는 시작월과 개월 수로 등록합니다. 다음 달·1년치를 미리 산 손님도 미리 넣어 두세요.
        <br />※ 예약 이용일이 패스 기간 안이면 결제 시 본인 1명분이 할인됩니다. 기간이 끝나면 자동으로
        종료됩니다.
      </p>
      <Table>
        <thead>
          <tr>
            <Th>번호</Th>
            <Th>이름</Th>
            <Th>닉네임</Th>
            <Th>연락처</Th>
            <Th>로그인 타입</Th>
            <Th>이번 달</Th>
            <Th>패스 기간</Th>
            <Th>등록</Th>
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
                  <LinkBadge $linked={isPass}>{isPass ? '이용중' : '-'}</LinkBadge>
                </Td>
                <Td>
                  {item.passes.length === 0
                    ? '-'
                    : item.passes.map(pass => {
                        const period = `${pass.startMonth} ~ ${pass.endMonth}`;
                        return (
                          <div
                            key={pass.passId}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '2px 0' }}
                          >
                            <span>{period}</span>
                            <DeleteButton
                              type="button"
                              onClick={() => deletePass(pass.passId, period, label)}
                            >
                              삭제
                            </DeleteButton>
                          </div>
                        );
                      })}
                </Td>
                <Td>
                  <ActionButton type="button" onClick={() => addPass(item.memberId, label)}>
                    등록
                  </ActionButton>
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
