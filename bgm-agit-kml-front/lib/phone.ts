// 휴대폰번호 입력 포맷터.
// 사용자가 하이픈을 안 넣어도 자동으로 채워 넣는다. (01092062248 → 010-9206-2248)
// 백엔드 BgmAgitMember.normalizePhone 과 같은 규칙이라 저장 결과가 화면과 일치한다.
export const formatPhoneNo = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};
