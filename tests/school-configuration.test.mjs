import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const MIGRATION = 'supabase/migrations/20261121090000_school_configuration.sql';
const ID = {
  admin: '00000000-0000-0000-0000-0000000000a1',
  principal: '00000000-0000-0000-0000-0000000000b1',
  teacher: '00000000-0000-0000-0000-0000000000c1',
  student: '00000000-0000-0000-0000-0000000000d1',
  parent: '00000000-0000-0000-0000-0000000000e1',
  pending: '00000000-0000-0000-0000-0000000000f1',
};
let db;

async function as(who, fn) {
  await db.exec(`set role authenticated; select set_config('test.uid','${ID[who]}',false);`);
  try { return await fn(); } finally { await db.exec('reset role;'); }
}
const denied = (p) => assert.rejects(p, /permission denied|row-level security|Hanya|violates|tidak valid|belum disetujui|tidak ditemukan/i);

before(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth;
    create function auth.uid() returns uuid language sql stable
      as $$ select nullif(current_setting('test.uid', true), '')::uuid $$;
    grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;
    create table public.profiles (id uuid primary key, role text not null);
    grant usage on schema public to anon, authenticated;
    grant select on public.profiles to authenticated;
    create schema school_private;
  `);
  for (const [role, id] of Object.entries(ID)) {
    await db.query('insert into public.profiles values ($1,$2)', [id, role === 'admin' ? 'administrator' : role]);
  }
  await db.exec(readFileSync(MIGRATION, 'utf8'));
});

test('anon tidak punya akses ke tabel konfigurasi', async () => {
  await db.exec('set role anon;');
  try {
    await denied(db.query('select * from public.grading_settings'));
    await denied(db.query('select * from public.retention_policies'));
  } finally { await db.exec('reset role;'); }
});

test('data awal: KKM 75, retensi supervisi 1 tahun ajaran, status guru lima', async () => {
  const k = await as('teacher', () => db.query('select kkm from public.grading_settings'));
  assert.equal(Number(k.rows[0].kkm), 75);
  const r = await as('admin', () => db.query("select retention_years, retention_unit, action from public.retention_policies where category='supervision_evidence'"));
  assert.deepEqual(r.rows[0], { retention_years: 1, retention_unit: 'academic_years', action: 'delete' });
  const s = await as('teacher', () => db.query('select count(*)::int n from public.teacher_attendance_status_types'));
  assert.equal(s.rows[0].n, 5);
});

test('retensi: hanya admin mengubah; kepala sekolah baca; guru tidak melihat', async () => {
  await as('admin', () => db.query("update public.retention_policies set retention_years=5 where category='attendance'"));
  const r = await as('principal', () => db.query("select retention_years from public.retention_policies where category='attendance'"));
  assert.equal(r.rows[0].retention_years, 5);
  const u = await as('principal', () => db.query("update public.retention_policies set retention_years=9 where category='attendance'"));
  assert.equal(u.affectedRows, 0);
  const g = await as('teacher', () => db.query('select * from public.retention_policies'));
  assert.equal(g.rows.length, 0);
  await as('admin', () => denied(db.query("update public.retention_policies set category='x' where category='audit'")));
});

test('KKM: admin ubah, peran lain 0 baris; nilai di luar 0-100 ditolak', async () => {
  const u = await as('teacher', () => db.query('update public.grading_settings set kkm=50'));
  assert.equal(u.affectedRows, 0);
  await as('admin', () => denied(db.query('update public.grading_settings set kkm=101')));
  await as('admin', () => db.query('update public.grading_settings set kkm=75'));
  const pend = await as('pending', () => db.query('select * from public.grading_settings'));
  assert.equal(pend.rows.length, 0);
});

test('status absensi guru: admin menambah, kode tidak dapat diubah, siswa tidak membaca', async () => {
  await as('admin', () => db.query("insert into public.teacher_attendance_status_types (code,label) values ('cuti','Cuti')"));
  await as('admin', () => denied(db.query("update public.teacher_attendance_status_types set code='cuti2' where code='cuti'")));
  await as('teacher', () => denied(db.query("insert into public.teacher_attendance_status_types (code,label) values ('x1','X')")));
  const s = await as('student', () => db.query('select * from public.teacher_attendance_status_types'));
  assert.equal(s.rows.length, 0);
});

test('jenis dokumen guru: admin menulis, guru membaca, nama unik tanpa beda huruf', async () => {
  await as('admin', () => db.query("insert into public.teacher_document_types (name,category) values ('Prota','perencanaan')"));
  await as('admin', () => denied(db.query("insert into public.teacher_document_types (name,category) values ('prota','perencanaan')")));
  const g = await as('teacher', () => db.query('select name from public.teacher_document_types'));
  assert.equal(g.rows.length, 1);
  await as('teacher', () => denied(db.query("insert into public.teacher_document_types (name,category) values ('Promes','perencanaan')")));
});

test('kalender: semua peran sekolah membaca, pending tidak, admin menulis, tanggal akhir valid', async () => {
  await as('admin', () => db.query("insert into public.school_calendar_events (event_date,kind,title) values ('2026-12-25','hari_besar','Contoh')"));
  for (const who of ['principal', 'teacher', 'student', 'parent']) {
    const r = await as(who, () => db.query('select * from public.school_calendar_events'));
    assert.equal(r.rows.length, 1, who);
  }
  const p = await as('pending', () => db.query('select * from public.school_calendar_events'));
  assert.equal(p.rows.length, 0);
  await as('parent', () => denied(db.query("insert into public.school_calendar_events (event_date,kind,title) values ('2026-12-26','libur','X')")));
  await as('admin', () => denied(db.query("insert into public.school_calendar_events (event_date,end_date,kind,title) values ('2026-12-26','2026-12-20','libur','X')")));
});

test('permintaan penghapusan: admin membuat, hanya kepala sekolah memutuskan, admin mencatat pelaksanaan', async () => {
  const ins = "insert into public.deletion_requests (requester_name,subject_type,subject_description,reason) values ('Pemohon Contoh','student','Data contoh','Permintaan wali') returning id";
  await as('teacher', () => denied(db.query(ins)));
  const id = (await as('admin', () => db.query(ins))).rows[0].id;
  await as('admin', () => denied(db.query(`update public.deletion_requests set status='approved' where id='${id}'`)));
  await as('admin', () => denied(db.query(`select public.decide_deletion_request('${id}', true, 'disetujui')`)));
  await as('principal', () => denied(db.query(`select public.decide_deletion_request('${id}', true, 'x')`)));
  await as('principal', () => denied(db.query(`select public.execute_deletion_request('${id}', 'sudah dilakukan')`)));
  await as('admin', () => denied(db.query(`select public.execute_deletion_request('${id}', 'sudah dilakukan')`)));
  await as('principal', () => db.query(`select public.decide_deletion_request('${id}', true, 'disetujui kepala sekolah')`));
  await as('principal', () => denied(db.query(`select public.decide_deletion_request('${id}', false, 'putusan ulang')`)));
  await as('principal', () => denied(db.query(`select public.execute_deletion_request('${id}', 'sudah dilakukan')`)));
  await as('admin', () => db.query(`select public.execute_deletion_request('${id}', 'sudah dilakukan')`));
  const row = (await as('principal', () => db.query(`select status, decided_by, executed_by from public.deletion_requests where id='${id}'`))).rows[0];
  assert.equal(row.status, 'executed');
  assert.equal(row.decided_by, ID.principal);
  assert.equal(row.executed_by, ID.admin);
  const g = await as('teacher', () => db.query('select * from public.deletion_requests'));
  assert.equal(g.rows.length, 0);
});

test('anon tidak dapat menjalankan RPC penghapusan', async () => {
  await db.exec('set role anon;');
  try {
    await denied(db.query("select public.decide_deletion_request(gen_random_uuid(), true, 'catatan')"));
  } finally { await db.exec('reset role;'); }
});
