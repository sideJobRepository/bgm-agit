import { CT_IMAGES_ENABLED } from '../../../config/clocktower.ts';
import type { GrimoireData, GrimoireRole } from '../../../types/clocktower.ts';

/**
 * 토큰 이미지 후보를 쓸 순서대로 돌려준다. 앞의 것이 안 뜨면(onError) 다음 것, 다 안 되면 글자 토큰.
 *
 * evil 은 그 좌석의 **실제 선악**(isEvilSeat). 캐릭터가 바뀌어도 선악은 그대로라
 * 악이 된 주민은 악(_e) 그림, 선이 된 악마는 선(_g) 그림을 쓴다(공식 스크립트 스키마 image 설명 "regular alignment and flipped alignment").
 * - 주민·외지인: 악이면 _e, 아니면 _g
 * - 하수인·악마: 선이면 _g, 아니면 _e
 * - 여행자: 선악 미정이면 무진영, 정했으면 _g/_e
 * - 전설·로릭: 무진영
 * 그다음 진영 기본 이미지(generic) 순.
 */
export function tokenImageCandidates(
  role: GrimoireRole | null | undefined,
  evil: boolean | null,
  generic?: Record<string, string>
): string[] {
  if (!CT_IMAGES_ENABLED || !role?.team) return [];
  const g = generic ?? {};
  const team = role.team;
  const list: (string | null | undefined)[] = [];
  if (team === 'TOWNSFOLK' || team === 'OUTSIDER') {
    const side = evil === true ? 'e' : 'g';
    list.push(side === 'e' ? role.imageEvil : role.imageGood, role.image);
    list.push(g[`${team.toLowerCase()}_${side}`], g[team.toLowerCase()]);
  } else if (team === 'MINION' || team === 'DEMON') {
    const side = evil === false ? 'g' : 'e';
    list.push(side === 'e' ? role.imageEvil : role.imageGood, role.image);
    list.push(g[`${team.toLowerCase()}_${side}`], g[team.toLowerCase()]);
  } else if (team === 'TRAVELLER') {
    if (evil == null) list.push(role.image, g.traveller);
    else {
      const side = evil ? 'e' : 'g';
      list.push(evil ? role.imageEvil : role.imageGood, role.image, g[`traveller_${side}`], g.traveller);
    }
  } else {
    // 전설·로릭
    list.push(role.image, g[team.toLowerCase()]);
  }
  return list.filter((u, i, arr): u is string => !!u && arr.indexOf(u) === i);
}

/** 마도서 진입 때 스크립트 이미지를 미리 받아 둔다(좌석을 바꿀 때마다 빈 칸이 깜빡이지 않게) */
export function preloadGrimoireImages(data: GrimoireData) {
  if (!CT_IMAGES_ENABLED) return;
  const urls = new Set<string>();
  for (const r of [...data.roles, ...(data.extraFabled ?? [])]) {
    for (const u of [r.image, r.imageGood, r.imageEvil]) if (u) urls.add(u);
  }
  for (const u of Object.values(data.genericImages ?? {})) urls.add(u);
  urls.forEach(u => {
    const img = new Image();
    img.decoding = 'async';
    img.src = u;
  });
}
