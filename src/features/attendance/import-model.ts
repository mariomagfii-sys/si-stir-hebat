import { attendanceLabels, type AttendanceChange, type AttendanceRecord, type AttendanceStatus } from './attendance-model.ts'

export const importHeaders = ['Kode siswa','Status','Alasan koreksi']
export const maxImportBytes = 2 * 1024 * 1024
export type ImportPreviewRow = { line: number; code: string; name: string; before: AttendanceStatus | null; after: AttendanceStatus | null; reason: string; changed: boolean }
export type ImportPlan = { rows: ImportPreviewRow[]; changes: AttendanceChange[]; errors: string[] }
export function validateImportFile(name: string, size: number) {
  if (!/\.xlsx$/i.test(name)) return 'Gunakan file Excel .xlsx, bukan .xls atau .xlsm.'
  if(name.length>120 || name.includes('/') || name.includes(String.fromCharCode(92)) || [...name].some(char=>char.charCodeAt(0)<32 || char.charCodeAt(0)===127)) return 'Gunakan nama file sederhana maksimal 120 karakter, tanpa path atau karakter kontrol.'
  if (!size || size > maxImportBytes) return 'Ukuran file harus lebih dari 0 dan maksimal 2 MB.'
  return ''
}
export function templateRows(records: AttendanceRecord[], sessionLabel:string) {
  return [['Sesi absensi',sessionLabel],importHeaders,...records.map(record=>[record.student_code,record.status ? attendanceLabels[record.status] : '', ''])]
}
export function validateImportRows(raw: unknown[][], records: AttendanceRecord[], sessionLabel:string): ImportPlan {
  const input=raw.map(row=>{
    const cells=[...row]
    while(cells.length && (cells.at(-1)===null || cells.at(-1)===undefined || cells.at(-1)==='')) cells.pop()
    return cells
  })
  const plan: ImportPlan={rows:[],changes:[],errors:[]}
  const normalize=(value:unknown)=>typeof value==='string' ? value.trim().replace(/\s+/g,' ').toLowerCase() : ''
  if(input[0]?.[0]!=='Sesi absensi' || input[0]?.[1]!==sessionLabel || input[0].length>2) {
    plan.errors.push('Identitas sesi pada file tidak cocok. Unduh template untuk sesi yang sedang dibuka.'); return plan
  }
  const header=input[1] ?? []
  if (header.length!==3 || importHeaders.some((name,index)=>normalize(header[index])!==normalize(name))) {
    plan.errors.push('Header harus tepat: Kode siswa, Status, Alasan koreksi. Gunakan template yang disediakan.'); return plan
  }
  if (input.length>102) { plan.errors.push('File maksimal 100 baris peserta di luar header.'); return plan }
  const byCode=new Map(records.map(record=>[record.student_code.toUpperCase(),record]))
  const seen=new Set<string>()
  for(let index=2;index<input.length;index++) {
    const row=input[index]
    if(row.every(value=>value===null || value===undefined || value==='')) continue
    const line=index+1
    if(row.length>3 || typeof row[0]!=='string') { plan.errors.push(`Baris ${line}: kode siswa harus bertipe teks dan hanya tiga kolom diizinkan.`); continue }
    const code=row[0].trim().toUpperCase()
    const record=byCode.get(code)
    if(!record) { plan.errors.push(`Baris ${line}: kode siswa tidak termasuk peserta sesi ini.`); continue }
    if(seen.has(code)) { plan.errors.push(`Baris ${line}: kode siswa berulang.`); continue }
    seen.add(code)
    if((row[1]!=null && typeof row[1]!=='string') || (row[2]!=null && typeof row[2]!=='string')) { plan.errors.push(`Baris ${line}: status dan alasan harus berupa teks.`); continue }
    const status=normalize(row[1])
    const reason=typeof row[2]==='string' ? row[2].trim() : ''
    const after=status ? (Object.entries(attendanceLabels).find(([,label])=>normalize(label)===status)?.[0] as AttendanceStatus|undefined) : record.status
    if(status && !after) { plan.errors.push(`Baris ${line}: status harus Hadir, Sakit, Izin, atau Alpa.`); continue }
    if((!status && reason) || reason.length>300) { plan.errors.push(`Baris ${line}: alasan maksimal 300 karakter dan harus disertai status.`); continue }
    const changed=Boolean(status && after!==record.status)
    if(changed && record.status!==null && reason.length<5) { plan.errors.push(`Baris ${line}: koreksi memerlukan alasan minimal 5 karakter.`); continue }
    plan.rows.push({line,code,name:record.student_name,before:record.status,after:after ?? null,reason,changed})
    if(changed) plan.changes.push({id:record.id,status:after!,revision:record.revision,reason})
  }
  if(!plan.rows.length && !plan.errors.length) plan.errors.push('File belum memiliki baris peserta.')
  return plan
}
