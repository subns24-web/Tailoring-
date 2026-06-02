'use strict';

// ===================== EXERCISE DATA =====================
const exercises = [
  {
    name: 'Barbell Squat', emoji: '🏋️', muscle: 'Quads, Glutes, Core', level: 'beginner',
    steps: ['Stand with feet shoulder-width apart, bar resting on upper traps.', 'Push knees out and hinge at hips, lowering until thighs are parallel to floor.', 'Drive through heels to return to standing.', 'Keep chest up and back neutral throughout.'],
    tips: ['Keep knees tracking over toes.', 'Take a deep breath before descending.', 'Start light — form > weight.']
  },
  {
    name: 'Bench Press', emoji: '💪', muscle: 'Chest, Shoulders, Triceps', level: 'beginner',
    steps: ['Lie flat on bench, grip bar just outside shoulder width.', 'Lower bar to mid-chest with elbows at ~45°.', 'Press bar up explosively until arms are locked out.', 'Maintain a slight arch in your lower back.'],
    tips: ['Squeeze the bar hard throughout.', 'Keep feet flat on the floor.', 'Don\'t bounce the bar off your chest.']
  },
  {
    name: 'Deadlift', emoji: '⚡', muscle: 'Hamstrings, Back, Glutes', level: 'beginner',
    steps: ['Stand with mid-foot under bar, feet hip-width apart.', 'Hinge at hips, grip bar just outside legs.', 'Push the floor away — don\'t "pull" the bar up.', 'Lock hips and knees at the top, then lower under control.'],
    tips: ['Keep the bar dragging your shins on the way up.', 'Never round your lower back.', 'Start with Romanian deadlifts if new to lifting.']
  },
  {
    name: 'Overhead Press', emoji: '🔝', muscle: 'Shoulders, Triceps, Core', level: 'beginner',
    steps: ['Hold bar at upper chest, hands just outside shoulders.', 'Press bar directly overhead, moving head back slightly.', 'Lock out elbows at the top.', 'Lower under control back to collarbone.'],
    tips: ['Squeeze glutes and abs for stability.', 'Don\'t lean back excessively.', 'Dumbbells are a great alternative.']
  },
  {
    name: 'Pull-Up', emoji: '🪝', muscle: 'Back, Biceps', level: 'beginner',
    steps: ['Hang from bar with overhand grip, hands shoulder-width apart.', 'Pull elbows down toward the floor.', 'Bring chin above the bar.', 'Lower fully to a dead hang.'],
    tips: ['Use lat pulldown if you can\'t do full pull-ups yet.', 'Don\'t kip or swing — use strict form.', 'Dead hangs improve grip and shoulder health.']
  },
  {
    name: 'Bent-Over Row', emoji: '🏗️', muscle: 'Back, Biceps, Rear Delts', level: 'beginner',
    steps: ['Hinge forward to ~45° with bar hanging at arms length.', 'Pull bar to lower chest, driving elbows back.', 'Squeeze shoulder blades together at the top.', 'Lower under control.'],
    tips: ['Keep your back straight — no rounding.', 'The bar should nearly touch your body.', 'Control the eccentric (lowering) phase.']
  },
  {
    name: 'Incline Dumbbell Press', emoji: '📐', muscle: 'Upper Chest, Shoulders', level: 'beginner',
    steps: ['Set bench to 30–45°. Hold dumbbells at chest level.', 'Press up and slightly inward.', 'Lower with control, feeling a stretch at the bottom.'],
    tips: ['Don\'t let dumbbells drift too far apart.', 'Keep elbows at ~45° to the body.']
  },
  {
    name: 'Leg Press', emoji: '🦵', muscle: 'Quads, Glutes, Hamstrings', level: 'beginner',
    steps: ['Sit in machine, feet hip-width on the plate.', 'Lower platform until knees reach 90°.', 'Push through heels to full extension (don\'t lock knees hard).'],
    tips: ['Higher foot placement hits glutes more.', 'Lower placement emphasises quads.', 'Never let lower back peel off the seat.']
  },
  {
    name: 'Dumbbell Curl', emoji: '💥', muscle: 'Biceps', level: 'beginner',
    steps: ['Stand holding dumbbells at your sides.', 'Curl both up to shoulder height, supinating wrists.', 'Squeeze at the top, lower slowly.'],
    tips: ['Don\'t swing your back.', 'Full range of motion matters more than heavy weight.']
  },
  {
    name: 'Tricep Pushdown', emoji: '⬇️', muscle: 'Triceps', level: 'beginner',
    steps: ['Attach rope/bar to high cable pulley.', 'Grip attachment, elbows tucked at sides.', 'Push down until arms are fully extended.', 'Slowly return to start.'],
    tips: ['Keep upper arms still — only forearms move.', 'Flex triceps hard at the bottom.']
  },
  {
    name: 'Romanian Deadlift', emoji: '📏', muscle: 'Hamstrings, Glutes', level: 'beginner',
    steps: ['Hold bar at hip level, soft bend in knees.', 'Hinge at hips, lowering bar down your legs.', 'Feel stretch in hamstrings, then drive hips forward.'],
    tips: ['Bar stays close to legs throughout.', 'Stop when you feel a good hamstring stretch (around shin level).']
  },
  {
    name: 'Lateral Raise', emoji: '↔️', muscle: 'Side Delts', level: 'beginner',
    steps: ['Hold dumbbells at sides.', 'Raise arms out to shoulder level, thumbs slightly down.', 'Lower under control — don\'t drop.'],
    tips: ['Use light weight — side delts are small.', 'Slight forward lean can help target the muscle better.']
  },
  {
    name: 'Plank', emoji: '🧱', muscle: 'Core, Shoulders', level: 'beginner',
    steps: ['Forearms on floor, body in a straight line.', 'Squeeze abs, glutes, and quads.', 'Hold for the prescribed time.'],
    tips: ['Don\'t let your hips sag or rise.', 'Breathe steadily throughout.', 'Progress to longer holds week by week.']
  },
  {
    name: 'Face Pull', emoji: '😮', muscle: 'Rear Delts, Rotator Cuff', level: 'beginner',
    steps: ['Set cable to face height with rope attachment.', 'Pull rope toward face, elbows high and wide.', 'Squeeze rear delts at the end.'],
    tips: ['Excellent for shoulder health — never skip this.', 'High rep, light weight is the sweet spot.']
  },
  {
    name: 'Walking Lunge', emoji: '🚶', muscle: 'Quads, Glutes, Balance', level: 'beginner',
    steps: ['Step forward into a lunge, lower back knee toward floor.', 'Push through front heel to bring feet together.', 'Repeat on the other leg.'],
    tips: ['Keep torso upright.', 'Don\'t let front knee cave inward.']
  },
  {
    name: 'Calf Raise', emoji: '👟', muscle: 'Calves', level: 'beginner',
    steps: ['Stand on edge of a step or flat ground.', 'Rise up on toes as high as possible.', 'Lower below neutral for full stretch.'],
    tips: ['Calves need high reps (15–20+) to grow.', 'Both straight-leg and bent-knee versions target different muscles.']
  },
  {
    name: 'Glute Bridge', emoji: '🌉', muscle: 'Glutes, Hamstrings', level: 'beginner',
    steps: ['Lie on back, feet flat, knees bent.', 'Drive hips up, squeezing glutes at the top.', 'Hold briefly, then lower.'],
    tips: ['Add a barbell across hips for progression.', 'Great warm-up for leg days.']
  },
  {
    name: 'Cable Row', emoji: '⛵', muscle: 'Back, Biceps', level: 'beginner',
    steps: ['Sit at cable machine, feet on pads, slight knee bend.', 'Pull handle to lower abdomen.', 'Squeeze shoulder blades, then return with control.'],
    tips: ['Don\'t lean back excessively.', 'Pause and squeeze at the end range.']
  }
];

