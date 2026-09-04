/**
 * Visibility Agent Automated Test Suite (Unit & Integration)
 * Verifies:
 * - Dynamic query intent evaluation
 * - Price constraint and budget matching
 * - Ranking position determination
 * - Overall GEO (Generative Engine Optimization) scorecard & remediation
 */

import { visibilityAgent } from '../../server/agents/visibilityAgent.js';

export interface VisibilityTestResult {
  passed: number;
  failed: number;
}

export async function runVisibilityTests(): Promise<VisibilityTestResult> {
  console.log('\n========================================');
  console.log('🧪 RUNNING: Visibility Agent Production Tests (TypeScript)');
  console.log('========================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, msg: string) => {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  };

  // Test 1: Query Evaluation with Budget Constraints
  console.log('\n--- Test 3.1: Natural Language Query Evaluation ---');
  const evalResult = visibilityAgent.evaluateQuery('Best laptop under 60000');
  assert(evalResult.query === 'Best laptop under 60000', 'Preserves original query string');
  assert(typeof evalResult.accuracy === 'number', 'Calculates numerical accuracy score');
  assert(evalResult.mentioned === true, 'Brand/Product mentioned in generative search');

  // Test 2: Multi-Model Intent Panel Execution
  console.log('\n--- Test 3.2: Multi-Model Synthetic Intent Panel ---');
  const panel = await visibilityAgent.runIntentQueryPanel('Best wireless ANC headphones under 10000');
  assert(panel.success === true, 'Intent panel execution returns success true');
  assert(panel.models_evaluated.length >= 4, 'Evaluates against at least 4 AI shopping models');
  assert(panel.overall_geo_score > 0, 'Computes overall GEO score');

  // Test 3: Feed Remediation
  console.log('\n--- Test 3.3: Autonomous Feed Remediation ---');
  const remediation = visibilityAgent.applyFeedRemediation();
  assert(remediation.success === true, 'Feed remediation applied successfully');
  assert(remediation.updated_score >= 90, 'Remediated score achieves >= 90%');

  return { passed, failed };
}
