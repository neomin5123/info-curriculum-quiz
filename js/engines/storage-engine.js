(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CurriLoopStorageEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const BACKUP_SCHEMA_VERSION = 9;
  const MAX_SUPPORTED_BACKUP_SCHEMA = 9;

  function buildBackupPayload({appVersion, coreSplitMigrationVersion, history, mastery, practicalStats, practiceSourceLink, practiceQuestionStats, theme, gradingOverrides, practicalExamProgress, exportedAt}) {
    return {
      schemaVersion:BACKUP_SCHEMA_VERSION,
      app:'CurriLoop',
      appVersion:String(appVersion || ''),
      coreSplitMigrationVersion:Number(coreSplitMigrationVersion || 0),
      exportedAt:exportedAt || new Date().toISOString(),
      counts:{history:(history || []).length, mastery:Object.keys(mastery || {}).length},
      history:history || [],
      mastery:mastery || {},
      practicalStats:practicalStats || {},
      practiceSourceLink:practiceSourceLink || {},
      practiceQuestionStats:practiceQuestionStats || {},
      gradingOverrides:gradingOverrides || {},
      practicalExamProgress:practicalExamProgress || {},
      theme:theme || null
    };
  }

  function schemaSupported(value) {
    const n = Number(value || 1);
    return Number.isInteger(n) && n >= 1 && n <= MAX_SUPPORTED_BACKUP_SCHEMA;
  }

  return { BACKUP_SCHEMA_VERSION, MAX_SUPPORTED_BACKUP_SCHEMA, buildBackupPayload, schemaSupported };
});
