"use client";

import { RecoilRoot } from "recoil";
import { ThemeProvider } from "styled-components";
import StyledComponentsRegistry from "./registry";
import theme from "@/styles/theme";

export default function ClientProviders({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    return (
        <RecoilRoot>
            <StyledComponentsRegistry>
                <ThemeProvider theme={theme}>{children}</ThemeProvider>
            </StyledComponentsRegistry>
        </RecoilRoot>
    );
}
