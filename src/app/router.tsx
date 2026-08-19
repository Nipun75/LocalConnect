import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { Home } from '@/pages/Home';
import { DynamicWeightPreview } from '@/components/preview/DynamicWeightPreview';

// Placeholders for Pages
const Auth = () => <div className="p-8">Auth Placeholder</div>;
const NeedUnderstanding = () => <div className="p-8"><h1 className="text-2xl font-bold">AI Understanding Placeholder</h1><p>Transitioned from home page.</p></div>;
const NeedConfirm = () => <div className="p-8">Requirement Confirm Placeholder</div>;
const Results = () => <div className="p-8">Match Results Placeholder</div>;
const ProviderProfile = () => <div className="p-8">Provider Profile Placeholder</div>;
const ProviderTrust = () => <div className="p-8">Provider Trust Detail Placeholder</div>;
const Requests = () => <div className="p-8">Requests Placeholder</div>;
const RequestDetails = () => <div className="p-8">Request Detail Placeholder</div>;
const Profile = () => <div className="p-8">Profile Placeholder</div>;
const Discover = () => <div className="p-8">Discover Placeholder</div>;

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
      { path: 'requests/:id', element: <RequestDetails /> },
      { path: 'profile', element: <Profile /> },
      { path: 'need/understanding', element: <NeedUnderstanding /> },
      { path: 'need/confirm', element: <NeedConfirm /> },
      { path: 'results', element: <Results /> },
      { path: 'provider/:id', element: <ProviderProfile /> },
      { path: 'provider/:id/trust', element: <ProviderTrust /> },
    ]
  },
  { path: '/auth', element: <Auth /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
