import { getComponentLibrary } from '../../utils/uiTree'

function BuilderLibrary({ onAdd }) {
  const components = getComponentLibrary()

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Component Library</p>
      <div className="mt-3 space-y-2">
        {components.map((component) => (
          <button
            key={component.type}
            type="button"
            onClick={() => onAdd(component.type)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Add {component.label}
          </button>
        ))}
      </div>
    </aside>
  )
}

export default BuilderLibrary
