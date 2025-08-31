import React, { useEffect, useState } from 'react';

interface PushNotificationsProps {
	roomId: string;
	username: string;
	enabled: boolean;
	onPermissionChange?: (granted: boolean) => void;
}

export async function registerServiceWorker() {
	if ('serviceWorker' in navigator) {
		try {
			const reg = await navigator.serviceWorker.register('/sw.js');
			return reg;
		} catch (e) {
			console.error('SW registration failed', e);
		}
	}
}

export function PushNotifications({ roomId, username, enabled, onPermissionChange }: PushNotificationsProps) {
	const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);

	useEffect(() => {
		if (!enabled) return; // muted by default unless toggled
		(async () => {
			if (!('Notification' in window)) return;
			if (permission === 'default') {
				const result = await Notification.requestPermission();
				setPermission(result);
				onPermissionChange?.(result === 'granted');
			} else if (permission === 'granted') {
				onPermissionChange?.(true);
			}
		})();
	}, [enabled, permission, onPermissionChange]);

	// Helper to fire a local test notification (used when mention occurs or new message while tab hidden)
	const sendLocalNotification = (title: string, body: string) => {
		if (permission !== 'granted' || !enabled) return;
		navigator.serviceWorker.getRegistration().then(reg => {
			reg?.showNotification(title, {
				body,
				icon: '/icon-192x192.png',
				tag: `msg-${roomId}`,
				data: { roomId },
			});
		});
	};

	return (
		<div style={{ display: 'none' }} data-permission={permission} data-enabled={enabled} data-room={roomId} data-username={username} />
	);
}

// Utility exported for other modules to trigger local notifications when needed
export function triggerLocalNotification(title: string, body: string) {
	if (Notification.permission !== 'granted') return;
	navigator.serviceWorker.getRegistration().then(reg => {
		reg?.showNotification(title, { body, icon: '/icon-192x192.png' });
	});
}
