import React from 'react';
import { Help, IndexHelp } from '../react';
import { renderComponent } from '../mocks';
import { commands, options, params } from './__fixtures__/args';

jest.mock('term-size');

const banner = ` _____ _____ _____ _____ _____
| __  |     |     |   __|_   _|
| __ -|  |  |  |  |__   | | |
|_____|_____|_____|_____| |_|`;

describe('<IndexHelp />', () => {
	const props = {
		bin: 'jil',
		name: 'Jil',
		version: '1.2.3',
	};

	it('renders with base props', async () => {
		await expect(renderComponent(<IndexHelp {...props} />)).resolves.toMatchSnapshot();
	});

	it('renders a banner', async () => {
		await expect(renderComponent(<IndexHelp {...props} banner={banner} />)).resolves.toMatchSnapshot();
	});

	it('renders a header', async () => {
		await expect(
			renderComponent(
				<IndexHelp {...props} header="For more information, see https://github.com/jiljs/jil" />,
			),
		).resolves.toMatchSnapshot();
	});

	it('renders a footer', async () => {
		await expect(
			renderComponent(<IndexHelp {...props} footer="Powered by Jil CLI v1.2.3" />),
		).resolves.toMatchSnapshot();
	});

	it('renders children', async () => {
		await expect(
			renderComponent(
				<IndexHelp {...props}>
					<Help
						commands={commands}
						config={{
							description: 'I am a command that does cool things.',
							usage: '$ ink foo bar',
						}}
						header="test"
						options={options}
						params={params}
					/>
				</IndexHelp>,
			),
		).resolves.toMatchSnapshot();
	});

	it('renders with everything', async () => {
		await expect(
			renderComponent(
				<IndexHelp
					{...props}
					banner={banner}
					footer="Powered by Jil CLI v1.2.3"
					header="For more information, see https://github.com/jiljs/jil"
				>
					<Help
						commands={commands}
						config={{
							description: 'I am a command that does cool things.',
							usage: '$ ink foo bar',
						}}
						header="test"
					/>
				</IndexHelp>,
			),
		).resolves.toMatchSnapshot();
	});
});
