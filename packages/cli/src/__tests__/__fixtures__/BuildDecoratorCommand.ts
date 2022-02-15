import { Arg, Command, Config, GlobalOptions } from '../..';

export interface BuildOptions extends GlobalOptions {
	dst: string;
	src: string;
}

@Config('build', 'Build a project', {
	aliases: ['compile'],
	category: 'setup',
	usage: 'build -S ./src -D ./lib',
})
export class BuildDecoratorCommand extends Command<BuildOptions> {
	// --dst, -D
	@Arg.String('Destination path', { short: 'D' })
	dst = '';

	// --src, -S
	@Arg.String('Source path', { short: 'S' })
	src = './src';

	async run() {
		await Promise.resolve();

		return 'Build!';
	}
}
