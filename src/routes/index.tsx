import { Route, Routes } from 'react-router-dom';
import GeneratePageNew from '../pages/GeneratePageNew.tsx';
import PreviewsPage from '../pages/PreviewsPage.tsx';
import { MainLayout } from '../components/main-layout';
import { ReactNode } from 'react';
import PreviewPage from '../pages/PreviewPage.tsx';
import { Model } from '../components/model';
import SettingStand from '../components/setting-stand/SettingStand.tsx';
import Page404 from '../pages/Page404.tsx';
import Rules from '../pages/RulesPage.tsx';
import DownloadPage from '../pages/DownloadPage.tsx';
import SettingFrameSwitch from '../components/setting-stand/SettingFrameOff.tsx';
import EditorPage from '../pages/EditorPage.tsx';
import PrintingModelsPage from '../pages/PrintingModelsPage.tsx';
import CensorPage from '../pages/CensorPage.tsx';
import KioskPage from '../pages/kiosk/KioskPage.tsx';
import SelfiePage from '../pages/SelfiePage.tsx';
import PrinterPage from '../pages/PrinterPage.tsx';
import CreatePrintModelPage from '../pages/CreatePrintModelPage.tsx';

interface RouteItem {
  route: string;
  component: ReactNode;
  collapse?: RouteItem[];
}

const getRoutes = (allRoutes: RouteItem[]): ReactNode[] =>
  allRoutes.flatMap((route: RouteItem) => {
    if (route.collapse) {
      return getRoutes(route.collapse);
    }

    if (route.route === '/:id/:index') {
      return <Route key={`${route.route}-${Math.random()}`} path={route.route} element={route.component} />;
    }

    if (route.route) {
      return <Route key={route.route} path={route.route} element={route.component} />;
    }

    return null;
  });

const AppRoutes = () => {
  const routes: RouteItem[] = [
    {
      route: '/',
      component: <GeneratePageNew />,
    },
    {
      route: '/:id',
      component: <PreviewPage />,
    },
    {
      route: '/:id/:index',
      component: <Model />,
    },
    {
      route: '/models',
      component: <PreviewsPage />,
    },
    {
      route: '/printing-models',
      component: <PrintingModelsPage />,
    },
    {
      route: '/setting-stand',
      component: <SettingStand />,
    },
    {
      route: '/setting-stand-off',
      component: <SettingStand off={true} />,
    },
    {
      route: '/setting-frame-switch',
      component: <SettingFrameSwitch />,
    },
    {
      route: '/404',
      component: <Page404 />,
    },
    {
      route: '/rules',
      component: <Rules />,
    },
    { route: '/download/:meshId', component: <DownloadPage /> },
    { route: '/editor', component: <EditorPage /> },
    { route: '/censor', component: <CensorPage /> },
    { route: '/kiosk', component: <KioskPage /> },
    { route: '/selfie', component: <SelfiePage /> },
    { route: '/printer', component: <PrinterPage /> },
    { route: '/create-print-model', component: <CreatePrintModelPage /> },
    // { route: '/feedback', component: <FeedbackPage />} Отложенно на неопределенный срок, из-за правил форм ОС
  ];

  const renderedRoutes = getRoutes(routes);

  return (
    <MainLayout>
      <Routes>{renderedRoutes}</Routes>
    </MainLayout>
  );
};

export default AppRoutes;
