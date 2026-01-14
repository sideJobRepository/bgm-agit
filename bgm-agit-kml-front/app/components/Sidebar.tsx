// app/components/Sidebar.tsx
"use client";

import Link from "next/link";
import styles from "./Sidebar.module.css";
import styled from "styled-components";

export default function Sidebar() {
    return (
        <SidebarWrapper className={styles.sidebar}>
            <Link href="/">홈</Link>
            <Link href="/convert">변환</Link>
            <Link href="/notice">공지</Link>
        </SidebarWrapper>
    );
}

const SidebarWrapper = styled.aside`
    width: 300px;
    height: 100dvh;
    background: ${({ theme }) => theme.colors.primary};
`