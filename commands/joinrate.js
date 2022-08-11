const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js')
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('joinrate')
		.setDescription('Shows a graph of user joins over a period of time.')
		.addStringOption(string =>
			string.setName('unit')
				.setDescription(`Unit of time.`)
				.setRequired(true)
				.addChoices(
					{ name: 'years', value: 'year' },
					{ name: 'months', value: 'month' },
					{ name: 'weeks', value: 'week' },
					{ name: 'days', value: 'day' },
					{ name: 'hours', value: 'hour' },
					{ name: 'minutes', value: 'minute' },
				))
		.addStringOption(string =>
			string.setName('type')
				.setDescription(`Type of graph.`)
				.setRequired(false)
				.addChoices(
					{ name: 'line', value: 'line' },
					{ name: 'bar', value: 'bar' },
				))
		.addIntegerOption(int =>
			int.setName(`time`)
				.setDescription(`How many units`)
				.setRequired(false))
		.addBooleanOption(int =>
			int.setName(`ephemeral`)
				.setDescription(`True to send to just you, False to send to channel.`)
				.setRequired(false)),

	async execute(client, interaction) {
		const unit = interaction.options.getString('unit')
		const type = interaction.options.getString('type') || "line"
		var eph = interaction.options.getBoolean('ephemeral')
		if (eph == null) eph = true
		var time = interaction.options.getInteger('time')
		const guild = interaction.guild

		var joins = []
		var count = {};

		const timeframe = []
		const frameVal = []
		const bgColor = "#ffffff"
		const width = 800
		const height = 600
		const opts = {
			plugins: {
				datalabels: {
					labels: {
						title: {
							color: 'black',
							textStrokeColor: '#D5D5D5',
							textStrokeWidth: 5,
							align: 'top',
							display: 'auto',
							offset: 3
						}
					}
				}
			}
		}
		const chartCallback = (ChartJS) => {
			ChartJS.register({
				id: 'opaqueBackground',
				beforeDraw: (chart) => {
					const ctx = chart.ctx
					ctx.fillStyle = "#D5D5D5";
					ctx.fillRect(0, 0, chart.width, chart.height)
				}
			})
		}

		const canvasRenderService = new ChartJSNodeCanvas({ width, height, chartCallback, plugins: { modern: ['chartjs-plugin-datalabels'] } });

		switch (unit) {
			case 'year': {
				var today = new Date()
				if (time > 10) time = 10
				if (!time) time = 2
				time += 1
				var priorDate = new Date(today.getTime() - (time * 31556926000)) // Subtracts (time) months from today's time, giving (time) months ago
				var dates = []

				for (i = priorDate.getTime(); i < today.getTime(); i += 31556926000) {
					dates.push(new Date(i))
				}
				// Gives (time) days and their milliseconds

				for (var item of dates) {
					joins.push(new Date(item).getFullYear())
				}

				guild.members.cache.forEach(mem => {
					if (priorDate < mem.joinedAt) joins.push(mem.joinedAt.getFullYear())
				})

				for (const element of joins) {
					if (count[element]) {
						count[element] += 1;
					} else {
						count[element] = 1;
					}
				}

				const countVals = Object.values(count)
				const uniqueJoins = [...new Set(joins)]
				for (i = 0; i < countVals.length; i++) {
					timeframe.push(uniqueJoins[i])
					frameVal.push(countVals[i] - 1)
				}

				if (time < timeframe.length && time > 0) {
					timeframe.reverse()
					frameVal.reverse()
					timeframe.length = time
					frameVal.length = time
					timeframe.reverse()
					frameVal.reverse()
				} else time = timeframe.length

				const configuration = {
					type: type,
					options: opts,
					data: {
						labels: timeframe,
						datasets: [
							{
								label: "Yearly Rates",
								data: frameVal,
								backgroundColor: bgColor,
								fill: false,
								borderColor: '#000000',
								borderWidth: 3,
								showLine: true,
								xAxisID: 'xAxis1'
							},
						]
					}
				}

				const attachment = await canvasRenderService.renderToBuffer(configuration, `image/png`)
				const file = new AttachmentBuilder(attachment);

				interaction.reply({
					content: `Here's the join member rate over the last ${(time || timeframe.length) - 1} ${unit}s!`,
					ephemeral: eph,
					files: [file]
				})
				break;
			}
			case 'month': {
				var today = new Date()
				if (time > 48) time = 48
				if (!time) time = 12
				time += 1
				var priorDate = new Date(today.getTime() - (time * 2628000000)) // Subtracts (time) months from today's time, giving (time) months ago
				var dates = []

				for (i = priorDate.getTime(); i < today.getTime(); i += 2628000000) {
					dates.push(new Date(i))
				}
				// Gives (time) days and their milliseconds

				for (var item of dates) {
					joins.push(`${toMonthName(new Date(item).getMonth() + 1)} ${new Date(item).getFullYear().toString().slice(-2)}`)
				}

				guild.members.cache.forEach(mem => {
					if (priorDate < mem.joinedAt) joins.push(`${toMonthName(mem.joinedAt.getMonth() + 1)} ${mem.joinedAt.getFullYear().toString().slice(-2)}`)
				})

				for (const element of joins) {
					if (count[element]) {
						count[element] += 1;
					} else {
						count[element] = 1;
					}
				}

				const countVals = Object.values(count)
				const uniqueJoins = [...new Set(joins)]
				for (i = 0; i < countVals.length; i++) {
					timeframe.push(uniqueJoins[i])
					frameVal.push(countVals[i] - 1)
				}

				if (time < timeframe.length && time > 0) {
					timeframe.reverse()
					frameVal.reverse()
					timeframe.length = time
					frameVal.length = time
					timeframe.reverse()
					frameVal.reverse()
				} else time = timeframe.length

				const configuration = {
					type: type,
					options: opts,
					data: {
						labels: timeframe,
						datasets: [
							{
								label: "Monthly Rates",
								data: frameVal,
								backgroundColor: bgColor,
								fill: false,
								borderColor: '#000000',
								borderWidth: 3,
								showLine: true,
								xAxisID: 'xAxis1'
							},
						]
					}
				}

				const attachment = await canvasRenderService.renderToBuffer(configuration, `image/png`)
				const file = new AttachmentBuilder(attachment);

				interaction.reply({
					content: `Here's the join member rate over the last ${(time || timeframe.length) - 1} ${unit}s!`,
					ephemeral: eph,
					files: [file]
				})
				break;
			}
			case 'week': {
				var today = new Date()
				if (time > 52) time = 52
				if (!time) time = 4
				time += 1
				var priorDate = new Date(today.getTime() - (time * 604800000)) // Subtracts (time) days from today's time, giving (time) days ago
				var dates = []

				for (i = priorDate.getTime(); i < today.getTime(); i += 604800000) {
					dates.push(new Date(i))
				}
				// Gives (time) days and their milliseconds

				for (var item of dates) {
					joins.push(`Week ${toWeekNumber(new Date(item))} ${String(new Date(item).getFullYear())}`)
				}

				guild.members.cache.forEach(mem => {
					if (priorDate < mem.joinedAt) joins.push(`Week ${toWeekNumber(mem.joinedAt)} ${String(mem.joinedAt.getFullYear())}`)
				})

				for (const element of joins) {
					if (count[element]) {
						count[element] += 1;
					} else {
						count[element] = 1;
					}
				}

				const countVals = Object.values(count)
				const uniqueJoins = [...new Set(joins)]
				for (i = 0; i < countVals.length; i++) {
					timeframe.push(uniqueJoins[i])
					frameVal.push(countVals[i] - 1)
				}

				if (time < timeframe.length && time > 0) {
					timeframe.reverse()
					frameVal.reverse()
					timeframe.length = time
					frameVal.length = time
					timeframe.reverse()
					frameVal.reverse()
				} else time = timeframe.length

				const configuration = {
					type: type,
					options: opts,
					data: {
						labels: timeframe,
						datasets: [
							{
								label: "Weekly Rates",
								data: frameVal,
								backgroundColor: bgColor,
								fill: false,
								borderColor: '#000000',
								borderWidth: 3,
								showLine: true,
								xAxisID: 'xAxis1'
							},
						]
					}
				}

				const attachment = await canvasRenderService.renderToBuffer(configuration, `image/png`)
				const file = new AttachmentBuilder(attachment);

				interaction.reply({
					content: `Here's the join member rate over the last ${(time || timeframe.length) - 1} ${unit}s!`,
					ephemeral: eph,
					files: [file]
				})
				break;
			}
			case 'day': {
				var today = new Date()
				if (time > 365) time = 365
				if (!time) time = 30
				time += 1
				var priorDate = new Date(today.getTime() - (time * 86400000)) // Subtracts (time) days from today's time, giving (time) days ago
				var dates = []

				for (i = priorDate.getTime(); i < today.getTime(); i += 86400000) {
					dates.push(new Date(i))
				}
				// Gives (time) days and their milliseconds

				for (var item of dates) {
					joins.push(`${toMonthName(new Date(item).getMonth() + 1)} ${new Date(item).getDate()}`)
				}

				guild.members.cache.forEach(mem => {
					if (priorDate < mem.joinedAt) joins.push(`${toMonthName(mem.joinedAt.getMonth() + 1)} ${mem.joinedAt.getDate()}`)
				})

				for (const element of joins) {
					if (count[element]) {
						count[element] += 1;
					} else {
						count[element] = 1;
					}
				}

				const countVals = Object.values(count)
				const uniqueJoins = [...new Set(joins)]
				for (i = 0; i < countVals.length; i++) {
					timeframe.push(uniqueJoins[i])
					frameVal.push(countVals[i] - 1)
				}

				if (time < timeframe.length && time > 0) {
					timeframe.reverse()
					frameVal.reverse()
					timeframe.length = time
					frameVal.length = time
					timeframe.reverse()
					frameVal.reverse()
				} else time = timeframe.length

				const configuration = {
					type: type,
					options: opts,
					data: {
						labels: timeframe,
						datasets: [
							{
								label: "Daily Rates",
								data: frameVal,
								backgroundColor: bgColor,
								fill: false,
								borderColor: '#000000',
								borderWidth: 3,
								showLine: true,
								xAxisID: 'xAxis1'
							},
						]
					}
				}

				const attachment = await canvasRenderService.renderToBuffer(configuration, `image/png`)
				const file = new AttachmentBuilder(attachment);

				interaction.reply({
					content: `Here's the join member rate over the last ${(time || timeframe.length) - 1} ${unit}s!`,
					ephemeral: eph,
					files: [file]
				})
				break;
			}
			case 'hour': {
				var today = new Date()
				if (time > 168) time = 168
				if (!time) time = 24
				time += 1
				var priorDate = new Date(today.getTime() - (time * 3600000)) // Subtracts (time) hours from today's time, giving (time) hours ago
				var dates = []

				for (i = priorDate.getTime(); i < today.getTime(); i += 3600000) {
					dates.push(new Date(i))
				}
				// Gives (time) days and their milliseconds

				for (var item of dates) {
					joins.push(`${new Date(item).getHours()}:00 ${new Date(item).getMonth() + 1}/${new Date(item).getDate()}`)
				}

				guild.members.cache.forEach(mem => {
					if (priorDate < mem.joinedAt) joins.push(`${mem.joinedAt.getHours()}:00 ${mem.joinedAt.getMonth() + 1}/${mem.joinedAt.getDate()}`)
				})

				for (const element of joins) {
					if (count[element]) {
						count[element] += 1;
					} else {
						count[element] = 1;
					}
				}

				const countVals = Object.values(count)
				const uniqueJoins = [...new Set(joins)]
				for (i = 0; i < countVals.length; i++) {
					timeframe.push(uniqueJoins[i])
					frameVal.push(countVals[i] - 1)
				}

				if (time < timeframe.length && time > 0) {
					timeframe.reverse()
					frameVal.reverse()
					timeframe.length = time
					frameVal.length = time
					timeframe.reverse()
					frameVal.reverse()
				} else time = timeframe.length

				const configuration = {
					type: type,
					options: opts,
					data: {
						labels: timeframe,
						datasets: [
							{
								label: "Minutely(?) Rates (UTC)",
								data: frameVal,
								backgroundColor: bgColor,
								fill: false,
								borderColor: '#000000',
								borderWidth: 3,
								showLine: true,
								xAxisID: 'xAxis1'
							},
						]
					}
				}

				const attachment = await canvasRenderService.renderToBuffer(configuration, `image/png`)
				const file = new AttachmentBuilder(attachment);

				interaction.reply({
					content: `Here's the join member rate over the last ${(time || timeframe.length) - 1} ${unit}s (UTC time)!`,
					ephemeral: eph,
					files: [file]
				})
				break;
			}
			case 'minute': {
				var today = new Date()
				if (time > 60) time = 60
				if (!time) time = 10
				time += 1
				var priorDate = new Date(today.getTime() - (time * 60000)) // Subtracts (time) minutes from today's time, giving (time) minutes ago
				var dates = []

				for (i = priorDate.getTime(); i < today.getTime(); i += 60000) {
					dates.push(new Date(i))
				}
				// Gives (time) days and their milliseconds

				for (var item of dates) {
					joins.push(`${new Date(item).getHours()}:${String(new Date(item).getMinutes()).padStart(2, '0')} ${new Date(item).getMonth() + 1}/${new Date(item).getDate()}`)
				}

				guild.members.cache.forEach(mem => {
					if (priorDate < mem.joinedAt) joins.push(`${mem.joinedAt.getHours()}:${String(mem.joinedAt.getMinutes()).padStart(2, '0')} ${mem.joinedAt.getMonth() + 1}/${mem.joinedAt.getDate()}`)
				})

				for (const element of joins) {
					if (count[element]) {
						count[element] += 1;
					} else {
						count[element] = 1;
					}
				}

				const countVals = Object.values(count)
				const uniqueJoins = [...new Set(joins)]
				for (i = 0; i < countVals.length; i++) {
					timeframe.push(uniqueJoins[i])
					frameVal.push(countVals[i] - 1)
				}

				if (time < timeframe.length && time > 0) {
					timeframe.reverse()
					frameVal.reverse()
					timeframe.length = time
					frameVal.length = time
					timeframe.reverse()
					frameVal.reverse()
				} else time = timeframe.length

				const configuration = {
					type: type,
					options: opts,
					data: {
						labels: timeframe,
						datasets: [
							{
								label: "Exetremely Recent Rates (UTC)",
								data: frameVal,
								backgroundColor: bgColor,
								fill: false,
								borderColor: '#000000',
								borderWidth: 3,
								showLine: true,
								xAxisID: 'xAxis1'
							},
						]
					}
				}

				const attachment = await canvasRenderService.renderToBuffer(configuration, `image/png`)
				const file = new AttachmentBuilder(attachment);

				interaction.reply({
					content: `Here's the join member rate over the last ${(time || timeframe.length) - 1} ${unit}s (UTC time)!`,
					ephemeral: eph,
					files: [file]
				})
				break;
			}
		}
	}
}

function toMonthName(monthNumber) {
	const date = new Date();
	date.setMonth(monthNumber - 1);

	return date.toLocaleString('en-US', {
		month: 'long',
	});
}
function toWeekNumber(date) {
	var oneJan = new Date(date.getFullYear(), 0, 1);
	var numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
	var result = Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
	return result;
}