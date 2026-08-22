import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { Home } from '@/pages/Home';
import { NeedUnderstanding } from '@/pages/NeedUnderstanding';
import { NeedConfirm } from '@/pages/NeedConfirm';
import { Results } from '@/pages/Results';
import { ProviderProfile } from '@/pages/ProviderProfile';
import { ProviderTrust } from '@/pages/ProviderTrust';
import { Discover } from '@/pages/Discover';
import { Requests } from '@/pages/Requests';
import { Profile } from '@/pages/Profile';
import { DynamicWeightPreview } from '@/components/preview/DynamicWeightPreview';

const router = createBrowserRouter([
  {
    path: '/preview/dynamic-weight',
    element: <DynamicWeightPreview />,
  },
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'home', element: <Navigate to="/" replace /> },
      { path: 'discover', element: <Discover /> },
      { path: 'requests', element: <Requests /> },
      { path: 'requests/:id', element: <Requests /> },
      { path: 'profile', element: <Profile /> },
      { path: 'need/understanding', element: <NeedUnderstanding /> },
      { path: 'need/confirm', element: <NeedConfirm /> },
      { path: 'results', element: <Results /> },
      { path: 'provider/:id', element: <ProviderProfile /> },
      { path: 'provider/:id/trust', element: <ProviderTrust /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
