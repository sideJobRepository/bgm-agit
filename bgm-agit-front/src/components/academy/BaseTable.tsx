import { PencilSimpleLine, MagnifyingGlass } from 'phosphor-react';
import { useRecoilValue } from 'recoil';
import { userState } from '../../recoil/state/userState.ts';
import { useInsertPost } from '../../recoil/fetch.ts';
import Pagination from './Pagination.tsx';
import { useLocation } from 'react-router-dom';
import type { MyPageItem } from '../../types/myPage.ts';
import { useMyPageFetch } from '../../recoil/myPageFetch.ts';
import { showConfirmModal } from '../confirmAlert.tsx';
import { toast } from '../../utils/toast';
import {
  TableBox,
  Table,
  Th,
  Td,
  Tr,
  EmptyTd,
  PaginationWrapper,
  TopBox,
  Button,
  SearchGroup,
  FieldsWrapper,
  Field,
  SearchButton,
  TableScroll,
  StatusButton,
  TextBox,
} from './BaseTable.styles.ts';

export interface BaseColumn<T> {
  key: string;
  header: React.ReactNode;
  render: (row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  nowrap?: boolean;
}

interface BaseTableProps<T> {
  columns: BaseColumn<T>[];
  data: T[];

  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;

  onRowClick?: (row: T) => void;
  showWriteButton?: boolean;
  onWriteClick?: () => void;
  emptyMessage?: string;
  searchLabel?: string;
  searchKeyword?: string;
  onSearchKeywordChange?: (value: string) => void;
  onSearch?: () => void;
}

type MyPageRow = MyPageItem & {
  approvalBtnEnabled?: boolean;
  cancelBtnEnabled?: boolean;
  approvalStatus?: string;
  cancelStatus?: string;
};

export function BaseTable<T>({
  columns,
  data,
  page,
  totalPages,
  onPageChange,
  onRowClick,
  showWriteButton = false,
  onWriteClick,
  emptyMessage = '검색된 결과가 없습니다.',
  searchLabel,
  searchKeyword,
  onSearchKeywordChange,
  onSearch,
}: BaseTableProps<T>) {
  const { insert } = useInsertPost();
  const fetchMyPage = useMyPageFetch();

  const user = useRecoilValue(userState);

  const location = useLocation();
  const pathname = location.pathname;
  const isReviewPage = pathname === '/review';

  function isMyPageRow(row: unknown): row is MyPageRow {
    return typeof row === 'object' && row !== null;
  }

  console.log('path', pathname);

  //공유하기
  function shareReservation(item: MyPageItem) {
    if (!window.Kakao || !window.Kakao.isInitialized()) {
      return;
    }

    window.Kakao.Share.sendDefault({
      objectType: 'text',
      text: `
      [마작 아카데미 예약 내역 안내]
      
      예약자: ${item.memberName}
      예약일자: ${item.startDate}
      예약시간: ${item.startTime} ~ ${item.endTime}
      연락처: ${item.phoneNo}
    `.trim(),
      link: {
        mobileWebUrl: 'https://bgmagit.co.kr',
        webUrl: 'https://bgmagit.co.kr',
      },
    });
  }

  //업데이트
  function updateData(item: MyPageItem, gb: boolean) {
    const param = {
      lectureId: item.lectureId,
      memberId: item.memberId,
    };

    const url = gb ? '/my-academy/approval' : '/my-academy/cancel';
    const message = gb ? '해당 예약을 확정하시겠습니까?' : '해당 예약을 취소하시겠습니까?';
    const message2 = gb ? '예약이 확정되었습니다.' : '예약이 취소되었습니다.';

    showConfirmModal({
      message,
      onConfirm: () => {
        insert({
          url: `/bgm-agit${url}`,
          body: param,
          ignoreHttpError: true,
          onSuccess: async () => {
            toast.success(message2);
            fetchMyPage({ page, titleAndCont: searchKeyword ?? '' });
          },
        });
      },
    });
  }
  return (
    <TableBox>
      <TopBox>
        {['/review'].includes(pathname) ? (
          <>
            <SearchGroup
              onSubmit={e => {
                e.preventDefault();
                onSearch?.();
              }}
            >
              <FieldsWrapper>
                <Field>
                  <label>{searchLabel}</label>
                  <input
                    type="text"
                    placeholder="검색어를 입력해주세요."
                    value={searchKeyword ?? ''}
                    onChange={e => onSearchKeywordChange?.(e.target.value)}
                  />
                </Field>
              </FieldsWrapper>
              <SearchButton type="submit">
                <MagnifyingGlass weight="bold" />
                검색
              </SearchButton>
            </SearchGroup>
            {((pathname === '/notice' && user?.roles?.includes('ROLE_ADMIN')) ||
              (pathname === '/review' && user)) && (
              <Button onClick={onWriteClick ? () => onWriteClick() : undefined}>
                <PencilSimpleLine weight="bold" />
              </Button>
            )}
          </>
        ) : (
          <TextBox>
            <p>
              • 계좌 : 카카오뱅크 79795151308 <br />• 예금주 : 박x후
            </p>
            <span>
              ※ 예약금은 10,000원이며, 반드시 예약자명으로 입금해주시기 바랍니다.
              <br />※ 확정 후 취소의 경우 0507-1445-3503로 문의 주시기 바랍니다.
            </span>
          </TextBox>
        )}
      </TopBox>
      <TableScroll>
        <Table $fixedLayout={isReviewPage}>
          <thead>
            <tr>
              {columns.map(col => (
                <Th key={col.key} $width={col.width}>
                  {col.header}
                </Th>
              ))}
              {pathname === '/my-academy' && <Th>예약 상태</Th>}
            </tr>
          </thead>
          <tbody>
            {data?.length === 0 ? (
              <tr>
                <EmptyTd colSpan={columns.length}>{emptyMessage}</EmptyTd>
              </tr>
            ) : (
              data?.map((row, index) => (
                <Tr
                  key={index}
                  $clickable={!!onRowClick}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map(col => (
                    <Td key={col.key} $align={col.align} $nowrap={col.nowrap}>
                      {col.render(row, index)}
                    </Td>
                  ))}
                  {pathname === '/my-academy' && isMyPageRow(row) && (
                    <Td $nowrap $align="center">
                      <div>
                        {row.cancelStatus === 'Y'
                          ? '예약 취소'
                          : row.approvalStatus === 'Y'
                            ? '예약 확정'
                            : '예약 대기'}
                        {row.approvalBtnEnabled && (
                          <StatusButton
                            color="#1A7D55"
                            onClick={e => {
                              e.stopPropagation();
                              updateData(row, true);
                            }}
                          >
                            확정
                          </StatusButton>
                        )}
                        {row.cancelBtnEnabled && (
                          <StatusButton
                            onClick={e => {
                              e.stopPropagation();
                              updateData(row, false);
                            }}
                            color="#FF5E57"
                          >
                            취소
                          </StatusButton>
                        )}
                        <StatusButton
                          color="#093A6E"
                          onClick={e => {
                            e.stopPropagation();
                            shareReservation(row);
                          }}
                        >
                          공유
                        </StatusButton>
                      </div>
                    </Td>
                  )}
                </Tr>
              ))
            )}
          </tbody>
        </Table>
      </TableScroll>
      <PaginationWrapper>
        <Pagination current={page} totalPages={totalPages} onChange={onPageChange} />
      </PaginationWrapper>
    </TableBox>
  );
}
