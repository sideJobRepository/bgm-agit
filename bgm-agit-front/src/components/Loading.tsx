import { ClipLoader } from 'react-spinners';
import { Overlay } from './Loading.styles.ts';
import ReactDOM from 'react-dom';
import { theme } from '../styles/theme.ts';

export default function Loading() {
  return ReactDOM.createPortal(
    <Overlay>
      <ClipLoader color={theme.colors.greenColor} size={60} />
    </Overlay>,
    document.body
  );
}
