'use client';

import React, { useState } from 'react';

type OutlineNode = {
  title: string;
  dest?: any;
  items?: OutlineNode[];
};

export default function OutlineItem({
                                      item,
                                      goToOutline,
                                      level = 0,
                                    }: {
  item: OutlineNode;
  goToOutline: (dest: any) => void;
  level?: number;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = Array.isArray(item.items) && item.items.length > 0;

  return (
    <li style={{ marginTop: 6 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          paddingLeft: level * 10,
          cursor: 'pointer',
          color: '#fff',
          userSelect: 'none',
        }}
        onClick={() => {
          if (hasChildren) setOpen((v) => !v);
          if (item.dest) goToOutline(item.dest);
        }}
      >
        {hasChildren && (
          <span style={{ opacity: 0.7, fontSize: 12 }}>
            {open ? '▾' : '▸'}
          </span>
        )}
        <span style={{ fontSize: 13 }}>{item.title || '(untitled)'}</span>
      </div>

      {hasChildren && open && (
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {item.items!.map((child, idx) => (
            <OutlineItem
              key={idx}
              item={child}
              goToOutline={goToOutline}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
