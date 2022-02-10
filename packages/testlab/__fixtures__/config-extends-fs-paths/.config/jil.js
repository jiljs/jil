module.exports = {
	root: true,
	extends: [
		'../some/relative/path/config.js',
		`${__dirname}/../../config-extends-fs-paths/some/absolute/path/config.yml`,
	],
};
