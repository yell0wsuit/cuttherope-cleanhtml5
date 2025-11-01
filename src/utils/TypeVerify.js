// @ts-check

/**
 * Type verification utility for runtime type checking with JSDoc-style type definitions.
 * Provides detailed logging and verification of values against expected types.
 *
 * @example
 * // Simple type verification
 * verifyType(42, 'number', 'userId');
 *
 * @example
 * // Object type verification
 * verifyType({ x: 10, y: 20 }, { x: 'number', y: 'number' }, 'position');
 *
 * @example
 * // Array type verification
 * verifyType([1, 2, 3], 'number[]', 'scores');
 *
 * @example
 * // Union type verification
 * verifyType('active', 'string | null', 'status');
 */

/**
 * Color codes for console output styling
 * @const
 * @type {Object.<string, string>}
 */
const Colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
};

/**
 * Configuration options for TypeVerify
 * @type {{
 *   enabled: boolean,
 *   throwOnError: boolean,
 *   logSuccess: boolean,
 *   useColors: boolean,
 *   stackTraceLimit: number
 * }}
 */
const config = {
    enabled: true,
    throwOnError: false,
    logSuccess: true,
    useColors: true,
    stackTraceLimit: 3,
};

/**
 * Gets the actual JavaScript type of a value
 * @param {*} value
 * @returns {string}
 */
function getActualType(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return 'array';
    if (value instanceof Date) return 'Date';
    if (value instanceof RegExp) return 'RegExp';
    if (value instanceof Map) return 'Map';
    if (value instanceof Set) return 'Set';

    const type = typeof value;

    // Check for custom class instances
    if (type === 'object' && value.constructor && value.constructor.name !== 'Object') {
        return value.constructor.name;
    }

    return type;
}

/**
 * Formats a value for console display
 * @param {*} value
 * @param {number} maxLength
 * @returns {string}
 */
