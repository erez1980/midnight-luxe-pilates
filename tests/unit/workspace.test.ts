import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { acknowledge, changeCollection, emptyWorkspace, mergeRemote, readWorkspace, writeWorkspace } from '../../src/utils/workspace.ts';
import { lesson, MemoryStorage } from '../fixtures.ts';
import type { CloudRow } from '../../src/utils/workspace.ts';
beforeEach(() => { Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: new MemoryStorage() }); });
const row: CloudRow = { collection: 'lessons', id: lesson.id, lesson, revision: 'v1', deleted: false };

test('opening a new device pulls cloud records without generating writes or deletes', () => {
  const merged = mergeRemote(emptyWorkspace(), [row]);
  assert.deepEqual(merged.workspace.lessons, [lesson]);
  assert.deepEqual(merged.workspace.pending, {});
  assert.deepEqual(merged.conflicts, []);
});
test('local stores and intentionally empty libraries are isolated per account', () => {
  writeWorkspace('A', { ...emptyWorkspace(), lessons: [lesson] });
  writeWorkspace('B', emptyWorkspace());
  assert.equal(readWorkspace('A').lessons.length, 1);
  assert.deepEqual(readWorkspace('B').lessons, []);
  assert.deepEqual(readWorkspace('guest').lessons, []);
});
test('only an explicitly removed record becomes a tombstone', () => {
  const initial = mergeRemote(emptyWorkspace(), [row]).workspace;
  const next = changeCollection(initial, 'lessons', []);
  assert.equal(next.pending['lessons:lesson-test'].deleted, true);
  assert.equal(next.pending['lessons:lesson-test'].expectedRevision, 'v1');
  const remoteDelete = mergeRemote(initial, [{ ...row, deleted: true, revision: 'v2' }]);
  assert.deepEqual(remoteDelete.workspace.lessons, []);
  assert.deepEqual(remoteDelete.workspace.pending, {});
});
test('a conflicting remote edit preserves local work until explicit resolution', () => {
  const initial = mergeRemote(emptyWorkspace(), [row]).workspace;
  const local = changeCollection(initial, 'lessons', [{ ...lesson, name: 'מקומי' }]);
  const merged = mergeRemote(local, [{ ...row, lesson: { ...lesson, name: 'מרוחק' }, revision: 'v2' }]);
  assert.deepEqual(merged.conflicts, ['lessons:lesson-test']);
  assert.equal(merged.workspace.lessons[0].name, 'מקומי');
  // Editing again does not silently accept the newly observed remote revision.
  const again = changeCollection(merged.workspace, 'lessons', [{ ...lesson, name: 'מקומי נוסף' }]);
  assert.equal(again.pending['lessons:lesson-test'].expectedRevision, 'v1');
});
test('an edit made during a network write stays pending and rebases onto the acknowledged version', () => {
  let workspace = changeCollection(emptyWorkspace(), 'lessons', [lesson]);
  const sent = workspace.pending['lessons:lesson-test'];
  workspace = changeCollection(workspace, 'lessons', [{ ...lesson, name: 'שינוי נוסף' }]);
  workspace = acknowledge(workspace, sent, 'server-v1');
  assert.equal(workspace.pending['lessons:lesson-test'].lesson.name, 'שינוי נוסף');
  assert.equal(workspace.pending['lessons:lesson-test'].expectedRevision, 'server-v1');
  const final = acknowledge(workspace, workspace.pending['lessons:lesson-test'], 'server-v2');
  assert.deepEqual(final.pending, {});
});
test('corrupt local data is reported and is not overwritten', () => {
  localStorage.setItem('pilates:workspace:v3:A', 'broken');
  assert.throws(() => readWorkspace('A'));
  assert.equal(localStorage.getItem('pilates:workspace:v3:A'), 'broken');
});
