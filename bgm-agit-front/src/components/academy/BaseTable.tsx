import styled from 'styled-components';
import { PencilSimpleLine, MagnifyingGlass } from 'phosphor-react';
import type { WithTheme } from '../../styles/styled-props.ts';
import { useRecoilValue } from 'recoil';
import { userState } from '../../recoil/state/userState.ts';
import { useInsertPost } from '../../recoil/fetch.ts';
import Pagination from './Pagination.tsx';
import { useLocation } from 'react-router-dom';
import type { MyPageItem } from '../../types/myPage.ts';
import { useMyPageFetch } from '../../recoil/myPageFetch.ts';
import { showConfirmModal } from '../confirmAlert.tsx';
import { toast } from 'react-toastify';

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
        <Table>
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

const TableBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 8px;
`;

const Table = styled.table<WithTheme>`
  width: 100%;
  border-collapse: collapse;
  font-size: ${({ theme }) => theme.desktop.sizes.sm};
  color: ${({ theme }) => theme.colors.inputColor};
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ theme }) => theme.colors.lineColor};
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 32px;
    height: 2px;
    background: ${({ theme }) => theme.colors.blackColor};
  }

  thead {
    border-bottom: 1px solid ${({ theme }) => theme.colors.lineColor};
  }

  th,
  td {
    padding: 14px;
  }

  tbody tr:hover {
    opacity: 0.6;
  }

  td {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const Th = styled.th<{
  $width?: string;
  $align?: 'left' | 'center' | 'right';
}>`
  white-space: nowrap;
  font-weight: 600;
  text-align: center;
  width: ${({ $width }) => $width ?? 'auto'};
`;

const Td = styled.td<{
  $align?: 'left' | 'center' | 'right';
  $nowrap?: boolean;
}>`
  text-align: ${({ $align }) => $align ?? 'left'};
  white-space: ${({ $nowrap }) => ($nowrap ? 'nowrap' : 'normal')};
  word-break: break-word;
  overflow-wrap: anywhere;

  > div {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
`;

const Tr = styled.tr<{ $clickable: boolean }>`
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};

  &:nth-child(even) {
    background-color: rgb(253, 253, 255);
  }
`;

const EmptyTd = styled.td`
  padding: 40px 0;
  font-weight: 600;
`;

const PaginationWrapper = styled.div`
  text-align: center;
  margin-top: 4px;
`;

const TopBox = styled.section`
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px 0;
  justify-content: space-between;
`;

const Button = styled.button<WithTheme>`
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

const SearchGroup = styled.form<WithTheme>`
  display: flex;
  background-color: ${({ theme }) => theme.colors.white};
  flex: 1;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px 2px 20px;
  border: 1px solid ${({ theme }) => theme.colors.lineColor};
  border-radius: 4px;
  flex-wrap: nowrap;
  max-width: 260px;

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

const Field = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-shrink: 0;

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

const SearchButton = styled.button<WithTheme>`
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

const TableScroll = styled.div<WithTheme>`
  width: 100%;
  overflow-x: auto;
`;

const StatusButton = styled.button<WithTheme & { color: string }>`
  padding: 4px 8px;
  background-color: ${({ color }) => color};
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.desktop.sizes.md};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.md};
  }
`;

const TextBox = styled.div<WithTheme>`
  display: flex;
  flex-direction: column;
  justify-content: right;
  width: 100%;
  font-size: ${({ theme }) => theme.desktop.sizes.xl};
  line-height: 1.4;
  @media ${({ theme }) => theme.device.mobile} {
    font-size: ${({ theme }) => theme.mobile.sizes.xl};
  }

  p {
    color: ${({ theme }) => theme.colors.subColor};
  }

  span {
    color: ${({ theme }) => theme.colors.redColor};
    font-weight: ${({ theme }) => theme.weight.semiBold};
  }
`;
