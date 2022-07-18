import { expandPhrases } from 'src/expandPhrases';
import Formatter from 'src/formatter/Formatter';
import Tokenizer from 'src/lexer/Tokenizer';
import { functions } from './postgresql.functions';
import { keywords } from './postgresql.keywords';

// https://www.postgresql.org/docs/14/sql-commands.html
const reservedCommands = [
  'ABORT',
  'ALTER AGGREGATE',
  'ALTER COLLATION',
  'ALTER CONVERSION',
  'ALTER DATABASE',
  'ALTER DEFAULT PRIVILEGES',
  'ALTER DOMAIN',
  'ALTER EVENT TRIGGER',
  'ALTER EXTENSION',
  'ALTER FOREIGN DATA WRAPPER',
  'ALTER FOREIGN TABLE',
  'ALTER FUNCTION',
  'ALTER GROUP',
  'ALTER INDEX',
  'ALTER LANGUAGE',
  'ALTER LARGE OBJECT',
  'ALTER MATERIALIZED VIEW',
  'ALTER OPERATOR',
  'ALTER OPERATOR CLASS',
  'ALTER OPERATOR FAMILY',
  'ALTER POLICY',
  'ALTER PROCEDURE',
  'ALTER PUBLICATION',
  'ALTER ROLE',
  'ALTER ROUTINE',
  'ALTER RULE',
  'ALTER SCHEMA',
  'ALTER SEQUENCE',
  'ALTER SERVER',
  'ALTER STATISTICS',
  'ALTER SUBSCRIPTION',
  'ALTER SYSTEM',
  'ALTER TABLE',
  'ALTER TABLESPACE',
  'ALTER TEXT SEARCH CONFIGURATION',
  'ALTER TEXT SEARCH DICTIONARY',
  'ALTER TEXT SEARCH PARSER',
  'ALTER TEXT SEARCH TEMPLATE',
  'ALTER TRIGGER',
  'ALTER TYPE',
  'ALTER USER',
  'ALTER USER MAPPING',
  'ALTER VIEW',
  'ANALYZE',
  'BEGIN',
  'CALL',
  'CHECKPOINT',
  'CLOSE',
  'CLUSTER',
  'COMMENT',
  'COMMIT',
  'COMMIT PREPARED',
  'COPY',
  'CREATE ACCESS METHOD',
  'CREATE AGGREGATE',
  'CREATE CAST',
  'CREATE COLLATION',
  'CREATE CONVERSION',
  'CREATE DATABASE',
  'CREATE DOMAIN',
  'CREATE EVENT TRIGGER',
  'CREATE EXTENSION',
  'CREATE FOREIGN DATA WRAPPER',
  'CREATE FOREIGN TABLE',
  'CREATE FUNCTION',
  'CREATE GROUP',
  'CREATE INDEX',
  'CREATE LANGUAGE',
  'CREATE MATERIALIZED VIEW',
  'CREATE OPERATOR',
  'CREATE OPERATOR CLASS',
  'CREATE OPERATOR FAMILY',
  'CREATE POLICY',
  'CREATE PROCEDURE',
  'CREATE PUBLICATION',
  'CREATE ROLE',
  'CREATE RULE',
  'CREATE SCHEMA',
  'CREATE SEQUENCE',
  'CREATE SERVER',
  'CREATE STATISTICS',
  'CREATE SUBSCRIPTION',
  'CREATE TABLE',
  'CREATE TABLE AS',
  'CREATE TABLESPACE',
  'CREATE TEXT SEARCH CONFIGURATION',
  'CREATE TEXT SEARCH DICTIONARY',
  'CREATE TEXT SEARCH PARSER',
  'CREATE TEXT SEARCH TEMPLATE',
  'CREATE TRANSFORM',
  'CREATE TRIGGER',
  'CREATE TYPE',
  'CREATE USER',
  'CREATE USER MAPPING',
  'CREATE VIEW',
  'DEALLOCATE',
  'DECLARE',
  'DELETE',
  'DELETE FROM',
  'DISCARD',
  'DO',
  'DROP ACCESS METHOD',
  'DROP AGGREGATE',
  'DROP CAST',
  'DROP COLLATION',
  'DROP CONVERSION',
  'DROP DATABASE',
  'DROP DOMAIN',
  'DROP EVENT TRIGGER',
  'DROP EXTENSION',
  'DROP FOREIGN DATA WRAPPER',
  'DROP FOREIGN TABLE',
  'DROP FUNCTION',
  'DROP GROUP',
  'DROP INDEX',
  'DROP LANGUAGE',
  'DROP MATERIALIZED VIEW',
  'DROP OPERATOR',
  'DROP OPERATOR CLASS',
  'DROP OPERATOR FAMILY',
  'DROP OWNED',
  'DROP POLICY',
  'DROP PROCEDURE',
  'DROP PUBLICATION',
  'DROP ROLE',
  'DROP ROUTINE',
  'DROP RULE',
  'DROP SCHEMA',
  'DROP SEQUENCE',
  'DROP SERVER',
  'DROP STATISTICS',
  'DROP SUBSCRIPTION',
  'DROP TABLE',
  'DROP TABLESPACE',
  'DROP TEXT SEARCH CONFIGURATION',
  'DROP TEXT SEARCH DICTIONARY',
  'DROP TEXT SEARCH PARSER',
  'DROP TEXT SEARCH TEMPLATE',
  'DROP TRANSFORM',
  'DROP TRIGGER',
  'DROP TYPE',
  'DROP USER',
  'DROP USER MAPPING',
  'DROP VIEW',
  'EXECUTE',
  'EXPLAIN',
  'FETCH',
  'GRANT',
  'IMPORT FOREIGN SCHEMA',
  'INSERT',
  'LISTEN',
  'LOAD',
  'LOCK',
  'MOVE',
  'NOTIFY',
  'PREPARE',
  'PREPARE TRANSACTION',
  'REASSIGN OWNED',
  'REFRESH MATERIALIZED VIEW',
  'REINDEX',
  'RELEASE SAVEPOINT',
  'RESET',
  'RETURNING',
  'REVOKE',
  'ROLLBACK',
  'ROLLBACK PREPARED',
  'ROLLBACK TO SAVEPOINT',
  'SAVEPOINT',
  'SECURITY LABEL',
  'SELECT',
  'SELECT INTO',
  'SET',
  'SET CONSTRAINTS',
  'SET ROLE',
  'SET SESSION AUTHORIZATION',
  'SET TRANSACTION',
  'SHOW',
  'START TRANSACTION',
  'TRUNCATE',
  'UNLISTEN',
  'UPDATE',
  'VACUUM',
  'VALUES',
  // other
  'ADD',
  'AFTER',
  'ALTER COLUMN',
  'INSERT INTO', // verify
  'SET SCHEMA', // verify
  'FROM',
  'GROUP BY',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'ORDER BY',
  'WHERE',
  'WITH',
  'WINDOW',
  'PARTITION BY',
];

