import { lazy } from 'react';

// Lazy load pages for code splitting
export const Dashboard = lazy(() => import('./Dashboard'));
export const CreateJob = lazy(() => import('./CreateJob'));
export const Jobs = lazy(() => import('./Jobs'));
export const JobDetail = lazy(() => import('./JobDetail').then(module => ({ default: module.JobDetail })));
export const Results = lazy(() => import('./Results'));
export const Health = lazy(() => import('./Health'));
export const NotFound = lazy(() => import('./NotFound'));
