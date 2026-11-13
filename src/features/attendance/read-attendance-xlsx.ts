import { unzipRaw } from 'unzipit'
import readExcelFile from 'read-excel-file/universal'

export class WorkbookInputError extends Error {}
export async function readAttendanceWorkbook(buffer: ArrayBuffer): Promise<unknown[][]> {
  const { entries }=await unzipRaw(buffer)
  if(entries.length>100 || entries.some(entry=>entry.encrypted || entry.size>4*1024*1024)
    || entries.reduce((total,entry)=>total+entry.size,0)>10*1024*1024) throw new WorkbookInputError('Isi file Excel melebihi batas aman pemrosesan.')
  if(entries.some(entry=>/vbaproject\.bin|xl\/externallinks\//i.test(entry.name))) throw new WorkbookInputError('File dengan makro atau tautan workbook eksternal tidak didukung.')
  const sheets=entries.filter(entry=>/^xl\/worksheets\/[^/]+\.xml$/i.test(entry.name))
  if(sheets.length!==1 || !entries.some(entry=>entry.name==='xl/workbook.xml')) throw new WorkbookInputError('Gunakan workbook dengan tepat satu sheet.')
  const xml=await sheets[0].text()
  if(/<(?:[\w.-]+:)?f(?:\s|\/?>)/i.test(xml)) throw new WorkbookInputError('Rumus Excel tidak didukung. Gunakan nilai teks pada template.')
  const workbook=await readExcelFile(buffer)
  if(workbook.length!==1) throw new WorkbookInputError('Gunakan workbook dengan tepat satu sheet.')
  if(workbook[0].data.length>102) throw new WorkbookInputError('File maksimal 100 baris peserta di luar header.')
  return workbook[0].data
}
