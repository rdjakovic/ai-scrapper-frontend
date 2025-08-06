# Test Keep/Delete Decisions

## Decision Criteria Applied:
1. **Keep all passing or fixable tests marked Core**
2. **For failing Core tests: mark must-fix**
3. **For failing Non-core tests: plan to delete**
4. **For passing Non-core tests: optional keep; default delete to reduce maintenance**
5. **Convert deletions by either: removing file or renaming to *.test.skip.tsx**

## Detailed Decisions:

### CORE TESTS TO KEEP (Passing)
| Test File | Status | Action | Reason |
|-----------|--------|--------|--------|
| `components/__tests__/HealthIndicator.test.tsx` | PASS | **KEEP** | Core health monitoring - passing |
| `components/__tests__/JobActions.test.tsx` | PASS | **KEEP** | Core job operations - passing |
| `utils/__tests__/jobUtils.test.ts` | PASS | **KEEP** | Core job utilities - passing |

### CORE TESTS TO KEEP (Failing but Fixable - MUST-FIX)
| Test File | Status | Action | Reason | Fix Type |
|-----------|--------|--------|--------|----------|
| `components/__tests__/ErrorMessage.test.tsx` | FAIL | **MUST-FIX** | Core error handling | Component export/import |
| `components/__tests__/JobCard.test.tsx` | FAIL | **MUST-FIX** | Core job display | Component export/import |
| `components/__tests__/RetryButton.test.tsx` | FAIL | **MUST-FIX** | Core error handling | Component export/import |
| `components/__tests__/StatusBadge.test.tsx` | FAIL | **MUST-FIX** | Core job monitoring | Component export/import |
| `components/forms/__tests__/JobForm.test.tsx` | FAIL | **MUST-FIX** | Core job creation | Environment variables |
| `components/forms/__tests__/UrlInput.test.tsx` | FAIL | **MUST-FIX** | Core input validation | Environment variables |
| `components/results/__tests__/ExportButton.test.tsx` | FAIL | **MUST-FIX** | Core results export | Environment variables |
| `components/results/__tests__/ResultsViewer.test.tsx` | FAIL | **MUST-FIX** | Core results display | Environment variables |
| `hooks/__tests__/useErrorHandler.test.tsx` | FAIL | **MUST-FIX** | Core error handling | Missing ToastProvider |
| `hooks/__tests__/useHealth.test.tsx` | FAIL | **MUST-FIX** | Core health monitoring | Environment variables |
| `hooks/__tests__/useJob.test.tsx` | FAIL | **MUST-FIX** | Core job detail | Environment variables |
| `hooks/__tests__/useJobs.test.tsx` | FAIL | **MUST-FIX** | Core job management | Environment variables |
| `pages/__tests__/CreateJob.test.tsx` | FAIL | **MUST-FIX** | Core job creation | Environment variables |
| `pages/__tests__/Dashboard.test.tsx` | FAIL | **MUST-FIX** | Core job monitoring | Environment variables |
| `pages/__tests__/Jobs.test.tsx` | FAIL | **MUST-FIX** | Core job list | Environment variables |
| `services/__tests__/healthService.test.ts` | FAIL | **MUST-FIX** | Core health monitoring | Environment variables |
| `services/__tests__/jobService.test.ts` | FAIL | **MUST-FIX** | Core job management | Environment variables |
| `test/integration/errorHandling.test.tsx` | FAIL | **MUST-FIX** | Core error handling | React import issues |
| `test/integration/userWorkflows.test.tsx` | FAIL | **MUST-FIX** | Core workflows | API service imports |
| `utils/__tests__/errorHandling.test.ts` | FAIL | **MUST-FIX** | Core error utilities | Test assertions |
| `utils/__tests__/exportUtils.test.ts` | FAIL | **MUST-FIX** | Core export utilities | Test logic |
| `utils/__tests__/validation.test.ts` | FAIL | **MUST-FIX** | Core validation | Test assertions |

### NON-CORE TESTS TO DELETE (All Failing)
| Test File | Status | Action | Reason |
|-----------|--------|--------|--------|
| `components/__tests__/LoadingSpinner.test.tsx` | FAIL | **DELETE** | Cosmetic component - failing |
| `components/forms/__tests__/JobForm.clone.test.tsx` | FAIL | **DELETE** | Non-core cloning - failing |
| `components/forms/__tests__/SelectorBuilder.test.tsx` | FAIL | **DELETE** | Advanced workflow - failing |
| `components/layout/__tests__/Breadcrumb.test.tsx` | FAIL | **DELETE** | Cosmetic navigation - failing |
| `components/routing/__tests__/RouteGuard.test.tsx` | FAIL | **DELETE** | Non-core routing - failing |
| `pages/__tests__/CloneJobPage.test.tsx` | FAIL | **DELETE** | Non-core cloning - failing |
| `test/integration/accessibility.test.tsx` | FAIL | **DELETE** | Non-core accessibility - failing |
| `test/integration/jobClone.test.tsx` | FAIL | **DELETE** | Non-core cloning - failing |
| `test/integration/performance.test.tsx` | FAIL | **DELETE** | Non-core performance - failing |

## Summary Statistics:
- **Core Tests to Keep (Passing)**: 3 tests
- **Core Tests to Keep (Must-Fix)**: 22 tests 
- **Non-Core Tests to Delete**: 9 tests
- **Total Tests Processed**: 34 tests

## Implementation Actions:
1. **Delete 9 non-core failing tests** (rename to .skip.tsx for potential resurrection)
2. **Mark 22 core failing tests as must-fix** (high priority)
3. **Preserve 3 passing core tests** (no action needed)
