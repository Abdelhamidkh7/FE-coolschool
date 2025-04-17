import React from 'react';
import { motion } from 'framer-motion';

interface Props { event: any; onClose: ()=>void; onSave: (e:any)=>void }
export function ModalForm({ event, onClose, onSave }: Props) {
  const [e, setE] = React.useState(event);
  return (
    <motion.div className="modal-backdrop" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
      <motion.div className="modal-box" initial={{ y:-20 }} animate={{ y:0 }} exit={{ y:20 }}>
        <h2 className="text-xl mb-2">{e.id? 'Edit':'New'} Event</h2>
        <input value={e.title} onChange={v=>setE({...e,title:v.target.value})} placeholder="Title" className="w-full mb-2 p-2 border" />
        <textarea value={e.description} onChange={v=>setE({...e,description:v.target.value})} placeholder="Description" className="w-full mb-2 p-2 border" />
        <div className="flex gap-2 mb-4">
          <input value={e.startISO.slice(0,16)} type="datetime-local" onChange={v=>setE({...e,startISO:v.target.value})} className="flex-1 p-2 border" />
          <input value={e.endISO.slice(0,16)} type="datetime-local" onChange={v=>setE({...e,endISO:v.target.value})} className="flex-1 p-2 border" />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={()=>onSave(e)} className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
        </div>
      </motion.div>
    </motion.div>
  );
}