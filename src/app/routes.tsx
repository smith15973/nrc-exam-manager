// src/config/routes.tsx
import { lazy } from 'react';

// Lazy load components for better performance
const HomePage = lazy(() => import('../pages/HomePage'));
const ErrorPage = lazy(() => import('../pages/ErrorPage'));
const PlantsPage = lazy(() => import('../features/plants/pages/PlantsPage'));
const PlantPage = lazy(() => import('../features/plants/pages/PlantPage'));
const ExamsPage = lazy(() => import('../features/exams/pages/ExamsPage'));
const ExamPage = lazy(() => import('../features/exams/pages/ExamPage'));
const ExamQuestionPage = lazy(() => import('../features/examsQuestions/pages/ExamQuestionPage'));
const QuestionsPage = lazy(() => import('../features/questions/pages/QuestionsPage'));
const QuestionPage = lazy(() => import('../features/questions/pages/QuestionPage'));
const SystemsPage = lazy(() => import('../features/systems/pages/SystemsPage'));
const SystemPage = lazy(() => import('../features/systems/pages/SystemPage'));
const StemsPage = lazy(() => import('../features/stems/pages/StemsPage'));
const StemPage = lazy(() => import('../features/stems/pages/StemPage'));
const KasPage = lazy(() => import('../features/kas/pages/KasPage'));
const KaPage = lazy(() => import('../features/kas/pages/KaPage'));
const SystemKasPage = lazy(() => import('../features/system_kas/pages/SystemKasPage'));
const SystemKaPage = lazy(() => import('../features/system_kas/pages/SystemKaPage'));
const SandboxPage = lazy(() => import('../pages/SandboxPage'));

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  showInNav?: boolean;
  navLabel?: string;
  parentPath?: string;
  isNested?: boolean;
}

export const routes: RouteConfig[] = [
  // Home
  {
    path: '/',
    element: HomePage,
    showInNav: true,
    navLabel: 'Home',
  },
  // Error Page
  {
    path: '/error',
    element: ErrorPage,
  },

  // Plants
  {
    path: '/plants',
    element: PlantsPage,
    showInNav: true,
    navLabel: 'Plants',
  },
  {
    path: '/plants/:plantId',
    element: PlantPage,
    parentPath: '/plants',
    isNested: true,
  },

  // Exams
  {
    path: '/exams',
    element: ExamsPage,
    showInNav: true,
    navLabel: 'Exams',
  },
  {
    path: '/exams/:examId',
    element: ExamPage,
    parentPath: '/exams',
    isNested: true,
  },
  {
    path: '/exams/:examId/questions/:questionId',
    element: ExamQuestionPage,
    parentPath: '/exams/:examId',
    isNested: true,
  },

  // Questions
  {
    path: '/questions',
    element: QuestionsPage,
    showInNav: true,
    navLabel: 'Question Search',
  },
  {
    path: '/questions/:questionId',
    element: QuestionPage,
    parentPath: '/questions',
    isNested: true,
  },

  // Systems
  {
    path: '/systems',
    element: SystemsPage,
    showInNav: true,
    navLabel: 'Systems',
  },
  {
    path: '/systems/:systemNum',
    element: SystemPage,
    parentPath: '/systems',
    isNested: true,
  },

  // Stems
  {
    path: '/stems',
    element: StemsPage,
    showInNav: true,
    navLabel: 'Stems',
  },
  {
    path: '/stems/:stemId',
    element: StemPage,
    parentPath: '/stems',
    isNested: true,
  },

  // KAs
  {
    path: '/kas',
    element: KasPage,
    showInNav: true,
    navLabel: 'Kas',
  },
  {
    path: '/kas/:kaNum',
    element: KaPage,
    parentPath: '/kas',
    isNested: true,
  },

  // System KAs
  {
    path: '/system_kas',
    element: SystemKasPage,
    showInNav: true,
    navLabel: 'SystemKas',
  },
  {
    path: '/system_kas/:system_kaNum',
    element: SystemKaPage,
    parentPath: '/system_kas',
    isNested: true,
  },

  // Sandbox
  {
    path: '/sandbox',
    element: SandboxPage,
    showInNav: true,
    navLabel: 'Sandbox',
  },
];

// Component for 404 Not Found
export const NotFoundPage = () => (
  <ErrorPage errorType="notFound" showBackButton={true} />
);

// Helper functions
export const getNavItems = () => {
  return routes
    .filter(route => route.showInNav)
    .map(route => ({
      label: route.navLabel,
      link: route.path,
    }));
};

export const getParentRoute = (currentPath: string): string | null => {
  // Remove trailing slash and normalize
  const cleanPath = currentPath.replace(/\/$/, '');

  // Find the current route config
  const currentRoute = routes.find(route => {
    if (route.path.includes(':')) {
      // Handle dynamic routes
      const pathPattern = route.path.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${pathPattern}$`);
      return regex.test(cleanPath);
    }
    return route.path === cleanPath;
  });

  if (!currentRoute || !currentRoute.parentPath) {
    return null;
  }

  // If parent path has parameters, resolve them from current path
  if (currentRoute.parentPath.includes(':')) {
    const currentPathParts = cleanPath.split('/');
    const parentPathParts = currentRoute.parentPath.split('/');

    let resolvedParentPath = '';
    for (let i = 0; i < parentPathParts.length; i++) {
      const part = parentPathParts[i];
      if (part.startsWith(':')) {
        // Use the corresponding part from current path
        resolvedParentPath += '/' + currentPathParts[i];
      } else {
        resolvedParentPath += '/' + part;
      }
    }
    return resolvedParentPath.replace(/^\/+/, '/');
  }

  return currentRoute.parentPath;
};

export const shouldShowBackButton = (pathname: string): boolean => {
  return getParentRoute(pathname) !== null;
};