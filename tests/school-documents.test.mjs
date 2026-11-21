import test from 'node:test'
import assert from 'node:assert/strict'

test('school documents API uses bounded pagination and omits private payload fields', async () => {
  const { daftarDokumenSekolah, riwayatVersiDokumen } = await import('../src/features/school-documents/api/index.ts')
  const rows = Array.from({ length: 26 }, (_, index) => ({ id: String(index), title: 'Data Contoh' }))
  let queriedTable = ''
  let range
  const client = {
    from(table) {
      queriedTable = table
      return {
        select(columns) { assert.equal(columns.includes('review_note'), true); return this },
        order() { return this },
        eq() { return this },
        range(start, end) { range = [start, end]; return this },
        then(resolve) { return resolve({ data: rows, error: null }) },
      }
    },
  }
  const page = await daftarDokumenSekolah(client, 0, 'submitted')
  assert.equal(queriedTable, 'school_documents')
  assert.deepEqual(range, [0, 25])
  assert.equal(page.items.length, 25)
  assert.equal(page.hasMore, true)
  await assert.rejects(daftarDokumenSekolah(client, -1), /Halaman/)
  await assert.rejects(riwayatVersiDokumen(client, ' '), /Identitas/)
})

test('document status API uses revision guard and requires a reason for revision requests', async () => {
  const { tindakLanjutDokumen } = await import('../src/features/school-documents/api/index.ts')
  let payload
  let filters = []
  const query = {
    update(value) { payload = value; return this },
    eq(key, value) { filters.push([key, value]); return this },
    select() { return this },
    async single() { return { data: { id: 'doc-1', status: payload.status, revision: payload.revision }, error: null } },
  }
  const client = { from() { return query } }
  await assert.rejects(tindakLanjutDokumen(client, 'doc-1', 0, 'needs_revision', 'x'), /Catatan revisi/)
  const result = await tindakLanjutDokumen(client, 'doc-1', 4, 'submitted')
  assert.deepEqual(payload, { status: 'submitted', revision: 5 })
  assert.deepEqual(filters, [['id', 'doc-1'], ['revision', 4]])
  assert.equal(result.status, 'submitted')
})

test('document upload enforces client bounds and discards only an unuploaded draft on failure', async () => {
  const { buatDrafDokumenSekolah } = await import('../src/features/school-documents/api/index.ts')
  let metadata
  let uploadedPath
  let cleanup
  const uploadFailure = new Error('synthetic upload failure')
  const query = {
    insert(value) { metadata = value; return this },
    select() { return this },
    async single() { return { data: { ...metadata, owner_profile_id: 'teacher-1', status: 'draft', revision: 0 }, error: null } },
  }
  const client = {
    from(table) { assert.equal(table, 'school_documents'); return query },
    storage: { from(bucket) { assert.equal(bucket, 'school-documents'); return { async upload(path) { uploadedPath = path; return { error: uploadFailure } } } } },
    async rpc(name, args) { cleanup = [name, args]; return { data: null, error: null } },
  }
  const file = { name: '../../rencana final.pdf', type: 'application/pdf', size: 200 }
  await assert.rejects(buatDrafDokumenSekolah(client, { category: 'rkt', title: 'Data Contoh Rencana', file }), error => error === uploadFailure)
  assert.match(uploadedPath, /^[0-9a-f-]{36}\/[0-9a-f-]{36}-rencana_final\.pdf$/)
  assert.equal(metadata.file_path, uploadedPath)
  assert.deepEqual(cleanup, ['discard_unuploaded_school_document_draft', { target_id: metadata.id, expected_revision: 0 }])
  await assert.rejects(buatDrafDokumenSekolah(client, { category: 'rkt', title: 'Data Contoh', file: { ...file, type: 'text/plain' } }), /Berkas harus/)
})
