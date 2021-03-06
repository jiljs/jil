import React, { useEffect } from 'react';
import { Box } from 'ink';
import { render } from 'ink-testing-library';
import { useProgram } from '../../hooks/useProgram';

describe('Input', () => {
	function TestProgram() {
		const program = useProgram();

		useEffect(() => {}, [program.exit]);

		return <Box />;
	}

	it('custom `exit` doesnt cause an infinite loop', () => {
		const { lastFrame } = render(<TestProgram />);

		expect(lastFrame()).toMatchSnapshot();
	});
});
