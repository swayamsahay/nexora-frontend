function PromptTab({ prompt, onPromptChange, onGenerate, isGenerating, error }) {
  return (
    <div className="space-y-3">
      <label htmlFor="prompt" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Prompt</label>
      <textarea
        id="prompt"
        value={prompt}
        onChange={(event) => onPromptChange(event.target.value)}
        className="min-h-40 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        placeholder="Create a modern sneaker ecommerce landing page"
        maxLength={600}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 dark:text-slate-400">{prompt.length}/600</p>
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>
      </div>
      {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
    </div>
  )
}

export default PromptTab
