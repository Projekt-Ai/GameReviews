export interface CurrentlyPlayingEntry {
	title: string;
	platform: string;
	status: string;
	note: string;
}

export const currentlyPlaying: CurrentlyPlayingEntry[] = [
	{
		title: 'Final Fantasy VII Rebirth',
		platform: 'PS5',
		status: 'Chapter 1',
		note: 'A slower start so far, but the presentation is polished and immediately welcoming.',
	},
	{
		title: 'Demonschool',
		platform: 'Steam',
		status: 'Week 9',
		note: 'The loop can feel repetitive, but the narrative and character dynamics keep pulling me through.',
	},
	{
		title: 'ENDER MAGNOLIA: Bloom in the Mist',
		platform: 'Steam',
		status: '',
		note: 'I am hoping this ends up being the metroidvania that finally clicks with me.',
	},
	{
		title: 'Yakuza Kiwami',
		platform: 'GOG',
		status: '',
		note: 'My introduction to the series, and I want to see how well it sets the tone for what follows.',
	},
	{
		title: 'Sonic Frontiers',
		platform: 'Nintendo Switch 2',
		status: 'Chaos Island',
		note: 'Exploration can be infuriating at times, but the Titan fights make it worthwhile.',
	},
];
