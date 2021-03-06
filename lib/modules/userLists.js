'use strict'

let Promise = require('bluebird')

let getAddUserFunction = (orderBy) => {
	return (user, categories) => {
		let date = new Date(orderBy === 'joindate' ? user.registered : user.lastLogin)
		let now = new Date()
		let seconds = Math.floor((now - date) / 1000)
		let days = seconds / 60 / 60 / 24
		let categoryName = 'Ojii-san'

		if(days <= 1)
			categoryName = 'Last 24 hours'
		else if(days <= 2)
			categoryName = 'Yesterday'
		else if(days <= 7)
			categoryName = 'This week'
		else if(days <= 30)
			categoryName = 'This month'

		if(categories.hasOwnProperty(categoryName))
			categories[categoryName].push(user)
		else
			categories[categoryName] = [user]

		return true
	}
}

arn.userOrderBy = {
	countries: {
		getCategories: () => {
			return {}
		},

		addUser: (user, categories) => {
			if(!user.location)
				return false

			let country = user.location.countryName

			if(!country || country === '-')
				return false

			if(categories.hasOwnProperty(country))
				categories[country].push(user)
			else
				categories[country] = [user]

			return true
		}
	},

	'providers/list': {
		getCategories: () => {
			return {
				'AniList': [],
				'HummingBird': [],
				'MyAnimeList': [],
				'AnimePlanet': []
			}
		},

		addUser: (user, categories) => {
			if(categories.hasOwnProperty(user.providers.list))
				categories[user.providers.list].push(user)
			else
				categories[user.providers.list] = [user]

			return true
		}
	},

	'providers/anime': {
		getCategories: () => {
			return {
				'CrunchyRoll': [],
				'Nyaa': []
			}
		},

		addUser: (user, categories) => {
			if(categories.hasOwnProperty(user.providers.anime))
				categories[user.providers.anime].push(user)
			else
				categories[user.providers.anime] = [user]

			return true
		}
	},

	login: {
		getCategories: () => {
			return {
				'Last 24 hours': [],
				'Yesterday': [],
				'This week': [],
				'This month': [],
				'Ojii-san': []
			}
		},

		addUser: getAddUserFunction('login')
	},

	joindate: {
		getCategories: () => {
			return {
				'Last 24 hours': [],
				'Yesterday': [],
				'This week': [],
				'This month': [],
				'Ojii-san': []
			}
		},

		addUser: getAddUserFunction('joindate')
	},

	osu: {
		getCategories: () => {
			return {
				'8k pp': [],
				'7k pp': [],
				'6k pp': [],
				'5k pp': [],
				'4k pp': [],
				'3k pp': [],
				'2k pp': [],
				'1k pp': [],
				'Beginners': [],
			}
		},

		addUser: (user, categories) => {
			if(!user.osu || !user.osuDetails)
				return false

			if(user.osuDetails.pp < 1000)
				categories.Beginners.push(user)
			else if(user.osuDetails.pp >= 8000)
				categories['8k pp'].push(user)
			else
				categories[parseInt(user.osuDetails.pp / 1000) + 'k pp'].push(user)

			return true
		}
	},

	staff: {
		getCategories: () => {
			return {
				'Developers': [],
				'Editors': []
			}
		},

		addUser: (user, categories) => {
			if(user.role === 'admin') {
				categories.Developers.push(user)
				return true
			} else if(user.role === 'editor') {
				categories.Editors.push(user)
				return true
			}

			return false
		}
	},

	'watching/count': {
		getCategories: () => {
			return {
				'30+': [],
				'20+': [],
				'10+': [],
				'1 - 9': []
			}
		},

		addUser: Promise.coroutine(function*(user, categories) {
			let animeList = yield arn.get('AnimeLists', user.id).catch(error => null)

			if(!animeList)
				return false

			console.log(user.nick, animeList.watching.length)

			if(!animeList.watching)
				return false

			if(animeList.watching.length < 10) {
				categories['1 - 9'].push(user)
				return true
			}

			if(animeList.watching.length >= 30) {
				categories['30+'].push(user)
				return true
			}

			let category = (parseInt(animeList.watching.length / 10) * 10) + '+'
			categories[category].push(user)
			return true
		})
	},

	default: {
		getCategories: () => {
			return {
				All: []
			}
		},

		addUser: (user, categories) => categories.All.push(user)
	}
}