import { theme } from './styles/theme.ts';
import './App.css';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle.ts';
import { RecoilRoot } from 'recoil';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import MainPage from './pages/MainPage.tsx';
import About from './pages/About.tsx';
import Game from './pages/Game.tsx';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <RecoilRoot>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<MainPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/game" element={<Game />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </RecoilRoot>
    </ThemeProvider>
  );
}

export default App;
