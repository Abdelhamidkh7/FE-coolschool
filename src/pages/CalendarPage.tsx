import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FiPlus, FiLogOut } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserContext } from '../context/UserContext';

const API = 'http://localhost:8080/api/calendar';

export default function CalendarPage() {
  const { user } = useUserContext();
  const [events, setEvents] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [modal, setModal] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get("token");
    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      navigate("/calendar", { replace: true });
    } else {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }
      setAuthReady(true);
    }
  }, [location.search, navigate]);

  const token = localStorage.getItem('token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!authReady) return;

    async function loadCalendar() {
      try {
        const [connRes, evtsRes] = await Promise.all([
          axios.get<boolean>(`${API}/is-connected`, { headers }),
          axios.get<any[]>(`${API}/events`, { headers }),
        ]);
        setConnected(connRes.data);
        const unique = Array.from(
          new Map(evtsRes.data.map(evt => [evt.id, evt])).values()
        );
        setEvents(
          unique.map(evt => ({
            id: String(evt.id),
            title: evt.title,
            start: evt.startTime,
            end: evt.endTime,
            backgroundColor: '#2563EB',
            borderColor: '#1D4ED8',
            textColor: '#fff',
            extendedProps: { description: evt.description },
          }))
        );
      } catch {
        toast.error('Could not load calendar');
      }
    }
    loadCalendar();
  }, [token, authReady]);

  function onDateSelect(selectInfo: any) {
    setModal({ mode: 'create', startISO: selectInfo.startStr, endISO: selectInfo.endStr });
  }

  function onEventClick(clickInfo: any) {
    const e = clickInfo.event;
    setModal({
      mode: 'view',
      title: e.title,
      description: e.extendedProps.description,
      startISO: e.startStr,
      endISO: e.endStr,
    });
  }

  async function onDisconnect() {
    try {
      await axios.post(`${API}/disconnect`, {}, { headers });
      localStorage.removeItem('token');
      setConnected(false);
      toast.success('Disconnected');
    } catch {
      toast.error('Disconnect failed');
    }
  }

  async function onSave(e: any) {
    const dto = {
      title: e.title,
      description: e.description,
      startTime: e.startISO,
      endTime: e.endISO,
    };
    try {
      if (e.id) {
        await axios.put(`${API}/event/${e.id}`, dto, { headers });
      } else {
        await axios.post(`${API}/event`, dto, { headers });
      }
      toast.success('Saved');
      setModal(null);
      const evtsRes = await axios.get<any[]>(`${API}/events`, { headers });
      const unique = Array.from(
        new Map(evtsRes.data.map(evt => [evt.id, evt])).values()
      );
      setEvents(unique.map(evt => ({
        id: String(evt.id),
        title: evt.title,
        start: evt.startTime,
        end: evt.endTime,
        backgroundColor: '#2563EB',
        borderColor: '#1D4ED8',
        textColor: '#fff',
        extendedProps: { description: evt.description },
      })));
    } catch {
      toast.error('Save failed');
    }
  }

  const fmt = (iso: string) => new Date(iso).toLocaleString();

  if (!authReady) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <h1 className="text-2xl font-semibold text-gray-800">Calendar</h1>
        <motion.button
          onClick={connected ? onDisconnect : () => window.location.href = `${API.replace('/api/calendar','')}/oauth2/authorization/google`}
          whileHover={{ scale: 1.05 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white
            ${connected ? 'bg-red-600' : 'bg-blue-600'}`}
        >
          {connected ? <FiLogOut /> : <FiPlus />}
          {connected ? 'Disconnect' : 'Connect Google'}
        </motion.button>
      </header>

      <main className="flex-1 p-4 sm:p-6 overflow-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            views={{
              dayGridMonth: {
                fixedWeekCount: false,
                showNonCurrentDates: false,
                dayMaxEventRows: 3,
                dayCellClassNames: arg => arg.isToday ? ['bg-indigo-50'] : [],
              },
              timeGridWeek: { nowIndicator: true, slotMinTime: '00:00', slotMaxTime: '24:00' },
              timeGridDay:  { nowIndicator: true, slotMinTime: '00:00', slotMaxTime: '24:00' },
            }}
            nowIndicator
            events={events}
            height="auto"
            selectable={user?.role === 'TEACHER'}
            select={onDateSelect}
            eventClick={onEventClick}
            eventDisplay="block"
          />
        </div>
      </main>

      <AnimatePresence>
        {modal && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-full max-w-lg p-6 rounded-lg shadow-xl"
              initial={{ y: -20 }} animate={{ y: 0 }} exit={{ y: 20 }}
            >
              {modal.mode === 'create' ? (
                <>
                  <h3 className="text-xl font-medium mb-4">New Event</h3>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-semibold mb-4">{modal.title}</h3>
                  <p className="text-gray-600 mb-2">{modal.description}</p>
                  <div className="space-y-1">
                    <div><strong>Start:</strong> {fmt(modal.startISO)}</div>
                    <div><strong>End:</strong> {fmt(modal.endISO)}</div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => setModal(null)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
