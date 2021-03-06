'use strict'

let request = require('request-promise')
let Promise = require('bluebird')
let xml2js = require('xml2js')
let animeRegEx = /<tr>(.*?)<\/tr>/gm
let imageRegEx = /(\/images\/.*?)['"]/
let episodesRegEx = / \((\d+)\+? eps\)/

class AnimePlanet {
	constructor() {
		this.headers = {
			'User-Agent': 'Anime Release Notifier'
		}

		this.xmlParser = new xml2js.Parser({
			trim: true,
			normalize: true
		})

		Promise.promisifyAll(this.xmlParser)
	}

	getAnimeListUrl(userName) {
		return `http://www.anime-planet.com/users/${userName}/anime/watching`
	}

	getAnimeList(userName, callback) {
		return request({
			uri: `http://www.anime-planet.com/users/${userName}/anime/watching`,
			method: 'GET',
			headers: this.headers
		}).then(body => {
			let parsingTasks = []

			body = body.replace(/\s/g, ' ')

			let match = null
			while((match = animeRegEx.exec(body)) !== null) {
				let code = match[0]

				if(code.indexOf('<th>') !== -1)
					continue

				let parsingTask = this.xmlParser.parseStringAsync(code).then(table => {
					let anime = {
						title: null,
						image: null,
						url: null,
						providerId: null,
						airingDate: null,
						episodes: {
							watched: 0,
							next: 1,
							available: 0,
							max: -1,
							offset: 0
						}
					}

					let columns = table.tr.td
					columns.forEach(col => {
						let className = col.$.class
						switch(className) {
							case 'tableEps':
								if(col._) {
									anime.episodes.watched = parseInt(col._)
									anime.episodes.next = anime.episodes.watched + 1
								}
								break

							case 'tableTitle':
								let link = col.a[0]
								let linkTitle = link.$.title
								anime.title = link._

								let serverPath = link.$.href
								anime.url = 'http://www.anime-planet.com' + serverPath

								if(serverPath.startsWith('/anime/'))
									anime.providerId = serverPath.substring('/anime/'.length)

								let match = imageRegEx.exec(linkTitle)
								if(match !== null)
									anime.image = 'http://www.anime-planet.com' + match[1].replace('/thumbs', '')

								match = episodesRegEx.exec(linkTitle)
								if(match !== null)
									anime.episodes.max = parseInt(match[1])
								break
						}
					})

					return anime
				}).then(anime => {
					return arn.getAnimeIdBySimilarTitle(anime, 'AnimePlanet').then(match => {
						anime.id = match ? match.id : null
						anime.similarity = match ? match.similarity : 0
						return anime
					})
				})/*.catch(error => {
					console.error(error, error.stack)
					callback(error, [])
				})*/

				parsingTasks.push(parsingTask)
			}

			Promise.all(parsingTasks).then(watching => {
				callback(undefined, watching)
			}).catch(error => {
				callback(error, [])
			})
		}).catch(error => {
			console.error(error, error.stack)
			callback(error, [])
		})
	}
}

module.exports = new AnimePlanet()