// ===================== RENDER EXERCISES =====================
function renderExercises(filter = '') {
  const grid = document.getElementById('exerciseGrid');
  const filtered = exercises.filter(ex =>
    ex.name.toLowerCase().includes(filter.toLowerCase()) ||
    ex.muscle.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="empty-state" style="grid-column:1/-1">No exercises found.</p>';
    return;
  }

  grid.innerHTML = filtered.map(ex => `
    <div class="ex-card" data-name="${ex.name}">
      <span class="ex-card-emoji">${ex.emoji}</span>
      <h4>${ex.name}</h4>
      <div class="ex-muscle">${ex.muscle}</div>
      <span class="ex-level level-${ex.level}">${ex.level.charAt(0).toUpperCase() + ex.level.slice(1)}</span>
    </div>
  `).join('');

  grid.querySelectorAll('.ex-card').forEach(card => {
    card.addEventListener('click', () => openExerciseModal(card.dataset.name));
  });
}

// ===================== MODAL =====================
function openExerciseModal(name) {
  const ex = exercises.find(e => e.name === name);
  if (!ex) return;

  document.getElementById('modalContent').innerHTML = `
    <span class="modal-emoji">${ex.emoji}</span>
    <h2>${ex.name}</h2>
    <div class="modal-muscle">${ex.muscle}</div>
    <div class="modal-section">
      <h4>How to Perform</h4>
      <ul>${ex.steps.map(s => `<li>${s}</li>`).join('')}</ul>
    </div>
    <div class="modal-section">
      <h4>Pro Tips</h4>
      <ul>${ex.tips.map(t => `<li>${t}</li>`).join('')}</ul>
    </div>
  `;

  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ===================== TABS =====================
function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
}

