
import Swal from 'sweetalert2';

export const confirmDialog = async (
  title: string,
  icon: 'warning' | 'info' | 'success' | 'error' = 'warning' // 기본은 warning
) => {
  return await Swal.fire({
    title,
    icon,
    showCancelButton: true,
    confirmButtonText: '확인',
    cancelButtonText: '취소',
    reverseButtons: true,
    confirmButtonColor: '#4A90E2',
    cancelButtonColor: '#757575',
  });
};

export const alertDialog = async (
  title: string,
  icon: 'success' | 'error' | 'info' = 'success'
) => {
  return await Swal.fire({
    icon,
    title,
    confirmButtonText: '확인',
    confirmButtonColor: '#4A90E2', // 확인 버튼 색
  });
};