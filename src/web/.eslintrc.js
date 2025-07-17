module.exports = {
    extends: ['next/core-web-vitals'],
    rules: {
        // Simple overrides for Next.js defaults
        'react-hooks/exhaustive-deps': 'error', // Make this an error instead of warning
        'indent': ['error', 4, { SwitchCase: 1 }], // Your preferred indentation
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                args: 'all',
                argsIgnorePattern: '^_',
                caughtErrors: 'all',
                caughtErrorsIgnorePattern: '^_',
                destructuredArrayIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                ignoreRestSiblings: true
            }
        ]
    }
};