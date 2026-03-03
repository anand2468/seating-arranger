export function generateSeating(rooms, students) {

  /* ---------------- PREPARE GROUPS ---------------- */

  const groups = students
    .filter(s => s.checked)
    .map(s => ({
      branch: s.branch,
      subject: s.subject,
      rolls: [...s.rollnums],
      index: 0
    }));

  const hasStudents = g => g.index < g.rolls.length;
  const remaining = g => g.rolls.length - g.index;

  function take(g, count) {
    const out = g.rolls.slice(g.index, g.index + count);
    g.index += out.length;
    return out;
  }

  /* ---------------- ROOM PREPARATION ---------------- */

  const activeRooms = rooms
    .filter(r => r.checked)
    .map(r => {
      const layoutSeats =
        Number(r.rows) * Number(r.columns) * 2;

      return {
        rno: r.rno,
        capacity: Math.min(layoutSeats, Number(r.strength)),
        benches: Math.floor(
          Math.min(layoutSeats, Number(r.strength)) / 2
        )
      };
    });

  /* ---------------- OUTPUT ---------------- */

  const roomWise = {};
  const brief = [];

  /* ---------------- RANGE COMPRESSOR ---------------- */

  const extractNum = r => Number(r.match(/\d+$/)?.[0] || 0);

  function compressRolls(rolls) {
    if (!rolls.length) return [];

    let res = [];
    let start = rolls[0];
    let prev = rolls[0];

    for (let i = 1; i < rolls.length; i++) {
      const curr = rolls[i];

      if (extractNum(curr) === extractNum(prev) + 1) {
        prev = curr;
      } else {
        res.push(formatRange(start, prev));
        start = curr;
        prev = curr;
      }
    }

    res.push(formatRange(start, prev));
    return res;
  }

  function formatRange(a, b) {
    return a === b ? a : `${a}–${b}`;
  }

  /* ---------------- GROUP PICKERS ---------------- */

  function pickFirstAvailable() {
    return groups.find(hasStudents);
  }

  function pickCompatible(subject) {
    return groups.find(
      g => hasStudents(g) && g.subject !== subject
    );
  }

  /* ---------------- MAIN SEATING ---------------- */

  activeRooms.forEach(room => {

    let benchesLeft = room.benches;
    let seatsLeft = room.capacity;

    const row1 = [];
    const row2 = [];

    while (benchesLeft > 0) {

      const g1 = pickFirstAvailable();
      if (!g1) break;

      const g2 = pickCompatible(g1.subject);

      /* ---------- NORMAL BLOCK (PAIR) ---------- */
      if (g2) {

        const blockSize = Math.min(
          benchesLeft,
          remaining(g1),
          remaining(g2)
        );

        const r1 = take(g1, blockSize);
        const r2 = take(g2, blockSize);

        row1.push(...r1);
        row2.push(...r2);

        benchesLeft -= blockSize;
        seatsLeft -= blockSize * 2;

        brief.push({
          rno: room.rno,
          row: 1,
          branch: g1.branch,
          rolls: r1
        });

        brief.push({
          rno: room.rno,
          row: 2,
          branch: g2.branch,
          rolls: r2
        });
      }
      /* ---------- SINGLE SEATING ---------- */
      else {

        const count = Math.min(
          seatsLeft,
          remaining(g1)
        );

        const r1 = take(g1, count);
        row1.push(...r1);

        seatsLeft -= r1.length;
        benchesLeft = 0;

        brief.push({
          rno: room.rno,
          row: 1,
          branch: g1.branch,
          rolls: r1
        });
      }
    }

    roomWise[room.rno] = {
      room_number: room.rno,
      row1,
      row2
    };
  });

  /* ---------------- FORMAT BRIEF ---------------- */

  const finalBrief = [];

  brief.forEach(b => {
    const ranges = compressRolls(b.rolls);

    ranges.forEach(range => {
      finalBrief.push({
        rno: b.rno,
        row: b.row,
        branch: b.branch,
        range
      });
    });
  });

  return { roomWise, brief: finalBrief };
}