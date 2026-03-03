// Exports: Room, Std, SeatArranger

import { findLimits } from "./findLimits";

class Room {
  constructor({rno, strength, rows}) {
    this.rno = rno;
    this.strength = strength;
    this.row1 = Math.floor(strength / 2);
    this.row2 = Math.floor(strength / 2);
    this.no_of_rows = rows;
    this.dt = { row1: [], row2: [] };
    this.record = { room: rno, nor: this.no_of_rows, row1: [], row2: [] };
    this.subj = { row1: [], row2: [] };
    this.rmss = 0;
  }

  // Returns true if there are seats available in either row
  isEmpty() {
    return this.row1 !== 0 || this.row2 !== 0;
  }

  desc() {
    return `${this.rno} is Alloted to ${JSON.stringify(this.dt)}\nrecord is ${JSON.stringify(
      this.record
    )}`;
  }

  canFill(std, row) {
    // if branch already present in any row, can't place
    if (this.dt.row1.includes(std.branch) || this.dt.row2.includes(std.branch)) {
      return false;
    }
    // if the subject exists in the other row, can't place
    for (const r of Object.keys(this.subj)) {
      if (r !== row && this.subj[r].includes(std.sub)) {
        return false;
      }
    }
    return true;
  }

  vacentroom() {
    this.row1 = Math.floor(this.strength / 2);
    this.row2 = Math.floor(this.strength / 2);
    this.dt = { row1: [], row2: [] };
    this.record = { room: this.rno, nor: this.no_of_rows, row1: [], row2: [] };
    this.subj = { row1: [], row2: [] };
  }

  fill(std) {
    if (this.row1 >= this.row2 && this.canFill(std, 'row1')) {
      const temp = Math.min(std.strength - std.filled, this.row1);

      if (temp !== 0) {
        this.dt.row1.push(std.branch);
        this.subj.row1.push(std.sub);
        const slice = std.rollnum.slice(std.filled, std.filled + temp);
        this.record.row1 = (this.record.row1 || []).concat(slice);
        std.alloted_rooms.push({
          rno: this.rno,
          limits: findLimits(slice),
          row: 1,
          branch: std.branch,
          total: temp,
        });
      }
      std.filled += temp;
      this.row1 -= temp;
    } else if (this.row2 !== 0 && this.canFill(std, 'row2')) {
      const temp = Math.min(std.strength - std.filled, this.row2);

      if (temp !== 0) {
        this.dt.row2.push(std.branch);
        this.subj.row2.push(std.sub);
        const slice = std.rollnum.slice(std.filled, std.filled + temp);
        this.record.row2 = (this.record.row2 || []).concat(slice);
        std.alloted_rooms.push({
          rno: this.rno,
          limits: findLimits(slice),
          row: 2,
          branch: std.branch,
          total: temp,
        });
      }
      std.filled += temp;
      this.row2 -= temp;
    }
  }
}

class Std {
  constructor({branch, strength, subject, rollnums}) {
    this.branch = branch;
    this.strength = strength;
    this.filled = 0;
    this.sub = subject;
    this.alloted_rooms = [];
    this.rollnum = rollnums;
  }

  isLeft() {
    return this.filled < this.strength;
  }

  vacentRoom() {
    this.filled = 0;
    this.alloted_rooms = [];
  }
}

class SeatArranger {
  constructor(roomList, branchList) {
    this.roomList = roomList;
    this.branchList = branchList;
    this.completed = [];
  }

  arrange() {
    // Randomly fill rooms until branches are exhausted or a safety counter is reached
    const rmss = this.roomList.slice();
    let count = 0;
    for (const b of this.branchList) {
      while (b.isLeft()) {
        count += 1;
        if (count > 1000) break;
        const idx = Math.floor(Math.random() * rmss.length);
        const rm = rmss[idx];
        if (!rm.isEmpty()) {
          // remove and continue
          rmss.splice(idx, 1);
          continue;
        }
        rm.fill(b);
      }
    }
  }

  arr1() {
    this.emptyRooms();
    let count = 0;
    const rmss = this.roomList.slice();
    this.completed = [];

    for (const b of this.branchList) {
      while (b.isLeft()) {
        count += 1;
        if (count > 1000) break;
        const idx = Math.floor(Math.random() * rmss.length);
        const rm = rmss[idx];
        if (!rm.isEmpty()) {
          this.completed.push(rm);
          rmss.splice(idx, 1);
          continue;
        }
        rm.fill(b);
      }
    }

    this.completed = this.completed.concat(rmss);
    // return flattened alloted_rooms
    return this.branchList.flatMap((x) => x.alloted_rooms);
  }

  getAttChart() {
    return this.completed.map((r) => r.record);
  }

  emptyRooms() {
    for (const r of this.roomList) r.vacentroom();
    for (const b of this.branchList) b.vacentRoom();
  }

  desc() {
    console.log('branch\troom\tsub\tfrom-to');
    for (const br of this.branchList) {
      for (const j of br.alloted_rooms) {
        console.log(`${br.branch}\t${j.rno}\t ${br.sub}\t ${j.limits}\t`);
      }
      console.log();
    }
  }
}

export { Room, Std, SeatArranger };
