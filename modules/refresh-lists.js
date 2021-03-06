'use strict'


let RateLimiter = require('limiter').RateLimiter
let limiter = new RateLimiter(1, 1000)

// Check every now and then if users have new episodes
let refreshAnimeLists = function() {
	console.log('Refreshing anime lists...')

	arn.forEach('Users', function(user) {
		if(!arn.isActiveUser(user))
			return

		limiter.removeTokens(1, function() {
			arn.getAnimeList(user, true).then(animeList => {
				// ...
			}).catch(error => {
				console.error(`Error when automatically updating the anime list of ${user.nick}:`, error, error.stack)
			})
		})
	}).then(function() {
		// ...
	})
}

module.exports = function(aero, callback) {
	arn.animeListCacheTime = 20 * 60 * 1000
	setInterval(refreshAnimeLists, arn.animeListCacheTime)
}