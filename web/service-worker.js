self.addEventListener('install', function(event) {
	console.log('Service worker installation...');
	// Perform install steps
});

self.addEventListener('push', function(event) {
	console.log('Received a push message', event);

	var title = 'Yay a message.';
	var body = 'We have received a push message.';
	var icon = '/images/characters/arn-waifu.png';
	var tag = 'simple-push-demo-notification-tag';

	event.waitUntil(
		self.registration.showNotification(title, {
			body: body,
			icon: icon,
			tag: tag
		})
	);
});