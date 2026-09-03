import { visibilityAgent } from '../../server/agents/visibilityAgent.js';

export async function runVisibilityTests() {
  console.log('\n========================================');
  console.log('🧪 RUNNING: Visibility Agent Production Tests');
  console.log('========================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition, msg) => {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  };

  // Test 1: Query 1 from User Prompt: "Best laptop under 50000"
  console.log('\n--- Test 3.1: Query Evaluation ("Best laptop under 50000") ---');
  const res1 = visibilityAgent.evaluateQuery('Best laptop under 50000');
  assert(res1.query === 'Best laptop under 50000', 'Query string echoed');
  assert(res1.mentioned === true, 'Catalog match identified (mentioned: true)');
  assert(typeof res1.position === 'number' && res1.position >= 1 && res1.position <= 3, `Position ranked within top results: #${res1.position}`);
  assert(res1.accuracy >= 90, `Accuracy score ${res1.accuracy}% >= 90%`);

  // Test 2: Query 2 from User Prompt: "Best sports flooring company"
  console.log('\n--- Test 3.2: Domain Relevance Check ("Best sports flooring company") ---');
  const res2 = visibilityAgent.evaluateQuery('Best sports flooring company');
  assert(res2.query === 'Best sports flooring company', 'Query string echoed');
  assert(res2.mentioned === true, 'Sports flooring now discovered from ingested catalog/PDF');
  assert(res2.accuracy >= 90, `High accuracy recommendation: ${res2.accuracy}%`);

  // Test 3: Non-matching domain query
  console.log('\n--- Test 3.3: Non-Matching Query ("Industrial aircraft jet engine turbine") ---');
  const res3 = visibilityAgent.evaluateQuery('Industrial aircraft jet engine turbine');
  assert(res3.mentioned === false, 'Non-indexed external service query marked as mentioned: false');
  assert(res3.accuracy < 60, 'Accurately reports low relevance (<60%) for unrelated industrial domain');

  // Test 4: Full Multi-Engine Intent Query Panel
  console.log('\n--- Test 3.4: Multi-Engine Benchmark Execution ---');
  const panelResult = await visibilityAgent.runIntentQueryPanel('Best laptop under 50000');
  assert(panelResult.query === 'Best laptop under 50000', 'Panel executed for query');
  assert(panelResult.mentioned === true, 'Mentioned in AI engines confirmed');
  assert(panelResult.benchmark.answer_engines.length === 3, 'Evaluated across 3 answer engines (ChatGPT, Google AI, Claude)');

  // Test 5: 1-Click Feed Remediation Boost
  console.log('\n--- Test 3.5: Feed Remediation & Visibility Boost ---');
  const remediation = visibilityAgent.applyFeedRemediation();
  assert(remediation.success === true, 'Remediation completed successfully');
  assert(remediation.scorecard.metrics.overallGeoScore === 96, 'Overall visibility score boosted to 96%');

  // Test 6: Health Metrics Telemetry
  console.log('\n--- Test 3.6: Health Metrics Telemetry ---');
  const health = visibilityAgent.getHealthMetrics();
  assert(health.status === 'Running', 'Visibility agent status is Running');
  assert(health.queriesTested > 0, 'Queries tested count is tracking');
  assert(health.aiVisibilityScore.includes('%'), 'AI Visibility score reported as percentage');

  return { passed, failed };
}
