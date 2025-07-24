import { theme } from './styles/theme.ts';
import './App.css';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from './styles/GlobalStyle.ts';
import { RecoilRoot } from 'recoil';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.tsx';
import MainPage from './pages/MainPage.tsx';
import About from './pages/About.tsx';
import Detail from './pages/Detail.tsx';
import Error from './pages/Error.tsx';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <RecoilRoot>
        <BrowserRouter>
          <Routes>
            <Route path="/error" element={<Error />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<MainPage />} />
              <Route path="about" element={<About />} />
              <Route path="detail/*" element={<Detail />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </RecoilRoot>
    </ThemeProvider>
  );
}

export default App;
