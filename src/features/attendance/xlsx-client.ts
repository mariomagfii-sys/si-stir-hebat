export function parseAttendanceFile(buffer:ArrayBuffer, signal:AbortSignal):Promise<unknown[][]> {
  return new Promise((resolve,reject)=>{
    const worker=new Worker(new URL('./xlsx.worker.ts',import.meta.url),{type:'module'})
    const finish=()=>{ clearTimeout(timer); worker.terminate(); signal.removeEventListener('abort',abort) }
    const abort=()=>{ finish(); reject(new Error('Pembacaan dibatalkan.')) }
    const timer=setTimeout(()=>{ finish(); reject(new Error('Pembacaan Excel terlalu lama. Gunakan file template yang lebih kecil.')) },10000)
    worker.onmessage=(event:MessageEvent<{rows?:unknown[][];error?:string}>)=>{
      finish()
      if(event.data.error) reject(new Error(event.data.error)); else resolve(event.data.rows ?? [])
    }
    worker.onerror=()=>{ finish(); reject(new Error('File Excel belum dapat diproses. Silakan coba lagi.')) }
    signal.addEventListener('abort',abort,{once:true})
    if(signal.aborted) { abort(); return }
    worker.postMessage(buffer,[buffer])
  })
}
