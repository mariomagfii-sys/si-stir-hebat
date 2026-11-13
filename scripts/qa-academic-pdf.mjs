// Synthetic pagination fixture; never queries the school's database.
import { mkdir, writeFile } from 'node:fs/promises'
import { createAcademicPdf } from '../src/features/academic/academic-report-pdf.ts'

const rows = Array.from({ length: 80 }, (_, index) => ({
  id: `result-${index}`, student_id: `student-${index}`, student_code: `00${index}`,
  student_name: `Data Contoh Siswa ${String(index + 1).padStart(3, '0')} — Éka Dwi dengan nama yang cukup panjang`,
  score: index === 0 ? 0 : index === 1 ? null : 18.5,
  assessments: {
    id: `assessment-${index}`, class_id: 'class-example', class_name: 'Data Contoh Kelas 1A',
    subject_id: 'subject-example', subject_name: 'Pendidikan Agama dan Budi Pekerti',
    title: `Data Contoh Asesmen ${String(index + 1).padStart(3, '0')} — Penilaian pemahaman bacaan dan penerapan konsep dalam kegiatan pembelajaran sehari-hari dengan judul panjang`,
    assessment_type: 'formative', held_on: '2026-11-12', maximum_score: 20, status: index === 1 ? 'draft' : 'published',
  },
}))
const pdf = await createAcademicPdf(rows, { start: '2026-11-01', end: '2026-11-12', loaded: '12/11/2026, 12.00.00',
  classLabel: 'Data Contoh Kelas 1A', subjectLabel: 'Pendidikan Agama dan Budi Pekerti',
  studentLabel: 'Semua siswa yang diizinkan', statusLabel: 'Semua status yang diizinkan' })
await mkdir('test-results/pdf-fixtures', { recursive: true })
await writeFile('test-results/pdf-fixtures/academic-long.pdf', await pdf.getBuffer())
console.log('Created synthetic 80-row PDF at test-results/pdf-fixtures/academic-long.pdf')
