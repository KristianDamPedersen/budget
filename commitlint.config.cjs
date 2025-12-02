module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // allow common extra types
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert'
      ]
    ],

    // optional enhancements
    'subject-case': [0],               // allow any case
    'header-max-length': [2, 'always', 100],
  },
};
