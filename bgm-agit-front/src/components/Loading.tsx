import { ClipLoader } from 'react-spinners';
import { Overlay } from './Loading.styles.ts';
import ReactDOM from 'react-dom';

export default function Loading() {
  return ReactDOM.createPortal(
    <Overlay>
      <ClipLoader color="#1A7D55" size={60} />
    </Overlay>,
    document.body
  );
}