// ===================== WORKOUT TRACKER =====================
let logEntries = JSON.parse(localStorage.getItem('gymFreshLog') || '[]');

function saveLog() {
  localStorage.setItem('gymFreshLog', JSON.stringify(logEntries));
}

function renderLog() {
  const container = document.getElementById('logEntries');
  if (logEntries.length === 0) {
    container.innerHTML = '<p class="empty-state">No exercises logged yet. Add one above!</p>';
    return;
  }

  container.innerHTML = logEntries.map((entry, i) => `
    <div class="log-entry">
      <div>
        <div class="log-entry-name">${entry.exercise}</div>
        <div class="log-entry-detail">${entry.sets} sets × ${entry.reps} reps @ ${entry.weight}kg</div>
      </div>
      <button class="log-entry-delete" data-index="${i}" title="Remove">✕</button>
    </div>
  `).join('');

  container.querySelectorAll('.log-entry-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      logEntries.splice(parseInt(btn.dataset.index), 1);
      saveLog();
      renderLog();
    });
  });
}

function initTracker() {
  renderLog();

  document.getElementById('logBtn').addEventListener('click', () => {
    const exercise = document.getElementById('logExercise').value.trim();
    const sets = parseInt(document.getElementById('logSets').value);
    const reps = parseInt(document.getElementById('logReps').value);
    const weight = parseFloat(document.getElementById('logWeight').value) || 0;

    if (!exercise) { alert('Please enter an exercise name.'); return; }
    if (!sets || sets < 1) { alert('Please enter valid sets.'); return; }
    if (!reps || reps < 1) { alert('Please enter valid reps.'); return; }

    logEntries.push({ exercise, sets, reps, weight });
    saveLog();
    renderLog();

    document.getElementById('logExercise').value = '';
    document.getElementById('logSets').value = '';
    document.getElementById('logReps').value = '';
    document.getElementById('logWeight').value = '';
  });

  document.getElementById('clearLog').addEventListener('click', () => {
    if (logEntries.length === 0) return;
    if (confirm('Clear all log entries for today?')) {
      logEntries = [];
      saveLog();
      renderLog();
    }
  });
}

// ===================== BMI CALCULATOR =====================
let selectedGender = 'male';

function initBMI() {
  document.querySelectorAll('.gender-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gender-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedGender = btn.dataset.gender;
    });
  });

  document.getElementById('calcBmi').addEventListener('click', () => {
    const height = parseFloat(document.getElementById('bmiHeight').value);
    const weight = parseFloat(document.getElementById('bmiWeight').value);
    const age = parseInt(document.getElementById('bmiAge').value);

    if (!height || !weight || height < 100 || weight < 20) {
      alert('Please enter valid height and weight.');
      return;
    }

    const bmi = weight / Math.pow(height / 100, 2);
    const bmiRounded = Math.round(bmi * 10) / 10;

    let category, advice, color;
    if (bmi < 18.5) {
      category = 'Underweight';
      color = '#3b82f6';
      advice = `At ${bmiRounded}, you're underweight. Focus on a caloric surplus with high-protein foods. Prioritise compound lifts and eating more. Consider consulting a nutritionist.`;
    } else if (bmi < 25) {
      category = 'Normal Weight';
      color = '#22c55e';
      advice = `Great news! At ${bmiRounded}, you're in a healthy range. Focus on building muscle and strength through progressive overload. Maintain your current caloric intake.`;
    } else if (bmi < 30) {
      category = 'Overweight';
      color = '#f97316';
      advice = `At ${bmiRounded}, you're slightly overweight. A small caloric deficit (300–500 kcal/day) with strength training will help. Don't skip cardio sessions.`;
    } else {
      category = 'Obese';
      color = '#ef4444';
      advice = `At ${bmiRounded}, prioritise health improvements. Start with moderate exercise 3–4x/week, reduce processed food, and speak to a doctor before starting intense training.`;
    }

    document.getElementById('bmiScore').textContent = bmiRounded;
    document.getElementById('bmiScore').style.color = color;
    document.getElementById('bmiCategory').textContent = category;
    document.getElementById('bmiCategory').style.color = color;
    document.getElementById('bmiAdvice').textContent = advice;

    // Position gauge marker (BMI 10 = 0%, BMI 40 = 100%)
    const pct = Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100));
    document.getElementById('gaugeMarker').style.left = `calc(${pct}% - 2px)`;

    const resultEl = document.getElementById('bmiResult');
    resultEl.style.display = 'flex';
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

// ===================== HAMBURGER MENU =====================
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  // Highlight active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 80) {
        current = section.id;
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }, { passive: true });
}

// ===================== INIT =====================
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  renderExercises();
  initTracker();
  initBMI();
  initNav();

  document.getElementById('exerciseSearch').addEventListener('input', e => {
    renderExercises(e.target.value);
  });

  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('modalOverlay')) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});
