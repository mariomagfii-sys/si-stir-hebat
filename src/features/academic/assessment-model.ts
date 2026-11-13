export const assessmentTypes = {
  formative: 'Formatif', summative: 'Sumatif', project: 'Proyek',
  practical: 'Praktik/keterampilan', character: 'Sikap dan karakter',
} as const

export type Assessment = {
  id: string; title: string; assessment_type: keyof typeof assessmentTypes; held_on: string
  maximum_score: number; class_name: string; subject_name: string; status: 'draft' | 'published'
  revision: number; student_count: number; graded_count: number
}
export type AssessmentResult = {
  id: string; student_code: string; student_name: string; score: number | null; feedback: string; revision: number
}
export const assessmentFields = 'id,title,assessment_type,held_on,maximum_score,class_name,subject_name,status,revision,student_count,graded_count'
export const resultFields = 'id,student_code,student_name,score,feedback,revision'

export function parseScore(value: string, maximum: number): number | null | undefined {
  if (!value.trim()) return null
  if (!/^\d+(\.\d{1,2})?$/.test(value.trim())) return undefined
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 && number <= maximum ? number : undefined
}
