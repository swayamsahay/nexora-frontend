function CodeTab({ files, selectedFilePath, onSelectFile, selectedFile, onChangeFile }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {files.map((file) => (
          <button
            key={file.path}
            type="button"
            onClick={() => onSelectFile(file.path)}
            className={selectedFilePath === file.path ? 'rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white' : 'rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}
          >
            {file.path}
          </button>
        ))}
      </div>

      {selectedFile ? (
        <textarea
          value={selectedFile.content}
          onChange={(event) => onChangeFile(selectedFile.path, event.target.value)}
          className="min-h-96 w-full rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-100 outline-none focus:border-slate-500"
        />
      ) : (
        <p className="text-sm text-slate-600 dark:text-slate-300">No generated files yet. Use Prompt tab to generate frontend code.</p>
      )}
    </div>
  )
}

export default CodeTab
