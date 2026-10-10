import ReactDOM from 'react-dom';
import { ModalBackdrop, ModalBox } from './Modal.styles.ts';

export default function Modal({
  children,
  onClose,
  closeOnBackdrop = true,
}: {
  children: React.ReactNode;
  onClose: () => void;
  // 배경(바깥) 클릭으로 닫을지 여부. 입력 폼 모달은 실수로 닫히는 것을 막기 위해 false 권장
  closeOnBackdrop?: boolean;
}) {
  return ReactDOM.createPortal(
    <ModalBackdrop onClick={closeOnBackdrop ? onClose : undefined}>
      <ModalBox onClick={e => e.stopPropagation()}>{children}</ModalBox>
    </ModalBackdrop>,
    document.body
  );
}