const reservedBinaryCommands = expandPhrases([
  'INTERSECT [ALL | DISTINCT]',
  'UNION [ALL | DISTINCT]',
  'EXCEPT [ALL | DISTINCT]',
  'MINUS [ALL | DISTINCT]',
]);

const reservedJoins = expandPhrases([
  'JOIN',
  'INNER JOIN',
  'LEFT JOIN',
  'LEFT OUTER JOIN',
  'RIGHT JOIN',
  'RIGHT OUTER JOIN',
  'FULL JOIN',
  'FULL OUTER JOIN',
  'CROSS JOIN',
  'NATURAL JOIN',
]);

const binaryOperators = [
  // Math Operators
  '<<',
  '>>',
  '|/',
  '||/',
  '!!',
  // String Operators
  '||',
  // Pattern Matching Operators
  '~~',
  '~~*',
  '!~~',
  '!~~*',
  // POSIX RegExp operators
  '~',
  '~*',
  '!~',
  '!~*',
  // Similarity Operators
  '<%',
  '<<%',
  '%>',
  '%>>',
  // Byte Comparison Operators
  '~>~',
  '~<~',
  '~>=~',
  '~<=~',
  // Geometric operators
  '@-@',
  '@@',
  '#',
  '##',
  '<->',
  '&&',
  '&<',
  '&>',
  '<<|',
  '&<|',
  '|>>',
  '|&>',
  '<^',
  '^>',
  '?#',
  '?-',
  '?|',
  '?-|',
  '?||',
  '@>',
  '<@',
  '~=',
  // Network Address operators
  '>>=',
  '<<=',
  // Text Search Operators
  '@@@',
  // JSON Operators
  '?',
  '@?',
  '?&',
  '->',
  '->>',
  '#>',
  '#>>',
  '#-',
  // Other Operators
  ':=',
  '::',
  '=>',
  '-|-',
];

// https://www.postgresql.org/docs/14/index.html
export default class PostgreSqlFormatter extends Formatter {
  static operators = binaryOperators;

  tokenizer() {
    return new Tokenizer({
      reservedCommands,
      reservedBinaryCommands,
      reservedJoins,
      reservedDependentClauses: ['WHEN', 'ELSE'],
      reservedKeywords: keywords,
      reservedFunctionNames: functions,
      openParens: ['(', '['],
      closeParens: [')', ']'],
      stringTypes: ['$$', { quote: "''", prefixes: ['B', 'E', 'X', 'U&'] }],
      identTypes: [{ quote: '""', prefixes: ['U&'] }],
      identChars: { rest: '$' },
      numberedParamTypes: ['$'],
      operators: PostgreSqlFormatter.operators,
    });
  }
}
