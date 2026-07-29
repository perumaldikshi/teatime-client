import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NotificationListener() {
  const { token, user } = useAuth();
  const [lastSeenId, setLastSeenId] = useState(() => {
    return localStorage.getItem('last_seen_notification_id') || null;
  });
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!token || !user) return;

    // Request native browser notification permission
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkNewNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        const list = res.data.notifications || [];
        
        if (list.length === 0) return;

        const newest = list[0]; // Ordered by sent_at DESC

        if (isFirstLoad.current) {
          // On login/initial load, mark the latest one as seen so we don't spam old alerts
          setLastSeenId(newest.id.toString());
          localStorage.setItem('last_seen_notification_id', newest.id.toString());
          isFirstLoad.current = false;
          return;
        }

        // If we have a new notification that hasn't been seen yet
        if (lastSeenId && Number(newest.id) > Number(lastSeenId)) {
          // Trigger native browser notification
          if (window.Notification && Notification.permission === 'granted') {
            new Notification(newest.title, {
              body: newest.body,
              icon: '/favicon.png',
              tag: 'teatime-alert-' + newest.id
            });
          }
          
          setLastSeenId(newest.id.toString());
          localStorage.setItem('last_seen_notification_id', newest.id.toString());
        } else if (!lastSeenId) {
          setLastSeenId(newest.id.toString());
          localStorage.setItem('last_seen_notification_id', newest.id.toString());
        }
      } catch (err) {
        console.error('Background notification check failed:', err);
      }
    };

    checkNewNotifications();

    // Poll every 10 seconds for new alerts
    const interval = setInterval(checkNewNotifications, 10000);

    return () => clearInterval(interval);
  }, [token, user, lastSeenId]);

  return null; // Renderless component
}