function formatValue(value, maxLength = 100) {
    let str;

    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`;

    if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        if (value.length <= 3) {
            str = `[${value.map(v => formatValue(v, 20)).join(', ')}]`;
        } else {
            str = `[${value.slice(0, 3).map(v => formatValue(v, 20)).join(', ')}, ... +${value.length - 3} more]`;
        }
    } else if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length === 0) return '{}';
        if (keys.length <= 3) {
            str = `{ ${keys.map(k => `${k}: ${formatValue(value[k], 20)}`).join(', ')} }`;
        } else {
            str = `{ ${keys.slice(0, 3).map(k => `${k}: ${formatValue(value[k], 20)}`).join(', ')}, ... +${keys.length - 3} more }`;
        }
    } else {
        str = String(value);
    }

    if (str.length > maxLength) {
        return str.substring(0, maxLength - 3) + '...';
    }

    return str;
}

/**
 * Checks if a value matches a primitive type
 * @param {*} value
 * @param {string} type
 * @returns {boolean}
 */
function matchesPrimitiveType(value, type) {
    const normalizedType = type.toLowerCase().trim();
    const actualType = getActualType(value);

    // Handle function signatures like ((t: Timeline) => void) or (arg: Type) => ReturnType
    if (normalizedType.startsWith('(') && normalizedType.includes('=>')) {
        return typeof value === 'function';
    }

    switch (normalizedType) {
        case 'number':
            return typeof value === 'number' && !isNaN(value);
        case 'string':
            return typeof value === 'string';
        case 'boolean':
            return typeof value === 'boolean';
        case 'function':
            return typeof value === 'function';
        case 'object':
            return typeof value === 'object' && value !== null && !Array.isArray(value);
        case 'array':
            return Array.isArray(value);
        case 'null':
            return value === null;
        case 'undefined':
            return value === undefined;
        case 'any':
        case '*':
            return true;
        default:
            // Check if it's a class name match
            return actualType === type;
    }
}

/**
 * Checks if a value matches an array type (e.g., "number[]", "string[]")
 * @param {*} value
 * @param {string} typeStr
 * @returns {{ valid: boolean, errors: string[] }}
 */
function matchesArrayType(value, typeStr) {
    if (!Array.isArray(value)) {
        return { valid: false, errors: [`Expected array, got ${getActualType(value)}`] };
    }

    // Extract the element type (e.g., "number[]" -> "number")
    const elementType = typeStr.replace(/\[\]$/, '').trim();
    const errors = [];

    if (elementType === '' || elementType === 'any' || elementType === '*') {
        return { valid: true, errors: [] };
    }

    // Check each element
    for (let i = 0; i < value.length; i++) {
        if (!matchesPrimitiveType(value[i], elementType)) {
            errors.push(`  [${i}]: expected ${elementType}, got ${getActualType(value[i])} (${formatValue(value[i], 30)})`);
            if (errors.length >= 5) {
                errors.push(`  ... ${value.length - i - 1} more errors`);
                break;
            }
        }
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Checks if a value matches an object type definition
 * @param {*} value
 * @param {Object.<string, string>} typeDef
 * @returns {{ valid: boolean, errors: string[] }}
 */
function matchesObjectType(value, typeDef) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return { valid: false, errors: [`Expected object, got ${getActualType(value)}`] };
    }

    const errors = [];

    // Check each property in the type definition
    for (const [key, expectedType] of Object.entries(typeDef)) {
        const optional = key.endsWith('?');
        const propName = optional ? key.slice(0, -1) : key;
        const propValue = value[propName];

        if (propValue === undefined) {
            if (!optional) {
                errors.push(`  Property "${propName}" is missing`);
            }
            continue;
        }

        const result = verifyTypeInternal(propValue, expectedType, propName);
        if (!result.valid) {
            errors.push(`  Property "${propName}": ${result.errors.join(', ')}`);
        }
    }

    return { valid: errors.length === 0, errors };
}

/**
 * Internal type verification function
 * @param {*} value
 * @param {string | Object.<string, string>} expectedType
 * @param {string} varName
 * @returns {{ valid: boolean, errors: string[], actualType: string }}
 */
function verifyTypeInternal(value, expectedType, varName = 'value') {
    const actualType = getActualType(value);
    const errors = [];

    // Handle object type definitions
    if (typeof expectedType === 'object' && !Array.isArray(expectedType)) {
        const result = matchesObjectType(value, expectedType);
        return { valid: result.valid, errors: result.errors, actualType };
    }

    // Handle string type definitions
    if (typeof expectedType !== 'string') {
        return {
            valid: false,
            errors: [`Invalid type definition: ${typeof expectedType}`],
            actualType
        };
    }

    const typeStr = expectedType.trim();

    // Handle union types (e.g., "string | null", "number | boolean")
    if (typeStr.includes('|')) {
        const types = typeStr.split('|').map(t => t.trim());
        const matchesAny = types.some(type => {
            if (type.endsWith('[]')) {
                return matchesArrayType(value, type).valid;
            }
            return matchesPrimitiveType(value, type);
        });

        if (!matchesAny) {
            errors.push(`Expected ${typeStr}, got ${actualType}`);
        }

        return { valid: matchesAny, errors, actualType };
    }

    // Handle array types (e.g., "number[]", "string[]")
    if (typeStr.endsWith('[]')) {
        const result = matchesArrayType(value, typeStr);
        return { valid: result.valid, errors: result.errors, actualType };
    }

    // Handle primitive types
    const matches = matchesPrimitiveType(value, typeStr);
    if (!matches) {
        errors.push(`Expected ${typeStr}, got ${actualType}`);
    }

    return { valid: matches, errors, actualType };
}

/**
 * Formats the type definition for display
 * @param {string | Object.<string, string>} type
 * @returns {string}
 */
function formatTypeDefinition(type) {
    if (typeof type === 'string') {
        return type;
    }

    if (typeof type === 'object') {
        const props = Object.entries(type)
            .map(([key, val]) => `${key}: ${val}`)
            .join(', ');
        return `{ ${props} }`;
    }

    return String(type);
}

/**
 * Gets a simplified stack trace for the call site
 * @returns {string}
 */
function getCallSite() {
    const stack = new Error().stack;
    if (!stack) return '';

    const lines = stack.split('\n').slice(3, 3 + config.stackTraceLimit); // Skip Error, getCallSite, and verifyType
    return lines.map(line => {
        // Clean up the stack trace line
        const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
        if (match) {
            const [, fn, file, lineNum] = match;
            const shortFile = file.split('/').slice(-2).join('/');
            return `    at ${fn} (${shortFile}:${lineNum})`;
        }
        return line;
    }).join('\n');
}

/**
 * Applies color to text if colors are enabled
 * @param {string} text
 * @param {string} color
 * @returns {string}
 */
function colorize(text, color) {
    if (!config.useColors) return text;
    return `${color}${text}${Colors.reset}`;
}

/**
 * Main type verification function with console logging
 *
 * @param {*} value - The value to verify
 * @param {string | Object.<string, string>} expectedType - The expected type (JSDoc-style)
 * @param {string} [varName='value'] - Optional variable name for better logging
 * @returns {boolean} True if type matches, false otherwise
 *
 * @example
 * // Verify a number
 * verifyType(42, 'number', 'userId');
 *
 * @example
 * // Verify an object with specific properties
 * verifyType({ x: 10, y: 20 }, { x: 'number', y: 'number' }, 'position');
 *
 * @example
 * // Verify an array of numbers
 * verifyType([1, 2, 3], 'number[]', 'scores');
 *
 * @example
 * // Verify a union type
 * verifyType('active', 'string | null', 'status');
 */
function verifyType(value, expectedType, varName = 'value') {
    if (!config.enabled) {
        return true;
    }

    const result = verifyTypeInternal(value, expectedType, varName);
    const typeDefStr = formatTypeDefinition(expectedType);

    if (result.valid) {
        if (config.logSuccess) {
            const successIcon = colorize('✓', Colors.green);
            const varLabel = colorize(varName, Colors.cyan);
            const typeLabel = colorize(typeDefStr, Colors.blue);
            const valueStr = colorize(formatValue(value), Colors.dim);

            console.log(`${successIcon} ${varLabel}: ${typeLabel} = ${valueStr}`);
        }
        return true;
    } else {
        const errorIcon = colorize('✗', Colors.red);
        const varLabel = colorize(varName, Colors.cyan);
        const typeLabel = colorize(typeDefStr, Colors.yellow);
        const valueStr = colorize(formatValue(value), Colors.white);

        console.error(`${errorIcon} ${varLabel}: ${typeLabel}`);
        console.error(`  ${colorize('Value:', Colors.dim)} ${valueStr}`);
        console.error(`  ${colorize('Actual type:', Colors.dim)} ${colorize(result.actualType, Colors.red)}`);

        if (result.errors.length > 0) {
            console.error(`  ${colorize('Errors:', Colors.dim)}`);
            result.errors.forEach(err => {
                console.error(`    ${colorize('•', Colors.red)} ${err}`);
            });
        }

        const callSite = getCallSite();
        if (callSite) {
            console.error(`  ${colorize('Called from:', Colors.dim)}\n${callSite}`);
        }

        if (config.throwOnError) {
            throw new TypeError(`Type verification failed for "${varName}": expected ${typeDefStr}, got ${result.actualType}`);
        }

        return false;
    }
}

/**
 * Configure TypeVerify behavior
 * @param {Partial<typeof config>} options
 */
verifyType.config = function(options) {
    Object.assign(config, options);
};

/**
 * Get current configuration
 * @returns {typeof config}
 */
verifyType.getConfig = function() {
    return { ...config };
};

/**
 * Enable type verification
 */
verifyType.enable = function() {
    config.enabled = true;
};

/**
 * Disable type verification (useful for production)
 */
verifyType.disable = function() {
    config.enabled = false;
};

/**
 * Create a typed validator function for reuse
 * @param {string | Object.<string, string>} expectedType
 * @param {string} [varName='value']
 * @returns {function(*): boolean}
 *
 * @example
 * const validatePosition = verifyType.validator({ x: 'number', y: 'number' }, 'position');
 * validatePosition({ x: 10, y: 20 });
 */
verifyType.validator = function(expectedType, varName = 'value') {
    return (value) => verifyType(value, expectedType, varName);
};

export default verifyType;
export { verifyType };
