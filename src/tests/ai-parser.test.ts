// Test suite for LocalConnect AI Parser Integration Only

import { parseNeedLocally, parseNeedWithAI, ParsedNeed } from '../services/aiParser';

export async function runParserTests() {
  console.log('===========================================================');
  console.log('🧪 Running LocalConnect AI Parser Tests (Step 13 & Step 17)');
  console.log('===========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, actual?: any) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} -> got:`, actual);
      failed++;
    }
  }

  // Test 1: "I need a plumber near me"
  console.log('1. Test Case 1: "I need a plumber near me"');
  const t1 = parseNeedLocally('I need a plumber near me');
  assert(t1.service === 'plumber', 'Identifies service = plumber', t1.service);
  assert(t1.location === 'current_location', 'Identifies location = current_location', t1.location);
  assert(t1.category === 'home maintenance', 'Identifies category = home maintenance', t1.category);

  // Test 2: "Need a maths tutor for class 12 under 500"
  console.log('\n2. Test Case 2: "Need a maths tutor for class 12 under 500"');
  const t2 = parseNeedLocally('Need a maths tutor for class 12 under 500');
  assert(t2.service === 'maths tutor', 'Identifies service = maths tutor', t2.service);
  assert(t2.level === 'class 12', 'Identifies level = class 12', t2.level);
  assert(t2.budget_max === 500, 'Identifies budget_max = 500', t2.budget_max);

  // Test 3: "bhai 500 ke andar laptop repair wala chahiye"
  console.log('\n3. Test Case 3 (Hinglish): "bhai 500 ke andar laptop repair wala chahiye"');
  const t3 = parseNeedLocally('bhai 500 ke andar laptop repair wala chahiye');
  assert(t3.service === 'laptop repair', 'Identifies service = laptop repair', t3.service);
  assert(t3.budget_max === 500, 'Identifies budget_max = 500', t3.budget_max);
  assert(t3.currency === 'INR', 'Identifies currency = INR', t3.currency);

  // Test 4: "I need someone to repair my AC tomorrow evening within 3 km"
  console.log('\n4. Test Case 4: "I need someone to repair my AC tomorrow evening within 3 km"');
  const t4 = parseNeedLocally('I need someone to repair my AC tomorrow evening within 3 km');
  assert(t4.service === 'AC repair', 'Identifies service = AC repair', t4.service);
  assert(t4.date === 'tomorrow', 'Identifies date = tomorrow', t4.date);
  assert(t4.time === 'evening', 'Identifies time = evening', t4.time);
  assert(t4.radius_km === 3, 'Identifies radius_km = 3', t4.radius_km);

  // Test 5: "photographer for wedding next Sunday around 10k"
  console.log('\n5. Test Case 5: "photographer for wedding next Sunday around 10k"');
  const t5 = parseNeedLocally('photographer for wedding next Sunday around 10k');
  assert(t5.service === 'wedding photographer', 'Identifies service = wedding photographer', t5.service);
  assert(t5.budget_max === 10000, 'Identifies budget_max = 10000', t5.budget_max);
  assert(t5.date === 'next Sunday', 'Identifies date = next Sunday', t5.date);

  // Test 6: "mere ghar ke paas koi laptop repair wala hai?"
  console.log('\n6. Test Case 6: "mere ghar ke paas koi laptop repair wala hai?"');
  const t6 = parseNeedLocally('mere ghar ke paas koi laptop repair wala hai?');
  assert(t6.service === 'laptop repair', 'Identifies service = laptop repair', t6.service);
  assert(t6.radius_km === 2, 'Identifies radius_km = 2 for "ghar ke paas"', t6.radius_km);

  // Test 7: Async wrapper & fallback safety
  console.log('\n7. Test Case 7: Async AI Parser execution & fallback');
  const t7 = await parseNeedWithAI('Need an emergency electrician in Dharampeth');
  assert(t7.service === 'electrician', 'Async parser extracts electrician', t7.service);
  assert(t7.location === 'Dharampeth', 'Async parser extracts location Dharampeth', t7.location);
  assert(t7.urgency === 'urgent', 'Async parser extracts urgency urgent', t7.urgency);

  console.log('\n===========================================================');
  console.log(`📊 Parser Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('===========================================================\n');
}

runParserTests().catch(console.error);
