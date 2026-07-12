/* ============================================================
   The ten interactive demos.
   Each entry: { icon, title, package, render(body) }.
   All demos are honest simulations on sample data — the modal
   footer says so. User-typed input must pass through esc() or
   land via textContent, never raw into innerHTML.
   Module top level must stay DOM-free: tests import this file in Node.
   ============================================================ */

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function esc(s) {
  return String(s).replace(/[&<>"']/g, (m) => ESC[m]);
}

function reduced() {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function think(slot, label = 'Working on it') {
  slot.innerHTML = '<div class="thinking"><span class="dots"><span></span><span></span><span></span></span> ' +
    esc(label) + '…</div>';
  return new Promise((r) => setTimeout(() => { slot.innerHTML = ''; r(); }, reduced() ? 60 : 950));
}

async function typeInto(node, text) {
  if (reduced()) { node.textContent = text; return; }
  node.textContent = '';
  for (let i = 0; i < text.length; i += 3) {
    node.textContent = text.slice(0, i + 3);
    await new Promise((r) => setTimeout(r, 12));
  }
  node.textContent = text;
}

/* Chip groups: wire toggle behavior, return a getter of selected values. */
function wireChips(wrap, { multi = false } = {}) {
  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.d-chip');
    if (!btn) return;
    if (multi) {
      const on = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', on ? 'false' : 'true');
    } else {
      for (const b of wrap.querySelectorAll('.d-chip')) b.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-pressed', 'true');
    }
  });
  return () => [...wrap.querySelectorAll('.d-chip[aria-pressed="true"]')].map((b) => b.dataset.value);
}

function chipsHTML(items, pressed = []) {
  return items.map((it) =>
    '<button type="button" class="d-chip" data-value="' + esc(it) + '" aria-pressed="' +
    (pressed.includes(it) ? 'true' : 'false') + '">' + esc(it) + '</button>').join('');
}

/* ============================================================ */

export const demos = {

  /* ---------------- 1. Inbox Tamer ---------------- */
  inbox: {
    icon: '📥',
    title: 'Inbox Tamer',
    package: 'Ongoing service',
    render(body) {
      const messages = [
        ['wa', 'WhatsApp', 'Gan Ilanit group', 'Reminder!! Parent meeting MOVED to Wednesday 18:00 — please confirm by tonight 🙏'],
        ['em', 'Email', 'Israel Electric', 'Payment failed: invoice #88231 — ₪412 due 13 July'],
        ['sms', 'SMS', 'DentalCare', 'Appt Thu 09:30. Reply C to confirm, X to cancel'],
        ['sms', 'SMS', 'BoxIt', 'Your package is waiting in locker 14. Code: 4471'],
        ['wa', 'WhatsApp', 'School parents (3rd grade)', '47 new messages overnight…'],
        ['em', 'Email', 'SuperDeal', '🔥 24 HOURS ONLY: everything 30% off!!'],
        ['em', 'Email', 'TravelBird', 'Escape to Greece from $99 — this week only'],
        ['em', 'Email', 'The Weekend Read', 'Your Saturday digest is here'],
        ['em', 'Email', 'Coupon King', "You've earned 500 points! Redeem now"],
        ['em', 'Email', 'Tech Weekly', 'Issue #204: the week in tech'],
        ['em', 'Email', 'MegaSport', 'New arrivals picked just for you'],
      ];
      body.innerHTML =
        '<p class="d-hint" style="margin:0 0 .8rem">A typical morning — 11 messages across email, WhatsApp and SMS:</p>' +
        '<div class="msg-list">' +
        messages.map(([cls, chan, from, text]) =>
          '<div class="msg"><span class="msg-chan ' + cls + '">' + chan + '</span>' +
          '<span class="msg-from">' + esc(from) + '</span>' +
          '<span class="msg-text">' + esc(text) + '</span></div>').join('') +
        '</div>' +
        '<button type="button" class="d-btn">✨ Summarize my morning</button>' +
        '<div class="out-slot"></div>';

      const slot = body.querySelector('.out-slot');
      body.querySelector('.d-btn').addEventListener('click', async (e) => {
        e.target.disabled = true;
        await think(slot, 'Reading 11 messages');
        slot.innerHTML =
          '<div class="d-out"><h4>Your morning in 30 seconds — Saturday, 7:00</h4>' +
          '<div class="digest-group"><h5>⚡ Needs you today (3)</h5><ul>' +
          '<li><strong>Gan Ilanit:</strong> parent meeting moved to <strong>Wednesday 18:00</strong> — they need a yes/no by tonight.</li>' +
          '<li><strong>Electric bill:</strong> autopay failed, ₪412 due <strong>tomorrow</strong> — needs a manual payment.</li>' +
          '<li><strong>Dentist:</strong> Thursday 09:30 — reply “C” to confirm.</li>' +
          '</ul></div>' +
          '<div class="digest-group"><h5>📌 Good to know (2)</h5><ul>' +
          '<li>Package in locker <strong>14</strong>, code <strong>4471</strong>.</li>' +
          '<li>School group: 47 messages, only one matters — <strong>white shirt needed Friday</strong>.</li>' +
          '</ul></div>' +
          '<div class="digest-group"><h5>🗑️ Handled quietly (6)</h5><ul>' +
          '<li>4 promotions archived, 2 newsletters filed under “weekend reading”.</li>' +
          '</ul></div>' +
          '<p class="d-hint">That was ~20 minutes of scrolling, done for you. Same time tomorrow ☀️</p>' +
          '</div>';
      });
    },
  },

  /* ---------------- 2. Fridge-to-Table ---------------- */
  meals: {
    icon: '🍳',
    title: 'Fridge-to-Table',
    package: 'One-shot build',
    render(body) {
      const INGREDIENTS = ['chicken', 'eggs', 'pasta', 'rice', 'canned tomatoes',
        'chickpeas', 'spinach', 'cheese', 'potatoes', 'tuna'];
      const RECIPES = [
        { name: 'One-pan lemon chicken & potatoes', uses: ['chicken', 'potatoes'], add: ['lemon', 'garlic'], type: 'meat' },
        { name: 'Shakshuka night', uses: ['eggs', 'canned tomatoes'], add: ['onion', 'fresh pita'], type: 'veg' },
        { name: 'Creamy spinach pasta', uses: ['pasta', 'spinach', 'cheese'], add: ['cream', 'garlic'], type: 'veg' },
        { name: 'Chickpea coconut curry on rice', uses: ['chickpeas', 'rice'], add: ['coconut milk', 'curry paste'], type: 'veg' },
        { name: 'Crispy tuna melts', uses: ['tuna', 'cheese'], add: ['good bread', 'mayo'], type: 'fish' },
        { name: 'Family fried rice', uses: ['rice', 'eggs'], add: ['soy sauce', 'frozen peas'], type: 'veg' },
        { name: 'Paprika chicken & rice skillet', uses: ['chicken', 'rice'], add: ['onion', 'sweet paprika'], type: 'meat' },
        { name: 'Loaded baked potatoes', uses: ['potatoes', 'cheese', 'spinach'], add: ['sour cream', 'chives'], type: 'veg' },
        { name: 'Pasta pomodoro', uses: ['pasta', 'canned tomatoes'], add: ['garlic', 'fresh basil'], type: 'veg' },
        { name: 'Spanish tortilla', uses: ['eggs', 'potatoes'], add: ['onion', 'olive oil'], type: 'veg' },
      ];
      const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

      body.innerHTML =
        '<span class="d-label">What’s in your kitchen? Tap everything you have</span>' +
        '<div class="d-chips ing"></div>' +
        '<span class="d-label">Preferences</span>' +
        '<div class="d-chips diet"></div>' +
        '<span class="d-label">How many dinners?</span>' +
        '<div class="d-chips nights"></div>' +
        '<button type="button" class="d-btn">✨ Plan my week</button>' +
        '<div class="out-slot"></div>';

      const ingWrap = body.querySelector('.ing');
      const dietWrap = body.querySelector('.diet');
      const nightsWrap = body.querySelector('.nights');
      ingWrap.innerHTML = chipsHTML(INGREDIENTS, ['eggs', 'pasta', 'canned tomatoes', 'cheese']);
      dietWrap.innerHTML = chipsHTML(['no preference', 'vegetarian', 'kosher'], ['no preference']);
      nightsWrap.innerHTML = chipsHTML(['3', '4', '5'], ['4']);
      const getIng = wireChips(ingWrap, { multi: true });
      const getDiet = wireChips(dietWrap);
      const getNights = wireChips(nightsWrap);

      const slot = body.querySelector('.out-slot');
      body.querySelector('.d-btn').addEventListener('click', async () => {
        const have = getIng();
        if (have.length === 0) {
          slot.innerHTML = '<p class="d-hint">Tap at least one ingredient — even just eggs. I can work with eggs.</p>';
          return;
        }
        const diet = getDiet()[0] || 'no preference';
        const nights = Number(getNights()[0] || 4);

        let pool = RECIPES;
        if (diet === 'vegetarian') pool = pool.filter((r) => r.type === 'veg');

        const scored = pool
          .map((r) => ({ ...r, score: r.uses.filter((u) => have.includes(u)).length }))
          .sort((a, b) => b.score - a.score || a.add.length - b.add.length);
        const plan = scored.slice(0, nights);

        await think(slot, 'Planning ' + nights + ' dinners around your ' + have.length + ' ingredients');

        const shopping = new Set();
        for (const r of plan) {
          for (const a of r.add) shopping.add(a);
          for (const u of r.uses) if (!have.includes(u)) shopping.add(u);
        }

        slot.innerHTML =
          '<div class="d-out"><h4>Your dinner plan</h4>' +
          plan.map((r, i) => {
            const yours = r.uses.filter((u) => have.includes(u));
            return '<div class="plan-night"><h5>' + esc(DAYS[i]) + ' — ' + esc(r.name) + '</h5>' +
              '<p>' + (yours.length ? 'from your kitchen: ' + esc(yours.join(', ')) + ' · ' : '') +
              'uses mostly pantry staples · '.repeat(yours.length ? 0 : 1) +
              'nothing fancy, ~30 min</p></div>';
          }).join('') +
          '<h4 style="margin-top:1rem">🛒 One shopping list for all ' + plan.length + ' nights</h4>' +
          '<p style="margin:.2rem 0">' + esc([...shopping].sort().join(' · ')) + '</p>' +
          (diet === 'kosher'
            ? '<p class="d-hint">Meat and dairy dinners are kept to separate nights — the real version learns your kitchen’s exact rules.</p>'
            : '<p class="d-hint">The real version knows your family’s picky eaters and never repeats last week.</p>') +
          '</div>';
      });
    },
  },

  /* ---------------- 3. Receipt Snap ---------------- */
  receipts: {
    icon: '🧾',
    title: 'Receipt Snap',
    package: 'One-shot build',
    render(body) {
      const RECEIPTS = {
        market: {
          store: 'SUPER-SAVE MARKET',
          lines: [['Milk 3%', 'Groceries', 6.9], ['Eggs L, 12', 'Groceries', 13.5],
            ['Chicken breast 1kg', 'Groceries', 32.4], ['Tomatoes', 'Groceries', 8.2],
            ['Pita x10', 'Groceries', 9.9], ['Chocolate spread', 'Kids & school', 15.9]],
        },
        pharm: {
          store: 'CITY PHARMACY',
          lines: [['Kids paracetamol', 'Pharmacy', 24.9], ['Sunscreen SPF50', 'Pharmacy', 49.9],
            ['Plasters, mixed', 'Pharmacy', 12.9]],
        },
      };
      const MONTH = [['Groceries', 1842], ['Eating out', 618], ['Pharmacy', 304],
        ['Kids & school', 277], ['Transport', 189]];

      function receiptHTML(id) {
        const r = RECEIPTS[id];
        const rows = r.lines.map(([n, , p]) => n.slice(0, 16).padEnd(17, ' ') + p.toFixed(2)).join('\n');
        const total = r.lines.reduce((s, [, , p]) => s + p, 0);
        return '<button type="button" class="receipt" data-r="' + id + '"><strong>' + esc(r.store) +
          '</strong>\n' + esc(rows) + '\n----------------\nTOTAL' + esc(total.toFixed(2).padStart(16, ' ')) +
          '\n\n<em style="font-family:inherit">tap to scan 📷</em></button>';
      }

      body.innerHTML =
        '<span class="d-label">Snap (or tap) a receipt</span>' +
        '<div class="receipt-pick">' + receiptHTML('market') + receiptHTML('pharm') + '</div>' +
        '<div class="out-slot"></div><div class="month-slot"></div>';

      const slot = body.querySelector('.out-slot');
      const monthSlot = body.querySelector('.month-slot');

      body.querySelector('.receipt-pick').addEventListener('click', async (e) => {
        const btn = e.target.closest('.receipt');
        if (!btn || btn.classList.contains('scanning')) return;
        const r = RECEIPTS[btn.dataset.r];
        btn.classList.add('scanning');
        const line = document.createElement('span');
        line.className = 'scanline';
        btn.appendChild(line);
        await new Promise((res) => setTimeout(res, reduced() ? 60 : 1450));
        line.remove();
        btn.classList.remove('scanning');

        const total = r.lines.reduce((s, [, , p]) => s + p, 0);
        const cats = new Set(r.lines.map(([, c]) => c));
        slot.innerHTML =
          '<div class="d-out"><h4>Read it. Filed it. ✓</h4>' +
          '<table class="d-table"><thead><tr><th>Item</th><th>Category</th><th class="num">₪</th></tr></thead><tbody>' +
          r.lines.map(([n, c, p]) => '<tr><td>' + esc(n) + '</td><td>' + esc(c) +
            '</td><td class="num">' + p.toFixed(2) + '</td></tr>').join('') +
          '</tbody></table>' +
          '<p class="d-hint">Added ₪' + total.toFixed(2) + ' to July across ' + cats.size +
          (cats.size === 1 ? ' category' : ' categories') + '. No spreadsheet touched.</p></div>';

        if (!monthSlot.hasChildNodes()) {
          const max = Math.max(...MONTH.map(([, v]) => v));
          monthSlot.innerHTML =
            '<div class="d-out"><h4>Your July so far</h4><div class="barchart">' +
            MONTH.map(([cat, v]) =>
              '<div class="bar-row"><span class="bar-label">' + esc(cat) + '</span>' +
              '<span class="bar-track" title="' + esc(cat) + ': ₪' + v.toLocaleString('en-US') + '">' +
              '<span class="bar-fill" data-w="' + (v / max * 100).toFixed(1) + '" style="width:0"></span>' +
              '<span class="bar-val">₪' + v.toLocaleString('en-US') + '</span></span></div>').join('') +
            '</div>' +
            '<p style="font-size:.9rem;margin:.8rem 0 0">💡 <strong>Eating out is 34% above your three-month average</strong> — almost all of it on Sundays. Want a nudge when a category runs hot?</p>' +
            '</div>';
          requestAnimationFrame(() => {
            for (const bar of monthSlot.querySelectorAll('.bar-fill')) {
              bar.style.width = bar.dataset.w + '%';
            }
          });
        }
      });
    },
  },

  /* ---------------- 4. Bedtime Stories ---------------- */
  story: {
    icon: '🌙',
    title: 'Bedtime Stories, Starring Your Kid',
    package: 'One-shot build',
    render(body) {
      const THEMES = {
        Dinosaurs: {
          place: 'the Whispering Fern Valley',
          buddyIntro: 'a small green triceratops named Pip',
          buddy: 'Pip',
          treasure: 'glowing amber stone',
          feat: 'roar loud enough to echo down the whole valley',
          opener: (n) => n + ' pressed through the giant ferns, following footprints the size of bathtubs.',
        },
        'Outer space': {
          place: 'the rings of Saturn',
          buddyIntro: 'a shy little robot called Bolt',
          buddy: 'Bolt',
          treasure: 'star-cherry — the rarest fruit in the galaxy',
          feat: 'land the rocket softly on the glittering ice moon',
          opener: (n) => 'The rocket’s window filled with stars as Captain ' + n + ' steered past the Moon.',
        },
        Pirates: {
          place: 'Coconut Cove',
          buddyIntro: 'a loud parrot named Biscuit',
          buddy: 'Biscuit',
          treasure: 'golden coconut',
          feat: 'tie the sailor’s knot that holds the mainsail',
          opener: (n) => n + ' stood at the wheel of the good ship Salty Lemon, treasure map flapping in the wind.',
        },
        Unicorns: {
          place: 'the Cloudberry Meadow',
          buddyIntro: 'a unicorn foal called Sprinkle',
          buddy: 'Sprinkle',
          treasure: 'rainbow cloudberry',
          feat: 'jump the sparkling stream in one great leap',
          opener: (n) => n + ' followed a trail of silver hoofprints into the morning mist.',
        },
      };
      const LESSONS = {
        'Being brave': (t, n) => [
          'But at the edge of ' + t.place + ', everything went quiet. Ahead lay a cave — dark, and deep, and ' + n +
          '’s tummy felt like jelly. “I’m scared too,” whispered ' + t.buddy + '. ' + n +
          ' took one big breath and said: “Being brave doesn’t mean not being scared. It means going anyway — together.” So they went: one small step, then another, then another.',
          'On the other side, the morning light was waiting for them. ' + n + ' was still a tiny bit scared — but ten feet taller on the inside.',
        ],
        Sharing: (t, n) => [
          'And there, right in the middle of ' + t.place + ', they found it: one perfect ' + t.treasure +
          '. Just one. ' + n + ' wanted it so much it almost hurt. But ' + t.buddy +
          '’s eyes had gone wide and hopeful too. ' + n + ' thought for a long moment… then smiled. “Half for you, half for me. Treasure tastes better in twos.”',
          'And somehow, half a ' + t.treasure + ' shared with a best friend felt bigger than a whole one alone.',
        ],
        'Trying again': (t, n) => [
          n + ' had one dream that day: to ' + t.feat + '. The first try? A flop. The second? An even bigger flop — ' +
          t.buddy + ' had to duck! ' + n + '’s cheeks went hot. “Maybe I’m just not good at this.” “Or maybe,” said ' +
          t.buddy + ', “you’re two tries closer. Third tries are magic.”',
          'And on the third try — wobbly, imperfect, wonderful — ' + n + ' did it. Not because of magic, it turns out. Because of the two flops that came first.',
        ],
      };

      body.innerHTML =
        '<div class="d-row">' +
        '<span><span class="d-label">Your child’s name</span><input class="d-input" maxlength="20" value="Maya"></span>' +
        '<span><span class="d-label">Tonight’s world</span><select class="d-select theme">' +
        Object.keys(THEMES).map((t) => '<option>' + t + '</option>').join('') + '</select></span>' +
        '<span><span class="d-label">Sneak in a lesson</span><select class="d-select lesson">' +
        Object.keys(LESSONS).map((l) => '<option>' + l + '</option>').join('') + '</select></span>' +
        '</div>' +
        '<button type="button" class="d-btn">✨ Tonight’s story, please</button>' +
        '<div class="out-slot"></div>';

      const slot = body.querySelector('.out-slot');
      body.querySelector('.d-btn').addEventListener('click', async () => {
        const name = (body.querySelector('.d-input').value.trim() || 'Maya').slice(0, 20);
        const t = THEMES[body.querySelector('.theme').value];
        const [middle, ending] = LESSONS[body.querySelector('.lesson').value](t, name);
        await think(slot, 'Writing tonight’s story for ' + name);
        const story = t.opener(name) + ' That’s where ' + name + ' met ' + t.buddyIntro + '.\n\n' +
          middle + '\n\n' + ending + '\n\nThe End 🌙';
        slot.innerHTML = '<div class="paper"></div>' +
          '<p class="d-hint">A different story every single night — same hero. The real version also reads them aloud in a calm voice.</p>';
        await typeInto(slot.querySelector('.paper'), story);
      });
    },
  },

  /* ---------------- 5. Paperwork Pal ---------------- */
  letters: {
    icon: '📄',
    title: 'Paperwork Pal',
    package: 'One-shot build',
    render(body) {
      const SCENARIOS = {
        'Appeal a parking ticket': {
          fields: [['Your name', 'Dana Cohen'], ['Ticket number', '8103467'],
            ['What happened', 'The no-parking sign was completely hidden behind a tree — I have photos.']],
          write: ([name, ticket, detail]) =>
            'To: Municipal Parking Authority — Appeals Department\n' +
            'Subject: Appeal of parking citation no. ' + ticket + '\n\n' +
            'To whom it may concern,\n\n' +
            'I am writing to formally appeal the above citation and respectfully request its cancellation.\n\n' +
            'The circumstances are as follows: ' + detail + ' Given these circumstances, the citation was issued in error, as the restriction was not reasonably visible or applicable at the time.\n\n' +
            'I am happy to provide photographs and any further documentation on request. I would appreciate written confirmation of the appeal’s receipt and its outcome within the statutory response period.\n\n' +
            'Respectfully,\n' + name,
        },
        'Ask the landlord for repairs': {
          fields: [['Your name', 'Dana Cohen'], ['Landlord’s name', 'Mr. Peretz'],
            ['What needs fixing', 'The water heater has been broken for two weeks, despite two phone calls.']],
          write: ([name, landlord, detail]) =>
            'Dear ' + landlord + ',\n\n' +
            'Re: Formal repair request\n\n' +
            'I am writing to put a maintenance issue on record: ' + detail + '\n\n' +
            'Under our rental agreement, repairs of this kind are the landlord’s responsibility, to be addressed within a reasonable time of written notice. Please consider this letter that notice. I would ask that the repair be scheduled within the next 7 days; I am available to coordinate access at your convenience.\n\n' +
            'I appreciate your prompt attention and would be glad to resolve this simply, as we always have.\n\n' +
            'Sincerely,\n' + name,
        },
        'Refund for a cancelled flight': {
          fields: [['Your name', 'Dana Cohen'], ['Flight', 'LY 315, Tel Aviv → Paris, 2 June'],
            ['What happened', 'The flight was cancelled four hours before departure; the offered alternative was two days later.']],
          write: ([name, flight, detail]) =>
            'To: Customer Relations Department\n' +
            'Subject: Refund and compensation request — flight ' + flight + '\n\n' +
            'Dear Sir or Madam,\n\n' +
            'I was booked on the above flight. ' + detail + '\n\n' +
            'As the cancellation was within the airline’s control and the alternative offered was not reasonable, I request: (1) a full refund of the unused ticket, and (2) the compensation and expense reimbursement provided under the passenger-rights rules applicable to this route.\n\n' +
            'Please find my booking reference and receipts attached. I expect a substantive reply within 21 days, failing which I will pursue the matter through the relevant consumer authority.\n\n' +
            'Sincerely,\n' + name,
        },
      };

      body.innerHTML =
        '<span class="d-label">What do you need to deal with?</span>' +
        '<select class="d-select scenario">' +
        Object.keys(SCENARIOS).map((s) => '<option>' + esc(s) + '</option>').join('') +
        '</select>' +
        '<div class="fields"></div>' +
        '<button type="button" class="d-btn">✨ Write it for me</button>' +
        '<div class="out-slot"></div>';

      const fieldsEl = body.querySelector('.fields');
      const scenarioEl = body.querySelector('.scenario');
      const slot = body.querySelector('.out-slot');

      function renderFields() {
        const sc = SCENARIOS[scenarioEl.value];
        fieldsEl.innerHTML = sc.fields.map(([label, val], i) =>
          '<span class="d-label">' + esc(label) + '</span>' +
          (i === sc.fields.length - 1
            ? '<textarea class="d-textarea f" rows="2" maxlength="200">' + esc(val) + '</textarea>'
            : '<input class="d-input f" style="width:100%" maxlength="60" value="' + esc(val) + '">')
        ).join('');
      }
      renderFields();
      scenarioEl.addEventListener('change', () => { renderFields(); slot.innerHTML = ''; });

      body.querySelector('.d-btn').addEventListener('click', async () => {
        const sc = SCENARIOS[scenarioEl.value];
        const values = [...fieldsEl.querySelectorAll('.f')].map((f, i) =>
          f.value.trim() || sc.fields[i][1]);
        await think(slot, 'Drafting the letter');
        slot.innerHTML =
          '<div class="paper letter"></div>' +
          '<button type="button" class="d-btn d-btn-secondary copy" style="margin-top:.8rem">Copy letter</button>' +
          '<p class="d-hint">Firm, polite, and structured the way clerks expect — that’s most of the battle.</p>';
        const paper = slot.querySelector('.paper');
        paper.textContent = sc.write(values);
        slot.querySelector('.copy').addEventListener('click', async (e) => {
          try {
            await navigator.clipboard.writeText(paper.textContent);
            e.target.textContent = 'Copied ✓';
          } catch {
            e.target.textContent = 'Select & copy manually';
          }
        });
      });
    },
  },

  /* ---------------- 6. Review Reply Writer ---------------- */
  reviews: {
    icon: '⭐',
    title: 'Review Reply Writer',
    package: 'Ongoing service',
    render(body) {
      const REVIEWS = [
        { stars: 5, who: 'Dana L.', text: 'The shakshuka is the best in the city and the staff remembered my kids’ names. We come every Friday!' },
        { stars: 3, who: 'Yossi M.', text: 'Food was great, but we waited 25 minutes for a table we had reserved.' },
        { stars: 1, who: 'Anonymous', text: 'Ordered delivery, got someone else’s order, and no one answered the phone. Waste of money.' },
      ];
      const REPLIES = {
        Warm: [
          'Dana, this made our whole week 💛 Friday wouldn’t be Friday without your crew — the kids’ hot chocolates are on us next time. See you soon!\n— Shoshana & the team',
          'Yossi, thank you — and you’re right to call us out. A reservation should mean zero waiting, full stop. We’ve changed how we hold tables on busy nights so it doesn’t repeat. Come back as our guests for dessert?\n— Shoshana & the team',
          'We’re so sorry — wrong order AND no answer is exactly the experience we never want to give. We’ve refunded the meal in full. If you’re willing to give us one more chance, dinner’s on us: just mention this reply.\n— Shoshana & the team',
        ],
        Professional: [
          'Thank you for the wonderful feedback, Dana. We’re delighted the shakshuka and the team’s service stood out — we’ll pass your kind words along. We look forward to seeing your family on Fridays.\n— Café Shoshana',
          'Thank you for your feedback, Yossi. We apologize for the wait despite your reservation; that fell short of our standard. We have since revised our table-holding procedure for peak hours and hope to serve you better on your next visit.\n— Café Shoshana',
          'We sincerely apologize for the mixed-up order and our unavailability by phone. A full refund has been issued. We would welcome the opportunity to make this right — please contact us directly and your next order will be on the house.\n— Café Shoshana',
        ],
        Playful: [
          'Dana!! The kitchen is blushing and the staff are arguing over who your kids like best 😄 Friday = you. Deal? Deal.\n— Team Shoshana 🍳',
          'Yossi, fair cop — 25 minutes is enough time to make a shakshuka AND eat it. We’ve had a word with our tables (and our booking system). Next round of malabi is on us 🍮\n— Team Shoshana',
          'Okay, this one hurts to read — because it’s true and it’s on us. Full refund done, phone rota fixed, kitchen suitably ashamed. Give us one more shot? Dinner’s on the house, no small print.\n— Team Shoshana',
        ],
      };

      body.innerHTML =
        '<p class="d-hint" style="margin:0 0 .6rem">New reviews at <strong>Café Shoshana</strong> this morning. Pick one:</p>' +
        '<div class="review-pick">' +
        REVIEWS.map((r, i) =>
          '<button type="button" class="review-opt" data-i="' + i + '" aria-pressed="' + (i === 0 ? 'true' : 'false') + '">' +
          '<span class="review-stars">' + '★'.repeat(r.stars) + '☆'.repeat(5 - r.stars) + '</span> ' +
          '<span class="review-meta">' + esc(r.who) + '</span><br>' + esc(r.text) + '</button>').join('') +
        '</div>' +
        '<span class="d-label">In what voice?</span>' +
        '<div class="d-chips tones">' + chipsHTML(['Warm', 'Professional', 'Playful'], ['Warm']) + '</div>' +
        '<button type="button" class="d-btn">✨ Draft my reply</button>' +
        '<div class="out-slot"></div>';

      const pick = body.querySelector('.review-pick');
      pick.addEventListener('click', (e) => {
        const btn = e.target.closest('.review-opt');
        if (!btn) return;
        for (const b of pick.querySelectorAll('.review-opt')) b.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-pressed', 'true');
      });
      const getTone = wireChips(body.querySelector('.tones'));

      const slot = body.querySelector('.out-slot');
      body.querySelector('.d-btn').addEventListener('click', async () => {
        const i = Number(pick.querySelector('[aria-pressed="true"]').dataset.i);
        const tone = getTone()[0] || 'Warm';
        await think(slot, 'Writing a ' + tone.toLowerCase() + ' reply in your voice');
        slot.innerHTML = '<div class="paper letter"></div>' +
          '<p class="d-hint">In the real version, drafts land on your phone for one-tap approval — or post automatically. Reviews answered in minutes, 24/7.</p>';
        await typeInto(slot.querySelector('.paper'), REPLIES[tone][i]);
      });
    },
  },

  /* ---------------- 7. Dream Trip Builder ---------------- */
  trip: {
    icon: '✈️',
    title: 'Dream Trip Builder',
    package: 'One-shot build',
    render(body) {
      const ACTS = {
        Rome: [
          ['Colosseum early-entry tour', ['History']], ['Trastevere food crawl', ['Food']],
          ['Pasta-making class with a real nonna', ['Food', 'Family-friendly']],
          ['Rowboats in Villa Borghese', ['Nature', 'Family-friendly']],
          ['Vatican Museums & Sistine Chapel', ['History']],
          ['Gelato-tasting walk (strict scientific method)', ['Food', 'Family-friendly']],
          ['Roman Forum & Palatine Hill', ['History']],
          ['Sunset from the Janiculum terrace', ['Nature']],
          ['Campo de’ Fiori market morning', ['Food']],
          ['Pantheon, then espresso at Sant’Eustachio', ['History', 'Food']],
          ['Bike ride down the ancient Appian Way', ['Nature', 'History']],
          ['Trevi Fountain & hidden courtyards walk', ['History', 'Family-friendly']],
          ['Lunch at Testaccio market', ['Food']],
          ['Gladiator school (kids get wooden swords)', ['Family-friendly', 'History']],
          ['Picnic in the Orange Garden', ['Nature', 'Family-friendly']],
        ],
        Tokyo: [
          ['Tsukiji outer-market breakfast', ['Food']], ['teamLab Planets digital art', ['Family-friendly']],
          ['Senso-ji temple at dawn', ['History']], ['Shibuya crossing & the Hachiko statue', ['Family-friendly']],
          ['Ramen crawl in Shinjuku', ['Food']], ['Meiji shrine forest walk', ['Nature', 'History']],
          ['Sushi-making class', ['Food', 'Family-friendly']], ['Ueno Park & the pandas', ['Nature', 'Family-friendly']],
          ['Edo-Tokyo open-air architecture museum', ['History']], ['Akihabara retro arcades', ['Family-friendly']],
          ['Shinjuku Gyoen gardens', ['Nature']], ['Depachika food-hall dinner hunt', ['Food']],
          ['Day trip: Great Buddha of Kamakura', ['History', 'Nature']],
          ['Harajuku crepes on Takeshita street', ['Food', 'Family-friendly']],
          ['Evening in Golden Gai (for the grown-ups)', ['Food']],
        ],
        'Costa Rica': [
          ['Arenal volcano hike', ['Nature']], ['Zip-lining over the cloud forest', ['Nature', 'Family-friendly']],
          ['Sloth sanctuary visit', ['Nature', 'Family-friendly']],
          ['Coffee-farm tour & tasting', ['Food', 'History']],
          ['Swim under La Fortuna waterfall', ['Nature']],
          ['Chocolate-making workshop, bean to bar', ['Food', 'Family-friendly']],
          ['Manuel Antonio beach (mind the capuchins)', ['Nature', 'Family-friendly']],
          ['Tortilla-making with a local family', ['Food', 'History']],
          ['Hot springs under the stars', ['Nature']],
          ['Night jungle walk — frogs everywhere', ['Nature', 'Family-friendly']],
          ['Monteverde hanging bridges', ['Nature']],
          ['Beginner surf lesson', ['Family-friendly']],
          ['Fruit tasting at the farmers’ feria', ['Food']],
          ['Boruca indigenous crafts village', ['History']],
          ['Sunset catamaran cruise', ['Nature', 'Family-friendly']],
        ],
      };
      const TIPS = {
        Rome: 'Book the Colosseum slot before you fly — it sells out first.',
        Tokyo: 'Get the Suica card at the airport; every train ride becomes a tap.',
        'Costa Rica': 'Rainforest means rain — mornings for adventures, afternoons for hot springs.',
      };
      const SLOTS = ['Morning', 'Afternoon', 'Evening'];

      body.innerHTML =
        '<div class="d-row">' +
        '<span><span class="d-label">Where to?</span><select class="d-select dest">' +
        Object.keys(ACTS).map((d) => '<option>' + esc(d) + '</option>').join('') + '</select></span>' +
        '<span><span class="d-label">How long?</span><span class="d-chips days">' +
        chipsHTML(['3 days', '5 days'], ['3 days']) + '</span></span>' +
        '</div>' +
        '<span class="d-label">What do you love?</span>' +
        '<div class="d-chips wants">' + chipsHTML(['Food', 'History', 'Nature', 'Family-friendly'], ['Food', 'Nature']) + '</div>' +
        '<button type="button" class="d-btn">✨ Build my trip</button>' +
        '<div class="out-slot"></div>';

      const getDays = wireChips(body.querySelector('.days'));
      const getWants = wireChips(body.querySelector('.wants'), { multi: true });
      const slot = body.querySelector('.out-slot');

      body.querySelector('.d-btn').addEventListener('click', async () => {
        const dest = body.querySelector('.dest').value;
        const days = Number((getDays()[0] || '3 days')[0]);
        const wants = getWants();
        const all = ACTS[dest];
        const liked = wants.length ? all.filter(([, tags]) => tags.some((t) => wants.includes(t))) : [...all];
        const rest = all.filter((a) => !liked.includes(a));
        const picks = [...liked, ...rest].slice(0, days * 3);

        await think(slot, 'Planning ' + days + ' days in ' + dest);

        let html = '<div class="d-out"><h4>' + esc(dest) + ' — your ' + days + '-day plan</h4>';
        for (let d = 0; d < days; d++) {
          html += '<div class="day-block"><h5>Day ' + (d + 1) + '</h5><ul>' +
            SLOTS.map((s, i) => {
              const act = picks[d * 3 + i];
              return act ? '<li><span class="slot">' + s + '</span>' + esc(act[0]) + '</li>' : '';
            }).join('') + '</ul></div>';
        }
        html += '<p style="font-size:.9rem;margin:.4rem 0 0">🎒 <strong>Local tip:</strong> ' + esc(TIPS[dest]) + '</p>' +
          '<p class="d-hint">The real version also checks opening days, walking distances and nap-time gaps — and books what can be booked.</p></div>';
        slot.innerHTML = html;
      });
    },
  },

  /* ---------------- 8. Contract Decoder ---------------- */
  contract: {
    icon: '🔍',
    title: 'Contract Decoder',
    package: 'One-shot build',
    render(body) {
      const CLAUSES = [
        ['c1', '1. Term.', 'The lease term is twelve (12) months commencing 1 September 2026, with an option to renew subject to clause 3.'],
        ['c2', '2. Rent.', 'Monthly rent of ₪5,800 is payable on the 1st of each month. Payments more than five days late incur a handling charge.'],
        ['c3', '3. Rent adjustment.', 'Upon renewal, the landlord may adjust the rent by no more than 5%, with written notice at least 60 days before the renewal date.'],
        ['c4', '4. Deposit.', 'A deposit equal to one month’s rent shall be returned within 30 days of vacating, less documented damages beyond reasonable wear.'],
        ['c5', '5. Repairs.', 'The landlord is responsible for structural elements and major systems, including plumbing, heating and the water heater, and shall repair them within 14 days of written notice. Damage caused by tenant misuse is the tenant’s responsibility.'],
        ['c6', '6. Pets.', 'No pets may be kept without the landlord’s prior written consent, which shall not be unreasonably withheld.'],
        ['c7', '7. Early termination.', 'The tenant may terminate early with 60 days’ written notice by presenting a replacement tenant reasonably acceptable to the landlord; otherwise the tenant remains liable for rent until the unit is re-let.'],
        ['c8', '8. Utilities.', 'Electricity, water, gas and municipal taxes (arnona) are payable by the tenant.'],
      ];
      const QA = [
        ['Can I have a dog? 🐕', 'c6', 'Yes — but get it in writing first. Clause 6 says you need the landlord’s written OK, and — the good part — he can’t refuse without a real reason. Send a short message, keep the "yes".'],
        ['What if I need to leave early?', 'c7', 'You have an exit door: give 60 days’ written notice and bring a reasonable replacement tenant (clause 7). Do both and you’re free; skip them and you keep paying until it’s re-let.'],
        ['Who pays if the boiler breaks?', 'c5', 'The landlord — the water heater is named in clause 5. One catch: the 14-day clock only starts when you notify him in writing. A WhatsApp counts; a phone call doesn’t. Write, then wait.'],
        ['Can the rent go up mid-year?', 'c3', 'No. Mid-lease, ₪5,800 is locked. It can rise only at renewal, by 5% at most, and only with 60 days’ written warning (clause 3). A surprise increase in March? Point at this clause.'],
      ];

      body.innerHTML =
        '<div class="lease-wrap">' +
        '<div class="lease-doc"><h5>RESIDENTIAL LEASE AGREEMENT</h5>' +
        CLAUSES.map(([id, head, text]) =>
          '<p class="clause" id="' + id + '"><strong>' + esc(head) + '</strong> ' + esc(text) + '</p>').join('') +
        '</div>' +
        '<div><span class="d-label">Ask your lease a question</span>' +
        '<div class="d-chips qs" style="flex-direction:column;align-items:flex-start">' +
        QA.map(([q], i) => '<button type="button" class="d-chip" data-value="' + i + '" aria-pressed="false">' + esc(q) + '</button>').join('') +
        '</div>' +
        '<div class="answer-box out-slot"></div></div>' +
        '</div>' +
        '<p class="d-hint">This is a sample lease — the real version reads <em>yours</em> (or any contract you’re about to sign).</p>';

      const doc = body.querySelector('.lease-doc');
      const qs = body.querySelector('.qs');
      const slot = body.querySelector('.answer-box');

      qs.addEventListener('click', async (e) => {
        const btn = e.target.closest('.d-chip');
        if (!btn) return;
        for (const b of qs.querySelectorAll('.d-chip')) b.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-pressed', 'true');
        const [, clauseId, answer] = QA[Number(btn.dataset.value)];
        await think(slot, 'Reading the lease');
        slot.innerHTML = '<div class="d-out" style="margin-top:.8rem"><p style="margin:0;font-size:.92rem"></p></div>';
        for (const c of doc.querySelectorAll('.clause')) c.classList.remove('lit');
        const clause = doc.querySelector('#' + clauseId);
        clause.classList.add('lit');
        doc.scrollTo({ top: clause.offsetTop - doc.offsetTop - 8, behavior: reduced() ? 'auto' : 'smooth' });
        await typeInto(slot.querySelector('p'), answer);
      });
    },
  },

  /* ---------------- 9. Price Watchdog ---------------- */
  prices: {
    icon: '📉',
    title: 'Price Watchdog',
    package: 'Ongoing service',
    render(body) {
      const ITEMS = [
        { name: 'Flight TLV → New York, December', target: 'alert under $650', cur: '$693',
          data: [720, 705, 712, 698, 690, 702, 715, 708, 699, 695, 693], drop: 498, dropText: '$498', was: '$693' },
        { name: 'KitchenAid mixer (the red one)', target: 'alert under ₪1,700', cur: '₪1,890',
          data: [1990, 1990, 1950, 1890, 1890, 1920, 1890, 1890, 1870, 1890, 1890] },
        { name: 'Weekend in Eilat, autumn', target: 'alert under ₪800/night', cur: '₪940',
          data: [880, 890, 920, 940, 900, 910, 940, 955, 940, 930, 940] },
      ];

      function sparkSVG(data, hotLast) {
        const w = 110, h = 30, pad = 4;
        const min = Math.min(...data), max = Math.max(...data);
        const pt = (v, i) => {
          const x = pad + (i / (data.length - 1)) * (w - 2 * pad);
          const y = max === min ? h / 2 : pad + (1 - (v - min) / (max - min)) * (h - 2 * pad);
          return x.toFixed(1) + ',' + y.toFixed(1);
        };
        const pts = data.map(pt);
        let inner;
        if (hotLast) {
          inner = '<polyline points="' + pts.slice(0, -1).join(' ') + '"/>' +
            '<polyline class="hot" points="' + pts.slice(-2).join(' ') + '"/>';
        } else {
          inner = '<polyline points="' + pts.join(' ') + '"/>';
        }
        const [ex, ey] = pts[pts.length - 1].split(',');
        inner += '<circle cx="' + ex + '" cy="' + ey + '" r="4"/>';
        return '<svg class="spark" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h +
          '" role="img" aria-label="price history">' + inner + '</svg>';
      }

      function rowHTML(it, alerted) {
        const data = alerted && it.drop ? [...it.data, it.drop] : it.data;
        return '<div class="watch-row' + (alerted && it.drop ? ' alert' : '') + '">' +
          '<span><span class="watch-name">' + esc(it.name) + '</span>' +
          '<span class="watch-target">' + esc(it.target) + '</span></span>' +
          sparkSVG(data, Boolean(alerted && it.drop)) +
          '<span class="watch-price">' + (alerted && it.drop
            ? esc(it.dropText) + '<span class="drop">▼ was ' + esc(it.was) + '</span>'
            : esc(it.cur)) + '</span>' +
          '</div>';
      }

      function render(alerted) {
        return '<p class="d-hint" style="margin:0 0 .7rem">Three things you told it to watch. It checks every morning so you never have to:</p>' +
          '<div class="rows">' + ITEMS.map((it) => rowHTML(it, alerted)).join('') + '</div>' +
          '<button type="button" class="d-btn"' + (alerted ? ' disabled' : '') + '>' +
          (alerted ? 'Checked today ✓' : '▶ Run this morning’s check') + '</button>' +
          '<div class="toast-slot"></div>';
      }

      body.innerHTML = '<div class="pw-root"></div>';
      const root = body.querySelector('.pw-root');
      root.innerHTML = render(false);
      root.addEventListener('click', async (e) => {
        const btn = e.target.closest('.d-btn');
        if (!btn || btn.disabled) return;
        btn.disabled = true;
        const toastSlot = root.querySelector('.toast-slot');
        await think(toastSlot, 'Checking 3 sites');
        root.innerHTML = render(true);
        root.querySelector('.toast-slot').innerHTML =
          '<div class="toast"><span>📬</span><span><strong>Price alert emailed:</strong> the December flight to New York just dropped 28% to $498 — under your $650 target. Fares like this usually vanish within a day or two.</span></div>' +
          '<p class="d-hint">It did this while you were making coffee. It will do it again tomorrow.</p>';
      });
    },
  },

  /* ---------------- 10. Study Buddy ---------------- */
  quiz: {
    icon: '📚',
    title: 'Study Buddy',
    package: 'One-shot build',
    render(body) {
      const MATERIAL = 'The water cycle describes how water moves around our planet. The sun heats seas and lakes, turning water into vapor — this is called evaporation. The vapor rises, cools, and condenses into tiny droplets that form clouds. When the droplets grow heavy, they fall as rain or snow — precipitation. The water gathers in rivers, lakes and oceans, and the cycle begins again.';
      const QUESTIONS = [
        { q: 'What makes water evaporate from the sea?', opts: ['The wind pushing it', 'The sun’s heat', 'Fish swimming around'], right: 1,
          yes: 'Nice! ☀️ The sun’s heat it is.', no: 'Not quite — it’s the sun’s heat that turns water into vapor.' },
        { q: 'What are clouds made of?', opts: ['Tiny droplets of condensed water vapor', 'Smoke from chimneys', 'Cotton candy (sadly, no)'], right: 0,
          yes: 'Exactly — tiny droplets, billions of them. ☁️', no: 'Nope — clouds are tiny droplets of condensed water vapor.' },
        { q: 'What’s it called when water falls back down?', opts: ['Evaporation', 'Condensation', 'Precipitation'], right: 2,
          yes: 'Precipitation — the fancy word for rain. 🌧️', no: 'That’s the other direction! Falling rain or snow is precipitation.' },
        { q: 'Where does rainwater go next?', opts: ['It disappears forever', 'Rivers, lakes and seas — then the cycle restarts', 'Straight up to the Moon'], right: 1,
          yes: 'Right — and round it goes again. 🔄', no: 'It gathers in rivers, lakes and seas — and the whole cycle restarts.' },
      ];

      body.innerHTML =
        '<span class="d-label">Tonight’s study material (sample)</span>' +
        '<div class="paper" style="margin-top:.3rem;font-size:.92rem">' + esc(MATERIAL) + '</div>' +
        '<p class="d-hint">The real version eats any worksheet, chapter or photo of messy notes.</p>' +
        '<button type="button" class="d-btn">✨ Turn it into a quiz</button>' +
        '<div class="out-slot"></div>';

      const slot = body.querySelector('.out-slot');
      const startBtn = body.querySelector('.d-btn');
      let idx = 0, score = 0;

      function showQuestion() {
        const item = QUESTIONS[idx];
        slot.innerHTML =
          '<div class="d-out"><p class="quiz-progress">Question ' + (idx + 1) + ' of ' + QUESTIONS.length +
          ' · Score ' + score + '</p>' +
          '<p class="quiz-q">' + esc(item.q) + '</p>' +
          '<div class="quiz-opts">' +
          item.opts.map((o, i) => '<button type="button" class="quiz-opt" data-i="' + i + '">' + esc(o) + '</button>').join('') +
          '</div><div class="fb"></div></div>';

        slot.querySelector('.quiz-opts').addEventListener('click', (e) => {
          const btn = e.target.closest('.quiz-opt');
          if (!btn) return;
          const picked = Number(btn.dataset.i);
          const opts = slot.querySelectorAll('.quiz-opt');
          for (const o of opts) o.disabled = true;
          opts[item.right].classList.add('correct');
          const ok = picked === item.right;
          if (ok) score++; else btn.classList.add('wrong');
          slot.querySelector('.fb').innerHTML =
            '<p class="quiz-feedback">' + esc(ok ? item.yes : item.no) + '</p>' +
            '<button type="button" class="d-btn next" style="margin-top:.7rem">' +
            (idx + 1 < QUESTIONS.length ? 'Next question →' : 'See my score') + '</button>';
          slot.querySelector('.next').addEventListener('click', () => {
            idx++;
            if (idx < QUESTIONS.length) showQuestion(); else showScore();
          });
        }, { once: false });
      }

      function showScore() {
        const titles = ['Rainy-day rookie — one more round?', 'Getting there! The clouds approve.',
          'Solid! Almost a water-cycle wizard.', 'Water-cycle wizard 🧙 Full marks!'];
        slot.innerHTML =
          '<div class="d-out" style="text-align:center"><h4 style="font-size:1.6rem;margin:.2rem 0">' +
          score + ' / ' + QUESTIONS.length + '</h4>' +
          '<p style="margin:.2rem 0 1rem">' + esc(titles[Math.max(0, score - 1)]) + '</p>' +
          '<button type="button" class="d-btn again">Play again</button>' +
          '<p class="d-hint">Same trick works for history dates, English vocabulary, driving-theory tests…</p></div>';
        slot.querySelector('.again').addEventListener('click', () => { idx = 0; score = 0; showQuestion(); });
      }

      startBtn.addEventListener('click', async () => {
        startBtn.disabled = true;
        await think(slot, 'Reading the material and writing questions');
        idx = 0; score = 0;
        showQuestion();
      });
    },
  },
};
