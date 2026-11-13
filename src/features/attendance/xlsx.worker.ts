import { readAttendanceWorkbook, WorkbookInputError } from './read-attendance-xlsx'
const scope=self as unknown as { onmessage: ((event:MessageEvent<ArrayBuffer>)=>void)|null; postMessage:(message:unknown)=>void }
scope.onmessage=async event=>{
  try { scope.postMessage({rows:await readAttendanceWorkbook(event.data)}) }
  catch(error) { scope.postMessage({error:error instanceof WorkbookInputError ? error.message : 'File Excel tidak dapat dibaca. Gunakan template .xlsx yang disediakan.'}) }
}
