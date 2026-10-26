import { useCallback, useEffect, useRef, useState } from 'react';

/** 짧은 알림음(파일 없이 소리를 낸다). 브라우저가 막으면 조용히 넘어간다 */
function beep() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    [0, 0.35, 0.7].forEach(at => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.25, ctx.currentTime + at);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + at + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + at);
      osc.stop(ctx.currentTime + at + 0.26);
    });
    window.setTimeout(() => ctx.close().catch(() => {}), 1500);
  } catch {
    // 소리를 못 내도 화면 표시는 그대로
  }
}

/**
 * 낮 토론 타이머. 남은 시간은 끝나는 시각에서 계산한다(탭을 다녀와도 어긋나지 않게).
 * 이 기기 화면에만 두고 저장하지 않는다 — 새로고침하면 사라져도 되는 값이다.
 */
export function useDayTimer() {
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [finished, setFinished] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    if (endsAt == null) return;
    const t = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(t);
  }, [endsAt]);

  const remainingMs = endsAt == null ? 0 : Math.max(0, endsAt - now);

  useEffect(() => {
    if (endsAt == null || remainingMs > 0 || fired.current) return;
    fired.current = true;
    setFinished(true);
    beep();
    navigator.vibrate?.([300, 150, 300]);
  }, [endsAt, remainingMs]);

  const start = useCallback((minutes: number) => {
    fired.current = false;
    setFinished(false);
    setNow(Date.now());
    setEndsAt(Date.now() + minutes * 60_000);
  }, []);

  const addMinute = useCallback(() => {
    fired.current = false;
    setFinished(false);
    setEndsAt(prev => Math.max(prev ?? Date.now(), Date.now()) + 60_000);
  }, []);

  const stop = useCallback(() => {
    setEndsAt(null);
    setFinished(false);
  }, []);

  const total = Math.ceil(remainingMs / 1000);
  const label = `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  return { running: endsAt != null && !finished, finished, label, start, addMinute, stop };
}
